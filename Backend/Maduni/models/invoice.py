from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Invoice(BaseModel):
    invoice_number: Optional[str] = None
    seller_name: str
    due_date: str
    total_amount: float
    category: str
