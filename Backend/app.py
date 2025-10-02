from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv

from Janodi.routes import upload
from Janodi.routes import receiptsave
from Janodi.routes import invoicesave
from core.config import db
from fastapi.middleware.cors import CORSMiddleware

from Maduni.routes import auth
from Maduni.routes import document
from Shanthisha.routes import receipt
from Maduni.routes import email_route
from Shanthisha.routes import user
from Shanthisha.routes import chatbot


app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

app.include_router(auth.router, prefix="/auth", tags=["Firebase Auth"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(document.router, prefix="/fetch", tags=["Fetch receipts invoices"])
app.include_router(receipt.router, prefix="/get", tags=["Receipts"])
app.include_router(user.router, prefix="/get", tags=["Users"])

app.include_router(email_route.router, prefix="/email", tags=["Send email"])

app.include_router(receiptsave.router, prefix="/api", tags=["Save_receipt_data"])
app.include_router(invoicesave.router, prefix="/api", tags=["Save_invoice_data"])

# Add the chatbot router
app.include_router(chatbot.router, prefix="/chatbot", tags=["AI Chatbot"])




if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

