from datetime import datetime
from fastapi import HTTPException
from firebase_admin import auth
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError
from core.firestore import get_user_collection
from ..models.user import User

def create_user_email(user_data: dict) -> User:
    """
    user_data should be a dict containing all fields needed for the User model,
    including email and password.
    """
    print("Received user_data:", user_data)  

    email = user_data["email"]
    password = user_data["password"]

    print("Email:", email)
    print("Password exists:", password is not None)

    try:
        #Create Firebase Auth user
        user_record = auth.create_user(email=email, password=password)
        uid = user_record.uid
        print("Firebase user created. UID:", uid)

        birthday = user_data.get("birthday")
        if isinstance(birthday, str):
            birthday = datetime.fromisoformat(birthday.replace("Z", "+00:00"))

        #Prepare full user document
        user_doc = {
            "uid": uid,
            "signup_at": datetime.utcnow(),
            "name": user_data["name"],
            "nic_number": user_data["nic_number"],
            "gender": user_data["gender"],
            "marital_status": user_data["marital_status"],
            "home_town": user_data["home_town"],
            "birthday": birthday,
            "occupation": user_data["occupation"],
            "monthly_salary": user_data["monthly_salary"],
            "average_expenses_per_month": None,
            "average_expenses_per_year": None,
            "cluster_id": None,
            "family_member_count": user_data["family_member_count"],
            "email": email,
            "provider": "email"
            # Note: never store password in Firestore
        }

        #Save in Firestore
        get_user_collection().document(uid).set(user_doc)

        print(f"User created successfully: {email} (UID: {uid})")
        return User(**user_doc)

    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=409, detail="User already exists.")

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong while creating the user.")

def verify_google_token(id_token: str) -> User:
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")
        firebase_user = auth.get_user(uid)

        #Prepare full user document
        user_doc = {
            "uid": uid,
            "signup_at": datetime.utcnow(),
            "name": firebase_user["name"],
            "nic_number": firebase_user["nic_number"],
            "gender": firebase_user["gender"],
            "marital_status": firebase_user["marital_status"],
            "home_town": firebase_user["home_town"],
            "birthday": firebase_user["birthday"],
            "occupation": firebase_user["occupation"],
            "monthly_salary": firebase_user["monthly_salary"],
            "average_expenses_per_month": firebase_user.get("average_expenses_per_month"),
            "average_expenses_per_year": firebase_user.get("average_expenses_per_year"),
            "cluster_id": firebase_user.get("cluster_id"),
            "family_member_count": firebase_user["family_member_count"],
            "email": firebase_user["email"],
            "provider": "google"
            # Note: never store password in Firestore
        }

        #Save in Firestore
        get_user_collection().document(uid).set(user_doc)

        return User(**user_doc)

    except ExpiredIdTokenError:
        raise ValueError("Token has expired")
    except RevokedIdTokenError:
        raise ValueError("Token has been revoked")
    except InvalidIdTokenError:
        raise ValueError("Invalid token")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {e}")