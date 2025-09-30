from fastapi import APIRouter, HTTPException, Query
from ..services.receipt_service import get_receipts_by_user, get_receipts_by_month
from datetime import datetime

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
        print(f"Error fetching receipts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/receipts/{user_id}/by-month")
async def get_receipts_for_month(
    user_id: str, 
    month: int = Query(..., description="Month (1-12)"), 
    year: int = Query(..., description="Year (e.g., 2025)")
):
    """
    Fetch receipts for a user filtered by month and year
    """
    print(f"Fetching receipts for user_id: {user_id}, month: {month}, year: {year}")
    
    # Validate month
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        
    # Validate year (basic validation)
    current_year = datetime.now().year
    if year < 2000 or year > current_year + 1:
        raise HTTPException(status_code=400, detail=f"Year must be between 2000 and {current_year + 1}")
    
    try:
        receipts = get_receipts_by_month(user_id=user_id, month=month, year=year)
        return {"receipts": receipts}
    except Exception as e:
        print(f"Error fetching receipts by month: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))