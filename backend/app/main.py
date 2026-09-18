from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth, resume, job, analysis
from app.utils.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

# Attempt to auto-create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.warning(
        f"Could not automatically initialize database tables: {str(e)}.\n"
        "Ensure MySQL is running or SQLite fallback database is accessible."
    )

app = FastAPI(
    title="CareerCopilot AI API",
    description="Production-Oriented LLM-Powered Resume & Job Match Analyzer API",
    version="2.0.0"
)

# Configure CORS origins safely
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(job.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to CareerCopilot AI API. Explore endpoints at /docs"
    }
