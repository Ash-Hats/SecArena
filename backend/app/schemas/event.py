"""Request and response schemas for training events."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.event import EventStatus
from app.schemas.lab import LabStudentResponse


class EventPayload(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(default="", max_length=4000)
    join_code: str = Field(..., min_length=3, max_length=40)
    starts_at: datetime
    ends_at: datetime
    capacity: Optional[int] = Field(default=None, ge=1)
    lab_ids: List[str] = Field(..., min_length=1)

    @field_validator("join_code")
    @classmethod
    def normalize_join_code(cls, value: str) -> str:
        return value.strip().upper()

    @model_validator(mode="after")
    def validate_dates(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("The event end time must be after its start time.")
        return self


class EventStatusUpdate(BaseModel):
    status: EventStatus


class EventJoinRequest(BaseModel):
    join_code: str = Field(..., min_length=3, max_length=40)

    @field_validator("join_code")
    @classmethod
    def normalize_join_code(cls, value: str) -> str:
        return value.strip().upper()


class TrainingEventResponse(BaseModel):
    id: str
    title: str
    description: str
    join_code: str
    status: EventStatus
    starts_at: datetime
    ends_at: datetime
    capacity: Optional[int]
    author_id: str
    created_at: datetime
    labs: List[LabStudentResponse]
    enrollment_count: int
    is_enrolled: bool = False
