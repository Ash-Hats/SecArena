"""Lab Repository for Database CRUD and Catalog Filtering."""

from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.lab import Lab, LabHint, LabCategory, Difficulty, LabStatus


class LabRepository:
    """Repository handling Lab database operations."""

    @staticmethod
    def get_by_id(db: Session, lab_id: str) -> Optional[Lab]:
        """Fetch lab by ID."""
        return db.query(Lab).filter(Lab.id == lab_id).first()

    @staticmethod
    def get_by_slug(db: Session, slug: str) -> Optional[Lab]:
        """Fetch lab by unique slug."""
        return db.query(Lab).filter(Lab.slug == slug.strip().lower()).first()

    @staticmethod
    def create_lab(db: Session, lab: Lab, hints_data: List[dict] = None) -> Lab:
        """Create and persist a new Lab with hints."""
        db.add(lab)
        db.flush()
        
        if hints_data:
            for h_data in hints_data:
                hint = LabHint(
                    lab_id=lab.id,
                    title=h_data["title"],
                    content=h_data["content"],
                    hint_order=h_data.get("hint_order", 1),
                )
                db.add(hint)
                
        db.commit()
        db.refresh(lab)
        return lab

    @staticmethod
    def update_lab(db: Session, lab: Lab, update_fields: dict, hints_data: Optional[List[dict]] = None) -> Lab:
        """Update existing Lab attributes and rebuild hints if provided."""
        for key, value in update_fields.items():
            if value is not None and hasattr(lab, key):
                setattr(lab, key, value)
                
        lab.updated_at = datetime.now(timezone.utc)
        
        if hints_data is not None:
            # Clear old hints and re-add updated list
            db.query(LabHint).filter(LabHint.lab_id == lab.id).delete()
            for h_data in hints_data:
                hint = LabHint(
                    lab_id=lab.id,
                    title=h_data["title"],
                    content=h_data["content"],
                    hint_order=h_data.get("hint_order", 1),
                )
                db.add(hint)

        db.commit()
        db.refresh(lab)
        return lab

    @staticmethod
    def delete_lab(db: Session, lab: Lab) -> None:
        """Delete lab record."""
        db.delete(lab)
        db.commit()

    @staticmethod
    def list_published_labs(
        db: Session,
        category: Optional[LabCategory] = None,
        difficulty: Optional[Difficulty] = None,
        search: Optional[str] = None,
    ) -> List[Lab]:
        """Query published labs for Student Catalog."""
        query = db.query(Lab).filter(Lab.status == LabStatus.PUBLISHED)
        
        if category:
            query = query.filter(Lab.category == category)
            
        if difficulty:
            query = query.filter(Lab.difficulty == difficulty)
            
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Lab.title.ilike(term),
                    Lab.short_description.ilike(term),
                    Lab.description.ilike(term),
                )
            )
            
        return query.order_by(Lab.published_at.desc().nullslast(), Lab.created_at.desc()).all()

    @staticmethod
    def list_instructor_labs(
        db: Session,
        author_id: str,
        status: Optional[LabStatus] = None,
        category: Optional[LabCategory] = None,
        difficulty: Optional[Difficulty] = None,
        search: Optional[str] = None,
    ) -> List[Lab]:
        """Query labs for Instructor Management overview."""
        query = db.query(Lab).filter(Lab.author_id == author_id)
        
        if status:
            query = query.filter(Lab.status == status)
            
        if category:
            query = query.filter(Lab.category == category)
            
        if difficulty:
            query = query.filter(Lab.difficulty == difficulty)
            
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Lab.title.ilike(term),
                    Lab.short_description.ilike(term),
                )
            )
            
        return query.order_by(Lab.updated_at.desc()).all()

    @staticmethod
    def count_published_labs(db: Session) -> int:
        """Count total published labs."""
        return db.query(Lab).filter(Lab.status == LabStatus.PUBLISHED).count()
