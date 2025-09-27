import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "smartexpense.manager@gmail.com")  # fallback

def send_invoice_email(invoice):
    """
    Sends an invoice reminder email to the user linked to the invoice.
    """
    # 1️⃣ Dereference the user
    user_ref = invoice.get("user_id")  # Firestore DocumentReference
    if not user_ref:
        print("Invoice missing user reference")
        return False

    user_doc = user_ref.get()
    if not user_doc.exists:
        print(f"User document not found for invoice {invoice.get('invoice_number')}")
        return False

    user_data = user_doc.to_dict()
    full_name = user_data.get("full_name", "Users")
    user_email = user_data.get("email")
    print(user_email)
    if not user_email:
        print(f"No email found for user {full_name}")
        return False

    # 2️⃣ Build email content
    subject = f"Invoice Reminder: {invoice.get('invoice_number')} Due Soon"
    due_date = invoice.get("due_date")
    # Handle Firestore timestamp or string
    if hasattr(due_date, "date"):
        due_date_str = due_date.date().strftime("%Y-%m-%d")
    else:
        due_date_str = str(due_date)

    body = f"""
Hello {full_name},

This is a friendly reminder that your invoice from {invoice.get('seller_name', 'Unknown')} is due on {due_date_str}.

Invoice Details:
- Invoice Number: {invoice.get('invoice_number')}
- Amount Due: {invoice.get('total_amount')}

Please pay before the due date to avoid late fees.

Thank you,
Smart Expense Manager
"""

    # 3️⃣ Create and send email
    message = Mail(
        from_email=SENDER_EMAIL,
        to_emails=user_email,
        subject=subject,
        plain_text_content=body
    )

    try:
        #sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg = SendGridAPIClient("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")
        response = sg.send(message)
        print(f"Email sent to {user_email}, status: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error sending email to {user_email}: {e}")
        return False
