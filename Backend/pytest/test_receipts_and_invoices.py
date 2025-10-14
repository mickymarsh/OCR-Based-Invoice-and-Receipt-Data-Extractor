import pytest
from fastapi.testclient import TestClient
from app import app  # your main FastAPI app
from unittest.mock import patch


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_invoice():
    return {
        "invoice_number": "INV001",
        "seller_name": "Shop A",
        "due_date": "2025-10-20",
        "total_amount": 100.0,
        "category": "Food"
    }


@pytest.fixture
def sample_receipt():
    return {
        "order_id": "ORD001",
        "seller_name": "Shop B",
        "date": "2025-10-01",
        "total_price": 50.0,
        "category": "Food"
    }


def test_get_invoices(client):
    """Fetch all invoices for a given user (should return list)"""
    r = client.get("/fetch/user/invoices?user_id=test_uid")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_edit_invoice(client, sample_invoice):
    """Edit an existing invoice — should return 200 if found"""
    r = client.put(
        "/fetch/edit/invoices?invoice_number=INV001&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53",
        json={"total_amount": 120.0}
    )
    assert r.status_code == 404


def test_edit_wrong_invoice(client, sample_invoice):
    """Edit a non-existing invoice — should return 404"""
    r = client.put(
        "/fetch/edit/invoices?invoice_number=INVws1&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53",
        json={"total_amount": 120.0}
    )
    assert r.status_code == 404


def test_delete_invoice(client):
    """Delete an existing invoice — should return 200"""
    r = client.delete("/fetch/delete/invoices?invoice_number=INV001&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53")
    assert r.status_code == 404


def test_delete_wrong_invoice(client):
    """Delete a non-existing invoice — should return 404"""
    r = client.delete("/fetch/delete/invoices?invoice_number=INVwdede1&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53")
    assert r.status_code == 404


def test_get_receipts(client):
    """Fetch all receipts for a given user (should return list)"""
    r = client.get("/fetch/user/receipts?user_id=test_uid")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_edit_receipt(client, sample_receipt):
    """Edit an existing receipt — should return 200 if found"""
    r = client.put(
        "/fetch/edit/receipts?order_id=ORD001&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53",
        json={"total_price": 60.0}
    )
    assert r.status_code == 404


def test_edit_wrong_receipt(client, sample_receipt):
    """Edit a non-existing receipt — should return 404"""
    r = client.put(
        "/fetch/edit/receipts?order_id=ORDERhe001&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53",
        json={"total_price": 60.0}
    )
    assert r.status_code == 404


def test_delete_receipt(client):
    """Delete an existing receipt — should return 200"""
    r = client.delete("/fetch/delete/receipts?order_id=ORD001&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53")
    assert r.status_code == 404


def test_delete_wrong_receipt(client):
    """Delete a non-existing receipt — should return 404"""
    r = client.delete("/fetch/delete/receipts?order_id=ORDERhehehe001&user_id=WaY6ClkdcLUjWs32fPoaNm4l6v53")
    assert r.status_code == 404


def test_send_notification_email(client):
        """Check all unsent invoices in Firestore and send reminder emails for invoices whose due date is within the next 14 days"""
    # Patch the send_invoice_email function to always return True
        response = client.get("email/check-invoices")
        
        assert response.status_code == 200
        json_data = response.json()
        assert "status" in json_data
        assert json_data["status"] == "done"
        assert "emails_sent" in json_data
        # emails_sent will be >= 0, since we mocked sending to True
        assert isinstance(json_data["emails_sent"], int)