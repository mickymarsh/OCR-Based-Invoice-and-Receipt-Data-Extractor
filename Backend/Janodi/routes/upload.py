from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import easyocr
import cv2
import numpy as np
import re
from pydantic import BaseModel
from ..gemini_api import classify_document
from ..model.receipts_model import extract_receipt_structured_data
from ..model.invoice_model import extract_invoice_structured_data
import logging
import tempfile
import os
import traceback
from pathlib import Path

router = APIRouter()

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])

# Logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class ExtractedData(BaseModel):
    Address: str = ""
    Date: str = ""
    Item: str = ""
    OrderId: str = ""
    Subtotal: str = ""
    Tax: str = ""
    Title: str = ""
    TotalPrice: str = ""
    DocumentType: str = ""

def extract_text_from_image(image_bytes: bytes) -> str:
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image from bytes - cv2.imdecode returned None")

    # Perform OCR
    results = reader.readtext(img)

    # Extract text
    text = ' '.join([result[1] for result in results])
    return text


def parse_extracted_data_invoice(text: str) -> dict:
    # Simple invoice parsing fallback
    data = {
        "Address": "",
        "Date": "",
        "Item": "",
        "OrderId": "",
        "Subtotal": "",
        "Tax": "",
        "Title": "",
        "TotalPrice": ""
    }
    lines = text.split('\n') if '\n' in text else text.split(' ')
    if lines:
        data["Title"] = lines[0].strip()
    date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b'
    date_match = re.search(date_pattern, text)
    if date_match:
        data["Date"] = date_match.group(1)
    orderid_pattern = r'(Invoice\s*(?:#|No\.?|Number)?[:\s]*)(\w[\w-]*)'
    orderid_match = re.search(orderid_pattern, text, re.IGNORECASE)
    if orderid_match:
        data["OrderId"] = orderid_match.group(2)
    subtotal_match = re.search(r'Subtotal[:\s]*\$?([0-9,]+\.?[0-9]*)', text, re.IGNORECASE)
    if subtotal_match:
        data["Subtotal"] = subtotal_match.group(1)
    tax_match = re.search(r'Tax[:\s]*\$?([0-9,]+\.?[0-9]*)', text, re.IGNORECASE)
    if tax_match:
        data["Tax"] = tax_match.group(1)
    total_match = re.search(r'(Total(?:\s*Due|\s*Amount)?[:\s]*\$?)([0-9,]+\.?[0-9]*)', text, re.IGNORECASE)
    if total_match:
        data["TotalPrice"] = total_match.group(2)
    return data



@router.post("/upload", response_model=List[ExtractedData])
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        logger.info(f"Received upload: filename=%s, content_type=%s", file.filename, file.content_type)
        if not file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".pdf")):
            raise HTTPException(status_code=400, detail="Unsupported file type")

        temp_path = None
        try:
            contents = await file.read()
            logger.info("Read %d bytes from uploaded file %s", len(contents), file.filename)

            if file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="PDF support not implemented yet")

            # Save image to a secure temporary file (unique)
            suffix = Path(file.filename).suffix or ".jpg"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, prefix="upload_", dir=None) as tmp:
                tmp.write(contents)
                temp_path = tmp.name
            logger.info("Saved uploaded file to %s", temp_path)

            # Quick validation: try to decode the saved file with cv2
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                # Try to read from saved file as a fallback
                img = cv2.imread(temp_path)
            if img is None:
                raise ValueError("Uploaded image could not be decoded by OpenCV")

            # Extract text
            text = extract_text_from_image(contents)
            print(text)  # Debug print to verify extracted text

            # Classify document (wrap in try to avoid crashing if external service fails)
            try:
                doc_type = classify_document(text)
                logger.info("Classified document %s as %s", file.filename, doc_type)
            except Exception as e:
                logger.exception("Document classification failed, defaulting to 'invoice'")
                doc_type = "invoice"  # Changed default to invoice for testing

            if doc_type == "receipt":
                logger.info("Receipt detected for file %s", file.filename)
                # Use pre-finetuned model for receipts
                structured = extract_receipt_structured_data(temp_path)
                if not isinstance(structured, dict):
                    raise ValueError("Receipt model did not return a dict")
                # Normalize lists to strings where appropriate
                parsed_data = {k: ' '.join(v) if isinstance(v, list) else v for k, v in structured.items()}
                parsed_data["DocumentType"] = "receipt"
            elif doc_type == "invoice":
                logger.info("Invoice detected for file %s", file.filename)
                # Try model-based invoice extraction first; fallback to regex parser
                try:
                    structured = extract_invoice_structured_data(temp_path)
                    if isinstance(structured, dict) and any(v for v in structured.values()):
                        # Normalize lists to strings if needed
                        parsed_data = {k: ' '.join(v) if isinstance(v, list) else v for k, v in structured.items()}
                        logger.info("Invoice model produced structured data for %s", file.filename)
                    else:
                        logger.info("Invoice model returned empty result for %s, using regex fallback", file.filename)
                        parsed_data = parse_extracted_data_invoice(text)
                except Exception as exc:
                    # Log more helpful message for gated/auth errors
                    tb = traceback.format_exc()
                    logger.error("Invoice model error for %s: %s\n%s", file.filename, str(exc), tb)
                    if 'gated' in str(exc).lower() or '401' in str(exc) or 'access' in str(exc).lower():
                        logger.error("Invoice model appears to be gated or requires HF authentication. Set HUGGINGFACE_HUB_TOKEN env var with a token that has access.")
                    parsed_data = parse_extracted_data_invoice(text)

                # Ensure DocumentType is present
                parsed_data["DocumentType"] = "invoice"
            else:
                logger.info("Unknown doc type for file %s: %s", file.filename, doc_type)
                parsed_data = {"Address": "Unknown", "Date": "", "Item": "", "OrderId": "", "Subtotal": "", "Tax": "", "Title": "", "TotalPrice": "", "DocumentType": "unknown"}

            results.append(ExtractedData(**parsed_data))
        except HTTPException:
            # re-raise FastAPI HTTPExceptions unchanged
            raise
        except Exception as e:
            # Log full traceback for debugging, but return a generic error to the client
            tb = traceback.format_exc()
            logger.error("Error processing file %s: %s\n%s", file.filename, str(e), tb)
            raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {str(e)}")
        finally:
            # Ensure temporary file is removed
            try:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
                    logger.info("Removed temporary file %s", temp_path)
            except Exception:
                logger.exception("Failed to remove temporary file %s", temp_path)

    return results
