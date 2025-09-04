from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import easyocr
import cv2
import numpy as np
import re
from pydantic import BaseModel
from ..gemini_api import classify_document

router = APIRouter()

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])

class ExtractedData(BaseModel):
    Address: str = ""
    Date: str = ""
    Item: str = ""
    OrderId: str = ""
    Subtotal: str = ""
    Tax: str = ""
    Title: str = ""
    TotalPrice: str = ""

def extract_text_from_image(image_bytes: bytes) -> str:
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Perform OCR
    results = reader.readtext(img)
    
    # Extract text
    text = ' '.join([result[1] for result in results])
    return text

def parse_extracted_data_receipt(text: str) -> dict:
    # Receipt parsing logic (same as before, can be customized)
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
    lines = text.split('\n')
    if lines:
        data["Address"] = lines[0].strip()
    date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b'
    date_match = re.search(date_pattern, text)
    if date_match:
        data["Date"] = date_match.group(1)
    item_line = next((l for l in lines if 'item' in l.lower()), "")
    data["Item"] = item_line
    orderid_pattern = r'(Order\s*ID[:\s]*)(\w+)'
    orderid_match = re.search(orderid_pattern, text, re.IGNORECASE)
    if orderid_match:
        data["OrderId"] = orderid_match.group(2)
    subtotal_pattern = r'(Subtotal[:\s]*)(\$?\d+\.?\d*)'
    subtotal_match = re.search(subtotal_pattern, text, re.IGNORECASE)
    if subtotal_match:
        data["Subtotal"] = subtotal_match.group(2)
    tax_pattern = r'(Tax[:\s]*)(\$?\d+\.?\d*)'
    tax_match = re.search(tax_pattern, text, re.IGNORECASE)
    if tax_match:
        data["Tax"] = tax_match.group(2)
    if len(lines) > 1:
        data["Title"] = lines[1].strip()
    title_line = next((l for l in lines if 'title' in l.lower()), "")
    if title_line:
        data["Title"] = title_line
    total_pattern = r'(Total(?:\s*Price)?[:\s]*)(\$?\d+\.?\d*)'
    total_match = re.search(total_pattern, text, re.IGNORECASE)
    if total_match:
        data["TotalPrice"] = total_match.group(2)
    return data

def parse_extracted_data_invoice(text: str) -> dict:
    # Invoice parsing logic (can be customized)
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
    lines = text.split('\n')
    if lines:
        data["Address"] = lines[0].strip()
    date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b'
    date_match = re.search(date_pattern, text)
    if date_match:
        data["Date"] = date_match.group(1)
    item_line = next((l for l in lines if 'item' in l.lower()), "")
    data["Item"] = item_line
    orderid_pattern = r'(Order\s*ID[:\s]*)(\w+)'
    orderid_match = re.search(orderid_pattern, text, re.IGNORECASE)
    if orderid_match:
        data["OrderId"] = orderid_match.group(2)
    subtotal_pattern = r'(Subtotal[:\s]*)(\$?\d+\.?\d*)'
    subtotal_match = re.search(subtotal_pattern, text, re.IGNORECASE)
    if subtotal_match:
        data["Subtotal"] = subtotal_match.group(2)
    tax_pattern = r'(Tax[:\s]*)(\$?\d+\.?\d*)'
    tax_match = re.search(tax_pattern, text, re.IGNORECASE)
    if tax_match:
        data["Tax"] = tax_match.group(2)
    if len(lines) > 1:
        data["Title"] = lines[1].strip()
    title_line = next((l for l in lines if 'title' in l.lower()), "")
    if title_line:
        data["Title"] = title_line
    total_pattern = r'(Total(?:\s*Price)?[:\s]*)(\$?\d+\.?\d*)'
    total_match = re.search(total_pattern, text, re.IGNORECASE)
    if total_match:
        data["TotalPrice"] = total_match.group(2)
    return data

@router.post("/upload", response_model=List[ExtractedData])
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    
    for file in files:
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        try:
            contents = await file.read()
            
            if file.filename.lower().endswith('.pdf'):
                # For PDF, you'd need pdf2image or similar to convert to images
                # For simplicity, skip PDF handling or add library
                raise HTTPException(status_code=400, detail="PDF support not implemented yet")
            
            # Extract text
            text = extract_text_from_image(contents)
            doc_type = classify_document(text)
            if doc_type == "receipt":
                parsed_data = parse_extracted_data_receipt(text)
            elif doc_type == "invoice":
                parsed_data = parse_extracted_data_invoice(text)
            else:
                parsed_data = {"Address": "Unknown", "Date": "", "Item": "", "OrderId": "", "Subtotal": "", "Tax": "", "Title": "", "TotalPrice": ""}
            
            results.append(ExtractedData(**parsed_data))
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {str(e)}")
    
    return results
