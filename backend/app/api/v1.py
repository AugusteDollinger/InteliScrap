from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services import userService
from app.database import get_db
from app.schemas import (
    UserResponse,
    UsersListResponse,
    UserCreate,
    UserLogin,
    UserUpdate,
    PasswordChange,
    Token,
)
from app.security import create_access_token, get_current_user
from app.models.user import User


router = APIRouter()


@router.get("/users", response_model=UsersListResponse)
def read_users(db: Session = Depends(get_db)):
    users = userService.get_all_users(db)
    return UsersListResponse(
        count=len(users),
        users=[UserResponse.model_validate(user) for user in users]
    )


@router.get("/users/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = userService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.patch("/users/me", response_model=UserResponse)
def update_current_user(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_in.email and user_in.email != current_user.email:
        existing = userService.get_user_by_email(db, user_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_in.email

    if user_in.username and user_in.username != current_user.username:
        existing = userService.get_user_by_username(db, user_in.username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_in.username

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.patch("/users/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not userService.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = userService.get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = userService.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = userService.create_user(db, email=user_in.email, username=user_in.username, password=user_in.password)
    return UserResponse.model_validate(user)


@router.post("/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = userService.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/homepage")
def homepage(current_user: User = Depends(get_current_user)):
    return {
        "message": "Welcome to InteliScrap",
        "username": current_user.username,
        "role": current_user.role,
    }
