from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobDescriptionBase(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    raw_text: str

class JobDescriptionCreate(JobDescriptionBase):
    user_id: int
    cleaned_text: Optional[str] = None

class JobDescriptionResponse(JobDescriptionBase):
    id: int
    user_id: int
    cleaned_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
