import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email="smartexpense.manager@gmail.com",
    to_emails="madunikarunarathne@yahoo.com",
    subject="Test Email from SendGrid",
    plain_text_content="Hello! This is a test email."
)

try:
    #sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
    sg = SendGridAPIClient("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")
    response = sg.send(message)
    print(response.status_code)  # should be 202 if request was accepted
except Exception as e:
    print("Error:", e)
