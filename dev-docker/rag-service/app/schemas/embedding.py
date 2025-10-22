"""Embedding schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class EmbeddingBase(BaseModel):
    """Base embedding schema"""
    document_id: UUID
    chunk_index: int = Field(..., ge=0)
    chunk_text: str
    chunk_metadata: Optional[Dict[str, Any]] = None


class EmbeddingCreate(EmbeddingBase):
    """Schema for creating an embedding"""
    embedding: List[float] = Field(..., min_length=768, max_length=768)


class EmbeddingResponse(EmbeddingBase):
    """Schema for embedding response"""
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
