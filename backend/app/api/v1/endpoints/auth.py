"""Authentication Endpoints (/api/v1/auth)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Student account",
    description="Registers a new user account. Public registrations strictly assign the Student role.",
)
def register_student(
    payload: UserRegister,
    db: Session = Depends(get_db),
):
    user = AuthService.register_student(db, payload)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate User and Issue JWT Access Token",
    description="Validates credentials and returns a signed Bearer JWT access token.",
)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    return AuthService.authenticate_user(db, payload)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retrieve Authenticated User Profile",
    description="Returns profile details of the currently authenticated user based on Bearer token.",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)
