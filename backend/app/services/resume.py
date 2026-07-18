from sqlalchemy.orm import Session
from app.models.resume import Resume

def create_resume(db: Session, user_id: int, filename: str, file_path: str, extracted_text: str):
    """
    Saves a new resume record in the database.
    """
    db_resume = Resume(
        user_id=user_id,
        filename=filename,
        file_path=file_path,
        extracted_text=extracted_text
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

def get_resumes_by_user(db: Session, user_id: int):
    """
    Retrieves all resumes uploaded by a specific user.
    """
    return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc()).all()

def get_resume_by_id(db: Session, resume_id: int, user_id: int):
    """
    Retrieves a specific resume record if it belongs to the user.
    """
    return db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()
