# models/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    uid: str
    signup_at: datetime
    name: str
    nic_number: str
    gender: str
    marital_status: str
    home_town: str
    birthday: datetime
    occupation: str
    monthly_salary: int
    average_expenses_per_month: Optional[int] = None
    average_expenses_per_year: Optional[int] = None
    cluster_id: Optional[int] = None
    family_member_count: int
    email: EmailStr
    provider: str
