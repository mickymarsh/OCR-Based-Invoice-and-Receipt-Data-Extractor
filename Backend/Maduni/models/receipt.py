from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Receipt(BaseModel):
    order_id: Optional[str] = None
    seller_name: str
    date: str
    total_price: float
    category: str
