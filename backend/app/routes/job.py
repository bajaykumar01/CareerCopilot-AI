from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.auth import get_current_user
from app.schemas.job_description import JobDescriptionBase, JobDescriptionResponse
from app.services.analysis import create_job_description

router = APIRouter(prefix="/jobs", tags=["Job Descriptions"])

@router.post("/create", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobDescriptionBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits and stores a target job description raw text.
    """
    if not job_data.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )
        
    try:
        db_job = create_job_description(
            db,
            current_user.id,
            job_data.title or "Target Role",
            job_data.company or "Target Company",
            job_data.raw_text
        )
        return db_job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store job description: {str(e)}"
        )
