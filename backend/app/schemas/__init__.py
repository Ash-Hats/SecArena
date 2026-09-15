"""Pydantic Schemas Package."""

from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.dashboard import StudentDashboardResponse, AdminDashboardResponse, AdminStudentListItem
from app.schemas.lab import (
    HintCreate,
    HintResponse,
    LabCreate,
    LabUpdate,
    LabStudentResponse,
    LabAdminResponse,
)

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "StudentDashboardResponse",
    "AdminDashboardResponse",
    "AdminStudentListItem",
    "HintCreate",
    "HintResponse",
    "LabCreate",
    "LabUpdate",
    "LabStudentResponse",
    "LabAdminResponse",
]
