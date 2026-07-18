from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    """Retrieves a user from the database by email address."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    """Retrieves a user from the database by user ID."""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    """Creates a new user in the database with hashed password."""
    # Check if user already exists
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        return None
    
    hashed_pwd = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Verifies user credentials against stored hashes."""
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
