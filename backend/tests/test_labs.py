"""Tests for Phase 3 Lab Definition & Challenge Management."""

import pytest
from app.models.lab import LabCategory, Difficulty, LabStatus


def test_create_lab_blueprint(client, instructor_headers, instructor_user):
    """Test instructor can create a new lab blueprint in DRAFT state."""
    payload = {
        "title": "SQL Injection Basics",
        "short_description": "Learn SQL injection fundamentals.",
        "description": "# SQL Injection\nDetailed lab markdown description.",
        "category": "WEB",
        "difficulty": "EASY",
        "estimated_duration_minutes": 30,
        "learning_objectives": ["Identify SQL injection", "Formulate payloads"],
        "required_tools": ["Burp Suite", "Browser"],
        "hints": [
            {"title": "Hint 1", "content": "Check input reflection", "hint_order": 1}
        ],
    }
    response = client.post("/api/v1/labs", json=payload, headers=instructor_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "SQL Injection Basics"
    assert data["slug"] == "sql-injection-basics"
    assert data["status"] == "DRAFT"
    assert data["author_id"] == instructor_user.id
    assert len(data["learning_objectives"]) == 2
    assert len(data["hints"]) == 1


def test_student_cannot_create_lab(client, student_headers):
    """Test student receives 403 Forbidden when attempting to create a lab."""
    payload = {
        "title": "Unauthorized Lab",
        "short_description": "Short desc",
        "description": "Long desc",
        "category": "WEB",
        "difficulty": "EASY",
    }
    response = client.post("/api/v1/labs", json=payload, headers=student_headers)
    assert response.status_code == 403


def test_publish_and_unpublish_lab_workflow(client, instructor_headers):
    """Test full publish and unpublish workflow."""
    # Create lab draft
    create_resp = client.post(
        "/api/v1/labs",
        json={
            "title": "Web XSS Fundamentals",
            "short_description": "Learn XSS fundamentals.",
            "description": "Detailed explanation of XSS.",
            "category": "WEB",
            "difficulty": "EASY",
            "learning_objectives": ["Objective 1"],
        },
        headers=instructor_headers,
    )
    assert create_resp.status_code == 201
    lab_id = create_resp.json()["id"]

    # Publish lab
    pub_resp = client.post(f"/api/v1/labs/manage/{lab_id}/publish", headers=instructor_headers)
    assert pub_resp.status_code == 200
    assert pub_resp.json()["status"] == "PUBLISHED"

    # Unpublish lab
    unpub_resp = client.post(f"/api/v1/labs/manage/{lab_id}/unpublish", headers=instructor_headers)
    assert unpub_resp.status_code == 200
    assert unpub_resp.json()["status"] == "DRAFT"


def test_student_catalog_filters_and_hides_drafts(client, student_headers, instructor_headers):
    """Test student catalog strictly exposes PUBLISHED labs and applies filters."""
    # Create draft lab (should be hidden from students)
    client.post(
        "/api/v1/labs",
        json={
            "title": "Draft Hidden Lab",
            "short_description": "Hidden lab short desc",
            "description": "Hidden lab description",
            "category": "LINUX",
            "difficulty": "HARD",
            "learning_objectives": ["Obj 1"],
        },
        headers=instructor_headers,
    )

    # Create & publish a Web lab
    pub_create = client.post(
        "/api/v1/labs",
        json={
            "title": "API Security Basics",
            "short_description": "API security desc",
            "description": "API security full desc",
            "category": "API",
            "difficulty": "MEDIUM",
            "learning_objectives": ["Obj 1"],
        },
        headers=instructor_headers,
    )
    lab_id = pub_create.json()["id"]
    client.post(f"/api/v1/labs/manage/{lab_id}/publish", headers=instructor_headers)

    # Query Student catalog
    catalog_resp = client.get("/api/v1/labs", headers=student_headers)
    assert catalog_resp.status_code == 200
    catalog = catalog_resp.json()
    titles = [l["title"] for l in catalog]
    assert "API Security Basics" in titles
    assert "Draft Hidden Lab" not in titles

    # Query with Category Filter
    filter_resp = client.get("/api/v1/labs?category=API", headers=student_headers)
    assert filter_resp.status_code == 200
    filtered = filter_resp.json()
    assert all(l["category"] == "API" for l in filtered)


def test_student_get_published_lab_detail(client, student_headers, instructor_headers):
    """Test student retrieves detail of published lab by slug."""
    create_resp = client.post(
        "/api/v1/labs",
        json={
            "title": "Linux Permissions Audit",
            "slug": "linux-permissions-audit",
            "short_description": "Audit linux permissions",
            "description": "Full description of linux permissions lab.",
            "category": "LINUX",
            "difficulty": "EASY",
            "learning_objectives": ["Understand SUID"],
            "required_tools": ["SSH"],
            "hints": [{"title": "Hint A", "content": "Run find command", "hint_order": 1}],
        },
        headers=instructor_headers,
    )
    lab_id = create_resp.json()["id"]
    client.post(f"/api/v1/labs/manage/{lab_id}/publish", headers=instructor_headers)

    detail_resp = client.get("/api/v1/labs/linux-permissions-audit", headers=student_headers)
    assert detail_resp.status_code == 200
    data = detail_resp.json()
    assert data["slug"] == "linux-permissions-audit"
    assert data["title"] == "Linux Permissions Audit"
    assert len(data["learning_objectives"]) == 1
    assert len(data["hints"]) == 1
    assert "status" not in data  # Student view excludes internal status/author_id


def test_archive_lab_workflow(client, instructor_headers, student_headers):
    """Test archiving lab hides it from student catalog."""
    create_resp = client.post(
        "/api/v1/labs",
        json={
            "title": "Deprecated Lab",
            "short_description": "Short description of lab",
            "description": "Full detailed description of deprecated lab.",
            "category": "NETWORK",
            "difficulty": "HARD",
            "learning_objectives": ["Obj 1"],
        },
        headers=instructor_headers,
    )
    lab_id = create_resp.json()["id"]
    slug = create_resp.json()["slug"]
    client.post(f"/api/v1/labs/manage/{lab_id}/publish", headers=instructor_headers)

    # Archive lab
    arch_resp = client.post(f"/api/v1/labs/manage/{lab_id}/archive", headers=instructor_headers)
    assert arch_resp.status_code == 200
    assert arch_resp.json()["status"] == "ARCHIVED"

    # Verify student cannot retrieve archived lab (404)
    detail_resp = client.get(f"/api/v1/labs/{slug}", headers=student_headers)
    assert detail_resp.status_code == 404
