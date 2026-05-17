def score_resume(resume_text: str, job_description: str):
    if not job_description:
        return 50
    try:
        documents = [resume_text, job_description]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        score = int(similarity * 100)
        return max(score, 20)
    except ValueError:
        return 20