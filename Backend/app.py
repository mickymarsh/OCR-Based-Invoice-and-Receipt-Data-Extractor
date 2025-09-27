from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv

from Janodi.routes import upload
from Janodi.routes import receipt
from core.config import db
from fastapi.middleware.cors import CORSMiddleware

from Maduni.routes import auth
from Maduni.routes import document
from Maduni.routes import receipt_rout


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
app.include_router(document.router, prefix="/fetch", tags=["Fetch_receipts_invoices"])
app.include_router(receipt_rout.router, prefix="/get", tags=["Receipts"])
app.include_router(receipt.router, prefix="/api", tags=["Save_receipt_data"])



if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

