"""Administrator-only platform management endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.lab import Lab
from app.models.user import User, UserRole
from app.schemas.lab import LabCreate, LabInstructorResponse, LabUpdate
from app.schemas.user import AdminUserCreate, AdminUserUpdate, UserResponse
from app.services.admin import AdminService
from app.services.lab import LabService

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
def list_users(current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return AdminService.list_users(db)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: AdminUserCreate, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return AdminService.create_user(db, payload)


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, payload: AdminUserUpdate, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return AdminService.update_user(db, user_id, payload, current_user)


@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return AdminService.delete_user(db, user_id, current_user)


@router.get("/labs", response_model=List[LabInstructorResponse])
def list_all_labs(current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return [LabInstructorResponse.model_validate(lab) for lab in db.query(Lab).order_by(Lab.updated_at.desc()).all()]


@router.post("/labs", response_model=LabInstructorResponse, status_code=status.HTTP_201_CREATED)
def create_lab(payload: LabCreate, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return LabService.create_lab(db, payload, current_user)


@router.put("/labs/{lab_id}", response_model=LabInstructorResponse)
def update_lab(lab_id: str, payload: LabUpdate, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return LabService.update_lab(db, lab_id, payload, current_user, allow_any=True)


@router.delete("/labs/{lab_id}")
def delete_lab(lab_id: str, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return LabService.delete_lab(db, lab_id, current_user, allow_any=True)
