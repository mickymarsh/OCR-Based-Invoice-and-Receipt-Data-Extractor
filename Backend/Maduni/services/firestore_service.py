from datetime import datetime
from firebase_admin import firestore, auth
from typing import Dict, List
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
        if not data:
            continue
        result.append(Receipt(
            order_id=data.get("order_id", ""),
            seller_name=data.get("seller_name", ""),
            date=data["date"].isoformat() if data.get("date") else None,
            total_price=data.get("total_price", 0.0),
            category=data.get("category", "")
        ))
    return result


def update_invoice(user_id: str, invoice_number: str, data: Dict):
    invoices_ref = get_invoice_collection(user_id=user_id)
    query = invoices_ref.where("invoice_number", "==", invoice_number).limit(1).stream()
    doc_list = list(query)

    if not doc_list:
        raise ValueError("Invoice not found")

    doc_ref = doc_list[0].reference
    # Convert date strings to datetime if needed
    if "due_date" in data and isinstance(data["due_date"], str):
        data["due_date"] = datetime.fromisoformat(data["due_date"])
    doc_ref.update(data)
    return True


def delete_invoice(user_id: str, invoice_number: str):
    invoices_ref = get_invoice_collection(user_id=user_id)
    query = invoices_ref.where("invoice_number", "==", invoice_number).limit(1).stream()
    doc_list = list(query)

    if not doc_list:
        raise ValueError("Invoice not found")

    doc_list[0].reference.delete()
    return True

def update_receipt(user_id: str, order_id: str, data: Dict):
    receipts_ref = get_receipt_collection(user_id=user_id)
    query = receipts_ref.where("order_id", "==", order_id).limit(1).stream()
    doc_list = list(query)

    if not doc_list:
        raise ValueError("Receipt not found")

    doc_ref = doc_list[0].reference
    # Convert datetime string to datetime object if needed
    if "date" in data and isinstance(data["date"], str):
        data["date"] = datetime.fromisoformat(data["date"])
    doc_ref.update(data)
    return True


def delete_receipt(user_id: str, order_id: str):
    receipts_ref = get_receipt_collection(user_id=user_id)
    query = receipts_ref.where("order_id", "==", order_id).limit(1).stream()
    doc_list = list(query)

    if not doc_list:
        raise ValueError("Receipt not found")

    doc_list[0].reference.delete()
    return True


