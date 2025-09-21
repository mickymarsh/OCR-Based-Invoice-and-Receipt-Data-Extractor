from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Receipt(BaseModel):
    order_id: Optional[str] = None
    seller_name: str
    uploaded_date: str
    total_amount: float
    category: str
