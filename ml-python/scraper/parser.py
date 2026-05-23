import re


class JobParser:

    @staticmethod
    def normalize_job(job):

        title = JobParser.extract_title(job)

        company = JobParser.extract_company(job)

        description = JobParser.clean_text(
            job.get("description", "")
        )

        skills = JobParser.extract_skills(
            description
        )

        return {

            "title": title,

            "company": company,

            "location":
                JobParser.clean_text(
                    job.get("location", "")
                ),

            "description": description,

            "skills": skills,

            "link": job.get("link", ""),

            "source":
                job.get("source", "Unknown")
        }

    @staticmethod
    def normalize_jobs(jobs):

        return [
            JobParser.normalize_job(job)
            for job in jobs
        ]

    @staticmethod
    def extract_title(job):

        return JobParser.clean_text(
            job.get("title", "")
        )

    @staticmethod
    def extract_company(job):

        return JobParser.clean_text(
            job.get("company", "")
        )

    @staticmethod
    def clean_text(text):

        if not text:
            return ""

        text = text.replace("\n", " ")

        text = text.replace("\t", " ")

        text = re.sub(
            r"\s+",
            " ",
            text
        )

        return text.strip()

    @staticmethod
    def extract_skills(description):

        known_skills = [

            "python",
            "java",
            "spring boot",
            "docker",
            "react",
            "aws",
            "kubernetes",
            "sql",
            "javascript",
            "fastapi"
        ]

        description = description.lower()

        found = []

        for skill in known_skills:

            if skill in description:

                found.append(skill)

        return found