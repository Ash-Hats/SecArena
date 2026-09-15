from app.db.session import SessionLocal
from app.models.user import User
from app.services.admin import AdminService

db = SessionLocal()
admin = db.query(User).filter(User.username == "admin").first()
student = db.query(User).filter(User.username != "admin").first()

if student:
    print(f"Deleting {student.username}...")
    try:
        AdminService.delete_user(db, student.id, admin)
        print("Success")
    except Exception as e:
        print("Error:", e)
else:
    print("No student found")
