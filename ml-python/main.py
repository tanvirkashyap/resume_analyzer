from fastapi import FastAPI
from routes.analyze import router


app = FastAPI(title="Resume Analyzer ML Service")
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)