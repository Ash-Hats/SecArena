"""Lab and LabHint Database Models and Enums."""

import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship, backref

from app.db.base import Base


class LabCategory(str, enum.Enum):
    """Lab Category Definitions."""

    WEB = "WEB"
    LINUX = "LINUX"
    NETWORK = "NETWORK"
    API = "API"
    CLOUD = "CLOUD"
    FORENSICS = "FORENSICS"
    OSINT = "OSINT"
    MOBILE = "MOBILE"


class Difficulty(str, enum.Enum):
    """Lab Difficulty Definitions."""

    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    EXPERT = "EXPERT"


class LabStatus(str, enum.Enum):
    """Lab Status Lifecycle Definitions."""

    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class Lab(Base):
    """Lab Definition Database Model."""

    __tablename__ = "labs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(150), nullable=False, index=True)
    short_description = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(LabCategory), nullable=False, default=LabCategory.WEB)
    difficulty = Column(Enum(Difficulty), nullable=False, default=Difficulty.EASY)
    status = Column(Enum(LabStatus), nullable=False, default=LabStatus.DRAFT)
    estimated_duration_minutes = Column(Integer, nullable=False, default=30)
    learning_objectives = Column(JSON, nullable=False, default=list)
    required_tools = Column(JSON, nullable=False, default=list)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    published_at = Column(DateTime(timezone=True), nullable=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    author = relationship("User", backref=backref("created_labs", cascade="all, delete-orphan"))
    hints = relationship("LabHint", back_populates="lab", cascade="all, delete-orphan", order_by="LabHint.hint_order")

    def __repr__(self) -> str:
        return f"<Lab slug={self.slug} status={self.status}>"


class LabHint(Base):
    """Lab Hint Model."""

    __tablename__ = "lab_hints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    hint_order = Column(Integer, nullable=False, default=1)

    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    lab = relationship("Lab", back_populates="hints")

    def __repr__(self) -> str:
        return f"<LabHint title={self.title} order={self.hint_order}>"
