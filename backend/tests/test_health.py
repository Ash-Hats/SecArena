"""Tests for Root Endpoint and API v1 Health Check."""

import pytest
from fastapi.testclient import TestClient


def test_read_root(client: TestClient):
    """Test GET / returns expected platform metadata and running status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "name": "SecArena",
        "status": "running",
    }


def test_read_health(client: TestClient):
    """Test GET /api/v1/health returns healthy status and service name."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SecArena API"
