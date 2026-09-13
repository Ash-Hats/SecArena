"""Administrator-only account and platform management."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.user import AdminUserCreate, AdminUserUpdate, UserResponse


class AdminService:
    @staticmethod
    def list_users(db: Session):
        return [UserResponse.model_validate(user) for user in db.query(User).order_by(User.created_at.desc()).all()]

    @staticmethod
    def create_user(db: Session, payload: AdminUserCreate):
        if db.query(User).filter(User.username.ilike(payload.username.strip())).first():
            raise HTTPException(status_code=400, detail="Username is already taken.")
        if db.query(User).filter(User.email.ilike(str(payload.email).strip())).first():
            raise HTTPException(status_code=400, detail="Email address is already registered.")
        user = User(username=payload.username.strip(), email=str(payload.email).lower(), password_hash=hash_password(payload.password), role=payload.role, is_active=True)
        db.add(user); db.commit(); db.refresh(user)
        return UserResponse.model_validate(user)

    @staticmethod
    def update_user(db: Session, user_id: str, payload: AdminUserUpdate, current_admin: User):
        user = db.query(User).filter(User.id == user_id).first()
        if not user: raise HTTPException(status_code=404, detail="User not found.")
        data = payload.model_dump(exclude_unset=True)
        if user.id == current_admin.id and (data.get("role") not in (None, UserRole.ADMIN) or data.get("is_active") is False):
            raise HTTPException(status_code=400, detail="You cannot remove your own administrator access.")
        if "username" in data and data["username"] != user.username and db.query(User).filter(User.username.ilike(data["username"])).first():
            raise HTTPException(status_code=400, detail="Username is already taken.")
        if "email" in data and str(data["email"]).lower() != user.email and db.query(User).filter(User.email.ilike(str(data["email"]))).first():
            raise HTTPException(status_code=400, detail="Email address is already registered.")
        if "password" in data: user.password_hash = hash_password(data.pop("password"))
        for key, value in data.items(): setattr(user, key, str(value).lower() if key == "email" else value)
        db.commit(); db.refresh(user)
        return UserResponse.model_validate(user)

    @staticmethod
    def delete_user(db: Session, user_id: str, current_admin: User):
        user = db.query(User).filter(User.id == user_id).first()
        if not user: raise HTTPException(status_code=404, detail="User not found.")
        if user.id == current_admin.id: raise HTTPException(status_code=400, detail="You cannot delete your own administrator account.")
        if user.role == UserRole.ADMIN and db.query(User).filter(User.role == UserRole.ADMIN).count() <= 1:
            raise HTTPException(status_code=400, detail="The last administrator cannot be deleted.")
        db.delete(user); db.commit()
        return {"detail": f"User '{user.username}' deleted."}
