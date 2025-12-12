from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List


class UserResponse(BaseModel):
    """Pydantic model for user response serialization."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    username: str
    created_at: Optional[datetime] = None


class UsersListResponse(BaseModel):
    """Pydantic model for users list response."""
    
    count: int
    users: List[UserResponse]
