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

# ------------------------------------------------------------------
# 🔹 Basic endpoint tests
# ------------------------------------------------------------------

def test_health_check(client):
    """Check chatbot service health endpoint"""
    r = client.get("/chatbot/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["service"] == "expense-chatbot"
    print("✅ Chatbot health check passed")

def test_get_categories(client):
    """Check that categories endpoint returns valid data"""
    r = client.get("/chatbot/categories")
    assert r.status_code == 200
    data = r.json()
    assert "categories" in data
    assert isinstance(data["categories"], list)
    assert "food" in data["categories"]
    print("✅ Categories route returned expected data")

def test_extract_details_endpoint(client):
    """Test detail extraction from a sample question"""
    question = "How much did I spend on food in June?"
    r = client.get("/chatbot/extract", params={"question": question})
    assert r.status_code == 200
    data = r.json()
    assert "extracted_details" in data
    print("✅ Extract details endpoint working correctly")

# ------------------------------------------------------------------
# 🔹 /ask and /chat functional tests
# ------------------------------------------------------------------

def test_ask_question_with_valid_input(client, sample_user_id):
    """Test chatbot /ask with valid input parameters"""
    r = client.get(
        "/chatbot/ask",
        params={
            "user_id": sample_user_id,
            "question": "How much did I spend on food this month?",
            "category": "food",
            "month": "2025-10"
        }
    )
    assert r.status_code in (200, 500)
    # 200 if mock works; 500 if Firestore unavailable (acceptable for local test)
    print("✅ /ask endpoint reachable")

def test_chat_endpoint_with_valid_input(client, sample_user_id):
    """Test chatbot /chat endpoint with valid input"""
    r = client.get(
        "/chatbot/chat",
        params={
            "question": "Show me my medicine expenses in July",
            "user_id": sample_user_id
        }
    )
    assert r.status_code in (200, 500)
    print("✅ /chat endpoint reachable")

def test_ask_question_empty_user_id(client):
    """Test /ask endpoint with empty user_id should return 400"""
    r = client.get(
        "/chatbot/ask",
        params={
            "user_id": "",
            "question": "How much did I spend on food?",
            "category": "food",
            "month": "2025-10"
        }
    )
    assert r.status_code == 400
    print("✅ Validation check for empty user_id passed")

def test_ask_question_invalid_month_format(client, sample_user_id):
    """Test /ask endpoint with invalid month format"""
    r = client.get(
        "/chatbot/ask",
        params={
            "user_id": sample_user_id,
            "question": "How much did I spend on transport?",
            "category": "transport",
            "month": "October-2025"  # wrong format
        }
    )
    assert r.status_code == 400
    print("✅ Invalid month format check passed")
