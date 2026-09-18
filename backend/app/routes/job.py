from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.auth import get_current_user
from app.schemas.job_description import JobDescriptionBase, JobDescriptionResponse
from app.services.job import create_job_description, get_job_descriptions_by_user, get_job_description_by_id

router = APIRouter(prefix="/job", tags=["Job Descriptions"])

@router.post("", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
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

@router.get("", response_model=list[JobDescriptionResponse])
def get_jobs(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists job descriptions submitted by the current user.
    """
    return get_job_descriptions_by_user(db, current_user.id)

@router.get("/{job_id}", response_model=JobDescriptionResponse)
def get_job_details(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves details for a specific job description ensuring user access control.
    """
    job = get_job_description_by_id(db, job_id, current_user.id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found or access denied."
        )
    return job
