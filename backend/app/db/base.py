"""SQLAlchemy Declarative Base Model.

All database models created in future phases (User, Lab, Flag, Telemetry, etc.)
will inherit from this Base class to allow metadata collection for Alembic migrations.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass
