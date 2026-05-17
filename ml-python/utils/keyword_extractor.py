import spacy
from utils.text_cleaner import clean_text

nlp = spacy.load("en_core_web_sm")

def extract_skills(resume_text: str):
    extracted_skills = set()
    for skill in SKILLS_DB:
        if skill.lower() in resume_text.lower():
            extracted_skills.add(skill.lower())
    return list(extracted_skills)