"""User Repository for Database Operations."""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User, UserRole


class UserRepository:
    """Repository handling User database operations."""

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        """Fetch user by primary key ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Fetch user by unique username."""
        return db.query(User).filter(User.username.ilike(username.strip())).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Fetch user by unique email."""
        return db.query(User).filter(User.email.ilike(email.strip())).first()

    @staticmethod
    def create(
        db: Session,
        username: str,
        email: str,
        password_hash: str,
        role: UserRole = UserRole.STUDENT,
    ) -> User:
        """Create and persist a new User instance."""
        user = User(
            username=username.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def count_students(db: Session) -> int:
        """Count total registered student accounts."""
        return db.query(User).filter(User.role == UserRole.STUDENT).count()

    @staticmethod
    def get_students(
        db: Session,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[User]:
        """Fetch list of student accounts with optional search and active filters."""
        query = db.query(User).filter(User.role == UserRole.STUDENT)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
            
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(or_(User.username.ilike(term), User.email.ilike(term)))
            
        return query.order_by(User.created_at.desc()).all()
