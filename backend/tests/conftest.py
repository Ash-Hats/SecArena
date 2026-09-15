"""Pytest Fixtures and Database Setup for SecArena Integration Testing."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import hash_password, create_access_token
import app.models  # Ensure all models are registered

# In-memory SQLite for fast testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Provides a clean in-memory database session per test function."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Provides FastAPI TestClient overriding get_db dependency."""
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def student_user(db):
    """Fixture creating a test Student user."""
    user = User(
        username="teststudent",
        email="student@example.com",
        password_hash=hash_password("StudentPass123!"),
        role=UserRole.STUDENT,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def instructor_user(db):
    """Fixture creating a test Instructor user."""
    user = User(
        username="testinstructor",
        email="instructor@example.com",
        password_hash=hash_password("InstructorPass123!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def student_token(student_user):
    """JWT token for Student user."""
    return create_access_token({"sub": student_user.id, "role": student_user.role.value})


@pytest.fixture
def instructor_token(instructor_user):
    """JWT token for Instructor user."""
    return create_access_token({"sub": instructor_user.id, "role": instructor_user.role.value})


@pytest.fixture
def student_headers(student_token):
    """HTTP Bearer headers for Student user."""
    return {"Authorization": f"Bearer {student_token}"}


@pytest.fixture
def instructor_headers(instructor_token):
    """HTTP Bearer headers for Instructor user."""
    return {"Authorization": f"Bearer {instructor_token}"}
