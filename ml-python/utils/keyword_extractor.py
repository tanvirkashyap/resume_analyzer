import json
import spacy
from utils.text_cleaner import clean_text

nlp = spacy.load("en_core_web_sm")

with open("data/skills.json", "r") as f:
    SKILLS_DB = json.load(f)

def extract_skills(resume_text: str):
    cleaned = clean_text(resume_text)
    print(f"Cleaned text for matching: {cleaned[:200]}")
    print(f"Skills DB: {SKILLS_DB}")
    extracted_skills = set()
    for skill in SKILLS_DB:
        if skill.lower() in cleaned.lower():
            print(f"MATCHED: {skill}")
            extracted_skills.add(skill.lower())
    print(f"Extracted skills: {extracted_skills}")
    return list(extracted_skills)