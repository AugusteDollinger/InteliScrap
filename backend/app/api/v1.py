from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.services import userService
from app.database import get_db
from app.schemas import UserResponse

router = APIRouter()

@router.get("/users")
def read_users(db: Session = Depends(get_db)):
    users = userService.get_all_users(db)
    return {
        "count": len(users),
        "users": [UserResponse.model_validate(user) for user in users]
    }


@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = userService.get_user_by_id(db, user_id)
    if not user:
        return {"error": "User not found"}
    return user