from pydantic import BaseModel
from typing import List, Optional

class ResumeRequest(BaseModel):
    resumeText: str
    jobDescription: Optional[str] = ""

class ResumeResponse(BaseModel):
    score: int
    skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]

    