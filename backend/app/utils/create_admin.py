"""Secure CLI to provision the first SecArena administrator."""
import argparse
import getpass
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole

def main():
    parser = argparse.ArgumentParser(description="Create a SecArena administrator")
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", help="Avoid this option in shared environments; prompts securely when omitted.")
    args = parser.parse_args()
    db = SessionLocal()
    try:
        if db.query(User).filter((User.username == args.username) | (User.email == args.email)).first():
            raise SystemExit("Username or email already exists.")
        password = args.password or getpass.getpass("Administrator password: ")
        if not args.password and password != getpass.getpass("Confirm administrator password: "):
            raise SystemExit("Passwords do not match.")
        user = User(username=args.username, email=args.email.lower(), password_hash=hash_password(password), role=UserRole.ADMIN, is_active=True)
        db.add(user); db.commit()
        print(f"[+] Administrator '{args.username}' created.")
    finally:
        db.close()

if __name__ == "__main__": main()
