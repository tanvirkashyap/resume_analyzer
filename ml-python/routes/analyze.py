from fastapi import APIRouter, HTTPException
from models.schemas import ResumeRequest, ResumeResponse
from services.analyzer import analyze_resume

router = APIRouter()

@router.post("/analyze", response_model=ResumeResponse)
async def analyze(request: ResumeRequest):
    try:
        result = analyze_resume(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))