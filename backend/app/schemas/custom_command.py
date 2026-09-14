from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CustomCommandBase(BaseModel):
    command_name: str = Field(..., min_length=1, max_length=100)
    output: Optional[str] = None
    description: Optional[str] = None
    is_real_execution: bool = False

class CustomCommandCreate(CustomCommandBase):
    pass

class CustomCommandUpdate(BaseModel):
    command_name: Optional[str] = Field(None, min_length=1, max_length=100)
    output: Optional[str] = None
    description: Optional[str] = None
    is_real_execution: Optional[bool] = None

class CustomCommandResponse(CustomCommandBase):
    id: str
    created_at: datetime
    
    model_config = {"from_attributes": True}
