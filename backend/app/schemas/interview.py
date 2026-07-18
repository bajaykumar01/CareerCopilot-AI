from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class InterviewSessionCreate(BaseModel):
    resume_id: int
    job_description_id: int

class InterviewQuestion(BaseModel):
    id: int
    question: str
    category: str  # HR, Technical, Project-based, Behavioral, Scenario-based

class InterviewSessionResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_description_id: int
    questions: List[InterviewQuestion]
    created_at: datetime

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    question_index: int
    question_text: str
    candidate_answer: str

class FeedbackResponse(BaseModel):
    id: int
    session_id: int
    question_index: int
    question_text: str
    candidate_answer: str
    strengths: str
    weaknesses: str
    communication_feedback: str
    technical_accuracy: str
    confidence_score: int
    suggested_improvements: str
    created_at: datetime

    class Config:
        from_attributes = True
