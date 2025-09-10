from dotenv import load_dotenv
load_dotenv()
import requests
import os
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# NOTE: The endpoint below is a placeholder. If you have a real Gemini or LLM API endpoint,
# replace this URL and the request payload/response parsing accordingly.
GEMINI_API_URL = os.getenv("GEMINI_API_URL", "https://api.gemini.com/v1/classify")
url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"



def _heuristic_classify(text: str) -> str:
    """Lightweight keyword-based fallback classifier."""
    t = text.lower()

    # Strong invoice indicators
    invoice_keywords = ["invoice", "bill to", "invoice #", "invoice number", "amount due", "due date", "bill to:"]
    # Receipt indicators
    receipt_keywords = ["subtotal", "receipt", "order id", "total", "cash", "card", "tax", "thank you", "qty"]

    inv_score = sum(1 for k in invoice_keywords if k in t)
    rec_score = sum(1 for k in receipt_keywords if k in t)

    # Detect price-like tokens (e.g., 19.99, 1,234.56, $12.50)
    price_patterns = re.findall(r"\$?\d{1,3}(?:[,\.]\d{2,3})?(?:[,\.]\d{2})?", text)
    price_count = sum(1 for p in price_patterns if re.search(r"\d", p))

    # Count lines that contain a price-like token (likely item lines)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    lines_with_price = sum(1 for l in lines if re.search(r"\$?\d+[\.,]\d{2}", l))

    # Detect phone numbers (common on receipts)
    phone_found = 1 if re.search(r"\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b", text) else 0

    # If invoice keywords present, prefer invoice strongly
    if inv_score >= 1 and inv_score > rec_score:
        return "invoice"

    # Build a score for receipt-like structure
    score = rec_score * 1 + price_count * 2 + lines_with_price * 2 + phone_found * 1

    # If many price-like tokens or several lines with prices, it's very likely a receipt
    if score >= 3:
        return "receipt"

    # If nothing matches, fallback to simple keyword comparison
    if rec_score > inv_score:
        return "receipt"
    if inv_score > rec_score:
        return "invoice"

    return "unknown"


def classify_document(text: str) -> str:
    """Classify document using Gemini API, fallback to heuristic."""
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set, using local heuristic classifier")
        return _heuristic_classify(text)

    payload = {
        "contents": [{
            "parts": [{
                "text": f"""
Classify the following document text as exactly one of: receipt, invoice, or unknown.

Rules:
- Receipt: Shop/store name at top, list of items/quantities/prices, Subtotal/Tax/Total, date, payment method (cash/card/order id), 'Thank you'.
- Invoice: Contains 'INVOICE', 'BILL TO', 'AMOUNT DUE', 'DUE UPON RECEIPT', invoice number, payment terms, or tax rate.
- Unknown: If neither clearly matches.

Return only one word: receipt OR invoice OR unknown.

Text:
{text}
"""
            }]
        }]
    }

    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Gemini API call failed (%s). Falling back to heuristic. URL=%s", exc, url)
        return _heuristic_classify(text)

    try:
        data = resp.json()
    except ValueError:
        logger.error("Gemini API returned non-json response. Falling back to heuristic.")
        return _heuristic_classify(text)

    # Parse Gemini response
    try:
        candidates = data.get("candidates", [])
        if candidates:
            txt = candidates[0]["content"]["parts"][0]["text"].strip().lower()
            if "receipt" in txt:
                return "receipt"
            if "invoice" in txt:
                return "invoice"
            if "unknown" in txt:
                return "unknown"
    except Exception:
        pass

    return _heuristic_classify(text)
