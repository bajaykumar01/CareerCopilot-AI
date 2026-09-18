from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AnalysisRequest(BaseModel):
    resume_id: int
    job_description_id: int

class ProjectRecommend(BaseModel):
    title: str
    difficulty: str
    technologies: List[str]
    learning_outcomes: List[str]

class CertificationRecommend(BaseModel):
    name: str
    authority: str
    relevance: str

class StructuredAnalysisOutput(BaseModel):
    """
    Pydantic schema representing the raw structured JSON response from the LLM.
    Used for strict validation of LLM outputs before storing or responding.
    """
    ats_score: int = Field(..., ge=0, le=100, description="Estimated ATS fit score between 0 and 100")
    ats_explanation: str
    strengths: List[str]
    weaknesses: List[str]
    matching_skills: List[str]
    missing_skills: List[str]
    skill_gap_analysis: Dict[str, Any]
    company_recommendations: Dict[str, Any]
    resume_suggestions: Dict[str, Any]
    certification_recommendations: List[CertificationRecommend]
    project_recommendations: List[ProjectRecommend]

class AnalysisResultResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_description_id: int
    
    ats_score: int
    ats_explanation: str
    
    strengths: List[str]
    weaknesses: List[str]
    matching_skills: List[str]
    missing_skills: List[str]
    
    skill_gap_analysis: Dict[str, Any]
    resume_suggestions: Dict[str, Any]
    project_recommendations: List[ProjectRecommend]
    certification_recommendations: List[CertificationRecommend]
    company_recommendations: Dict[str, Any]
    
    created_at: datetime

    class Config:
        from_attributes = True
