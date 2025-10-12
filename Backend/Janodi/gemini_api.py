from dotenv import load_dotenv
load_dotenv()
import requests
import os
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_KEY_DOCS = os.getenv("GEMINI_KEY_DOCS")
# NOTE: The endpoint below is a placeholder. If you have a real Gemini or LLM API endpoint,
# replace this URL and the request payload/response parsing accordingly.
GEMINI_FOR_DOCS = os.getenv("GEMINI_FOR_DOCS", "https://api.gemini.com/v1/classify")
url = f"{GEMINI_FOR_DOCS}?key={GEMINI_KEY_DOCS}"



def _heuristic_classify(text: str) -> str:
    """Lightweight keyword-based fallback classifier."""
    t = text.lower()


    # Expanded invoice indicators
    invoice_keywords = [
        "invoice", "bill to", "invoice #", "invoice number", "amount due", "due date", "bill to:",
        "payment terms", "tax rate", "due upon receipt", "purchase order", "po number", "remit to",
        "terms", "reference", "account number", "supplier", "customer", "net", "vat", "gst", "total due"
    ]
    # Receipt indicators
    receipt_keywords = ["subtotal", "receipt", "order id", "total", "cash", "card", "tax", "thank you", "qty", "change", "item", "store", "shop", "payment method"]

    inv_score = sum(1 for k in invoice_keywords if k in t)
    # If 'invoice' or fuzzy match is found, give full marks
    fuzzy_invoice_patterns = [
        r"invoice", r"inv[o0]ic[e3]", r"invoce", r"invocie", r"invoic", r"inv[o0]ice", r"inv[o0]ce",
        r"invo1ce", r"1nvoice", r"1nv0ice", r"1nv0ic3", r"invo1c3", r"invo1c", r"invo1c3", r"INVOICE"
    ]
    if any(re.search(p, t) for p in fuzzy_invoice_patterns):
        inv_score = 100
    rec_score = sum(1 for k in receipt_keywords if k in t)

    # Invoice number pattern detection (e.g., INV12345, Invoice No: 12345)
    invoice_number_patterns = [
        r"invoice\s*(no\.?|number|#)?[:\s]*[a-zA-Z0-9\-]+",
        r"inv\s*[a-zA-Z0-9\-]+",
        r"po\s*(no\.?|number|#)?[:\s]*[a-zA-Z0-9\-]+"
    ]
    invoice_number_found = any(re.search(p, t) for p in invoice_number_patterns)

    # Payment terms detection
    payment_terms_found = bool(re.search(r"payment terms|due upon receipt|net \d+", t))

    # Tax rate detection
    tax_rate_found = bool(re.search(r"tax rate|vat|gst", t))

    # Detect price-like tokens (e.g., 19.99, 1,234.56, $12.50)
    price_patterns = re.findall(r"\$?\d{1,3}(?:[,\.]\d{2,3})?(?:[,\.]\d{2})?", text)
    price_count = sum(1 for p in price_patterns if re.search(r"\d", p))

    # Count lines that contain a price-like token (likely item lines)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    lines_with_price = sum(1 for l in lines if re.search(r"\$?\d+[\.,]\d{2}", l))

    # Detect phone numbers (common on receipts)
    phone_found = 1 if re.search(r"\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b", text) else 0

    # Invoice scoring: give extra weight to invoice number, payment terms, tax rate
    invoice_score = inv_score * 2 + invoice_number_found * 2 + payment_terms_found * 2 + tax_rate_found * 1
    receipt_score = rec_score * 1 + price_count * 2 + lines_with_price * 2 + phone_found * 1


    # Fuzzy matching for 'invoice' and invoice number
    fuzzy_invoice_patterns = [
        r"invoice", r"inv[o0]ic[e3]", r"invoce", r"invocie", r"invoic", r"inv[o0]ice", r"inv[o0]ce",
        r"invo1ce", r"1nvoice", r"1nv0ice", r"1nv0ic3", r"invo1c3", r"invo1c", r"invo1c3", r"invo1c3",
        r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3",
        r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3",
        r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3",
        r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3",
        r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3",
        r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3", r"invo1c3",r"INVOICE"
    ]
    fuzzy_invoice_number_patterns = [
        r"invoice\s*(no\.?|number|#)?[:\s]*[a-zA-Z0-9\-]+",
        r"inv\s*[a-zA-Z0-9\-]+",
        r"po\s*(no\.?|number|#)?[:\s]*[a-zA-Z0-9\-]+"
    ]
    fuzzy_invoice_found = any(re.search(p, t) for p in fuzzy_invoice_patterns)
    fuzzy_invoice_number_found = any(re.search(p, t) for p in fuzzy_invoice_number_patterns)

    # Strongest override: if any form of 'invoice' is present, always classify as invoice
    if fuzzy_invoice_found:
        return "invoice"

    # Prefer invoice if invoice_score is high
    if invoice_score >= 3 and invoice_score > receipt_score:
        return "invoice"

    # Prefer receipt if receipt_score is high
    if receipt_score >= 3 and receipt_score > invoice_score:
        return "receipt"

    # If nothing matches, fallback to simple keyword comparison
    if receipt_score > invoice_score:
        return "receipt"
    if invoice_score > receipt_score:
        return "invoice"

    return "unknown"


def classify_document(text: str) -> dict:
    """LangGraph-style: first classify doc type, then expense type if needed. Returns dict."""
    def gemini_doc_type_agent(text: str) -> str:
        if not GEMINI_KEY_DOCS:
            logger.warning("GEMINI_KEY_DOCS is not set, using local heuristic classifier")
            return _heuristic_classify(text)
        prompt = f"""
Classify the following document text as exactly one of: receipt, invoice, or unknown.

Text:
{text}

Return only one word: receipt, invoice, or unknown.
"""
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {"Content-Type": "application/json"}
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                txt = candidates[0]["content"]["parts"][0]["text"].strip().lower()
                if "receipt" in txt:
                    return "receipt"
                if "invoice" in txt:
                    return "invoice"
                if "unknown" in txt:
                    return "unknown"
        except Exception as e:
            logger.error("Gemini doc_type agent failed: %s", e)
            return _heuristic_classify(text)
        return _heuristic_classify(text)

    def gemini_expense_type_agent(text: str) -> str:
        if not GEMINI_KEY_DOCS:
            logger.warning("GEMINI_KEY_DOCS is not set, using local heuristic classifier")
            return _heuristic_classify(text)
        prompt = f"""
Given the following document text, classify the expense type as one of: food, transport, utilities, entertainment, shopping, healthcare, or unknown.

Text:
{text}

Return only one word: food, transport, utilities, entertainment, shopping, healthcare, or unknown.
"""
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {"Content-Type": "application/json"}
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                txt = candidates[0]["content"]["parts"][0]["text"].strip().lower()
                for cat in ["food", "transport", "utilities", "entertainment", "shopping", "healthcare"]:
                    if cat in txt:
                        return cat
                if "unknown" in txt:
                    return "unknown"
        except Exception as e:
            logger.error("Gemini expense_type agent failed: %s", e)
            return _heuristic_classify(text)
        return _heuristic_classify(text)

    doc_type = gemini_doc_type_agent(text)
    if doc_type in ("receipt", "invoice"):
        expense_type = gemini_expense_type_agent(text)
    else:
        expense_type = "unknown"
    return {"document_type": doc_type, "expense_type": expense_type}
