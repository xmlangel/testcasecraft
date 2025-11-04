"""RAG Embedding model"""
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from ..core.database import Base
import uuid


class RAGEmbedding(Base):
    """RAG Embedding table for vector search"""

    __tablename__ = "rag_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('rag_documents.id', ondelete='CASCADE'), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_metadata = Column(JSONB)
    embedding = Column(Vector(768))  # 768-dimensional vector for paraphrase-multilingual-mpnet-base-v2
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    document = relationship("RAGDocument", back_populates="embeddings")

    def __repr__(self):
        return f"<RAGEmbedding(id={self.id}, document_id={self.document_id}, chunk_index={self.chunk_index})>"
