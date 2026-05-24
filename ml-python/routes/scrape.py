from fastapi import APIRouter, HTTPException
from scraper.scraper import JobScraper
from scraper.linkedin_scraper import LinkedInScraper

router = APIRouter()

@router.get("/scrape")
async def scrape_jobs(query: str, source: str = "indeed"):
    try:
        if source == "linkedin":
            scraper = LinkedInScraper()
        else:
            scraper = JobScraper()
        jobs = scraper.search_jobs(query)
        print(f"Scraped {len(jobs)} jobs")
        for job in jobs:
            print(f"Title: {job['title']}")
            print(f"Description length: {len(job['description'])}")
            print(f"Description preview: {job['description'][:200]}")
            print("---")
        return {"jobs": jobs, "source": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))