from fastapi import APIRouter
from datetime import datetime
from ..services.email_service import send_invoice_email
from core.config import db

router = APIRouter()

@router.get("/check-invoices")
def check_invoices():
    today = datetime.utcnow().date()
    emails_sent = 0

    invoices_ref = db.collection("Invoice")
    docs = invoices_ref.where("sent_email", "==", False).stream()

    for doc in docs:
        invoice = doc.to_dict()
        
        # Firestore timestamp already gives datetime
        due_date = invoice['due_date'].date()
        days_left = (due_date - today).days

        if 0 <= days_left <= 14:
            if send_invoice_email(invoice):
                invoices_ref.document(doc.id).update({"sent_email": True})
                emails_sent += 1

    return {"status": "done", "emails_sent": emails_sent}


