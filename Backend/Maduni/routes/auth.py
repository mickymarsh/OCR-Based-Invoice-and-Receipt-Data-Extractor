# routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from ..services.auth_service import save_user
from ..models.users import Users
from core.firebase_auth import verify_firebase_token


router = APIRouter()

@router.post("/setup-profile")
def setup_profile(data: Users, decoded_token=Depends(verify_firebase_token)):
    uid = decoded_token["uid"]
    email = decoded_token.get("email")

    user_doc = save_user(uid=uid, email=email, user_data=data.dict())
    return {"message": "Profile saved successfully", "user": user_doc}
