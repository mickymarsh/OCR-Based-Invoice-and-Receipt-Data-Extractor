# core/firestore.py
from core.config import db

def get_receipt_collection(user_id):
    user_ref = get_users_collection().document(user_id)
    print(user_ref.path)
    return db.collection("Receipt").where("user_ref", "==", user_ref)

def get_users_collection():
    return db.collection("Users")

def get_invoice_collection(user_id):
    user_ref = get_users_collection().document(user_id)
    print(user_ref.path)
    return db.collection("Invoice").where("user_id", "==", user_ref)

