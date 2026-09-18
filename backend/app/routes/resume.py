import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.auth import get_current_user
from app.schemas.resume import ResumeResponse
from app.services.resume import create_resume, get_resumes_by_user, get_resume_by_id
from app.utils.pdf_parser import extract_text_from_pdf_bytes

router = APIRouter(prefix="/resume", tags=["Resumes"])

# Create local uploads folder if not exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a resume PDF, extracts text, saves the physical file, and creates a database record.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF resume."
        )
        
    try:
        content = await file.read()
        extracted_text = extract_text_from_pdf_bytes(content)
        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume PDF is blank or has no readable text content."
            )
            
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        
        with open(file_path, "wb") as f:
            f.write(content)
            
        db_resume = create_resume(db, current_user.id, file.filename, file_path, extracted_text)
        return db_resume
        
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while uploading: {str(e)}"
        )

@router.get("", response_model=list[ResumeResponse])
@router.get("/history", response_model=list[ResumeResponse])
def get_resumes(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists upload history for the current user.
    """
    return get_resumes_by_user(db, current_user.id)

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume_details(
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves metadata details for a specific resume.
    """
    resume = get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )
    return resume
