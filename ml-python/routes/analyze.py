from fastapi import APIRouter, HTTPException
from models.schemas import ResumeRequest, ResumeResponse
from services.analyzer import analyze_resume

router = APIRouter()

@router.post("/analyze", response_model=ResumeResponse)
async def analyze_resume(data: ResumeRequest):
    try:
        cleaned_resume = parse_resume_text(data.resumeText)
        extracted_skills = extract_skills(cleaned_resume)
        score = score_resume(cleaned_resume, data.jobDescription)
        missing_skills = []
        if data.jobDescription:
            job_skills = extract_skills(data.jobDescription)
            missing_skills = [s for s in job_skills if s not in extracted_skills]
        suggestions = generate_suggestions(extracted_skills, missing_skills, cleaned_resume, score)
        return ResumeResponse(score=score, skills=extracted_skills,
                              missing_skills=missing_skills, suggestions=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))