from sqlalchemy.orm import Session
from app.models.job_description import JobDescription
from app.models.analysis import AnalysisResult
from app.ai.rag_pipeline import analyze_resume_rag
from app.services.resume import get_resume_by_id

def create_job_description(db: Session, user_id: int, title: str, company: str, raw_text: str):
    """
    Creates and stores a job description in the database.
    """
    db_job = JobDescription(
        user_id=user_id,
        title=title,
        company=company,
        raw_text=raw_text,
        cleaned_text=raw_text.strip()
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def run_and_save_analysis(db: Session, user_id: int, resume_id: int, job_description_id: int, gemini_api_key: str):
    """
    Executes the RAG pipeline on the selected resume and job description, then saves results.
    """
    resume = get_resume_by_id(db, resume_id, user_id)
    if not resume:
        raise ValueError("Resume not found or access denied.")
        
    job = db.query(JobDescription).filter(JobDescription.id == job_description_id, JobDescription.user_id == user_id).first()
    if not job:
        raise ValueError("Job description not found or access denied.")
        
    # Trigger RAG pipeline
    result = analyze_resume_rag(resume.extracted_text, job.raw_text, gemini_api_key)
    
    # Store result in database
    db_analysis = AnalysisResult(
        user_id=user_id,
        resume_id=resume_id,
        job_description_id=job_description_id,
        ats_score=result.get("ats_score", 0),
        ats_explanation=result.get("ats_explanation", ""),
        strengths=result.get("strengths", []),
        weaknesses=result.get("weaknesses", []),
        matching_skills=result.get("matching_skills", []),
        missing_skills=result.get("missing_skills", []),
        skill_gap_analysis=result.get("skill_gap_analysis", {}),
        resume_suggestions=result.get("resume_suggestions", {}),
        project_recommendations=result.get("project_recommendations", []),
        certification_recommendations=result.get("certification_recommendations", []),
        company_recommendations=result.get("company_recommendations", {})
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis

def get_analysis_results_by_user(db: Session, user_id: int):
    """
    Fetches the history of analysis results for the user.
    """
    return db.query(AnalysisResult).filter(AnalysisResult.user_id == user_id).order_by(AnalysisResult.created_at.desc()).all()

def get_analysis_result_by_id(db: Session, analysis_id: int, user_id: int):
    """
    Fetches a specific analysis result record.
    """
    return db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id, AnalysisResult.user_id == user_id).first()
