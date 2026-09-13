"""Tests for Phase 2 Dashboard APIs and Authorization."""

import pytest
from app.models.user import UserRole


def test_student_dashboard_access(client, student_headers, student_user):
    """Test student dashboard endpoint returns student metrics."""
    response = client.get("/api/v1/dashboard/student", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == student_user.username
    assert data["role"] == "student"
    assert "available_labs_count" in data
    assert "running_labs_count" in data


def test_instructor_dashboard_access(client, instructor_headers, instructor_user):
    """Test instructor dashboard endpoint returns instructor metrics."""
    response = client.get("/api/v1/dashboard/instructor", headers=instructor_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == instructor_user.username
    assert data["role"] == "instructor"
    assert "total_students_count" in data


def test_student_denied_instructor_dashboard(client, student_headers):
    """Test student is forbidden (403) from accessing instructor dashboard."""
    response = client.get("/api/v1/dashboard/instructor", headers=student_headers)
    assert response.status_code == 403


def test_unauthenticated_dashboard_access(client):
    """Test unauthenticated request to dashboard is unauthorized (401)."""
    assert client.get("/api/v1/dashboard/student").status_code == 401
    assert client.get("/api/v1/dashboard/instructor").status_code == 401


def test_instructor_student_list(client, instructor_headers, student_user):
    """Test instructor student overview endpoint returns student list."""
    response = client.get("/api/v1/dashboard/instructor/students", headers=instructor_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    usernames = [s["username"] for s in data]
    assert student_user.username in usernames
    for item in data:
        assert "password_hash" not in item


def test_student_denied_instructor_student_list(client, student_headers):
    """Test student is forbidden (403) from viewing student management list."""
    response = client.get("/api/v1/dashboard/instructor/students", headers=student_headers)
    assert response.status_code == 403
