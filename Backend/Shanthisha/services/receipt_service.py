
from typing import List, Optional
from ..models.receipt import ReceiptOut
from core.config import db
from core.firestore import get_receipt_collection
from datetime import datetime

def get_receipts_by_category_month(user_id: str, category: str, month: int, year: int) -> list:
    """
    Fetch receipts for a specific user filtered by category, month, and year
    """
    try:
        receipts_ref = get_receipt_collection(user_id=user_id).stream()
        result = []
        count = 0
        filtered_count = 0
        for doc in receipts_ref:
            count += 1
            data = doc.to_dict()
            date_str = data.get("date")
            cat = data.get("category", "")
            if date_str and cat:
                date_obj = datetime.fromisoformat(date_str) if isinstance(date_str, str) else date_str
                if date_obj.month == month and date_obj.year == year and cat.lower() == category.lower():
                    filtered_count += 1
                    result.append({
                        "category": cat,
                        "date": date_obj,
                        "total_price": float(data.get("total_price", 0))
                    })
        print(f"[INFO] Total receipts found: {count}, filtered by category '{category}', month {month}/{year}: {filtered_count}")
        result.sort(key=lambda x: x["date"], reverse=True)
        return result
    except Exception as e:
        print(f"[ERROR] Failed to fetch receipts for user '{user_id}' by category/month: {str(e)}")
        raise e
    
def get_receipts_by_user(user_id: str) -> List[ReceiptOut]:
    """
    Fetch receipts for a specific user from Firestore
    """
    try:
        # Query receipts
        receipts_ref = get_receipt_collection(user_id=user_id).stream()

        result = []
        count = 0
        for doc in receipts_ref:
            count += 1
            data = doc.to_dict()
            result.append({
                "category": data.get("category", ""),
                "date": data.get("date"),
                "total_price": float(data.get("total_price", 0))
            })

        if count == 0:
            print(f"[INFO] No receipts found for user '{user_id}'.")
        else:
            print(f"[INFO] Total receipts found: {count}")

        return result
    except Exception as e:
        print(f"[ERROR] Failed to fetch receipts for user '{user_id}': {str(e)}")
        raise e

def get_receipts_by_month(user_id: str, month: int, year: int) -> List[ReceiptOut]:
    """
    Fetch receipts for a specific user from Firestore filtered by month and year
    """
    try:
        # Query all receipts for this user
        receipts_ref = get_receipt_collection(user_id=user_id).stream()

        result = []
        count = 0
        filtered_count = 0
        
        for doc in receipts_ref:
            count += 1
            data = doc.to_dict()
            date_str = data.get("date")
            
            if date_str:
                # Parse the date from the string format
                date_obj = datetime.fromisoformat(date_str) if isinstance(date_str, str) else date_str
                
                # Check if the receipt matches the requested month and year
                if date_obj.month == month and date_obj.year == year:
                    filtered_count += 1
                    result.append({
                        "category": data.get("category", ""),
                        "date": date_obj,
                        "total_price": float(data.get("total_price", 0))
                    })
        
        print(f"[INFO] Total receipts found: {count}, filtered by month {month}/{year}: {filtered_count}")
        
        # Sort the result in descending order by date (most recent first)
        result.sort(key=lambda x: x["date"], reverse=True)
        
        return result
    except Exception as e:
        print(f"[ERROR] Failed to fetch receipts for user '{user_id}' by month {month}/{year}: {str(e)}")
        raise e