from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    """Pydantic model for user response serialization."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    username: str
    created_at: Optional[datetime] = None
