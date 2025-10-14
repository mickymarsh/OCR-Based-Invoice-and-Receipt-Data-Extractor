# tests/conftest.py
import os
import sys
import requests
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Add backend root to sys.path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import your existing FastAPI app
from app import app

load_dotenv()

# --- keeps your existing docstring display ---
def pytest_itemcollected(item):
    """Show docstring when test is collected"""
    if item.function.__doc__:
        item._nodeid = f"{item.nodeid} - {item.function.__doc__}"

# --- Firebase test setup ---
FIREBASE_API_KEY = os.environ["FIREBASE_API_KEY"]
TEST_USER_EMAIL = os.environ["TEST_USER_EMAIL"]
TEST_USER_PASSWORD = os.environ["TEST_USER_PASSWORD"]

def sign_in_and_get_id_token(email: str, password: str, api_key: str) -> str:
    """Sign in to Firebase Auth REST API and get ID token"""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    r = requests.post(url, json=payload, timeout=10)
    r.raise_for_status()
    return r.json()["idToken"]

@pytest.fixture()
def id_token():
    """Get Firebase ID token for the test user"""
    return sign_in_and_get_id_token(TEST_USER_EMAIL, TEST_USER_PASSWORD, FIREBASE_API_KEY)

@pytest.fixture()
def client():
    """Plain TestClient for your existing FastAPI app"""
    return TestClient(app)

@pytest.fixture()
def auth_client(client, id_token):
    """TestClient with Authorization header already set"""
    client.headers.update({"Authorization": f"Bearer {id_token}"})
    return client
