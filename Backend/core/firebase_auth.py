# core/firebase_auth.py
from fastapi import HTTPException, Depends, Header
from firebase_admin import auth

def verify_firebase_token(authorization: str = Header(...)):
    """
    Expects header: Authorization: Bearer <id_token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    id_token = authorization.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # contains uid, email, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
