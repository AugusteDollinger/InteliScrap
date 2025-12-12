from app.models.user import User
from sqlalchemy.orm import Session
from typing import List

def get_all_users(db: Session) -> List[User]:
    """Retrieve all users from the database"""
    return db.query(User).all()

def get_user_by_id(db: Session, user_id: int) -> User:
    """Retrieve a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> User:
    """Retrieve a user by email"""
    return db.query(User).filter(User.email == email).first()


