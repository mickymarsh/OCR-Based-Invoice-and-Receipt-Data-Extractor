# pytest/test_users.py

import pytest
from datetime import datetime
from pydantic import ValidationError
from Maduni.models.users import Users
from core.config import db  # Firestore client (Admin SDK)

# -----------------------------
# 1. Pydantic Validation Tests
# -----------------------------

def test_invalid_email():
    """Test: Invalid email format should raise ValidationError"""
    with pytest.raises(ValidationError):
        Users(
            uid="u1",
            signup_at=datetime.now(),
            name="Alice",
            gender="F",
            marital_status="Single",
            home_town="Colombo",
            birthday=datetime(1995, 1, 1),
            education_level="Bachelor",
            car_ownership="No",
            occupation="Engineer",
            monthly_salary=5000,
            family_member_count=3,
            exercise_frequency="Weekly",
            email="invalid-email"  # invalid
        )

def test_negative_salary():
    """Test: Monthly salary cannot be negative"""
    with pytest.raises(ValidationError):
        Users(
            uid="u2",
            signup_at=datetime.now(),
            name="Bob",
            gender="M",
            marital_status="Single",
            home_town="Kandy",
            birthday=datetime(1990, 5, 10),
            education_level="Master",
            car_ownership="Yes",
            occupation="Developer",
            monthly_salary=-1000,  # invalid
            family_member_count=2,
            exercise_frequency="Daily",
            email="bob@example.com"
        )

def test_negative_family_member_count():
    """Test: Family member count cannot be negative"""
    with pytest.raises(ValidationError):
        Users(
            uid="u3",
            signup_at=datetime.now(),
            name="Charlie",
            gender="M",
            marital_status="Married",
            home_town="Galle",
            birthday=datetime(1985, 7, 20),
            education_level="PhD",
            car_ownership="Yes",
            occupation="Scientist",
            monthly_salary=8000,
            family_member_count=-1,  # invalid
            exercise_frequency="Weekly",
            email="charlie@example.com"
        )

# -----------------------------
# 2. Edge Case Pydantic Model Tests
# -----------------------------

def test_edge_case_large_salary_and_long_name():
    """Edge Case: Very long name and extremely high monthly salary"""
    user = Users(
        uid="u4",
        signup_at=datetime.now(),
        name="A"*300,  # very long name
        gender="F",
        marital_status="Single",
        home_town="Colombo",
        birthday=datetime(1990, 1, 1),
        education_level="PhD",
        car_ownership="Yes",
        occupation="Scientist",
        monthly_salary=10**9,  # extremely large salary
        family_member_count=10,
        exercise_frequency="Daily",
        email="valid@example.com"
    )
    assert user.name.startswith("A")
    assert user.monthly_salary == 10**9

def test_edge_case_optional_fields_none():
    """Edge Case: Optional fields can be None"""
    user = Users(
        uid="u5",
        signup_at=datetime.now(),
        name="Daisy",
        gender="F",
        marital_status="Single",
        home_town="Colombo",
        birthday=datetime(1995, 3, 15),
        education_level="Bachelor",
        car_ownership="No",
        occupation="Teacher",
        monthly_salary=3000,
        family_member_count=1,
        exercise_frequency="Weekly",
        email="daisy@example.com",
        average_expenses_per_month=None,
        average_expenses_per_year=None,
        cluster_id=None
    )
    assert user.average_expenses_per_month is None
    assert user.average_expenses_per_year is None
    assert user.cluster_id is None

# -----------------------------
# 3. Firestore Admin SDK Tests
# -----------------------------

def test_add_and_fetch_valid_user():
    """Test: Add a valid user to Firestore and fetch the first document"""
    user_ref = db.collection("Users").document("valid_user_test")
    user_data = {
        "uid": "valid_user_test",
        "signup_at": datetime.now(),
        "name": "Eve",
        "gender": "F",
        "marital_status": "Single",
        "home_town": "Colombo",
        "birthday": datetime(1995, 6, 10),
        "education_level": "Bachelor",
        "car_ownership": "No",
        "occupation": "Designer",
        "monthly_salary": 4000,
        "family_member_count": 2,
        "exercise_frequency": "Weekly",
        "email": "eve@example.com"
    }

    # Write user
    user_ref.set(user_data)

    # Fetch the first document in Users collection
    first_doc = next(iter(db.collection("Users").limit(1).stream()), None)
    assert first_doc is not None
    fetched_data = first_doc.to_dict()
    assert "uid" in fetched_data
    assert fetched_data["uid"] == first_doc.id or fetched_data["uid"] == "valid_user_test"
