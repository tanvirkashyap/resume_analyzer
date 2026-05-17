from fastapi import APIRouter, HTTPException
from models.schemas import ResumeRequest, ResumeResponse
from services.analyzer import analyze_resume

router = APIRouter()

@router.post("/analyze", response_model=ResumeResponse)
async def analyze(data: ResumeRequest):
    try:
        result = analyze_resume(data.resumeText, data.jobDescription)
        return ResumeResponse(
            score=result["match_score"],
            skills=result["matched_keywords"],
            missing_skills=result["missing_keywords"],
            suggestions=result["suggestions"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))