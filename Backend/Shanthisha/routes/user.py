from fastapi import APIRouter, HTTPException, Body
from ..services.user_service import get_user_by_id, get_user_cluster_id, get_expected_expenses
from typing import List
from pydantic import BaseModel

router = APIRouter()

class ExpenseRequest(BaseModel):
    cluster_id: int
    months: List[str]
    years: List[str]

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

@router.get("/user/cluster/{user_id}")
async def get_cluster(user_id: str):
    """
    Get user's cluster ID
    """
    print(f"Fetching cluster ID for user_id: {user_id}")
    try:
        cluster_id = get_user_cluster_id(user_id=user_id)
        if cluster_id is None:
            raise HTTPException(status_code=404, detail="Cluster ID not found for user")
        return {"cluster_id": cluster_id}
    except Exception as e:
        print(f"Error fetching cluster ID: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/expected_expenses")
async def fetch_expected_expenses(request: ExpenseRequest):
    """
    Get expected expenses for a specific cluster ID and months/years
    """
    print(f"Fetching expected expenses for cluster_id: {request.cluster_id}")
    try:
        expenses = get_expected_expenses(
            cluster_id=request.cluster_id, 
            months=request.months,
            years=request.years
        )
        return {"expenses": expenses}
    except Exception as e:
        print(f"Error fetching expected expenses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))