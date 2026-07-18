import os
import sys

# Append parent dir to sys.path to resolve app imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import SessionLocal, Base, engine
from app.services.auth import create_user, authenticate_user
from app.schemas.user import UserCreate

def run_checks():
    print("==================================================")
    print("   CareerCopilot AI Backend Verification System")
    print("==================================================")
    
    # 1. Check Database connection & table binding
    print("\n[CHECK 1] Validating MySQL database connection and schema binding...")
    try:
        Base.metadata.create_all(bind=engine)
        print("  -> SUCCESS: Database connection stable. Schema models synchronised.")
    except Exception as e:
        print(f"  -> ERROR: Database connection failed. Details: {str(e)}")
        print("     Ensure your local MySQL service is active and credentials are correct.")
        return False
        
    # 2. Check User Creation and Authentication logic
    print("\n[CHECK 2] Validating authentication service logic...")
    db = SessionLocal()
    try:
        email = "verification-test@careercopilot.ai"
        pwd = "temporary-verification-password-1"
        name = "Verification Bot"
        
        # Remove pre-existing test entity if any
        from app.models.user import User
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            db.delete(existing)
            db.commit()
            
        # Create test user
        schema_in = UserCreate(email=email, password=pwd, full_name=name)
        new_user = create_user(db, schema_in)
        if new_user:
            print(f"  -> SUCCESS: Test registration recorded (User ID: {new_user.id}).")
        else:
            print("  -> ERROR: User registration failed to insert.")
            return False
            
        # Verify credentials
        authenticated = authenticate_user(db, email, pwd)
        if authenticated and authenticated.full_name == name:
            print("  -> SUCCESS: Verification user credentials authenticated.")
        else:
            print("  -> ERROR: Password checking returned invalid.")
            return False
            
        # Clean up database
        db.delete(authenticated)
        db.commit()
        print("  -> SUCCESS: Verification entries purged from table.")
        
    except Exception as e:
        print(f"  -> ERROR: Auth test crashed. Details: {str(e)}")
        return False
    finally:
        db.close()
        
    print("\n==================================================")
    print("   ALL INTEGRATION CHECKS COMPLETED SUCCESSFULLY!")
    print("==================================================")
    return True

if __name__ == "__main__":
    run_checks()
