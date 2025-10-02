"""
Router for expense chatbot API endpoints
"""
from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
from google.cloud.firestore_v1.base_query import FieldFilter
from utils.gemini import ask_gemini, extract_question_details
from core.config import db
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

def fetch_receipts(user_id: str, category: str, month: str):
    """
    Fetch receipt data from Firestore based on user ID, category, and month.
    
    Args:
        user_id: The user ID
        category: Expense category
        month: Month in YYYY-MM format
        
    Returns:
        str: Formatted summary of receipts or empty string if none found
    """
    try:
        # Convert month format (YYYY-MM) to date objects for comparison
        start_date = datetime.strptime(month + "-01", "%Y-%m-%d")
        
        # Handle month overflow (e.g., December to January)
        if start_date.month == 12:
            end_date = datetime(start_date.year + 1, 1, 1)
        else:
            end_date = datetime(start_date.year, start_date.month + 1, 1)
        
        # Access the Receipt collection and apply filters
        receipt_collection = db.collection("Receipt")
        
        # Get all receipts for the user and filter client-side
        # This is a workaround since we're using user_ref instead of user_id
        from core.firestore import get_users_collection
        user_ref = get_users_collection().document(user_id)
        
        receipts = receipt_collection.where("user_ref", "==", user_ref).stream()
        
        summary = ""
        total = 0
        count = 0
        
        for r in receipts:
            doc = r.to_dict()
            receipt_date = datetime.strptime(doc['date'], "%Y-%m-%d")
            
            # Skip if not in the requested month/year
            if receipt_date < start_date or receipt_date >= end_date:
                continue
                
            # Skip if not the requested category (case insensitive comparison)
            if doc['category'].lower() != category.lower():
                continue
                
            # Include in summary
            vendor = doc.get('vendor_name', 'Unknown vendor')
            amount = float(doc.get('total_price', 0))
            summary += f"- {doc['date']}: LKR {amount} at {vendor}\n"
            total += amount
            count += 1
        
        if count > 0:
            summary += f"\nTotal: LKR {total} ({count} transactions)"
        else:
            summary = ""
            
        return summary
        
    except Exception as e:
        logger.error(f"Error fetching receipts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching expense data")

@router.get("/ask")
def ask_question(
    user_id: str = Query(..., description="User ID"), 
    question: str = Query(..., description="User's question"), 
    category: str = Query(None, description="Expense category (optional - will be extracted from question if not provided)"), 
    month: str = Query(None, description="Month in YYYY-MM format (optional - will be extracted from question if not provided)")
):
    """
    Ask a question about expenses with explicit parameters
    """
    try:
        # Validate inputs
        if not user_id.strip():
            raise HTTPException(status_code=400, detail="User ID cannot be empty")
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # If category or month not provided, extract from question
        if not category or not month:
            logger.info("Extracting details from question using AI...")
            print("Extracting  AI...")
            extracted = extract_question_details(question)
            
            if not category:
                category = extracted.get("category")
            if not month:
                month = extracted.get("month")
            
            category_str = str(category) if category else "None"
            month_str = str(month) if month else "None"
            logger.info(f"Extracted - Category: {category_str}, Month: {month_str}, Confidence: {extracted.get('confidence', 'unknown')}")
        
        # Validate extracted/provided data
        if not category:
            return {"answer": "I couldn't determine the expense category from your question. Please specify the category (e.g., food, medicine, transport, etc.) or rephrase your question to be more specific."}
        
        if month:
            try:
                datetime.strptime(month, "%Y-%m")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
        else:
            month = datetime.now().strftime('%Y-%m')
        
        logger.info(f"Processing question for user {user_id}, category {category}, month {month}")
        
        receipts = fetch_receipts(user_id, category.lower(), month)
        
        if not receipts.strip():
            return {"answer": f"No expense data found for category '{category}' in {month}. You may want to check if the category name is correct or if you have any expenses recorded for that period."}
        
        answer = ask_gemini(question, receipts)
        return {
            "answer": answer,
            "extracted_details": {
                "category": category,
                "month": month
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/chat")
def smart_chat(
    question: str = Query(..., description="User's question about expenses"),
    user_id: str = Query("default_user", description="User ID (optional, defaults to 'default_user')")
):
    """
    Smart endpoint that automatically extracts category and month from the question
    """
    try:
        # Validate inputs
        if not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        logger.info("Extracting details from question using AI...")
        extracted = extract_question_details(question)
        
        category = extracted.get("category")
        month = extracted.get("month")
        confidence = extracted.get("confidence", "unknown")
        
        category_str = str(category) if category else "None"
        month_str = str(month) if month else "None"
        logger.info(f"Extracted - Category: {category_str}, Month: {month_str}, Confidence: {confidence}")
        
        # If category couldn't be extracted, return helpful message
        if not category:
            return {
                "answer": "I couldn't determine the expense category from your question. Please specify the category (e.g., food, medicine, transport, entertainment, shopping, utilities, etc.) or rephrase your question to be more specific.",
                "extracted_details": {
                    "category": None,
                    "month": month,
                    "confidence": confidence
                },
                "suggestions": [
                    "Try: 'How much did I spend on food in June?'",
                    "Try: 'Show me my medicine expenses this month'",
                    "Try: 'What were my transport costs last month?'"
                ]
            }
        
        # Use current month if none extracted
        if not month:
            month = datetime.now().strftime('%Y-%m')
        
        logger.info(f"Processing smart chat for user {user_id}, category {category}, month {month}")
        
        receipts = fetch_receipts(user_id, category.lower(), month)
        if not receipts.strip():
            return {
                "answer": f"No expense data found for category '{category}' in {month}. You may want to check if you have any expenses recorded for that period, or try asking about a different category or time period.",
                "extracted_details": {
                    "category": category,
                    "month": month,
                    "confidence": confidence
                },
                "suggestions": [
                    f"Try asking about different months for {category}",
                    "Try asking about other categories like food, transport, or entertainment",
                    "Check if your expense data is properly recorded"
                ]
            }
        
        answer = ask_gemini(question, receipts)
        return {
            "answer": answer,
            "extracted_details": {
                "category": category,
                "month": month,
                "confidence": confidence
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing smart chat request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
def health_check():
    """
    Health check endpoint for the chatbot service
    """
    return {"status": "healthy", "service": "expense-chatbot"}

@router.get("/extract")
def extract_details_endpoint(question: str = Query(..., description="Question to analyze")):
    """
    Test endpoint to see what details are extracted from a question
    """
    try:
        extracted = extract_question_details(question)
        return {
            "question": question,
            "extracted_details": extracted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting details: {str(e)}")

@router.get("/categories")
def get_categories():
    """
    Get list of supported expense categories
    """
    return {
        "categories": [
            "food", "medicine", "transport", "entertainment", "shopping", 
            "utilities", "groceries", "fuel", "dining", "healthcare", 
            "education", "clothing", "electronics", "travel", "subscriptions",
            "rent", "insurance", "gym", "movies", "books", "gifts"
        ],
        "examples": {
            "food": ["How much did I spend on food this month?", "Show me my food expenses in June"],
            "medicine": ["What were my medicine costs last month?", "Medicine expenses in 2024"],
            "transport": ["How much did I spend on transport?", "Show transport costs for July"],
            "entertainment": ["Entertainment expenses this year", "How much on movies last month?"]
        }
    }