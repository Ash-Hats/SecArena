"""Lab and LabHint Schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
import re
from app.models.lab import LabCategory, Difficulty, LabStatus


class HintCreate(BaseModel):
    """Hint Creation Payload."""

    title: str = Field(..., min_length=1, max_length=150)
    content: str = Field(..., min_length=1)
    hint_order: int = Field(default=1, ge=1)


class HintResponse(BaseModel):
    """Hint Response Schema."""

    id: str
    lab_id: str
    title: str
    content: str
    hint_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class LabCreate(BaseModel):
    """Lab Blueprint Creation Payload."""

    title: str = Field(..., min_length=3, max_length=150)
    slug: Optional[str] = Field(default=None, max_length=100)
    short_description: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    category: LabCategory = Field(default=LabCategory.WEB)
    difficulty: Difficulty = Field(default=Difficulty.EASY)
    estimated_duration_minutes: int = Field(default=30, ge=1, le=1440)
    learning_objectives: List[str] = Field(default_factory=list)
    required_tools: List[str] = Field(default_factory=list)
    hints: List[HintCreate] = Field(default_factory=list)

    @field_validator("slug")
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip():
            v = v.strip().lower()
            if not re.match(r"^[a-z0-9-]+$", v):
                raise ValueError("Slug can only contain lowercase alphanumeric characters and hyphens.")
            return v
        return None


class LabUpdate(BaseModel):
    """Lab Blueprint Update Payload."""

    title: Optional[str] = Field(default=None, min_length=3, max_length=150)
    slug: Optional[str] = Field(default=None, max_length=100)
    short_description: Optional[str] = Field(default=None, min_length=5, max_length=255)
    description: Optional[str] = Field(default=None, min_length=10)
    category: Optional[LabCategory] = None
    difficulty: Optional[Difficulty] = None
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=1, le=1440)
    learning_objectives: Optional[List[str]] = None
    required_tools: Optional[List[str]] = None
    hints: Optional[List[HintCreate]] = None

    @field_validator("slug")
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip():
            v = v.strip().lower()
            if not re.match(r"^[a-z0-9-]+$", v):
                raise ValueError("Slug can only contain lowercase alphanumeric characters and hyphens.")
            return v
        return None


class LabStudentResponse(BaseModel):
    """Student Lab View (excludes internal/author/status metadata)."""

    id: str
    slug: str
    title: str
    short_description: str
    description: str
    category: LabCategory
    difficulty: Difficulty
    estimated_duration_minutes: int
    learning_objectives: List[str]
    required_tools: List[str]
    hints: List[HintResponse]

    class Config:
        from_attributes = True


class LabAdminResponse(BaseModel):
    """Instructor Lab Management Response."""

    id: str
    slug: str
    title: str
    short_description: str
    description: str
    category: LabCategory
    difficulty: Difficulty
    status: LabStatus
    estimated_duration_minutes: int
    learning_objectives: List[str]
    required_tools: List[str]
    hints: List[HintResponse]
    author_id: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None

    class Config:
        from_attributes = True
