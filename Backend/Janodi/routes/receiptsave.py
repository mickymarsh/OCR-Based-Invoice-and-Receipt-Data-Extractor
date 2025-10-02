from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from ..services.firestore_service import save_receipt_to_firestore
from datetime import datetime

router = APIRouter()

# Receipt data model
class ReceiptData(BaseModel):
	category: Optional[str]
	date: Optional[datetime]
	items: Optional[list[dict]]
	order_id: Optional[str]
	seller_address: Optional[str]
	seller_name: Optional[str]
	subtotal: Optional[float]
	tax: Optional[float]
	total_price: float
	uploaded_date: Optional[datetime]
	user_id: Optional[str]

@router.post("/receipt")
async def save_receipt(receipt: ReceiptData):
	try:
		# Save to Firestore using your service
		doc_id = save_receipt_to_firestore(receipt.dict())
		return {"success": True, "doc_id": doc_id}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to save receipt: {str(e)}")
