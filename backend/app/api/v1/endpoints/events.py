"""Authenticated training event endpoints."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.event import EventEnrollment, EventLab, EventStatus, TrainingEvent
from app.models.lab import Lab, LabStatus
from app.models.user import User, UserRole
from app.schemas.event import EventJoinRequest, EventPayload, EventStatusUpdate, TrainingEventResponse
from app.schemas.lab import LabStudentResponse

router = APIRouter()


def _event_response(event: TrainingEvent, user_id: str | None = None) -> TrainingEventResponse:
    labs = [LabStudentResponse.model_validate(item.lab) for item in event.assignments]
    enrolled_ids = {item.student_id for item in event.enrollments}
    return TrainingEventResponse(
        id=event.id, title=event.title, description=event.description, join_code=event.join_code,
        status=event.status, starts_at=event.starts_at, ends_at=event.ends_at, capacity=event.capacity,
        author_id=event.author_id, created_at=event.created_at, labs=labs,
        enrollment_count=len(enrolled_ids), is_enrolled=user_id in enrolled_ids,
    )


def _get_event(db: Session, event_id: str) -> TrainingEvent:
    event = db.query(TrainingEvent).options(joinedload(TrainingEvent.assignments).joinedload(EventLab.lab), joinedload(TrainingEvent.enrollments)).filter(TrainingEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Training event not found.")
    return event


def _validate_labs(db: Session, lab_ids: List[str], instructor_id: str) -> List[Lab]:
    unique_ids = list(dict.fromkeys(lab_ids))
    labs = db.query(Lab).filter(Lab.id.in_(unique_ids), Lab.author_id == instructor_id, Lab.status == LabStatus.PUBLISHED).all()
    if len(labs) != len(unique_ids):
        raise HTTPException(status_code=422, detail="Events can only include your published lab blueprints.")
    return labs


@router.get("/manage", response_model=List[TrainingEventResponse])
def list_instructor_events(current_user: User = Depends(require_role(UserRole.INSTRUCTOR)), db: Session = Depends(get_db)):
    events = db.query(TrainingEvent).options(joinedload(TrainingEvent.assignments).joinedload(EventLab.lab), joinedload(TrainingEvent.enrollments)).filter(TrainingEvent.author_id == current_user.id).order_by(TrainingEvent.updated_at.desc()).all()
    return [_event_response(event, current_user.id) for event in events]


@router.get("", response_model=List[TrainingEventResponse])
def list_published_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(TrainingEvent).options(joinedload(TrainingEvent.assignments).joinedload(EventLab.lab), joinedload(TrainingEvent.enrollments)).filter(TrainingEvent.status == EventStatus.PUBLISHED).order_by(TrainingEvent.starts_at.asc()).all()
    return [_event_response(event, current_user.id) for event in events]


@router.post("", response_model=TrainingEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventPayload, current_user: User = Depends(require_role(UserRole.INSTRUCTOR)), db: Session = Depends(get_db)):
    if db.query(TrainingEvent).filter(TrainingEvent.join_code == payload.join_code).first():
        raise HTTPException(status_code=409, detail="That join code is already in use.")
    labs = _validate_labs(db, payload.lab_ids, current_user.id)
    event = TrainingEvent(**payload.model_dump(exclude={"lab_ids"}), author_id=current_user.id)
    event.assignments = [EventLab(lab_id=lab.id) for lab in labs]
    db.add(event); db.commit()
    return _event_response(_get_event(db, event.id), current_user.id)


@router.get("/{event_id}", response_model=TrainingEventResponse)
def get_event(event_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = _get_event(db, event_id)
    enrolled = any(item.student_id == current_user.id for item in event.enrollments)
    if event.author_id != current_user.id and event.status != EventStatus.PUBLISHED and not enrolled:
        raise HTTPException(status_code=404, detail="Training event not found.")
    return _event_response(event, current_user.id)


@router.put("/{event_id}", response_model=TrainingEventResponse)
def update_event(event_id: str, payload: EventPayload, current_user: User = Depends(require_role(UserRole.INSTRUCTOR)), db: Session = Depends(get_db)):
    event = _get_event(db, event_id)
    if event.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this event.")
    duplicate = db.query(TrainingEvent).filter(TrainingEvent.join_code == payload.join_code, TrainingEvent.id != event_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="That join code is already in use.")
    labs = _validate_labs(db, payload.lab_ids, current_user.id)
    for field, value in payload.model_dump(exclude={"lab_ids"}).items(): setattr(event, field, value)
    event.updated_at = datetime.now(timezone.utc)
    event.assignments = [EventLab(lab_id=lab.id) for lab in labs]
    db.commit()
    return _event_response(_get_event(db, event_id), current_user.id)


@router.post("/{event_id}/status", response_model=TrainingEventResponse)
def set_event_status(event_id: str, payload: EventStatusUpdate, current_user: User = Depends(require_role(UserRole.INSTRUCTOR)), db: Session = Depends(get_db)):
    event = _get_event(db, event_id)
    if event.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this event.")
    event.status = payload.status; event.updated_at = datetime.now(timezone.utc); db.commit()
    return _event_response(_get_event(db, event_id), current_user.id)


@router.post("/join", response_model=TrainingEventResponse)
def join_event(payload: EventJoinRequest, current_user: User = Depends(require_role(UserRole.STUDENT)), db: Session = Depends(get_db)):
    event = db.query(TrainingEvent).options(joinedload(TrainingEvent.assignments).joinedload(EventLab.lab), joinedload(TrainingEvent.enrollments)).filter(TrainingEvent.join_code == payload.join_code).first()
    if not event or event.status != EventStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="No open event matches that join code.")
    now = datetime.now(timezone.utc)
    if event.ends_at.replace(tzinfo=event.ends_at.tzinfo or timezone.utc) < now:
        raise HTTPException(status_code=400, detail="This event has already ended.")
    if not any(item.student_id == current_user.id for item in event.enrollments):
        if event.capacity and len(event.enrollments) >= event.capacity:
            raise HTTPException(status_code=409, detail="This event has reached its capacity.")
        db.add(EventEnrollment(event_id=event.id, student_id=current_user.id)); db.commit()
    return _event_response(_get_event(db, event.id), current_user.id)
