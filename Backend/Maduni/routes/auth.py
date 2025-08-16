# routes/auth.py
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from ..services.auth_service import create_user_email, verify_google_token

router = APIRouter()

class EmailSignUp(BaseModel):
    email: EmailStr
    password: str
    name: str
    nic_number: str
    gender: str
    marital_status: str
    home_town: str
    birthday: datetime
    occupation: str
    monthly_salary: int
    family_member_count: int
    provider: str

class GoogleSignIn(BaseModel):
    id_token: str  # This comes from frontend Google sign-in

@router.post("/signup-email")
def signup_email(data: EmailSignUp):
    try:
        user = create_user_email(data.dict())
        return {"message": "User created", "user": user.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin-google")
def signin_google(data: GoogleSignIn):
    try:
        user = verify_google_token(data.id_token)
        return {"message": "Google sign-in success", "user": user.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
