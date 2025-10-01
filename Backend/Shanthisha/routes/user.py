from fastapi import APIRouter, HTTPException
from ..services.user_service import get_user_by_id

router = APIRouter()

@router.get("/user/{user_id}")
async def get_user(user_id: str):
    """
    Get user details by ID
    """
    print(f"Fetching user data for user_id: {user_id}")
    try:
        user_data = get_user_by_id(user_id=user_id)
        if user_data is None:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user": user_data}
    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))