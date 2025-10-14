# core/firebase_auth.py
from fastapi import HTTPException, Depends, Header
from firebase_admin import auth

# core/firebase_auth.py
from fastapi import HTTPException, Header

def verify_firebase_token(authorization: str | None = Header(default=None)):
    """
    Expects header: Authorization: Bearer <id_token>
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    id_token = authorization.split(" ")[1]
    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # contains uid, email, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

