from ..models.invoice import Invoice
from ..models.receipt import Receipt
from ..services.firestore_service import fetch_invoices_by_user, fetch_receipts_by_user
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter()

@router.get("/user/invoices", response_model=List[Invoice])
async def get_invoices(user_id: str):
    return fetch_invoices_by_user(user_id)

@router.get("/user/receipts", response_model=List[Receipt])
async def get_receipts(user_id: str):
    return fetch_receipts_by_user(user_id)
