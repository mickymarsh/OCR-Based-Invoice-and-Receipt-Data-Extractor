from firebase_admin import firestore, auth
from typing import List
from ..models.invoice import Invoice
from ..models.receipt import Receipt
from core.firestore import get_invoice_collection, get_receipt_collection


def fetch_invoices_by_user(user_id: str) -> List[Invoice]:
    invoices_ref = get_invoice_collection(user_id=user_id)
    docs = invoices_ref.stream()
    result = []
    for doc in docs:
        data = doc.to_dict()
        result.append(Invoice(
            invoice_number=data["invoice_number"],
            seller_name=data["seller_name"],
            due_date=data["due_date"].isoformat(),
            total_amount=data["total_amount"],
            category=data.get("category", "")
        ))
    return result

def fetch_receipts_by_user(user_id: str) -> List[Receipt]:
    receipts_ref = get_receipt_collection(user_id=user_id)
    docs = receipts_ref.stream()
    result = []
    for doc in docs:
        data = doc.to_dict()
        result.append(Receipt(
            order_id=data["order_id"],
            seller_name=data["seller_name"],
            uploaded_date=data["uploaded_date"].isoformat(),
            total_amount=data["total_amount"],
            category=data.get("category", "")
        ))
    return result