# Janodi/routes/test_auth_router.py
from fastapi import APIRouter, Depends
from core.firebase_auth import verify_firebase_token

router = APIRouter()

@router.get("/protected-test")
def protected_test_route(user=Depends(verify_firebase_token)):
    """Temporary route to test Firebase authentication"""
    return {"uid": user["uid"], "email": user.get("email")}
