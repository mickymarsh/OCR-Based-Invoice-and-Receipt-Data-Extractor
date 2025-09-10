import logging
from typing import Dict
import os
import easyocr
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForTokenClassification
import re

logger = logging.getLogger(__name__)

# Lazy-loaded globals
_MODEL_ID = "Mickeymarsh02/layoutlmv3-yoloinvoice-ner-finetuned"
_processor = None
_model = None
_reader = None


def _init_invoice_model():
    global _processor, _model, _reader
    if _processor is None or _model is None:
        logger.info("Loading invoice processor/model: %s", _MODEL_ID)
        # Support a per-model token if you have models across different accounts
        hf_token = os.getenv("INVOICE_MODEL_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN")
        # pass token when accessing gated/private repos
        if hf_token:
            logger.info("Using HF token from env to access invoice model (INVOICE_MODEL_TOKEN or HUGGINGFACE_HUB_TOKEN)")
            _processor = AutoProcessor.from_pretrained(_MODEL_ID, use_auth_token=hf_token)
            _model = AutoModelForTokenClassification.from_pretrained(_MODEL_ID, use_auth_token=hf_token)
        else:
            logger.info("No HF token found in INVOICE_MODEL_TOKEN or HUGGINGFACE_HUB_TOKEN; attempting anonymous access")
            _processor = AutoProcessor.from_pretrained(_MODEL_ID)
            _model = AutoModelForTokenClassification.from_pretrained(_MODEL_ID)
        _reader = easyocr.Reader(['en'])
    return _processor, _model, _reader


_FIELD_MAP = {
    # map model label tokens to API fields
    "INVOICE_NUMBER": "OrderId",
    "INVOICE_NO": "OrderId",
    "INVOICE": "OrderId",
    "DATE": "Date",
    "INVOICE_DATE": "Date",
    "BILL_TO": "Address",
    "SHIP_TO": "Address",
    "RECEIVER": "Address",
    "BILL_FROM": "Title",
    "VENDOR": "Title",
    "ISSUER": "Title",
    "SUBTOTAL": "Subtotal",
    "TAX": "Tax",
    "TOTAL": "TotalPrice",
    "AMOUNT_DUE": "TotalPrice",
    "PAID": "TotalPrice",
    "ITEM": "Item",
    "DESCRIPTION": "Item",
}


def _reading_order(entries, H, y_tol=0.015):
    lines = {}
    for t, (x1, y1, x2, y2) in entries:
        yc = (y1 + y2) / 2
        placed = False
        for k in list(lines.keys()):
            if abs(k - yc) <= y_tol * H:
                lines[k].append((t, [x1, y1, x2, y2]))
                placed = True
                break
        if not placed:
            lines[yc] = [(t, [x1, y1, x2, y2])]
    ordered = []
    for k in sorted(lines.keys()):
        line = sorted(lines[k], key=lambda e: e[1][0])
        ordered.extend(line)
    return ordered


def extract_invoice_structured_data(image_path: str) -> Dict[str, str]:
    """Run the invoice NER model and return a dict with keys:
    Address, Date, Item, OrderId, Subtotal, Tax, Title, TotalPrice
    """
    try:
        processor, model, reader = _init_invoice_model()
    except Exception as e:
        logger.exception("Failed to initialize invoice model: %s", e)
        return {k: "" for k in [
            "customer_address", "customer_name", "due_date", "invoice_date", "invoice_number", "invoice_subtotal", "invoice_total",
            "item_description", "item_quantity", "item_total_price", "item_unit_price", "supplier_address", "supplier_name", "tax_amount", "tax_rate"
        ]}

    try:
        raw = reader.readtext(image_path)
        img = Image.open(image_path).convert("RGB")
        W, H = img.size

        tmp = []
        CONF_THRESH = 0.3
        for poly, text, conf in raw:
            if not text or conf < CONF_THRESH:
                continue
            xs = [p[0] for p in poly]
            ys = [p[1] for p in poly]
            x1, y1, x2, y2 = max(0, min(xs)), max(0, min(ys)), min(W, max(xs)), min(H, max(ys))
            tmp.append((text, [x1, y1, x2, y2]))

        ordered = _reading_order(tmp, H)
        words = []
        boxes = []
        for t, (x1, y1, x2, y2) in ordered:
            b = [
                int(1000 * x1 / W),
                int(1000 * y1 / H),
                int(1000 * x2 / W),
                int(1000 * y2 / H),
            ]
            b = [min(1000, max(0, v)) for v in b]
            words.append(t)
            boxes.append(b)

        if len(words) == 0:
            logger.info("No OCR words after filtering for %s", image_path)
            return {k: "" for k in ["Address", "Date", "Item", "OrderId", "Subtotal", "Tax", "Title", "TotalPrice"]}

        encoding = processor(images=img, text=words, boxes=boxes, return_tensors="pt", padding="max_length", truncation=True, max_length=512)
        # ensure bbox type
        if "bbox" in encoding:
            encoding["bbox"] = encoding["bbox"].to(torch.long)

        with torch.no_grad():
            outputs = model(**encoding)

        logits = outputs.logits
        pred_ids = logits.argmax(-1).squeeze(0).tolist()
        word_ids = encoding.word_ids(batch_index=0)

        # Map token predictions back to word-level labels (first token wins)
        word_level_labels = []
        used = set()
        id2label = model.config.id2label
        for tok_idx, widx in enumerate(word_ids):
            if widx is None or widx in used:
                continue
            used.add(widx)
            lab = id2label.get(pred_ids[tok_idx], "O")
            # normalize label prefixes
            if lab.startswith("B-") or lab.startswith("I-") or lab.startswith("S-") or lab.startswith("E-"):
                lab = lab.split("-", 1)[1]
            word_level_labels.append(lab.upper())

        word_level_labels = word_level_labels[:len(words)]

        raw_struct = {}
        for w, lab in zip(words, word_level_labels):
            if not lab or lab == "O":
                continue
            raw_struct.setdefault(lab, []).append(w)

        final = {"Address": "", "Date": "", "Item": "", "OrderId": "", "Subtotal": "", "Tax": "", "Title": "", "TotalPrice": ""}
        for raw_lab, words_list in raw_struct.items():
            mapped = _FIELD_MAP.get(raw_lab)
            if mapped:
                final[mapped] = " ".join(words_list)

        return final
    except Exception as e:
        logger.exception("Error extracting invoice structured data from %s: %s", image_path, e)
        return {k: "" for k in ["Address", "Date", "Item", "OrderId", "Subtotal", "Tax", "Title", "TotalPrice"]}
