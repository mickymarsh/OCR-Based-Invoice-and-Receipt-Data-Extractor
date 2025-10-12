# tests/test_user_profile_integration.py
import pytest
from fastapi.testclient import TestClient
from app import app

@pytest.fixture
def client():
    """Fixture: Create a reusable FastAPI test client"""
    return TestClient(app)


# ------------------------------------------------------
# Helper function
# ------------------------------------------------------
def signup_and_get_token_via_rest(client, email, password):
    """Call the helper route to get a valid ID token"""
    r = client.post("/auth/signup-and-get-token", json={"email": email, "password": password})
    assert r.status_code == 200
    print(f"✅ Created user and retrieved ID token for {email}")
    return r.json()["idToken"]


# ------------------------------------------------------
# Test 1: Basic signup flow
# ------------------------------------------------------
def test_signup_helper(client):
    """Should successfully create a user and return an ID token"""
    token = signup_and_get_token_via_rest(client, "test_user@example.com", "Test1234")
    assert token is not None
    print("🟢 PASS: Signup helper returned valid ID token")


# ------------------------------------------------------
# Test 2: Successful profile setup
# ------------------------------------------------------
def test_setup_profile_success(client):
    """Should create a user and successfully set up profile"""
    email = "test_user1@example.com"
    password = "Madhuni1234"
    token = signup_and_get_token_via_rest(client, email, password)

    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "uid": "test_user1_uid",
        "signup_at": "2025-10-05T08:00:00",
        "name": "Test User",
        "gender": "Male",
        "marital_status": "Single",
        "home_town": "Colombo",
        "birthday": "1990-01-01T00:00:00",
        "education_level": "Bachelors",
        "car_ownership": "No",
        "occupation": "Engineer",
        "monthly_salary": 5000,
        "family_member_count": 3,
        "exercise_frequency": "Weekly",
        "email": email
    }

    r = client.post("/auth/setup-profile", json=payload, headers=headers)
    assert r.status_code == 200
    assert "Profile saved successfully" in r.json()["message"]
    print("🟢 PASS: Profile setup successful for", email)


# ------------------------------------------------------
# Test 3: Invalid email validation
# ------------------------------------------------------
def test_setup_profile_invalid_email(client):
    """Should reject profile creation with invalid email"""
    email = "test_user2@example.com"
    password = "Test5678"
    token = signup_and_get_token_via_rest(client, email, password)

    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "uid": "test_user2_uid",
        "signup_at": "2025-10-05T08:00:00",
        "name": "Test User",
        "gender": "Male",
        "marital_status": "Single",
        "home_town": "Colombo",
        "birthday": "1990-01-01T00:00:00",
        "education_level": "Bachelors",
        "car_ownership": "No",
        "occupation": "Engineer",
        "monthly_salary": 5000,
        "family_member_count": 3,
        "exercise_frequency": "Weekly",
        "email": "invalid-email"
    }

    r = client.post("/auth/setup-profile", json=payload, headers=headers)
    assert r.status_code == 422
    print("🟡 PASS: Invalid email correctly rejected (422)")
