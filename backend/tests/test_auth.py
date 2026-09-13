"""Tests for Phase 1 Authentication & User Management."""

import pytest
from app.core.security import verify_password, hash_password
from app.models.user import User, UserRole


def test_password_hashing():
    """Verify Argon2id password hashing and verification."""
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)
    assert hashed != password
    assert "argon2" in hashed.lower()
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_register_student(client):
    """Test successful student registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newstudent",
            "email": "newstudent@example.com",
            "password": "Password123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newstudent"
    assert data["email"] == "newstudent@example.com"
    assert data["role"] == "student"
    assert "password_hash" not in data
    assert "password" not in data


def test_register_duplicate_username(client, student_user):
    """Test registration fails on duplicate username."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": student_user.username,
            "email": "otheremail@example.com",
            "password": "Password123!",
        },
    )
    assert response.status_code == 400
    assert "already taken" in response.json()["detail"]


def test_register_duplicate_email(client, student_user):
    """Test registration fails on duplicate email."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "uniqueusername",
            "email": student_user.email,
            "password": "Password123!",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client, student_user):
    """Test successful login returns JWT access token."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username_or_email": student_user.username,
            "password": "StudentPass123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == student_user.username


def test_login_invalid_password(client, student_user):
    """Test login fails with incorrect password."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username_or_email": student_user.username,
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]


def test_login_unknown_user(client):
    """Test login fails with non-existent user."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username_or_email": "nonexistentuser",
            "password": "SomePassword123!",
        },
    )
    assert response.status_code == 401


def test_get_me_success(client, student_headers, student_user):
    """Test /auth/me returns current user profile."""
    response = client.get("/api/v1/auth/me", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == student_user.id
    assert data["username"] == student_user.username
    assert data["email"] == student_user.email
    assert data["role"] == "student"


def test_get_me_unauthenticated(client):
    """Test /auth/me rejects unauthenticated request with 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_rbac_test_endpoints(client, student_headers, instructor_headers):
    """Test student and instructor endpoint RBAC controls."""
    # Student endpoint accessible by student
    resp_student = client.get("/api/v1/test/student", headers=student_headers)
    assert resp_student.status_code == 200

    # Instructor endpoint accessible by instructor
    resp_inst = client.get("/api/v1/test/instructor", headers=instructor_headers)
    assert resp_inst.status_code == 200

    # Student denied access to instructor endpoint (403)
    resp_denied = client.get("/api/v1/test/instructor", headers=student_headers)
    assert resp_denied.status_code == 403
