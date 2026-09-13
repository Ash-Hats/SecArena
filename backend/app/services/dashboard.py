"""Dashboard Service for Student and Instructor Metrics."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.repositories.dashboard import DashboardRepository
from app.repositories.lab import LabRepository
from app.schemas.dashboard import (
    StudentDashboardResponse,
    InstructorDashboardResponse,
    InstructorStudentListItem,
)


class DashboardService:
    """Service compiling dashboard statistics and student lists."""

    @staticmethod
    def get_student_dashboard(db: Session, current_user: User) -> StudentDashboardResponse:
        """Construct dashboard data for an authenticated Student."""
        available_labs = LabRepository.count_published_labs(db)
        
        return StudentDashboardResponse(
            username=current_user.username,
            role=current_user.role,
            available_labs_count=available_labs,
            running_labs_count=0,
            completed_challenges_count=0,
            progress_status_message="Progress tracking will become active as challenges are completed.",
            recent_activity=[],
        )

    @staticmethod
    def get_instructor_dashboard(db: Session, current_user: User) -> InstructorDashboardResponse:
        """Construct dashboard data for an authenticated Instructor."""
        total_students = DashboardRepository.get_total_students_count(db)

        return InstructorDashboardResponse(
            username=current_user.username,
            role=current_user.role,
            total_students_count=total_students,
            active_students_count="Not available yet",
            running_labs_count="0 / Not available yet",
            completed_challenges_count="Not available yet",
            avg_completion_time="Not available yet",
            recent_activity=[],
        )

    @staticmethod
    def get_instructor_students(
        db: Session,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[InstructorStudentListItem]:
        """Retrieve list of registered students for Instructor management overview."""
        students = DashboardRepository.get_instructor_students_list(db, search=search, is_active=is_active)
        return [InstructorStudentListItem.model_validate(s) for s in students]
