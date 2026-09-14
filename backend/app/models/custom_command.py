import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime

from app.db.base import Base

class CustomCommand(Base):
    __tablename__ = "custom_commands"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    command_name = Column(String(100), unique=True, index=True, nullable=False)
    output = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
    is_real_execution = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
