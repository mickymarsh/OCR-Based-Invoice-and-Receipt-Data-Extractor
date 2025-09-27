from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.firestore_service import save_invoice_to_firestore

router = APIRouter()

# Invoice data model
class InvoiceData(BaseModel):
	category: Optional[str]
	customer_address: Optional[str]
	customer_name: Optional[str]
	due_date: Optional[str]  # Accept as string/timestamp
	invoice_number: Optional[str]
	item: Optional[str]
	seller_address: Optional[str]
	seller_name: Optional[str]
	sent_email: Optional[bool]
	total_amount: Optional[float]
	uploaded_date: Optional[str]  # Accept as string/timestamp
	user_id: Optional[str]

@router.post("/invoice")
async def save_invoice(invoice: InvoiceData):
	try:
		# Save to Firestore using your service
		doc_id = save_invoice_to_firestore(invoice.dict())
		return {"success": True, "doc_id": doc_id}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to save invoice: {str(e)}")
