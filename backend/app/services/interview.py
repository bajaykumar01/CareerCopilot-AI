from sqlalchemy.orm import Session
from app.models.interview import InterviewSession, InterviewFeedback
from app.services.resume import get_resume_by_id
from app.models.job_description import JobDescription
from app.ai.rag_pipeline import generate_interview_questions, evaluate_interview_answer

def create_interview_session(db: Session, user_id: int, resume_id: int, job_description_id: int, gemini_api_key: str):
    """
    Initiates a mock interview session and generates 5 custom questions based on resume & job requirements.
    """
    resume = get_resume_by_id(db, resume_id, user_id)
    if not resume:
        raise ValueError("Resume not found or access denied.")
        
    job = db.query(JobDescription).filter(JobDescription.id == job_description_id, JobDescription.user_id == user_id).first()
    if not job:
        raise ValueError("Job description not found or access denied.")
        
    # Generate 5 questions via LLM
    questions = generate_interview_questions(resume.extracted_text, job.raw_text, gemini_api_key)
    
    db_session = InterviewSession(
        user_id=user_id,
        resume_id=resume_id,
        job_description_id=job_description_id,
        questions=questions
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def submit_answer_feedback(db: Session, user_id: int, session_id: int, question_index: int, question_text: str, candidate_answer: str, gemini_api_key: str):
    """
    Evaluates a candidate's answer to a session question and stores the feedback.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise ValueError("Interview session not found or access denied.")
        
    # Build evaluation context
    resume = get_resume_by_id(db, session.resume_id, user_id)
    job = db.query(JobDescription).filter(JobDescription.id == session.job_description_id, JobDescription.user_id == user_id).first()
    context = f"Resume Details:\n{resume.extracted_text}\n\nJob Description Requirements:\n{job.raw_text}"
    
    # Evaluate answer via LLM
    eval_res = evaluate_interview_answer(question_text, candidate_answer, context, gemini_api_key)
    
    # Save feedback
    feedback = InterviewFeedback(
        session_id=session_id,
        question_index=question_index,
        question_text=question_text,
        candidate_answer=candidate_answer,
        strengths=eval_res.get("strengths", ""),
        weaknesses=eval_res.get("weaknesses", ""),
        communication_feedback=eval_res.get("communication_feedback", ""),
        technical_accuracy=eval_res.get("technical_accuracy", ""),
        confidence_score=eval_res.get("confidence_score", 0),
        suggested_improvements=eval_res.get("suggested_improvements", "")
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

def get_interview_sessions_by_user(db: Session, user_id: int):
    """
    Retrieves all interview sessions of a specific user.
    """
    return db.query(InterviewSession).filter(InterviewSession.user_id == user_id).order_by(InterviewSession.created_at.desc()).all()

def get_interview_session_by_id(db: Session, session_id: int, user_id: int):
    """
    Retrieves a specific interview session and its feedback answers.
    """
    return db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
