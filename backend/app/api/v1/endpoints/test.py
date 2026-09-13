"""Test endpoints for verifying RBAC authorization logic."""

from fastapi import APIRouter, Depends
from app.core.security import require_role
from app.models.user import User, UserRole

router = APIRouter()


@router.get("/student", summary="Student Test Endpoint")
def test_student_endpoint(
    current_user: User = Depends(require_role([UserRole.STUDENT, UserRole.INSTRUCTOR])),
):
    """Accessible by Student (and Instructor)."""
    return {
        "message": f"Hello {current_user.username}, you have accessed the Student protected endpoint.",
        "role": current_user.role,
    }


@router.get("/instructor", summary="Instructor Test Endpoint")
def test_instructor_endpoint(
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR)),
):
    """Accessible strictly by Instructors."""
    return {
        "message": f"Hello {current_user.username}, you have accessed the Instructor protected endpoint.",
        "role": current_user.role,
    }
