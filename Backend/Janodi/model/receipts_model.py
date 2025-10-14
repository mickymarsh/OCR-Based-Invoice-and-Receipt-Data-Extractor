import logging
import torch
from PIL import Image, ImageDraw
import easyocr
from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
import matplotlib.pyplot as plt
from typing import Dict


logger = logging.getLogger(__name__)

# Lazy-loaded globals to avoid heavy work on module import
_MODEL_NAME = "janodis/layoutlmv3-refinetuned-receipts"
_processor = None
_model = None
_id2label = None
_reader = None


def _init_model():
    global _processor, _model, _id2label, _reader
    if _processor is None or _model is None:
        logger.info("Loading LayoutLMv3 processor and model: %s", _MODEL_NAME)
        _processor = LayoutLMv3Processor.from_pretrained(_MODEL_NAME, apply_ocr=False, use_fast=True)
        _model = LayoutLMv3ForTokenClassification.from_pretrained(_MODEL_NAME)
        _id2label = _model.config.id2label
        _reader = easyocr.Reader(['en'])
    return _processor, _model, _id2label, _reader


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


_FIELD_MAP = {
    "TITLE": "Title",
    "ADDRESS": "Address",
    "DATE": "Date",
    "ITEM": "Item",
    "ORDERID": "OrderId",
    "ORDER_ID": "OrderId",
    "ORDER": "OrderId",
    "SUBTOTAL": "Subtotal",
    "TAX": "Tax",
    "TOTAL": "TotalPrice",
    "TOTALPRICE": "TotalPrice",
    "AMOUNT": "TotalPrice",
    "PRICE": "TotalPrice",
}


def _normalize_label(raw_label: str) -> str:
    if not raw_label:
        return ""
    lab = raw_label.upper()
    for prefix in ("B-", "I-", "E-", "S-"):
        if lab.startswith(prefix):
            lab = lab[len(prefix):]
            break
    return lab


def extract_receipt_structured_data(image_path: str) -> Dict[str, str]:
    """Extract structured fields from a receipt image and return a dict with these keys:
    Address, Date, Item, OrderId, Subtotal, Tax, Title, TotalPrice

    This function is safe to import (no heavy work on import); model and reader are loaded lazily.
    """
    try:
        processor, model, id2label, reader = _init_model()
    except Exception as e:
        logger.exception("Failed to initialize model/processor: %s", e)
        # Return empty structured result to avoid crashing the server
        return {k: "" for k in ["Address", "Date", "Item", "OrderId", "Subtotal", "Tax", "Title", "TotalPrice"]}

    try:
        raw = reader.readtext(image_path)
        img = Image.open(image_path).convert("RGB")
        W, H = img.size

        tmp = []
        CONF_THRESH = 0.35
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

        encoding = processor(
            images=img,
            text=words,
            boxes=boxes,
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=512,
        )

        with torch.no_grad():
            outputs = model(**encoding)

        logits = outputs.logits
        pred_ids = logits.argmax(-1).squeeze(0).tolist()
        word_ids = encoding.word_ids(batch_index=0)
        word_level_labels = []
        used = set()
        for tok_idx, widx in enumerate(word_ids):
            if widx is None or widx in used:
                continue
            used.add(widx)
            lbl = id2label.get(pred_ids[tok_idx], "")
            word_level_labels.append(_normalize_label(lbl))

        word_level_labels = word_level_labels[:len(words)]
        # Fallback for slow tokenizer: assume one label per word, in order
        # Fallback for slow tokenizer: align as best as possible
       

        #word_level_labels = [_normalize_label(id2label.get(pid, "")) for pid in pred_ids]
                # Aggregate words by label
        raw_struct = {}
        for w, lab in zip(words, word_level_labels):
            if not lab or lab == "O":
                continue
            raw_struct.setdefault(lab, []).append(w)

        # Map raw labels to required fields
        final = {"Address": "", "Date": "", "Item": "", "OrderId": "", "Subtotal": "", "Tax": "", "Title": "", "TotalPrice": ""}
        for raw_lab, words_list in raw_struct.items():
            mapped = _FIELD_MAP.get(raw_lab)
            if mapped:
                # join words in their original order (they already are in reading order)
                final[mapped] = " ".join(words_list)

        return final
    except Exception as e:
        logger.exception("Error extracting structured data from %s: %s", image_path, e)
        return {k: "" for k in ["Address", "Date", "Item", "OrderId", "Subtotal", "Tax", "Title", "TotalPrice"]}


def display_image(image_path):
    img = Image.open(image_path).convert("RGB")
    plt.figure(figsize=(10, 14))
    plt.imshow(img)
    plt.axis("off")
    plt.show()


def display_image_with_boxes(image_path, boxes, labels=None):
    """
    Display image with bounding boxes.
    boxes: list of [x1, y1, x2, y2] in pixel coordinates
    labels: optional list of labels for each box
    """
    img = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    for i, box in enumerate(boxes):
        color = (255, 0, 0)  # red
        draw.rectangle(box, outline=color, width=2)
        if labels:
            label = labels[i]
            draw.text((box[0], max(0, box[1] - 16)), label, fill=color)
    plt.figure(figsize=(10, 14))
    plt.imshow(img)
    plt.axis("off")
    plt.show()


if __name__ == "__main__":
    # Example manual test. Run `python receipts_model.py path/to/image.jpg`
    import sys
    if len(sys.argv) > 1:
        p = sys.argv[1]
        print(extract_receipt_structured_data(p))