import os
import pytest
from fastapi.testclient import TestClient
from app import app  # <-- import your FastAPI app

client = TestClient(app)

def get_file_path(filename: str) -> str:
    """Helper to get absolute path to test files"""
    path = os.path.join(os.path.dirname(__file__), "..", filename)
    assert os.path.exists(path), f"Test file missing: {path}"
    return path

def upload_and_check(file_path: str):
    """Helper to upload a file and verify response"""
    with open(file_path, "rb") as f:
        files = {"files": (os.path.basename(file_path), f, "image/jpeg")}
        response = client.post("/api/upload", files=files)

    assert response.status_code == 200, f"Upload failed: {response.text}"
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1

    parsed = data[0]
    assert "DocumentType" in parsed
    assert "ExpenseType" in parsed

    print(f"\n✅ Upload OK for {os.path.basename(file_path)}")
    print(f"DocumentType={parsed['DocumentType']}, ExpenseType={parsed['ExpenseType']}")

def test_upload_invoice():
    """Test uploading an invoice image"""
    file_path = get_file_path("test_data/invoice_sample.jpg")
    upload_and_check(file_path)

def test_upload_receipt():
    """Test uploading a receipt image"""
    file_path = get_file_path("test_data/receipt_sample.jpg")
    upload_and_check(file_path)
