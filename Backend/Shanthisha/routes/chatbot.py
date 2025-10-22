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

def fetch_receipts(user_id: str, category: str = None, month: str = None, is_general_question: bool = False):
    """
    Fetch receipt data from Firestore based on user ID, category, and month.
    
    Args:
        user_id: The user ID
        category: Expense category (optional if is_general_question is True)
        month: Month in YYYY-MM format (optional)
        is_general_question: Whether this is a general expense question across all categories
        
    Returns:
        str: Formatted summary of receipts or empty string if none found
    """
    try:
        # Only set date filters if month is specified
        start_date = None
        end_date = None
        
        if month:
            # Convert month format (YYYY-MM) to date objects for comparison
            start_date = datetime.strptime(month + "-01", "%Y-%m-%d").replace(tzinfo=None)
            
            # Handle month overflow (e.g., December to January)
            if start_date.month == 12:
                end_date = datetime(start_date.year + 1, 1, 1).replace(tzinfo=None)
            else:
                end_date = datetime(start_date.year, start_date.month + 1, 1).replace(tzinfo=None)
        
        # Access the Receipt collection and apply filters
        receipt_collection = db.collection("Receipt")
        
        # Get all receipts for the user and filter client-side
        # This is a workaround since we're using user_ref instead of user_id
        from core.firestore import get_users_collection
        user_ref = get_users_collection().document(user_id)
        
        receipts = list(receipt_collection.where("user_id", "==", user_ref).stream())
        # Convert the stream generator to a list for easier debugging
        # print("Receipts fetched ch:", [r.to_dict() for r in receipts])
        summary = ""
        total = 0
        count = 0
        
        # For tracking most frequent vendors and categories in general questions
        vendor_totals = {}
        category_totals = {}
        
        for r in receipts:
            doc = r.to_dict()
            
            # Handle the receipt date - ensure it's timezone-naive for comparison
            if isinstance(doc['date'], datetime):
                receipt_date = doc['date'].replace(tzinfo=None)
            else:
                receipt_date = datetime.strptime(doc['date'], "%Y-%m-%d").replace(tzinfo=None)
            # print("Receipt date:", receipt_date)
            
            # Skip if not in the requested month/year (if month is specified)
            if start_date and end_date and (receipt_date < start_date or receipt_date >= end_date):
                continue
                
            # Skip if not the requested category (case insensitive comparison) - only if this is not a general question
            if not is_general_question and category and doc['category'].lower() != category.lower():
                continue
                
            # Include in summary
            vendor = doc.get('seller_name', 'Unknown vendor')
            amount = float(doc.get('total_price', 0))
            item_category = doc.get('category', category if not is_general_question else 'Uncategorized')
            
            # Track vendor and category totals for general questions
            if is_general_question:
                vendor_totals[vendor] = vendor_totals.get(vendor, 0) + amount
                category_totals[item_category] = category_totals.get(item_category, 0) + amount

            summary += f"- {doc['date']}: LKR {amount} at {vendor} items {doc.get('items', [])} (Category: {item_category})\n"
            total += amount
            count += 1
        
        if count > 0:
            # Add regular summary for category-specific queries
            if not is_general_question and category:
                summary += f"\nTotal: LKR {total} ({count} transactions in {category} category)"
            else:
                # Add enhanced summary for general questions
                summary += f"\nTotal: LKR {total} ({count} transactions across all categories)\n"
                
                # Add top vendors by spending
                if vendor_totals:
                    summary += "\nTop vendors by spending:\n"
                    sorted_vendors = sorted(vendor_totals.items(), key=lambda x: x[1], reverse=True)[:5]
                    for vendor, amount in sorted_vendors:
                        summary += f"- {vendor}: LKR {amount:.2f}\n"
                
                # Add category breakdown
                if category_totals:
                    summary += "\nSpending by category:\n"
                    sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
                    for cat, amount in sorted_categories:
                        percentage = (amount / total) * 100 if total > 0 else 0
                        summary += f"- {cat}: LKR {amount:.2f} ({percentage:.1f}%)\n"
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
                print("Category_up:", category)
            if not month:
                month = extracted.get("month")
                print("Month_up:", month)

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
            },
            "suggestions": [
                f"How much did I spend on {category} last month?",
                f"What was my biggest {category} expense?",
                "How does my spending compare to previous months?",
                "Show me my spending trends by category"
            ]
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
        
        # Handle casual greetings like "hi", "hello", etc.
        from utils.gemini import is_casual_greeting, handle_casual_conversation
        
        if is_casual_greeting(question):
            greeting_response = handle_casual_conversation(question)
            return {
                "answer": greeting_response,
                "extracted_details": {
                    "category": None,
                    "month": None,
                    "confidence": "high",
                    "is_casual_greeting": True
                },
                "suggestions": [
                    "How much did I spend on food this month?",
                    "Show me my expenses for June",
                    "What were my biggest expenses last month?",
                    "Compare my spending across categories"
                ]
            }
        
        logger.info("Extracting details from question using AI...")
        print("Question:", question)
        extracted = extract_question_details(question)
        
        category = extracted.get("category")
        print("Category:", category)

        month = extracted.get("month")
        print("Month:", month)
        confidence = extracted.get("confidence", "unknown")
        print("Confidence:", confidence)
        
        # Check if this is a general question about all expenses
        is_general_question = extracted.get("is_general_question", False)
        print("Is general question:", is_general_question)
        
        category_str = str(category) if category else "None"
        month_str = str(month) if month else "None"
        logger.info(f"Extracted - Category: {category_str}, Month: {month_str}, General: {is_general_question}, Confidence: {confidence}")
        
        # If category couldn't be extracted and it's not a general question, return helpful message
        if not category and not is_general_question:
            return {
                "answer": "I couldn't determine the expense category from your question. Please specify the category (e.g., food, medicine, transport, entertainment, shopping, utilities, etc.) or rephrase your question to be more specific.",
                "extracted_details": {
                    "category": None,
                    "month": month,
                    "confidence": confidence,
                    "is_general_question": is_general_question
                },
                "suggestions": [
                    "Try: 'How much did I spend on food in June?'",
                    "Try: 'Show me my medicine expenses this month'",
                    "Try: 'What were my transport costs last month?'"
                ]
            }
        
        # Use current month if none extracted
        if not month and not is_general_question:
            month = datetime.now().strftime('%Y-%m')
        
        if is_general_question:
            logger.info(f"Processing general expense question for user {user_id}, month {month if month else 'all'}")
            receipts = fetch_receipts(user_id, None, month, is_general_question=True)
        else:
            logger.info(f"Processing smart chat for user {user_id}, category {category}, month {month}")
            receipts = fetch_receipts(user_id, category.lower(), month)
        print("Receipts fetched:", receipts)
        if not receipts.strip():
            if is_general_question:
                month_str = f" in {month}" if month else ""
                return {
                    "answer": f"No expense data found{month_str}. You may want to check if you have any expenses recorded for that period.",
                    "extracted_details": {
                        "category": "all",
                        "month": month,
                        "confidence": confidence,
                        "is_general_question": True
                    },
                    "suggestions": [
                        "Try adding some receipts first",
                        "Check if your expense data is properly recorded",
                        "Try asking about a specific category like food or transport"
                    ]
                }
            else:
                return {
                    "answer": f"No expense data found for category '{category}' in {month}. You may want to check if you have any expenses recorded for that period, or try asking about a different category or time period.",
                    "extracted_details": {
                        "category": category,
                        "month": month,
                        "confidence": confidence,
                        "is_general_question": False
                    },
                    "suggestions": [
                        f"Try asking about different months for {category}",
                        "Try asking about other categories like food, transport, or entertainment",
                        "Check if your expense data is properly recorded"
                    ]
                }
        
        answer = ask_gemini(question, receipts)
        print("Answer:", answer)
        
        # Different suggestions based on whether this is a general or category-specific question
        if is_general_question:
            return {
                "answer": answer,
                "extracted_details": {
                    "category": "all",
                    "month": month,
                    "confidence": confidence,
                    "is_general_question": True
                },
                "suggestions": [
                    "Which category did I spend most on?",
                    "How has my spending changed over time?",
                    "What was my biggest expense last month?",
                    "Compare my spending this month to last month"
                ]
            }
        else:
            return {
                "answer": answer,
                "extracted_details": {
                    "category": category,
                    "month": month,
                    "confidence": confidence,
                    "is_general_question": False
                },
                "suggestions": [
                    f"What was my biggest {category} expense in {month}?",
                    f"How much did I spend on {category} compared to last month?",
                    f"Show me a breakdown of my {category} expenses",
                    "Which vendor did I spend most at?"
                ]
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