# core/firestore.py
from core.config import db

def get_user_collection():
    return db.collection("User")

def get_users_collection():
    return db.collection("Users")

