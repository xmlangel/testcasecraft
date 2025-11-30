"""Application configuration settings"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "RAG Service"
    APP_VERSION: str = "1.0.11"
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

    # Document Parser Configuration
    # Options:
    #   "upstage" - Cloud API (advanced layout analysis)
    #   "pypdf" - pypdf + python-docx (basic, fast)
    #   "pymupdf" - PyMuPDF/fitz (fast, feature-rich)
    #   "pymupdf4llm" - PyMuPDF4LLM (LLM-optimized markdown)
    #   "auto" - Auto-select best available parser
    DOCUMENT_PARSER: str = "pymupdf4llm"
    UPSTAGE_API_KEY: Optional[str] = None

    # Embedding Provider Configuration
    # Options: "sentence-transformers" (local), "ollama" (local server)
    EMBEDDING_PROVIDER: str = "sentence-transformers"
    EMBEDDING_MODEL: str = "paraphrase-multilingual-mpnet-base-v2"
    EMBEDDING_DIMENSION: int = 768

    # Ollama Configuration (if using ollama embeddings)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_EMBEDDING_MODEL: str = "llama2"  # or mistral, nomic-embed-text, etc.

    # Vector Search
    SIMILARITY_THRESHOLD: float = 0.7
    MAX_SEARCH_RESULTS: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
