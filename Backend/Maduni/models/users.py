# models/users.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Users(BaseModel):
    uid: str
    signup_at: datetime
    name: str
    gender: str
    marital_status: str
    home_town: str
    birthday: datetime
    education_level: str
    car_ownership: str
    occupation: str
    monthly_salary: int
    average_expenses_per_month: Optional[int] = None
    average_expenses_per_year: Optional[int] = None
    cluster_id: Optional[int] = None
    family_member_count: int
    exercise_frequency: str
    email: EmailStr
