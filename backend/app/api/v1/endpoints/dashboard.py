"""Dashboard Endpoints (/api/v1/dashboard)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.dashboard import (
    StudentDashboardResponse,
    InstructorDashboardResponse,
    InstructorStudentListItem,
)
from app.services.dashboard import DashboardService

router = APIRouter()


@router.get(
    "/student",
    response_model=StudentDashboardResponse,
    summary="Student Dashboard Metrics",
    description="Returns personalized training statistics and status for authenticated Student.",
)
def get_student_dashboard(
    current_user: User = Depends(require_role([UserRole.STUDENT, UserRole.INSTRUCTOR])),
    db: Session = Depends(get_db),
):
    return DashboardService.get_student_dashboard(db, current_user)


@router.get(
    "/instructor",
    response_model=InstructorDashboardResponse,
    summary="Instructor Dashboard Metrics",
    description="Returns aggregate platform metrics and active training stats for authenticated Instructor.",
)
def get_instructor_dashboard(
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR)),
    db: Session = Depends(get_db),
):
    return DashboardService.get_instructor_dashboard(db, current_user)


@router.get(
    "/instructor/students",
    response_model=List[InstructorStudentListItem],
    summary="Instructor Student Overview",
    description="Returns list of registered student accounts for Instructor management overview.",
)
def get_instructor_students(
    search: Optional[str] = Query(None, description="Search by username or email"),
    is_active: Optional[bool] = Query(None, description="Filter active status"),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR)),
    db: Session = Depends(get_db),
):
    return DashboardService.get_instructor_students(db, search=search, is_active=is_active)
