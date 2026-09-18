from sqlalchemy.orm import Session
from app.models.job_description import JobDescription

def create_job_description(db: Session, user_id: int, title: str, company: str, raw_text: str) -> JobDescription:
    """
    Creates and stores a job description record in the database.
    """
    cleaned = raw_text.strip()
    db_job = JobDescription(
        user_id=user_id,
        title=title or "Target Role",
        company=company or "Target Company",
        raw_text=raw_text,
        cleaned_text=cleaned
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_job_descriptions_by_user(db: Session, user_id: int):
    """
    Retrieves all job descriptions uploaded by a specific user.
    """
    return db.query(JobDescription).filter(JobDescription.user_id == user_id).order_by(JobDescription.created_at.desc()).all()

def get_job_description_by_id(db: Session, job_id: int, user_id: int):
    """
    Retrieves a specific job description by ID ensuring user ownership.
    """
    return db.query(JobDescription).filter(JobDescription.id == job_id, JobDescription.user_id == user_id).first()
