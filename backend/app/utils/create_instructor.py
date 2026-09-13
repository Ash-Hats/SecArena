"""Secure CLI mechanism to create Instructor accounts without exposing passwords.

Usage:
    python -m app.utils.create_instructor --username instructor1 --email instructor@secarena.local --password "SecurePass123!"
"""

import sys
import argparse
import getpass
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.repositories.user import UserRepository
from app.models.user import UserRole


def create_instructor(username: str, email: str, password: str) -> None:
    """Create an instructor account directly in the database."""
    db = SessionLocal()
    try:
        existing_user = UserRepository.get_by_username(db, username)
        if existing_user:
            print(f"[!] Error: Username '{username}' already exists.")
            sys.exit(1)

        existing_email = UserRepository.get_by_email(db, email)
        if existing_email:
            print(f"[!] Error: Email '{email}' already exists.")
            sys.exit(1)

        pwd_hash = hash_password(password)
        instructor = UserRepository.create(
            db=db,
            username=username,
            email=email,
            password_hash=pwd_hash,
            role=UserRole.INSTRUCTOR,
        )
        print(f"[+] Instructor account '{instructor.username}' ({instructor.email}) successfully created.")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="SecArena Secure Instructor Account Provisioning CLI")
    parser.add_argument("--username", help="Instructor Username", required=False)
    parser.add_argument("--email", help="Instructor Email", required=False)
    parser.add_argument("--password", help="Instructor Password (optional, will prompt if omitted)", required=False)

    args = parser.parse_args()

    username = args.username or input("Enter Instructor Username: ").strip()
    email = args.email or input("Enter Instructor Email: ").strip()
    
    if args.password:
        password = args.password
    else:
        password = getpass.getpass("Enter Instructor Password: ")
        confirm_pass = getpass.getpass("Confirm Instructor Password: ")
        if password != confirm_pass:
            print("[!] Error: Passwords do not match.")
            sys.exit(1)

    if not username or not email or not password:
        print("[!] Error: All fields are required.")
        sys.exit(1)

    create_instructor(username, email, password)


if __name__ == "__main__":
    main()
