from typing import List
from ..models.receiptout import ReceiptOut
from core.config import db
from core.firestore import get_invoice_collection, get_receipt_collection



def get_receipts_by_user(user_id: str) -> List[ReceiptOut]:

    # Query receipts
    receipts_ref = get_receipt_collection(user_id = user_id).stream()
    
    result = []
    count = 0
    for doc in receipts_ref:
        count += 1
        data = doc.to_dict()
        result.append({
            "category": data.get("category"),
            "date": data.get("date"),
            "total_price": data.get("total_price")
        })
    
    if count == 0:
        print(f"[INFO] No receipts found for user '{user_id}'.")
    else:
        print(f"[INFO] Total receipts found: {count}")

    return result
