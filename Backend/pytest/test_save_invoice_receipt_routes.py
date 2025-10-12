import pytest
from fastapi.testclient import TestClient
from app import app


@pytest.fixture
def client():
    """Create a TestClient for FastAPI app"""
    return TestClient(app)


@pytest.fixture
def sample_invoice():
    """Sample invoice data for testing"""
    return {
        "category": "Utilities",
        "customer_address": "123 Main Street",
        "customer_name": "John Doe",
        "due_date": "2025-10-15T00:00:00",
        "invoice_number": "INV-001",
        "item": "Electricity Bill",
        "seller_address": "Power Company HQ",
        "seller_name": "PowerCo",
        "sent_email": False,
        "total_amount": 150.50,
        "uploaded_date": "2025-10-05T00:00:00",
        "user_id": "test_user_001"
    }


@pytest.fixture
def sample_receipt():
    """Sample receipt data for testing"""
    return {
        "category": "Food",
        "date": "2025-10-05T00:00:00",
        "items": [{"name": "Burger", "price": 12.0}],
        "order_id": "ORD-123",
        "seller_address": "Food Street 21",
        "seller_name": "Burger Hub",
        "subtotal": 10.0,
        "tax": 2.0,
        "total_price": 12.0,
        "uploaded_date": "2025-10-05T00:00:00",
        "user_id": "test_user_001"
    }


# --------------------------------------------------------------------
# 🔹 Invoice tests
# --------------------------------------------------------------------

def test_save_invoice_success(client, sample_invoice):
    """
    Test that valid invoice data is saved successfully (status code 200)
    """
    r = client.post("/api/invoice", json=sample_invoice)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert "doc_id" in data
    print("✅ Invoice route saved successfully:", data["doc_id"])


def test_save_invoice_invalid_amount(client, sample_invoice):
    """
    Test invoice with negative total_amount should fail validation (422)
    """
    sample_invoice["total_amount"] = -50.0
    r = client.post("/api/invoice", json=sample_invoice)
    assert r.status_code == 422
    print("✅ Invoice negative amount validation passed")


def test_save_invoice_missing_required_field(client, sample_invoice):
    """
    Test invoice missing required field 'invoice_number' should fail (422)
    """
    del sample_invoice["invoice_number"]
    r = client.post("/api/invoice", json=sample_invoice)
    assert r.status_code == 422
    print("✅ Invoice missing field validation passed")


# --------------------------------------------------------------------
# 🔹 Receipt tests
# --------------------------------------------------------------------

def test_save_receipt_success(client, sample_receipt):
    """
    Test that valid receipt data is saved successfully (status code 200)
    """
    r = client.post("/api/receipt", json=sample_receipt)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert "doc_id" in data
    print("✅ Receipt route saved successfully:", data["doc_id"])


def test_save_receipt_invalid_total(client, sample_receipt):
    """
    Test receipt with negative total_price should fail validation (422)
    """
    sample_receipt["total_price"] = -10.0
    r = client.post("/api/receipt", json=sample_receipt)
    assert r.status_code == 422
    print("✅ Receipt negative total validation passed")


def test_save_receipt_missing_category(client, sample_receipt):
    """
    Test missing category should fail validation (422)
    """
    del sample_receipt["category"]
    r = client.post("/api/receipt", json=sample_receipt)
    assert r.status_code == 422
    print("✅ Receipt missing category validation passed")
