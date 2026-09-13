"""Dashboard Pydantic Schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.user import UserRole


class ActivityItem(BaseModel):
    """Activity Log Item Schema."""

    id: str
    description: str
    timestamp: datetime
    type: str = "info"


class StudentDashboardResponse(BaseModel):
    """Student Dashboard Data Response."""

    username: str
    role: UserRole
    available_labs_count: int = 0
    running_labs_count: int = 0
    completed_challenges_count: int = 0
    progress_status_message: str = "Progress tracking will become active as challenges are completed."
    recent_activity: List[ActivityItem] = []


class InstructorDashboardResponse(BaseModel):
    """Instructor Dashboard Data Response."""

    username: str
    role: UserRole
    total_students_count: int = 0
    active_students_count: str = "Not available yet"
    running_labs_count: str = "0 / Not available yet"
    completed_challenges_count: str = "Not available yet"
    avg_completion_time: str = "Not available yet"
    recent_activity: List[ActivityItem] = []


class InstructorStudentListItem(BaseModel):
    """Student list item for instructor management overview."""

    id: str
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
