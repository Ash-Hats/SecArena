"""Database records for browser-based, data-only simulations."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class SimulationStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    COMPLETED = "COMPLETED"


class SimulationTeam(str, enum.Enum):
    RED = "RED"
    BLUE = "BLUE"
    OBSERVER = "OBSERVER"

class SimulationSession(Base):
    """A student's private, server-controlled virtual scenario state."""

    __tablename__ = "simulation_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_slug = Column(String(100), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(SimulationStatus), nullable=False, default=SimulationStatus.RUNNING)
    state = Column(JSON, nullable=False, default=dict)
    score = Column(Integer, nullable=False, default=0)
    progress = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    stopped_at = Column(DateTime(timezone=True), nullable=True)
    
    # PvP fields
    is_pvp = Column(Boolean, nullable=False, default=False)
    join_code = Column(String(20), unique=True, index=True, nullable=True)
    time_limit_minutes = Column(Integer, nullable=True)

    student = relationship("User", backref="simulation_sessions")
    actions = relationship("SimulationAction", back_populates="session", cascade="all, delete-orphan")
    events = relationship("SimulationEvent", back_populates="session", cascade="all, delete-orphan")
    participants = relationship("SimulationSessionUser", back_populates="session", cascade="all, delete-orphan")

class SimulationSessionUser(Base):
    __tablename__ = "simulation_session_users"

    session_id = Column(String(36), ForeignKey("simulation_sessions.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    team = Column(Enum(SimulationTeam), nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    session = relationship("SimulationSession", back_populates="participants")
    user = relationship("User")


class SimulationAction(Base):
    __tablename__ = "simulation_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    action_input = Column(String(500), nullable=False)
    command = Column(String(50), nullable=False)
    success = Column(String(10), nullable=False)
    result = Column(Text, nullable=False)
    score_contribution = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    session = relationship("SimulationSession", back_populates="actions")


class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(80), nullable=False)
    severity = Column(String(20), nullable=False, default="INFO")
    description = Column(Text, nullable=False)
    detected = Column(String(10), nullable=False, default="true")
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    session = relationship("SimulationSession", back_populates="events")
