import spacy
from utils.text_cleaner import clean_text

nlp = spacy.load("en_core_web_sm")

def extract_keywords(text: str) -> list:
    cleaned = clean_text(text)
    doc = nlp(cleaned)
    keywords = [
        token.lemma_ for token in doc
        if not token.is_stop and not token.is_punct and token.pos_ in ("NOUN", "PROPN", "VERB")
    ]
    return list(set(keywords))