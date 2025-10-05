# pytest/test_receipts.py

import pytest
from datetime import datetime
from pydantic import ValidationError
from Janodi.routes.receiptsave import ReceiptData   # adjust the import path to match your project
from core.config import db


# -----------------------------
# 1. Constraint Validation Tests
# -----------------------------

def test_missing_category():
    """Test: Category is required and cannot be null"""
    with pytest.raises(ValidationError):
        ReceiptData(
            date=datetime.now(),
            items=[{"item": "Milk", "price": 200}],
            order_id="ORD001",
            seller_address="Colombo",
            seller_name="ShopX",
            subtotal=200.0,
            tax=10.0,
            total_price=210.0,
            uploaded_date=datetime.now(),
            user_id="u1"
        )

def test_missing_date():
    """Test: Date is required and cannot be null"""
    with pytest.raises(ValidationError):
        ReceiptData(
            category="Groceries",
            items=[{"item": "Milk", "price": 200}],
            order_id="ORD001",
            seller_address="Colombo",
            seller_name="ShopX",
            subtotal=200.0,
            tax=10.0,
            total_price=210.0,
            uploaded_date=datetime.now(),
            user_id="u1"
        )

def test_missing_uploaded_date():
    """Test: Uploaded date is required and cannot be null"""
    with pytest.raises(ValidationError):
        ReceiptData(
            category="Groceries",
            date=datetime.now(),
            items=[{"item": "Milk", "price": 200}],
            order_id="ORD001",
            seller_address="Colombo",
            seller_name="ShopX",
            subtotal=200.0,
            tax=10.0,
            total_price=210.0,
            user_id="u1"
        )

def test_negative_total_price():
    """Test: Total price cannot be negative"""
    with pytest.raises(ValidationError):
        ReceiptData(
            category="Groceries",
            date=datetime.now(),
            items=[{"item": "Milk", "price": 200}],
            order_id="ORD001",
            seller_address="Colombo",
            seller_name="ShopX",
            subtotal=200.0,
            tax=10.0,
            total_price=-50.0,  # invalid
            uploaded_date=datetime.now(),
            user_id="u1"
        )

# -----------------------------
# 2. Valid & Edge Case Tests
# -----------------------------

def test_valid_receipt():
    """Test: Valid receipt should be accepted"""
    receipt = ReceiptData(
        category="Groceries",
        date=datetime(2025, 1, 1),
        items=[{"item": "Milk", "price": 200}],
        order_id="ORD001",
        seller_address="Colombo",
        seller_name="ShopX",
        subtotal=200.0,
        tax=10.0,
        total_price=210.0,
        uploaded_date=datetime.now(),
        user_id="u1"
    )
    assert receipt.category == "Groceries"
    assert receipt.total_price == 210.0

def test_edge_case_large_total_price():
    """Edge Case: Very large total price should still be valid"""
    receipt = ReceiptData(
        category="Luxury",
        date=datetime(2025, 6, 1),
        items=[{"item": "Gold Watch", "price": 10**9}],
        order_id="ORD999999",
        seller_address="Dubai",
        seller_name="EliteShop",
        subtotal=10**9,
        tax=0.0,
        total_price=10**9,  # 1 billion
        uploaded_date=datetime.now(),
        user_id="u999"
    )
    assert receipt.total_price == 10**9


def test_fetch_first_receipt_from_db():
    """Integration Test: Fetch first document from Firestore 'Receipt' collection and validate core fields"""
    docs = db.collection("Receipt").limit(1).stream()
    first_doc = next(docs, None)

    assert first_doc is not None, "No documents found in 'Receipt' collection"

    data = first_doc.to_dict()

    # ✅ Core checks
    assert "category" in data and data["category"], "Category is missing"
    assert "date" in data and data["date"] is not None, "Date is missing"
    assert "uploaded_date" in data and data["uploaded_date"] is not None, "Uploaded date is missing"
    assert "total_price" in data and data["total_price"] >= 0, "Invalid total price"

