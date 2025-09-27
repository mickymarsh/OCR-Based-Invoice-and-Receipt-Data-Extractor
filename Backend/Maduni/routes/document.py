from datetime import datetime
from pydantic import BaseModel, Field
from ..models.invoice import Invoice
from ..models.receipt import Receipt
from ..services.firestore_service import fetch_invoices_by_user, fetch_receipts_by_user, update_invoice, update_receipt, delete_invoice, delete_receipt
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List

router = APIRouter()

@router.get("/user/invoices", response_model=List[Invoice])
async def get_invoices(user_id: str):
    return fetch_invoices_by_user(user_id)

@router.get("/user/receipts", response_model=List[Receipt])
async def get_receipts(user_id: str):
    return fetch_receipts_by_user(user_id)


@router.put("/edit/invoices")
async def edit_invoice(invoice_number: str, data: Dict, user_id: str):
    try:
        update_invoice(user_id, invoice_number, data)
        return {"status": "success", "message": "Invoice updated"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/delete/invoices")
async def remove_invoice(invoice_number: str, user_id: str):
    try:
        delete_invoice(user_id, invoice_number)
        return {"status": "success", "message": "Invoice deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))



@router.put("/edit/receipts")
async def edit_receipt(order_id: str, data: Dict, user_id: str):
    try:
        update_receipt(user_id, order_id, data)
        return {"status": "success", "message": "Receipt updated"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/delete/receipts")
async def remove_receipt(order_id: str,  user_id: str):
    try:
        delete_receipt(user_id, order_id)
        return {"status": "success", "message": "Receipt deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


