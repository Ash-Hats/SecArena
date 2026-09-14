"""Pydantic User and Auth Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


class UserRegister(BaseModel):
    """Registration Payload."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v.isalnum() and "_" not in v and "-" not in v:
            raise ValueError("Username can only contain alphanumeric characters, underscores, and hyphens.")
        return v


class UserLogin(BaseModel):
    """Login Payload."""

    username_or_email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    """Public User Profile Response."""

    id: str
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT Token Response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AdminUserCreate(UserRegister):
    """Administrator-created account payload."""
    role: UserRole = UserRole.STUDENT


class AdminUserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserUpdate(BaseModel):
    """Profile update payload for regular users."""
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    old_password: Optional[str] = Field(default=None, min_length=1)
    new_password: Optional[str] = Field(default=None, min_length=8, max_length=128)

    @field_validator("username")
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v.isalnum() and "_" not in v and "-" not in v:
            raise ValueError("Username can only contain alphanumeric characters, underscores, and hyphens.")
        return v
