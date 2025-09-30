from pydantic import BaseModel
from datetime import datetime

# What you return to frontend
class ReceiptOut(BaseModel):
    category: str
    date: datetime
    total_price: float