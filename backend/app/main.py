from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth, resume, job, analysis, interview
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Attempt to auto-create MySQL database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.warning(
        f"Could not automatically initialize database tables: {str(e)}.\n"
        "Ensure MySQL is running, the database 'career_copilot' exists, and credentials in .env are correct."
    )

app = FastAPI(
    title="CareerCopilot AI API",
    description="Production-Ready LLM-Powered Resume & Job Match Analyzer API",
    version="2.0.0"
)

# Configure CORS for Vite frontend (typically http://localhost:5173 or other ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(job.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(interview.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to CareerCopilot AI API. Explore endpoints at /docs"
    }
