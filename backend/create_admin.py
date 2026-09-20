import sys
import os

# Append current directory so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def run():
    db = SessionLocal()
    admin = db.query(User).filter_by(username="admin").first()
    if admin:
        print("Admin user already exists. Updating password to admin123")
        admin.password_hash = hash_password("admin123")
    else:
        print("Creating admin user...")
        admin = User(
            username="admin",
            email="admin@secarena.com",
            role=UserRole.ADMIN,
            is_active=True,
            password_hash=hash_password("admin123")
        )
        db.add(admin)
    db.commit()
    print("Success! Admin user created. You can now login with admin / admin123")

if __name__ == "__main__":
    run()
