from pydantic import BaseModel
from typing import List

class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeResponse(BaseModel):
    match_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]