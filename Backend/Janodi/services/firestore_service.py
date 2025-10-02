
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase app if not already initialized
if not firebase_admin._apps:
    cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


def save_invoice_to_firestore(invoice_data):
    """
    Save invoice data to Firestore 'invoices' collection.
    Returns the document ID.
    """
    # Convert user_id/user_ref to a DocumentReference if present
    try:
        if isinstance(invoice_data, dict):
            # Possible keys: 'user_id' or 'user_ref'
            for key in ("user_id", "user_ref"):
                if key in invoice_data and invoice_data[key]:
                    val = invoice_data[key]
                    # Accept '/Users/uid', 'Users/uid', '/User/uid', or plain uid
                    if isinstance(val, str):
                        s = val.strip()
                        if s.startswith('/'):
                            s = s[1:]
                        # If value is just uid (no slash), assume Users/{uid}
                        if '/' not in s:
                            path = f"Users/{s}"
                        else:
                            path = s
                        invoice_data[key] = db.document(path)
    except Exception:
        # If conversion fails, leave the original value
        pass

    doc_ref = db.collection("Invoice").add(invoice_data)
    return doc_ref[1].id



def save_receipt_to_firestore(receipt_data: dict) -> str:
    """
    Save receipt data to Firestore 'Receipt' collection.
    Returns the document ID.
    """
    # Convert user_ref string to a Firestore DocumentReference when possible
    try:
        if isinstance(receipt_data, dict) and 'user_ref' in receipt_data and receipt_data['user_ref']:
            val = receipt_data['user_ref']
            if isinstance(val, str):
                s = val.strip()
                if s.startswith('/'):
                    s = s[1:]
                if '/' not in s:
                    path = f"Users/{s}"
                else:
                    path = s
                receipt_data['user_ref'] = db.document(path)
    except Exception:
        # leave as-is on failure
        pass

    doc_ref = db.collection("Receipt").document()
    doc_ref.set(receipt_data)
    return doc_ref.id
