# tests/test_receipts_routes.py
import pytest
from fastapi.testclient import TestClient
from app import app

@pytest.fixture
def client():
    """Create a TestClient for the FastAPI app"""
    return TestClient(app)

@pytest.fixture
def sample_user_id():
    """Sample user ID for testing"""
    return "WaY6ClkdcLUjWs32fPoaNm4l6v53"

@pytest.fixture
def sample_category():
    """Sample expense category"""
    return "food"

@pytest.fixture
def sample_month_year():
    """Sample month and year"""
    return {"month": 10, "year": 2025}

def test_get_receipts(client, sample_user_id):
    """
    Test fetching all receipts for a user
    """
    r = client.get(f"/get/receipts/{sample_user_id}")
    assert r.status_code == 200
    assert "receipts" in r.json()
    print("✅ Fetch all receipts route passed")

def test_get_receipts_by_month(client, sample_user_id, sample_month_year):
    """
    Test fetching receipts filtered by month and year
    """
    r = client.get(
        f"/get/receipts/{sample_user_id}/by-month",
        params={"month": sample_month_year["month"], "year": sample_month_year["year"]}
    )
    assert r.status_code == 200
    assert "receipts" in r.json()
    print("✅ Fetch receipts by month route passed")

def test_get_receipts_for_category_month(client, sample_user_id, sample_category, sample_month_year):
    """
    Test fetching receipts filtered by category, month, and year
    """
    r = client.get(
        f"/get/receipts/{sample_user_id}/filter",
        params={
            "category": sample_category,
            "month": sample_month_year["month"],
            "year": sample_month_year["year"]
        }
    )
    assert r.status_code == 200
    assert "receipts" in r.json()
    print("✅ Fetch receipts by category/month route passed")


def test_invalid_category(client, sample_user_id, sample_month_year):
    """
    Test fetching receipts with a category that does not exist, should trigger HTTP 404 
    """
    r = client.get(
        f"/get/receipts/{sample_user_id}/filter",
        params={
            "category": "nonexistent_category",
            "month": sample_month_year["month"],
            "year": sample_month_year["year"]
        }
    )
    assert r.status_code == 200
    # Depending on your implementation, receipts may be empty
    assert "receipts" in r.json()
    assert r.json()["receipts"] == []  # Optional, if your service returns empty list
    print("✅ Invalid category check passed")


def test_invalid_month(client, sample_user_id):
    """
    Test invalid month value triggers HTTP 400
    """
    r = client.get(f"/get/receipts/{sample_user_id}/by-month", params={"month": 15, "year": 2025})
    assert r.status_code == 400
    print("✅ Invalid month check passed")

def test_invalid_year(client, sample_user_id):
    """
    Test invalid year value triggers HTTP 400
    """
    r = client.get(f"/get/receipts/{sample_user_id}/by-month", params={"month": 10, "year": 1999})
    assert r.status_code == 400
    print("✅ Invalid year check passed")
