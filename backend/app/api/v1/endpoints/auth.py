"""Authentication Endpoints (/api/v1/auth)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse, UserUpdate
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

@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update Authenticated User Profile",
    description="Updates the profile of the currently authenticated user.",
)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_user = AuthService.update_profile(db, current_user, payload)
    return UserResponse.model_validate(updated_user)

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout User",
    description="Deletes all simulation history and data for the user on logout.",
)
def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.simulation import SimulationSession
    # Delete all simulation sessions associated with the user
    db.query(SimulationSession).filter(SimulationSession.student_id == current_user.id).delete()
    db.commit()
    return {"message": "Logged out and data cleared"}
