from fastapi import APIRouter, HTTPException
from ..services.receipt_service import get_receipts_by_user

router = APIRouter()

@router.get("/receipts/{user_id}")
async def get_receipts(user_id: str):
    """
    Fetch receipts for a user
    """
    print(f"Fetching receipts for user_id: {user_id}")
    try:
        receipts = get_receipts_by_user(user_id=user_id)
        return {"receipts": receipts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
