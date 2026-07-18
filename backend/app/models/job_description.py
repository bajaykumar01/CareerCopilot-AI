from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    raw_text = Column(Text(16777215), nullable=False)
    cleaned_text = Column(Text(16777215), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
