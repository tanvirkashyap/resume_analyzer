from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

with open("data/skills.json", "r") as f:
    SKILLS_DB = json.load(f)

def extract_skills(text):
    text_lower = text.lower()
    return [skill for skill in SKILLS_DB if skill.lower() in text_lower]

def score_resume(resume_text: str, job_description: str):
    if not job_description:
        return 50
    try:
        # TF-IDF similarity
        documents = [resume_text, job_description]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)
        tfidf_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        # Keyword match score
        resume_skills = set(extract_skills(resume_text))
        job_skills = set(extract_skills(job_description))

        if len(job_skills) > 0:
            keyword_score = len(resume_skills & job_skills) / len(job_skills)
        else:
            keyword_score = 0

        # Combined score (60% keyword match + 40% TF-IDF)
        combined = (keyword_score * 0.6) + (tfidf_score * 0.4)
        score = int(combined * 100)
        return max(score, 20)
    except ValueError:
        return 20