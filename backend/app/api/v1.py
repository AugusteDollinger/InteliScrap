from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import userService
from app.database import get_db

router = APIRouter()

@router.get("/users")
def read_users(db: Session = Depends(get_db)):
    users = userService.get_all_users(db)
    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            for user in users
        ]
    }


@router.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = userService.get_user_by_id(db, user_id)
    if not user:
        return {"error": "User not found"}
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }