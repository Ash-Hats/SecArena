"""SQLAlchemy Database Engine, Session Factory, and Dependency Injection."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Create SQLAlchemy engine configured for PostgreSQL / SQLite fallback
# connect_args is only passed for sqlite if needed in testing
engine_args = {"pool_pre_ping": True}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

from sqlalchemy import event
from sqlalchemy.engine import Engine

engine = create_engine(
    settings.DATABASE_URL,
    **engine_args
)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency providing transactional database sessions.

    Yields:
        SQLAlchemy Session object. Closes session automatically upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
