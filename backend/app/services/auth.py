"""Auth Service for Authentication & Registration Rules."""

from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user import UserRepository
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse, UserUpdate
from app.models.user import User, UserRole


class AuthService:
    """Service handling user registration, authentication, and token generation."""

    @staticmethod
    def register_student(db: Session, payload: UserRegister) -> User:
        """Register a new student account. Public registration MUST always assign Student role."""
        existing_username = UserRepository.get_by_username(db, payload.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken.",
            )

        existing_email = UserRepository.get_by_email(db, payload.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered.",
            )

        pwd_hash = hash_password(payload.password)
        
        # Explicitly enforce Student role for public registrations
        user = UserRepository.create(
            db=db,
            username=payload.username,
            email=payload.email,
            password_hash=pwd_hash,
            role=UserRole.STUDENT,
        )
        return user

    @staticmethod
    def authenticate_user(db: Session, payload: UserLogin) -> TokenResponse:
        """Authenticate user credentials and issue JWT access token."""
        input_str = payload.username_or_email.strip()
        user = None
        
        if "@" in input_str:
            user = UserRepository.get_by_email(db, input_str)
        if not user:
            user = UserRepository.get_by_username(db, input_str)

        if not user:
            from app.core.security import pwd_context
            pwd_context.dummy_verify()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not registered.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password or username is incorrect.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Automatically upgrade password hash if settings have changed (e.g., to lower the cost)
        from app.core.security import pwd_context
        if pwd_context.needs_update(user.password_hash):
            user.password_hash = hash_password(payload.password)
            db.commit()

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support.",
            )

        token = create_access_token(
            data={
                "sub": user.id,
                "role": user.role.value if isinstance(user.role, UserRole) else str(user.role),
            }
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def update_profile(db: Session, user: User, payload: UserUpdate) -> User:
        """Update authenticated user's profile information."""
        if payload.username and payload.username != user.username:
            if UserRepository.get_by_username(db, payload.username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username is already taken.",
                )
            user.username = payload.username
            
        if payload.email and payload.email != user.email:
            if UserRepository.get_by_email(db, payload.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email address is already registered.",
                )
            user.email = payload.email

        if payload.new_password:
            if not payload.old_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Old password is required to change password.",
                )
            if not verify_password(payload.old_password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect old password.",
                )
            user.password_hash = hash_password(payload.new_password)

        db.commit()
        db.refresh(user)
        return user
