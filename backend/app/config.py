import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/career_copilot"
    SECRET_KEY: str = "super-secret-key-for-career-copilot-auth-tokens-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    GEMINI_API_KEY: str = ""

    # RAG Baseline Configuration
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 60
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    TOP_K: int = 5
    GEMINI_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
