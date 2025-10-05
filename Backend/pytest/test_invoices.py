# pytest/test_invoices.py

import pytest
from datetime import datetime
from pydantic import ValidationError
from core.config import db
from Janodi.routes.invoicesave import InvoiceData

# -----------------------------
# 1. Constraint Validation Tests
# -----------------------------

def test_missing_category():
    """Test: Category is required and cannot be null"""
    with pytest.raises(ValidationError):
        InvoiceData(
            customer_address="Colombo",
            customer_name="Alice",
            due_date=datetime.now(),
            invoice_number="INV001",
            item="Laptop",
            seller_address="Kandy",
            seller_name="TechStore",
            sent_email=False,
            total_amount=1000.0,
            uploaded_date=datetime.now(),
            user_id="u1"
        )

def test_missing_due_date():
    """Test: Due date is required and cannot be null"""
    with pytest.raises(ValidationError):
        InvoiceData(
            category="Electronics",
            customer_address="Colombo",
            customer_name="Alice",
            invoice_number="INV001",
            item="Laptop",
            seller_address="Kandy",
            seller_name="TechStore",
            sent_email=False,
            total_amount=1000.0,
            uploaded_date=datetime.now(),
            user_id="u1"
        )

def test_missing_invoice_number():
    """Test: Invoice number is required and cannot be null"""
    with pytest.raises(ValidationError):
        InvoiceData(
            category="Electronics",
            customer_address="Colombo",
            customer_name="Alice",
            due_date=datetime.now(),
            item="Laptop",
            seller_address="Kandy",
            seller_name="TechStore",
            sent_email=False,
            total_amount=1000.0,
            uploaded_date=datetime.now(),
            user_id="u1"
        )

def test_negative_total_amount():
    """Test: Total amount cannot be negative"""
    with pytest.raises(ValidationError):
        InvoiceData(
            category="Electronics",
            customer_address="Colombo",
            customer_name="Alice",
            due_date=datetime.now(),
            invoice_number="INV001",
            item="Laptop",
            seller_address="Kandy",
            seller_name="TechStore",
            sent_email=False,
            total_amount=-500.0,  # invalid
            uploaded_date=datetime.now(),
            user_id="u1"
        )

# -----------------------------
# 2. Valid & Edge Case Tests
# -----------------------------

def test_valid_invoice():
    """Test: Valid invoice should be accepted"""
    invoice = InvoiceData(
        category="Electronics",
        customer_address="Colombo",
        customer_name="Alice",
        due_date=datetime(2025, 12, 31),
        invoice_number="INV001",
        item="Laptop",
        seller_address="Kandy",
        seller_name="TechStore",
        sent_email=True,
        total_amount=1500.50,
        uploaded_date=datetime.now(),
        user_id="u1"
    )
    assert invoice.invoice_number == "INV001"
    assert invoice.total_amount == 1500.50

def test_edge_case_large_total_amount():
    """Edge Case: Very large total amount should still be valid"""
    invoice = InvoiceData(
        category="Luxury",
        customer_address="Colombo",
        customer_name="Bob",
        due_date=datetime(2030, 1, 1),
        invoice_number="INV999999",
        item="Private Jet",
        seller_address="Dubai",
        seller_name="EliteSales",
        sent_email=True,
        total_amount=10**9,  # 1 billion
        uploaded_date=datetime.now(),
        user_id="u999"
    )
    assert invoice.total_amount == 10**9


# -----------------------------
# 3. Firestore Integration Test
# -----------------------------

def test_fetch_first_invoice_from_db():
    """Integration Test: Fetch first document from Firestore 'Invoice' collection and validate core fields"""
    docs = db.collection("Invoice").limit(1).stream()
    first_doc = next(docs, None)

    assert first_doc is not None, "No documents found in 'Invoice' collection"

    data = first_doc.to_dict()

    # ✅ Core checks
    assert "invoice_number" in data and data["invoice_number"], "Invoice number is missing"
    assert "due_date" in data and data["due_date"] is not None, "Due date is missing"
    assert "total_amount" in data and data["total_amount"] >= 0, "Invalid total amount"
