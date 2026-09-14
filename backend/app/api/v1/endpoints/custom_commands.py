from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import require_role
from app.models.user import User, UserRole
from app.models.custom_command import CustomCommand
from app.schemas.custom_command import CustomCommandCreate, CustomCommandUpdate, CustomCommandResponse

router = APIRouter()

def require_admin(current_user: User = Depends(require_role(UserRole.ADMIN))) -> User:
    return current_user

@router.get("/", response_model=List[CustomCommandResponse])
def read_custom_commands(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    _: User = Depends(require_admin)
) -> Any:
    """Retrieve all custom commands."""
    commands = db.query(CustomCommand).offset(skip).limit(limit).all()
    return commands

@router.post("/", response_model=CustomCommandResponse, status_code=201)
def create_custom_command(
    *,
    db: Session = Depends(get_db),
    command_in: CustomCommandCreate,
    _: User = Depends(require_admin)
) -> Any:
    """Create new custom command."""
    command = db.query(CustomCommand).filter(CustomCommand.command_name == command_in.command_name).first()
    if command:
        raise HTTPException(status_code=400, detail="Command already exists.")
    
    command = CustomCommand(
        command_name=command_in.command_name,
        output=command_in.output,
        description=command_in.description,
        is_real_execution=command_in.is_real_execution
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    return command

@router.put("/{id}", response_model=CustomCommandResponse)
def update_custom_command(
    *,
    db: Session = Depends(get_db),
    id: str,
    command_in: CustomCommandUpdate,
    _: User = Depends(require_admin)
) -> Any:
    """Update custom command."""
    command = db.query(CustomCommand).filter(CustomCommand.id == id).first()
    if not command:
        raise HTTPException(status_code=404, detail="Command not found")
        
    update_data = command_in.model_dump(exclude_unset=True)
    if "command_name" in update_data and update_data["command_name"] != command.command_name:
        existing = db.query(CustomCommand).filter(CustomCommand.command_name == update_data["command_name"]).first()
        if existing:
             raise HTTPException(status_code=400, detail="Command name already exists.")

    for field, value in update_data.items():
        setattr(command, field, value)
        
    db.add(command)
    db.commit()
    db.refresh(command)
    return command

@router.delete("/{id}")
def delete_custom_command(
    *,
    db: Session = Depends(get_db),
    id: str,
    _: User = Depends(require_admin)
) -> Any:
    """Delete custom command."""
    command = db.query(CustomCommand).filter(CustomCommand.id == id).first()
    if not command:
        raise HTTPException(status_code=404, detail="Command not found")
    
    db.delete(command)
    db.commit()
    return {"success": True}
