from datetime import datetime
from fastapi import HTTPException
from firebase_admin import auth
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError
from core.firestore import get_user_collection
from ..models.user import User

def save_user(uid: str, email: str, user_data: dict) -> User:
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
    except ExpiredIdTokenError:
        raise ValueError("Token has expired")
    except RevokedIdTokenError:
        raise ValueError("Token has been revoked")
    except InvalidIdTokenError:
        raise ValueError("Invalid token")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong while creating the user.")

