from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    
    ats_score = Column(Integer, nullable=False)
    ats_explanation = Column(Text(65535), nullable=False)
    
    strengths = Column(JSON, nullable=False)
    weaknesses = Column(JSON, nullable=False)
    matching_skills = Column(JSON, nullable=False)
    missing_skills = Column(JSON, nullable=False)
    skill_gap_analysis = Column(JSON, nullable=False)
    resume_suggestions = Column(JSON, nullable=False)
    project_recommendations = Column(JSON, nullable=False)
    certification_recommendations = Column(JSON, nullable=False)
    company_recommendations = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    resume = relationship("Resume")
    job_description = relationship("JobDescription")
