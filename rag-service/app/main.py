"""FastAPI RAG Service Main Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .api.v1 import api_router
from .models import (
    RAGDocument,
    RAGEmbedding,
    RAGConversationMessage,
    LlmAnalysisJob,
    LlmAnalysisResult,
    AnalysisSummary
)  # Import models for table creation
import logging

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="RAG (Retrieval-Augmented Generation) Service for Test Case Management",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info("Initializing database connection...")

    # Initialize database schema
    try:
        from sqlalchemy import text

        # 1. Install pgvector extension
        logger.info("Installing pgvector extension...")
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        logger.info("pgvector extension installed successfully")

        # 2. Create tables if not exist
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # 3. Create indexes and functions
        logger.info("Creating additional indexes and functions...")
        with engine.connect() as conn:
            # Create HNSW index for vector similarity search
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rag_embeddings_vector
                ON rag_embeddings USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
            """))

            # Create update trigger function
            conn.execute(text("""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql'
            """))

            # Create update trigger
            conn.execute(text("""
                DROP TRIGGER IF EXISTS update_rag_documents_updated_at ON rag_documents
            """))
            conn.execute(text("""
                CREATE TRIGGER update_rag_documents_updated_at
                BEFORE UPDATE ON rag_documents
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
            """))

            # Create similarity search function
            conn.execute(text("""
                CREATE OR REPLACE FUNCTION search_similar_chunks(
                    query_embedding vector(768),
                    similarity_threshold FLOAT DEFAULT 0.7,
                    max_results INTEGER DEFAULT 10
                )
                RETURNS TABLE (
                    embedding_id UUID,
                    document_id UUID,
                    chunk_index INTEGER,
                    chunk_text TEXT,
                    chunk_metadata JSONB,
                    similarity_score FLOAT,
                    file_name VARCHAR,
                    project_id UUID
                ) AS $$
                BEGIN
                    RETURN QUERY
                    SELECT
                        e.id AS embedding_id,
                        e.document_id,
                        e.chunk_index,
                        e.chunk_text,
                        e.chunk_metadata,
                        1 - (e.embedding <=> query_embedding) AS similarity_score,
                        d.file_name,
                        d.project_id
                    FROM rag_embeddings e
                    JOIN rag_documents d ON e.document_id = d.id
                    WHERE 1 - (e.embedding <=> query_embedding) >= similarity_threshold
                    ORDER BY e.embedding <=> query_embedding
                    LIMIT max_results;
                END;
                $$ LANGUAGE plpgsql
            """))

            conn.commit()
        logger.info("Database initialization completed successfully")

    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        logger.exception("Detailed error:")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down RAG Service...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.APP_ENV
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/api/v1/info")
async def api_info():
    """API information endpoint"""
    return {
        "api_version": "v1",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "features": {
            "document_upload": "enabled",
            "vector_search": "enabled",
            "similar_testcases": "enabled"
        }
    }
