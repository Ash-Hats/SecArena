"""Training event, lab assignment, and enrolment database models."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship, backref

from app.db.base import Base


class EventStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class TrainingEvent(Base):
    __tablename__ = "training_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False, default="")
    join_code = Column(String(40), nullable=False, unique=True, index=True)
    status = Column(Enum(EventStatus), nullable=False, default=EventStatus.DRAFT)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    capacity = Column(Integer, nullable=True)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    author = relationship("User", backref=backref("created_events", cascade="all, delete-orphan"))
    assignments = relationship("EventLab", cascade="all, delete-orphan", back_populates="event")
    enrollments = relationship("EventEnrollment", cascade="all, delete-orphan", back_populates="event")


class EventLab(Base):
    __tablename__ = "event_labs"
    __table_args__ = (UniqueConstraint("event_id", "lab_id", name="uq_event_lab"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("training_events.id", ondelete="CASCADE"), nullable=False, index=True)
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="CASCADE"), nullable=False, index=True)

    event = relationship("TrainingEvent", back_populates="assignments")
    lab = relationship("Lab")


class EventEnrollment(Base):
    __tablename__ = "event_enrollments"
    __table_args__ = (UniqueConstraint("event_id", "student_id", name="uq_event_enrollment"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("training_events.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    event = relationship("TrainingEvent", back_populates="enrollments")
