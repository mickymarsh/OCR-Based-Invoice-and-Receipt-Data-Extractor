from core.firestore import get_users_collection
from core.config import db
from typing import List

def get_user_by_id(user_id: str):
    """
    Get user details from Firestore by user ID
    """
    try:
        user_ref = get_users_collection().document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return None
            
        user_data = user_doc.to_dict()
        return user_data
    except Exception as e:
        print(f"Error getting user data: {str(e)}")
        raise e

def get_user_cluster_id(user_id: str):
    """
    Get user's cluster ID from Firestore
    """
    try:
        user_data = get_user_by_id(user_id)
        if not user_data or 'cluster_id' not in user_data:
            return None
        
        return user_data['cluster_id']
    except Exception as e:
        print(f"Error getting user's cluster ID: {str(e)}")
        raise e

def get_expected_expenses(cluster_id: int, months: List[str], years: List[str]):
    """
    Get expected expenses for a specific cluster ID and months/years
    """
    try:
        # Get the ExpectedExpense collection
        expected_expense_collection = db.collection("ExpectedExpense")
        
        # Query for expenses matching the cluster ID and within the specified months and years
        query = expected_expense_collection.where("cluster_id", "==", cluster_id)
        
        # Execute the query
        expense_docs = query.stream()
        
        # Convert to list of dictionaries and filter by months and years
        expenses = []
        for doc in expense_docs:
            expense_data = doc.to_dict()
            if expense_data.get("month") in months and expense_data.get("year") in years:
                expenses.append(expense_data)
        
        # Sort by year and month (latest first)
        expenses = sorted(
            expenses, 
            key=lambda x: (years.index(x.get("year")), months.index(x.get("month")))
        )
        
        # Limit to the last 3
        expenses = expenses[:3]
        
        return expenses
    except Exception as e:
        print(f"Error getting expected expenses: {str(e)}")
        raise e