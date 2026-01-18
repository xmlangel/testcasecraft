"""RAG Conversation message model"""
from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from ..core.database import Base
import uuid


class RAGConversationMessage(Base):
    """RAG conversation message table for vector search"""

    __tablename__ = "rag_conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    project_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    thread_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    question = Column(Text)
    answer = Column(Text, nullable=False)
    combined_text = Column(Text, nullable=False)
    metadata_json = Column("metadata", JSONB)
    embedding = Column(Vector(768))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return (
            f"<RAGConversationMessage(message_id={self.message_id}, project_id={self.project_id}, "
            f"thread_id={self.thread_id})>"
        )
