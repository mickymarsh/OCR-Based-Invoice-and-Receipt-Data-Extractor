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
    """Attempt to classify using external Gemini API, falling back to a local heuristic on error.

    Returns: 'receipt', 'invoice', or 'unknown'
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set, using local heuristic classifier")
        return _heuristic_classify(text)

    payload = {
        # This payload will likely need to be adapted to the real API you use.
        # The prompt below instructs the model to return exactly one of: receipt, invoice, or unknown.
        # It includes clear heuristics and short examples so receipts (shop name, list of items, subtotal/total, date)
        # are separated from invoices (the word "invoice", invoice number, issuer name, receiver/bill-to, paid/amount due).
        "prompt": f"""
Classify the following document text as exactly one of: receipt, invoice, or unknown.

Rules (use these to decide):
- Receipt: typically shows a shop/store name at the top, a list of purchased items or quantities, prices, a Subtotal/Tax/Total or 'Total' line, and a date; may include 'Thank you' or payment method (cash/card/order id). If these features are present, return 'receipt'.
- Invoice: explicitly uses the word 'invoice' or 'invoice number' (or 'Invoice #'), shows issuer/seller name and receiver/bill-to name, and payment-related terms like 'amount due', 'paid', 'due date', or payment instructions; if these features are present, return 'invoice'.
- Unknown: if neither clearly matches, or if ambiguous, return 'unknown'.

Return requirements:
- Respond with a single word only: receipt OR invoice OR unknown (no punctuation, no explanation).

Examples (input -> expected):
- "SuperMart\n1x Apple  $1.00\nSubtotal $1.00\nTax $0.05\nTotal $1.05\n2025-01-10" -> receipt
- "INVOICE\nInvoice #1234\nBill To: Acme Co.\nAmount Due: $350.00" -> invoice

Now classify the following document text (do not add any extra text):\n\n"{text}"
""",
        "max_tokens": 8,
    }
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(GEMINI_API_URL, json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Gemini API call failed (%s). Falling back to heuristic. URL=%s", exc, GEMINI_API_URL)
        return _heuristic_classify(text)

    try:
        data = resp.json()
    except ValueError:
        logger.error("Gemini API returned non-json response. Falling back to heuristic.")
        return _heuristic_classify(text)

    # Best-effort parsing for common response shapes. Adjust to your API's schema.
    # Example shapes handled: {"label":"receipt"}, {"type":"invoice"}, {"choices":[{"text":"receipt"}]}
    if isinstance(data, dict):
        if "label" in data:
            return data.get("label")
        if "type" in data:
            return data.get("type")
        # OpenAI-like choices
        choices = data.get("choices") or data.get("outputs")
        if isinstance(choices, list) and len(choices) > 0:
            first = choices[0]
            # try known keys
            for key in ("text", "label", "content", "output"):
                if isinstance(first, dict) and key in first:
                    txt = first.get(key, "").lower()
                    if "receipt" in txt:
                        return "receipt"
                    if "invoice" in txt:
                        return "invoice"
            # if the choice is a string
            if isinstance(first, str):
                if "receipt" in first.lower():
                    return "receipt"
                if "invoice" in first.lower():
                    return "invoice"

    # As a last resort use the heuristic
    return _heuristic_classify(text)
