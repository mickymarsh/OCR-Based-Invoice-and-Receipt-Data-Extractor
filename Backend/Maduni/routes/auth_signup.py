import requests
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from firebase_admin import auth
import os

router = APIRouter()

# Get from environment variables for security
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

class UserAuthRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup", status_code=201)
def signup_user(payload: UserAuthRequest):
    """
    Create a new Firebase user.
    Returns 201 if success, 400 if email already exists.
    """
    try:
        user = auth.create_user(
            email=payload.email,
            password=payload.password
        )
        return {"uid": user.uid, "email": user.email}
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Email already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/signup-and-get-token")
def signup_and_get_token(payload: UserAuthRequest):
    """
    Signup a Firebase user and immediately return an ID token via Firebase REST API.
    Only for integration tests.
    """
    try:
        # Step 1: Create user in Firebase (if doesn't exist)
        try:
            user = auth.create_user(email=payload.email, password=payload.password)
        except auth.EmailAlreadyExistsError:
            # User already exists - this is expected in some cases
            pass

        # Step 2: Sign in using REST API to get ID token
        if not FIREBASE_API_KEY:
            raise HTTPException(status_code=500, detail="Firebase API key not configured")

        login_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
        login_payload = {"email": payload.email, "password": payload.password, "returnSecureToken": True}
        
        r = requests.post(login_url, json=login_payload)
        if r.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get ID token")

        response_data = r.json()
        id_token = response_data["idToken"]
        return {"email": payload.email, "idToken": id_token}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))