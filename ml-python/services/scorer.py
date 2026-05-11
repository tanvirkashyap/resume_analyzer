def calculate_score(matched: list, job_keywords: list) -> float:
    if not job_keywords:
        return 0.0
    return round(len(matched) / len(job_keywords) * 100, 2)