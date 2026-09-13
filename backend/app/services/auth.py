"""Auth Service for Authentication & Registration Rules."""

from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user import UserRepository
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
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

        # Generic authentication failure message to prevent credential enumeration
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

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
