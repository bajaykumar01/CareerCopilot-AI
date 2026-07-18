from pydantic import BaseModel
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str

class ResumeCreate(ResumeBase):
    user_id: int
    file_path: str
    extracted_text: str

class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
