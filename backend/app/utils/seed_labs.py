"""Development Seed Data Script for SecArena Lab Definitions.

Usage:
    python -m app.utils.seed_labs
"""

import sys
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.repositories.user import UserRepository
from app.repositories.lab import LabRepository
from app.models.user import UserRole
from app.models.lab import Lab, LabHint, LabCategory, Difficulty, LabStatus
from app.core.security import hash_password


SAMPLE_LABS = [
    {
        "title": "SQL Injection Fundamentals",
        "slug": "sql-injection-basics",
        "short_description": "Learn how unsafe database queries can expose sensitive application data and bypass login controls.",
        "description": """# SQL Injection Fundamentals

## Objective
Analyze how unsanitized user inputs concat directly into SQL queries, leading to unauthorized database access.

## Scenario
You are assigned to audit a vulnerable web authentication portal. Analyze the login parameter handling, construct an authentication bypass payload, and retrieve hidden database records.

> [!NOTE]
> This is a declarative lab definition. Safe browser-based simulations are available separately in the Simulator.
""",
        "category": LabCategory.WEB,
        "difficulty": Difficulty.EASY,
        "estimated_duration_minutes": 30,
        "learning_objectives": [
            "Identify unsanitized SQL query input parameters",
            "Construct authentication bypass payloads",
            "Understand parameterization defensive measures",
        ],
        "required_tools": ["Burp Suite", "Browser DevTools", "curl"],
        "hints": [
            {
                "title": "Inspect Login Query Logic",
                "content": "Look at how the username input parameter is formatted inside the backend SQL statement.",
                "hint_order": 1,
            },
            {
                "title": "SQL Comment Characters",
                "content": "Try using `--` or `#` to truncate the remainder of the SQL query string.",
                "hint_order": 2,
            },
        ],
    },
    {
        "title": "Cross-Site Scripting (XSS) Basics",
        "slug": "xss-basics",
        "short_description": "Understand Reflected and Stored XSS attack vectors and payload execution contexts.",
        "description": """# Cross-Site Scripting (XSS) Basics

## Objective
Identify reflected input parameters that render directly into the DOM without HTML entity escaping.

## Scenario
Analyze a vulnerable comment submission form, inject a script payload, and observe client-side execution boundaries.
""",
        "category": LabCategory.WEB,
        "difficulty": Difficulty.EASY,
        "estimated_duration_minutes": 25,
        "learning_objectives": [
            "Understand Reflected vs Stored XSS mechanics",
            "Craft context-aware script execution payloads",
            "Implement Content Security Policy (CSP) headers",
        ],
        "required_tools": ["Browser DevTools"],
        "hints": [
            {
                "title": "Script Tag Context",
                "content": "Check if user input is echoed directly between HTML tags.",
                "hint_order": 1,
            },
        ],
    },
    {
        "title": "Linux Privilege Escalation via SUID",
        "slug": "linux-privilege-escalation",
        "short_description": "Explore Linux file permissions, misconfigured SUID binaries, and escalation paths to root.",
        "description": """# Linux Privilege Escalation via SUID

## Objective
Locate binaries with the SUID bit enabled and leverage misconfigurations to elevate system privileges.

## Scenario
You have gained low-privilege SSH access to a Linux target server. Enumerate system binaries, identify misconfigurations, and elevate to root.
""",
        "category": LabCategory.LINUX,
        "difficulty": Difficulty.MEDIUM,
        "estimated_duration_minutes": 45,
        "learning_objectives": [
            "Enumerate binaries with SUID permission bits",
            "Analyze GTFOBins for privilege escalation vectors",
            "Audit file permissions and system capabilities",
        ],
        "required_tools": ["SSH", "Linux CLI", "find"],
        "hints": [
            {
                "title": "Finding SUID Binaries",
                "content": "Use `find / -perm -4000 -type f 2>/dev/null` to locate SUID binaries.",
                "hint_order": 1,
            },
        ],
    },
    {
        "title": "API Authentication Bypass & BOLA",
        "slug": "api-authentication-bypass",
        "short_description": "Audit RESTful API endpoints for Broken Object Level Authorization (BOLA/IDOR) vulnerabilities.",
        "description": """# API Authentication Bypass & BOLA

## Objective
Analyze REST API resource identifiers and bypass authorization controls to access unauthorized user objects.

## Scenario
Audit a user profile API endpoint. Test whether modifying resource IDs in JSON request payloads exposes data belonging to other accounts.
""",
        "category": LabCategory.API,
        "difficulty": Difficulty.MEDIUM,
        "estimated_duration_minutes": 35,
        "learning_objectives": [
            "Understand OWASP API Top 10 BOLA vulnerabilities",
            "Analyze JWT token claims vs object ownership",
            "Implement object-level authorization checks",
        ],
        "required_tools": ["Postman", "curl", "Burp Suite"],
        "hints": [
            {
                "title": "Resource Identifier Tampering",
                "content": "Try changing `user_id` parameters in API endpoint requests.",
                "hint_order": 1,
            },
        ],
    },
]


def seed_labs():
    db = SessionLocal()
    try:
        # Find or create seed instructor
        instructor = (
            UserRepository.get_by_username(db, "instructor_seed")
            or UserRepository.get_by_email(db, "instructor@secarena.local")
        )
        
        if not instructor:
            instructor = UserRepository.create(
                db=db,
                username="instructor_seed",
                email="instructor@secarena.local",
                password_hash=hash_password("SecArenaSeed123!"),
                role=UserRole.INSTRUCTOR,
            )
            print(f"[+] Created seed instructor account 'instructor_seed'.")

        now = datetime.now(timezone.utc)
        count = 0
        for lab_data in SAMPLE_LABS:
            existing = LabRepository.get_by_slug(db, lab_data["slug"])
            if existing:
                continue

            hints = lab_data["hints"]
            lab = Lab(
                slug=lab_data["slug"],
                title=lab_data["title"],
                short_description=lab_data["short_description"],
                description=lab_data["description"],
                category=lab_data["category"],
                difficulty=lab_data["difficulty"],
                status=LabStatus.PUBLISHED,
                estimated_duration_minutes=lab_data["estimated_duration_minutes"],
                learning_objectives=lab_data["learning_objectives"],
                required_tools=lab_data["required_tools"],
                author_id=instructor.id,
                published_at=now,
            )
            LabRepository.create_lab(db, lab, hints_data=hints)
            count += 1

        print(f"[+] Seeded {count} sample published lab definitions successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_labs()
