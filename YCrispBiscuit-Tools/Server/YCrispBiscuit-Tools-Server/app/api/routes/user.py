
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas, models
from app.dependencies import get_current_active_user

router = APIRouter()

@router.get("/profile", response_model=schemas.user.User)
def read_users_me(
    current_user: models.user.User = Depends(get_current_active_user)
):
    """
    Get current user profile.
    """
    return current_user
