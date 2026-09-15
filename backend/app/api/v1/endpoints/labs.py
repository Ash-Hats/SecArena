"""Lab Blueprint Endpoints (/api/v1/labs)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.lab import LabCategory, Difficulty, LabStatus
from app.schemas.lab import (
    LabCreate,
    LabUpdate,
    LabStudentResponse,
    LabAdminResponse,
)
from app.services.lab import LabService

router = APIRouter()


# ============================================================================
# STUDENT ENDPOINTS (Catalog & Details)
# ============================================================================

@router.get(
    "",
    response_model=List[LabStudentResponse],
    summary="Student Lab Catalog",
    description="Returns all published cybersecurity training labs. Supports search and category/difficulty filtering.",
)
def list_student_catalog(
    category: Optional[LabCategory] = Query(None, description="Filter by category (WEB, LINUX, NETWORK, API)"),
    difficulty: Optional[Difficulty] = Query(None, description="Filter by difficulty (EASY, MEDIUM, HARD, EXPERT)"),
    search: Optional[str] = Query(None, description="Search terms in title or description"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return LabService.list_student_catalog(db, category=category, difficulty=difficulty, search=search)


@router.get(
    "/manage",
    response_model=List[LabAdminResponse],
    summary="Instructor Lab Management List",
    description="Lists all lab blueprints created by the authenticated Instructor across all lifecycle statuses.",
)
def list_instructor_labs(
    status: Optional[LabStatus] = Query(None, description="Filter by lifecycle status (DRAFT, PUBLISHED, ARCHIVED)"),
    category: Optional[LabCategory] = Query(None, description="Filter by category"),
    difficulty: Optional[Difficulty] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Search terms"),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.list_instructor_labs(
        db,
        current_user=current_user,
        status_filter=status,
        category=category,
        difficulty=difficulty,
        search=search,
    )


@router.get(
    "/manage/{lab_id}",
    response_model=LabAdminResponse,
    summary="Instructor Lab Blueprint Detail",
    description="Retrieves full lab blueprint details for instructor management view.",
)
def get_instructor_lab_detail(
    lab_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.get_instructor_lab_detail(db, lab_id=lab_id, current_user=current_user)


@router.get(
    "/{slug_or_id}",
    response_model=LabStudentResponse,
    summary="Student Lab Blueprint Detail",
    description="Retrieves published lab blueprint details by slug or ID for student view.",
)
def get_published_lab_detail(
    slug_or_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return LabService.get_published_lab_detail(db, slug_or_id=slug_or_id)


# ============================================================================
# INSTRUCTOR MANAGEMENT ENDPOINTS
# ============================================================================

@router.post(
    "",
    response_model=LabAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Lab Blueprint (Instructor Only)",
    description="Creates a new cybersecurity lab blueprint in DRAFT state.",
)
def create_lab(
    payload: LabCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.create_lab(db, payload=payload, current_user=current_user)


@router.put(
    "/manage/{lab_id}",
    response_model=LabAdminResponse,
    summary="Update Lab Blueprint (Instructor Only)",
    description="Updates an existing lab blueprint. Cannot update archived labs.",
)
def update_lab(
    lab_id: str,
    payload: LabUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.update_lab(db, lab_id=lab_id, payload=payload, current_user=current_user)


@router.delete(
    "/manage/{lab_id}",
    summary="Delete Lab Blueprint (Instructor Only)",
    description="Deletes a lab blueprint.",
)
def delete_lab(
    lab_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.delete_lab(db, lab_id=lab_id, current_user=current_user)


@router.post(
    "/manage/{lab_id}/publish",
    response_model=LabAdminResponse,
    summary="Publish Lab Blueprint",
    description="Transitions a lab from DRAFT to PUBLISHED state after content validation.",
)
def publish_lab(
    lab_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.publish_lab(db, lab_id=lab_id, current_user=current_user)


@router.post(
    "/manage/{lab_id}/unpublish",
    response_model=LabAdminResponse,
    summary="Unpublish Lab Blueprint",
    description="Reverts a published lab back to DRAFT state.",
)
def unpublish_lab(
    lab_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.unpublish_lab(db, lab_id=lab_id, current_user=current_user)


@router.post(
    "/manage/{lab_id}/archive",
    response_model=LabAdminResponse,
    summary="Archive Lab Blueprint",
    description="Archives a lab blueprint. Archived labs are hidden from students.",
)
def archive_lab(
    lab_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return LabService.archive_lab(db, lab_id=lab_id, current_user=current_user)
