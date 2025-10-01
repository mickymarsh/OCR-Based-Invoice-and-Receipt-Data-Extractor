from core.firestore import get_users_collection

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