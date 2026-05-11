from utils.keyword_extractor import extract_keywords
from services.scorer import calculate_score

def analyze_resume(resume_text: str, job_description: str) -> dict:
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)

    matched = list(set(resume_keywords) & set(job_keywords))
    missing = list(set(job_keywords) - set(resume_keywords))
    score = calculate_score(matched, job_keywords)

    return {
        "match_score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": [f"Consider adding '{kw}' to your resume" for kw in missing[:5]]
    }