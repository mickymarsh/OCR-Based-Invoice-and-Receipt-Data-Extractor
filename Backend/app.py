from fastapi import FastAPI
import uvicorn
from core.config import db
from fastapi.middleware.cors import CORSMiddleware

from Maduni.routes import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:58331"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

app.include_router(auth.router, prefix="/auth", tags=["Firebase Auth"])

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

