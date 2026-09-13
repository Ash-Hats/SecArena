"""Lab Service implementing Business Logic, Validation, and State Transitions."""

import re
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.lab import Lab, LabStatus, LabCategory, Difficulty
from app.repositories.lab import LabRepository
from app.schemas.lab import LabCreate, LabUpdate, LabStudentResponse, LabInstructorResponse


def generate_slug(title: str) -> str:
    """Generate a clean URL-safe slug from a title string."""
    s = title.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s or "lab"


class LabService:
    """Service handling Lab management, publishing workflows, and validation."""

    @staticmethod
    def _verify_lab_ownership(lab: Lab, user: User, allow_any: bool = False) -> None:
        """Ensure current user is the author of the lab."""
        if not allow_any and lab.author_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this lab blueprint.",
            )

    @staticmethod
    def create_lab(db: Session, payload: LabCreate, current_user: User) -> LabInstructorResponse:
        """Create a new Lab blueprint in DRAFT state."""
        slug_str = payload.slug or generate_slug(payload.title)
        
        # Ensure slug uniqueness
        existing_slug = LabRepository.get_by_slug(db, slug_str)
        if existing_slug:
            # Append short random suffix if slug collides
            slug_str = f"{slug_str}-{datetime.now().strftime('%M%S')}"

        hints_dicts = [h.model_dump() for h in payload.hints] if payload.hints else []

        lab = Lab(
            slug=slug_str,
            title=payload.title.strip(),
            short_description=payload.short_description.strip(),
            description=payload.description.strip(),
            category=payload.category,
            difficulty=payload.difficulty,
            status=LabStatus.DRAFT,
            estimated_duration_minutes=payload.estimated_duration_minutes,
            learning_objectives=payload.learning_objectives,
            required_tools=payload.required_tools,
            author_id=current_user.id,
        )

        created_lab = LabRepository.create_lab(db, lab, hints_data=hints_dicts)
        return LabInstructorResponse.model_validate(created_lab)

    @staticmethod
    def update_lab(db: Session, lab_id: str, payload: LabUpdate, current_user: User, allow_any: bool = False) -> LabInstructorResponse:
        """Update an existing Lab blueprint."""
        lab = LabRepository.get_by_id(db, lab_id)
        if not lab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab blueprint not found.")

        LabService._verify_lab_ownership(lab, current_user, allow_any)

        if lab.status == LabStatus.ARCHIVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Archived labs cannot be modified.",
            )

        update_dict = payload.model_dump(exclude_unset=True)
        hints_data = None
        if "hints" in update_dict:
            hints_list = update_dict.pop("hints")
            hints_data = [h if isinstance(h, dict) else h for h in hints_list] if hints_list is not None else []

        if "slug" in update_dict and update_dict["slug"]:
            new_slug = update_dict["slug"]
            if new_slug != lab.slug:
                existing = LabRepository.get_by_slug(db, new_slug)
                if existing and existing.id != lab.id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Slug '{new_slug}' is already in use by another lab.",
                    )

        updated_lab = LabRepository.update_lab(db, lab, update_dict, hints_data=hints_data)
        return LabInstructorResponse.model_validate(updated_lab)

    @staticmethod
    def publish_lab(db: Session, lab_id: str, current_user: User) -> LabInstructorResponse:
        """Publish a Lab blueprint after strict validation."""
        lab = LabRepository.get_by_id(db, lab_id)
        if not lab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab blueprint not found.")

        LabService._verify_lab_ownership(lab, current_user)

        if lab.status == LabStatus.ARCHIVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Archived labs cannot be published.",
            )

        # Strict Publish Content Validation
        missing_requirements = []
        if not lab.title or not lab.title.strip():
            missing_requirements.append("title")
        if not lab.description or not lab.description.strip():
            missing_requirements.append("description")
        if not lab.short_description or not lab.short_description.strip():
            missing_requirements.append("short description")
        if not lab.learning_objectives or len(lab.learning_objectives) == 0:
            missing_requirements.append("at least one learning objective")

        if missing_requirements:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Cannot publish lab. Missing required content: {', '.join(missing_requirements)}.",
            )

        now = datetime.now(timezone.utc)
        updated_lab = LabRepository.update_lab(
            db,
            lab,
            {"status": LabStatus.PUBLISHED, "published_at": now},
        )
        return LabInstructorResponse.model_validate(updated_lab)

    @staticmethod
    def unpublish_lab(db: Session, lab_id: str, current_user: User) -> LabInstructorResponse:
        """Revert a published Lab to DRAFT state."""
        lab = LabRepository.get_by_id(db, lab_id)
        if not lab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab blueprint not found.")

        LabService._verify_lab_ownership(lab, current_user)

        if lab.status == LabStatus.ARCHIVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Archived labs cannot be unpublished.",
            )

        updated_lab = LabRepository.update_lab(db, lab, {"status": LabStatus.DRAFT})
        return LabInstructorResponse.model_validate(updated_lab)

    @staticmethod
    def archive_lab(db: Session, lab_id: str, current_user: User) -> LabInstructorResponse:
        """Archive a Lab blueprint."""
        lab = LabRepository.get_by_id(db, lab_id)
        if not lab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab blueprint not found.")

        LabService._verify_lab_ownership(lab, current_user)

        now = datetime.now(timezone.utc)
        updated_lab = LabRepository.update_lab(
            db,
            lab,
            {"status": LabStatus.ARCHIVED, "archived_at": now},
        )
        return LabInstructorResponse.model_validate(updated_lab)

    @staticmethod
    def delete_lab(db: Session, lab_id: str, current_user: User, allow_any: bool = False) -> dict:
        """Delete a Lab blueprint."""
        lab = LabRepository.get_by_id(db, lab_id)
        if not lab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab blueprint not found.")

        LabService._verify_lab_ownership(lab, current_user, allow_any)
        LabRepository.delete_lab(db, lab)
        return {"detail": f"Lab '{lab.title}' has been deleted."}

    @staticmethod
    def list_student_catalog(
        db: Session,
        category: Optional[LabCategory] = None,
        difficulty: Optional[Difficulty] = None,
        search: Optional[str] = None,
    ) -> List[LabStudentResponse]:
        """Fetch strictly PUBLISHED labs for student catalog."""
        labs = LabRepository.list_published_labs(db, category=category, difficulty=difficulty, search=search)
        return [LabStudentResponse.model_validate(l) for l in labs]

    @staticmethod
    def get_published_lab_detail(db: Session, slug_or_id: str) -> LabStudentResponse:
        """Fetch published lab details by slug or ID for student view."""
        lab = LabRepository.get_by_slug(db, slug_or_id)
        if not lab:
            lab = LabRepository.get_by_id(db, slug_or_id)

        if not lab or lab.status != LabStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lab blueprint not found or unavailable.",
            )

        return LabStudentResponse.model_validate(lab)

    @staticmethod
    def list_instructor_labs(
        db: Session,
        current_user: User,
        status_filter: Optional[LabStatus] = None,
        category: Optional[LabCategory] = None,
        difficulty: Optional[Difficulty] = None,
        search: Optional[str] = None,
    ) -> List[LabInstructorResponse]:
        """Fetch all labs authored by the current instructor."""
        labs = LabRepository.list_instructor_labs(
            db,
            author_id=current_user.id,
            status=status_filter,
            category=category,
            difficulty=difficulty,
            search=search,
        )
        return [LabInstructorResponse.model_validate(l) for l in labs]

    @staticmethod
    def get_instructor_lab_detail(db: Session, lab_id: str, current_user: User) -> LabInstructorResponse:
        """Fetch lab detail for instructor management view."""
        lab = LabRepository.get_by_id(db, lab_id)
        if not lab:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab blueprint not found.")

        LabService._verify_lab_ownership(lab, current_user)
        return LabInstructorResponse.model_validate(lab)
