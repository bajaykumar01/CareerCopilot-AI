from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.routes.auth import get_current_user
from app.schemas.analysis import AnalysisRequest, AnalysisResultResponse
from app.services.analysis import run_and_save_analysis, get_analysis_results_by_user, get_analysis_result_by_id

router = APIRouter(prefix="/analysis", tags=["RAG Analysis"])

@router.post("", response_model=AnalysisResultResponse, status_code=status.HTTP_201_CREATED)
@router.post("/run", response_model=AnalysisResultResponse, status_code=status.HTTP_201_CREATED)
def run_analysis(
    req: AnalysisRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers the RAG pipeline analysis on a selected resume and job description.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Gemini API key is missing. Please define GEMINI_API_KEY in backend .env"
        )
        
    try:
        db_res = run_and_save_analysis(db, current_user.id, req.resume_id, req.job_description_id, api_key)
        return db_res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute RAG matching pipeline: {str(e)}"
        )

@router.get("", response_model=list[AnalysisResultResponse])
@router.get("/history", response_model=list[AnalysisResultResponse])
def get_analysis_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves previous analysis history items for the current user.
    """
    return get_analysis_results_by_user(db, current_user.id)

@router.get("/{analysis_id}", response_model=AnalysisResultResponse)
def get_analysis_details(
    analysis_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific analysis details report ensuring user ownership.
    """
    res = get_analysis_result_by_id(db, analysis_id, current_user.id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found or access denied."
        )
    return res
