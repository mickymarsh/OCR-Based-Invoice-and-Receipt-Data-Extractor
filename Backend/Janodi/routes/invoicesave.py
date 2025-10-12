from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from ..services.firestore_service import save_invoice_to_firestore
from datetime import datetime

router = APIRouter()

# Invoice data model
class InvoiceData(BaseModel):
	category: str = Field(..., description="Category must not be null")
	customer_address: Optional[str]
	customer_name: Optional[str]
	due_date: datetime = Field(..., description="Due date must not be null")
	invoice_number: str = Field(..., description="Invoice number must not be null")
	item: Optional[str]
	seller_address: Optional[str]
	seller_name: Optional[str]
	sent_email: Optional[bool]
	total_amount: float = Field(..., ge=0, description="Total amount must be non-negative")
	uploaded_date: Optional[datetime]  # System-generated ISO date string
	user_id: str

@router.post("/invoice")
async def save_invoice(invoice: InvoiceData):
	try:
		# Save to Firestore using your service
		doc_id = save_invoice_to_firestore(invoice.dict())
		return {"success": True, "doc_id": doc_id}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to save invoice: {str(e)}")
