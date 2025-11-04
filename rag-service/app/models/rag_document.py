"""RAG Document model"""
from sqlalchemy import Column, String, BigInteger, Integer, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid


class RAGDocument(Base):
    """RAG Document metadata table"""

    __tablename__ = "rag_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    file_name = Column(String(512), nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(String(255))
    minio_bucket = Column(String(255), nullable=False)
    minio_object_key = Column(Text, nullable=False)
    analysis_status = Column(String(50), default='pending', index=True)
    analysis_date = Column(DateTime(timezone=True))
    total_chunks = Column(Integer, default=0)
    meta_data = Column("metadata", JSONB)  # Map meta_data attribute to metadata column
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    embeddings = relationship("RAGEmbedding", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RAGDocument(id={self.id}, file_name={self.file_name}, status={self.analysis_status})>"
