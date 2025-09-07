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
        "prompt": f"""
Classify the following document text as exactly one of: receipt, invoice, or unknown.

Rules:
- Receipt: Shop/store name at top, list of items/quantities/prices, Subtotal/Tax/Total, date, payment method (cash/card/order id), 'Thank you'.
- Invoice: If the text starts with 'INVOICE' or contains 'BILL TO', 'TAX', 'TOTAL', 'DATE', 'AMOUNT DUE', 'DUE UPON RECEIPT', treat as invoice even if other words are noisy, misspelled, or missing. Also treat as invoice if you see issuer/seller name, receiver/bill-to name, or invoice number. Payment terms and tax rate are strong invoice signals. If these features are present, return 'invoice'.
- Unknown: If neither clearly matches, or ambiguous, return 'unknown'.

Return only a single word: receipt OR invoice OR unknown (no punctuation, no explanation).

Examples (input -> expected):
- "SuperMart\n1x Apple  $1.00\nSubtotal $1.00\nTax $0.05\nTotal $1.05\n2025-01-10" -> receipt
- "INVOICE\nInvoice #1234\nBill To: Acme Co.\nAmount Due: $350.00" -> invoice
- "[Company Name] INVOICE stcet Addters] Icay: Fnen [C00] Bod 0od0 Wenenn DATE Zok 421/ 2014 bILLTO CUSTOHEE Weace DuR Upon KettipE [Cralerent] Esurel Aadtftt] [Cn_ [ehone Addrt Drcmirnon HaeWE See L0bDI Ennn( cheut drkcvec 150J0 SudtOI 575-00 TAX RATE 4-2503 22.31 TOTAL 547.31 Icdem4Ye 4ete ueahonit Wolde @al CC #tot [Na7Fhens ? meaeteade" -> invoice
- "INVOICE\nBILL TO: John Doe\nDATE: 2023-05-01\nTAX: 10.00\nTOTAL: 100.00" -> invoice
- "INVOICE\nBILL TO: Jane Smith\nDUE UPON RECEIPT\nTAX RATE: 5%\nTOTAL: 250.00" -> invoice

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
