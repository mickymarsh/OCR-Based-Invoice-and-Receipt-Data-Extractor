import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://api.gemini.com/v1/classify"  # Replace with actual Gemini endpoint

def classify_document(text: str) -> str:
    # Example payload, adjust as per Gemini API docs
    payload = {
        "prompt": f"Classify this document as 'receipt' or 'invoice' based on its content: {text}",
        "max_tokens": 10
    }
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(GEMINI_API_URL, json=payload, headers=headers)
    response.raise_for_status()
    result = response.json()
    # Parse result to get type
    # Adjust parsing based on Gemini API response format
    doc_type = result.get("type") or result.get("label") or "unknown"
    return doc_type
