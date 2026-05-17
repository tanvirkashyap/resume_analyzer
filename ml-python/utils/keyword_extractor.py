import json
import spacy
from utils.text_cleaner import clean_text

nlp = spacy.load("en_core_web_sm")

with open("data/skills.json", "r") as f:
    SKILLS_DB = json.load(f)

def extract_skills(resume_text: str):
    cleaned = clean_text(resume_text)
    extracted_skills = set()
    for skill in SKILLS_DB:
        if skill.lower() in cleaned.lower():
            extracted_skills.add(skill.lower())
    return list(extracted_skills)