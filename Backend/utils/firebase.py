"""
Firebase utility for the expense chatbot.
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging

logger = logging.getLogger(__name__)

def init_firestore():
    """
    Initialize and return a Firestore client.
    Uses the existing firebase connection if already initialized.
    """
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        logger.info("Firebase already initialized, reusing existing app")
    except ValueError:
        # Initialize Firebase if not already done
        logger.info("Initializing Firebase")
        service_account_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', 'serviceAccountKey.json')
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        
    return firestore.client()