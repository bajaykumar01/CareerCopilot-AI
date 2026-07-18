import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Fallback mechanism: Attempt MySQL, fall back to SQLite if connection fails
db_url = settings.DATABASE_URL
engine = None

try:
    # Try connecting to the primary database
    temp_engine = create_engine(db_url)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
    logger.info("Connected to primary MySQL database successfully.")
except Exception as e:
    logger.warning(
        f"MySQL database connection failed: {str(e)}.\n"
        "Falling back to local SQLite database ('sqlite:///./career_copilot.db') for execution."
    )
    # Configure SQLite database file in the workspace
    db_url = "sqlite:///./career_copilot.db"
    engine = create_engine(
        db_url, 
        connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
