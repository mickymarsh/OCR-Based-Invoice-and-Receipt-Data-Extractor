"""
Gemini AI utility for the expense chatbot.
"""
import os
import google.generativeai as genai
import logging
# Load environment variables from a .env file
from dotenv import load_dotenv
import json
import re
from datetime import datetime
load_dotenv()

logger = logging.getLogger(__name__)

# Configure the Google Generative AI API
def configure_genai():
    """Configure Google Generative AI with API key"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY environment variable not set. Using mock responses.")
        return False
    
    genai.configure(api_key=api_key)
    return True

def extract_question_details(question):
    """
    Use Gemini AI to extract expense category and month from the question.
    
    Args:
        question (str): The user's question about expenses
        
    Returns:
        dict: Contains extracted category, month (in YYYY-MM format), and confidence score
    """
    if not configure_genai():
        # Provide mock extraction if API key is not configured
        return {
            "category": None, 
            "month": None, 
            "confidence": "low",
            "is_general_question": False
        }
    
    try:
        prompt = f"""
        Extract the expense category, month (if any), and determine if this is a general expense question from the user's query about personal expenses.
        Question: "{question}"
        
        Return a JSON with these keys:
        - category: The expense category (food, transport, healthcare, utilities, entertainment, shopping, etc.) or null if not found
        - month: In YYYY-MM format, or "current" for current month, or null if not mentioned
        - confidence: "high", "medium", or "low" based on your confidence in extraction
        - is_general_question: true if the question is about overall expenses across all categories (e.g., "Which vendor did I spend most at?", "What's my total spending?"), false otherwise
        
        Example 1 (Category-specific question):
        {{
          "category": "food",
          "month": "2024-05",
          "confidence": "high",
          "is_general_question": false
        }}

        Example 2 (General question):
        {{
          "category": null,
          "month": "2024-05",
          "confidence": "high",
          "is_general_question": true
        }}
        """
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        response_text = response.text
        print(f"Gemini extraction resulttttt: {response_text}")
        
        # Parse the response text as JSON - clean up any markdown formatting first
        
        try:
            # Clean the response text - remove markdown code blocks if present
            cleaned_text = response_text
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text.replace("```json", "", 1)
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text.replace("```", "", 1)
            cleaned_text = cleaned_text.strip()
            
            result = json.loads(cleaned_text)
            print(f"Gemini extraction resullllllt: {result}")
            
            # Handle "current" month
            if result.get("month") == "current":
                result["month"] = datetime.now().strftime('%Y-%m')
            
            # Ensure is_general_question exists
            if "is_general_question" not in result:
                result["is_general_question"] = False
                
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Gemini response: {response_text}")
            logger.error(f"JSON parse error: {str(e)}")
            
            # Try a more aggressive cleaning approach as fallback
            try:
                # Extract JSON content between curly braces if possible
                json_pattern = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_pattern:
                    potential_json = json_pattern.group(0)
                    result = json.loads(potential_json)
                    logger.info(f"Successfully parsed JSON with fallback method")
                    
                    # Ensure is_general_question exists
                    if "is_general_question" not in result:
                        result["is_general_question"] = False
                    
                    return result
            except Exception:
                logger.error(f"Fallback JSON parsing also failed")
            
            return {"category": None, "month": None, "confidence": "low", "is_general_question": False}
            
    except Exception as e:
        logger.error(f"Error in extract_question_details: {str(e)}")
        return {"category": None, "month": None, "confidence": "low", "is_general_question": False}

def is_casual_greeting(question):
    """
    Detect if the input is a casual greeting like 'hi', 'hello', etc.
    
    Args:
        question (str): The user's input
        
    Returns:
        bool: True if the input is a casual greeting, False otherwise
    """
    greeting_patterns = [
        r'^hi$', r'^hello$', r'^hey$', r'^hola$', r'^howdy$', r'^greetings$',
        r'^hi there$', r'^hello there$', r'^hey there$', r'^hi!$', r'^hello!$',
        r'^sup$', r'^what\'?s up$', r'^yo$', r'^hiya$', r'^good morning$',
        r'^good afternoon$', r'^good evening$', r'^how are you$', r'^how\'?s it going$'
    ]
    
    question_lower = question.lower().strip()
    
    for pattern in greeting_patterns:
        if re.match(pattern, question_lower):
            return True
            
    return False

def handle_casual_conversation(question):
    """
    Use Gemini to respond to casual conversation starters like greetings.
    
    Args:
        question (str): The user's casual input
        
    Returns:
        str: Gemini's conversational response
    """
    if not configure_genai():
        # Provide mock answer if API key is not configured
        return "Hello! I'm your expense assistant. How can I help you with your expenses today?"
    
    try:
        prompt = f"""
        You are an AI expense assistant that helps users analyze their receipts and expenses.
        Respond to this casual greeting in a friendly, helpful way, mentioning that you can help with expense tracking.
        Keep it brief and natural.
        
        User input: "{question}"
        """
        
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error in handle_casual_conversation: {str(e)}")
        return "Hello! I'm your expense assistant. How can I help you with your expenses today?"

def ask_gemini(question, receipt_data):
    """
    Use Gemini AI to answer questions about expense data.
    
    Args:
        question (str): The user's question about expenses
        receipt_data (str): The relevant expense data to consider
        
    Returns:
        str: Gemini's answer based on the provided data
    """
    if not configure_genai():
        # Provide mock answer if API key is not configured
        return "I'm sorry, I can't analyze your expenses right now. The AI service is unavailable."
    
    try:
        prompt = f"""
        Answer this question about expenses based ONLY on the data provided below.
        If you don't have enough information, say so clearly.
        
        Question: "{question}"
        
        Receipt data:
        {receipt_data}
        
        Provide a helpful, concise answer focusing only on the expense data provided.
        """
        
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
            
    except Exception as e:
        logger.error(f"Error in ask_gemini: {str(e)}")
        return "Sorry, I encountered an error while processing your question."