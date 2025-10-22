from datetime import datetime
from fastapi import HTTPException
from firebase_admin import auth, firestore
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError
from core.firestore import get_users_collection
from ..models.users import Users

def save_user(uid: str, email: str, user_data: dict) -> Users:
    """
    Save user profile data to Firestore (DO NOT create new Firebase user)
    """
    print("Received user_data:", user_data)  
    print("UID from token:", uid)
    print("Email from token:", email)

    try:
        # Check if user already exists in Firestore
        user_ref = get_users_collection().document(uid)
        existing_user = user_ref.get()
        
        if existing_user.exists:
            print("User already exists in Firestore, updating profile...")
            # Update existing user
            user_ref.update(user_data)
            return Users(**existing_user.to_dict())
        
        # Convert birthday string to datetime if needed
        birthday = user_data.get("birthday")
        if isinstance(birthday, str):
            birthday = datetime.fromisoformat(birthday.replace("Z", "+00:00"))

        # Prepare user document for Firestore
        user_doc = {
            "uid": uid,
            "signup_at": datetime.utcnow(),
            "name": user_data["name"],
            "gender": user_data["gender"],
            "marital_status": user_data["marital_status"],
            "home_town": user_data["home_town"],
            "birthday": birthday,
            "education_level": user_data["education_level"],
            "car_ownership": user_data["car_ownership"],
            "occupation": user_data["occupation"],
            "monthly_salary": user_data["monthly_salary"],
            "average_expenses_per_month": user_data.get("average_expenses_per_month"),
            "average_expenses_per_year": user_data.get("average_expenses_per_year"),
            "cluster_id": user_data.get("cluster_id"),
            "family_member_count": user_data["family_member_count"],
            "email": email,
            "exercise_frequency": user_data["exercise_frequency"],
            "provider": "email",
            "created_at": firestore.SERVER_TIMESTAMP
        }

        # Save to Firestore only (NO auth.create_user!)
        user_ref.set(user_doc)

        print(f"User profile saved successfully: {email} (UID: {uid})")
        return Users(**user_doc)

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong while saving the user profile.")