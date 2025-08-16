# core/config.py
import firebase_admin
from firebase_admin import credentials, auth, firestore

cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

