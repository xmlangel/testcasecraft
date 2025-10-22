"""Application configuration settings"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "RAG Service"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql://rag_user:rag_dev_password_123@postgres-rag:5432/rag_db"

    # MinIO
    MINIO_ENDPOINT: str = "host.docker.internal:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin_dev_password_789"
    MINIO_BUCKET: str = "rag-documents"
    MINIO_SECURE: bool = False

    # Upstage API
    UPSTAGE_API_KEY: Optional[str] = None

    # Embedding Model
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    EMBEDDING_DIMENSION: int = 768

    # Vector Search
    SIMILARITY_THRESHOLD: float = 0.7
    MAX_SEARCH_RESULTS: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
