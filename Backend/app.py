import firebase_admin
from fastapi import FastAPI
from firebase_admin import credentials, firestore
import uvicorn

app = FastAPI()

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/status")
def status():
    return {"status": "Backend is running"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

