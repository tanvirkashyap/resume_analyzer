from fastapi import FastAPI
from routes.analyze import router
from routes.scrape import router as scrape_router

app = FastAPI(title="Resume Analyzer ML Service")
app.include_router(router, prefix="/api")
app.include_router(scrape_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)