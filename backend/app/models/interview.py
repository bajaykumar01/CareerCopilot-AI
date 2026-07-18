from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    
    # Stores a list of dictionaries: [{"id": 1, "question": "...", "category": "Technical"}, ...]
    questions = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    resume = relationship("Resume")
    job_description = relationship("JobDescription")
    feedbacks = relationship("InterviewFeedback", back_populates="session", cascade="all, delete-orphan")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    candidate_answer = Column(Text, nullable=False)
    
    strengths = Column(Text, nullable=False)
    weaknesses = Column(Text, nullable=False)
    communication_feedback = Column(Text, nullable=False)
    technical_accuracy = Column(Text, nullable=False)
    confidence_score = Column(Integer, nullable=False)
    suggested_improvements = Column(Text, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("InterviewSession", back_populates="feedbacks")
