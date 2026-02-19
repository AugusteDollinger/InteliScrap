from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    username: str
    role: str
    created_at: Optional[datetime] = None


class UsersListResponse(BaseModel):
    count: int
    users: List[UserResponse]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
