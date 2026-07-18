from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.routes.auth import get_current_user
from app.schemas.interview import InterviewSessionCreate, InterviewSessionResponse, AnswerSubmit, FeedbackResponse
from app.services.interview import (
    create_interview_session,
    submit_answer_feedback,
    get_interview_sessions_by_user,
    get_interview_session_by_id
)

router = APIRouter(prefix="/interviews", tags=["Mock Interview"])

@router.post("/sessions/create", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    req: InterviewSessionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a mock interview session and returns the 5 generated questions.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Gemini API key is missing on the server config."
        )
        
    try:
        session = create_interview_session(db, current_user.id, req.resume_id, req.job_description_id, api_key)
        return session
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview questions: {str(e)}"
        )

@router.post("/sessions/{session_id}/submit", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_answer(
    session_id: int,
    sub: AnswerSubmit,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a candidate's answer to a question in the session and returns LLM evaluation feedback.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Gemini API key is missing on the server config."
        )
        
    try:
        feedback = submit_answer_feedback(
            db, 
            current_user.id, 
            session_id, 
            sub.question_index, 
            sub.question_text, 
            sub.candidate_answer, 
            api_key
        )
        return feedback
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate response: {str(e)}"
        )

@router.get("/sessions", response_model=list[InterviewSessionResponse])
def get_sessions_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists the mock interview history for the user.
    """
    return get_interview_sessions_by_user(db, current_user.id)

@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
def get_session_details(
    session_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the interview session details (including the questions).
    """
    session = get_interview_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied."
        )
    return session

@router.get("/sessions/{session_id}/feedback", response_model=list[FeedbackResponse])
def get_session_feedbacks(
    session_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the candidate's answers and corresponding AI feedback for this session.
    """
    session = get_interview_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied."
        )
    return session.feedbacks
