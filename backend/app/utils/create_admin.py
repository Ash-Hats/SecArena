"""Secure CLI to provision the first SecArena administrator."""
import argparse
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole

def main():
    parser = argparse.ArgumentParser(description="Create a SecArena administrator")
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    db = SessionLocal()
    try:
        if db.query(User).filter((User.username == args.username) | (User.email == args.email)).first():
            raise SystemExit("Username or email already exists.")
        user = User(username=args.username, email=args.email.lower(), password_hash=hash_password(args.password), role=UserRole.ADMIN, is_active=True)
        db.add(user); db.commit()
        print(f"[+] Administrator '{args.username}' created.")
    finally:
        db.close()

if __name__ == "__main__": main()
