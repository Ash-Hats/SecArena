"""Dashboard Repository for Data Aggregation."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.user import UserRepository
from app.models.user import User, UserRole


class DashboardRepository:
    """Repository providing aggregated statistics for Student and Instructor dashboards."""

    @staticmethod
    def get_total_students_count(db: Session) -> int:
        """Query total count of students."""
        return UserRepository.count_students(db)

    @staticmethod
    def get_instructor_students_list(
        db: Session,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[User]:
        """Query student list for instructor overview."""
        return UserRepository.get_students(db, search=search, is_active=is_active)
