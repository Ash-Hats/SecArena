"""Pydantic Schemas Package."""

from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.dashboard import StudentDashboardResponse, InstructorDashboardResponse, InstructorStudentListItem
from app.schemas.lab import (
    HintCreate,
    HintResponse,
    LabCreate,
    LabUpdate,
    LabStudentResponse,
    LabInstructorResponse,
)

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "StudentDashboardResponse",
    "InstructorDashboardResponse",
    "InstructorStudentListItem",
    "HintCreate",
    "HintResponse",
    "LabCreate",
    "LabUpdate",
    "LabStudentResponse",
    "LabInstructorResponse",
]
