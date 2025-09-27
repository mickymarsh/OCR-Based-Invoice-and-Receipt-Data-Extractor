import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase app if not already initialized
if not firebase_admin._apps:
    cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def save_receipt_to_firestore(receipt_data: dict) -> str:
    """
    Save receipt data to Firestore 'Receipt' collection.
    Returns the document ID.
    """
    doc_ref = db.collection("Receipt").document()
    doc_ref.set(receipt_data)
    return doc_ref.id
