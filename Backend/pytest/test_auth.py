# tests/test_auth.py
def test_signup_success(client):
    """Should create a new user and return 201"""
    payload = {
        "email": "new_test_user@example.com",
        "password": "test1234"
    }
    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "uid" in data
    assert data["email"] == payload["email"]

def test_signup_existing_email(client):
    """Should return 400 if email already exists"""
    payload = {
        "email": "test_user@example.com",  # already in Firebase
        "password": "test1234"
    }
    r = client.post("/auth/signup", json=payload)
    assert r.status_code == 400
    data = r.json()
    assert "detail" in data


def test_auth_route(auth_client):
    """Should return 200 for authorized request"""
    r = auth_client.get("/test/protected-test")
    assert r.status_code == 200

def test_missing_token(client):
    """Should return 401 when no token is provided"""
    r = client.get("/test/protected-test")
    assert r.status_code == 401

def test_invalid_token(client):
    """Should return 401 for invalid token"""
    client.headers.update({"Authorization": "Bearer invalidtoken"})
    r = client.get("/test/protected-test")
    assert r.status_code == 401
