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


class GenerateEmbeddingRequest(BaseModel):
    """Schema for generating embeddings for document chunks
    문서 청크 임베딩 생성 요청 스키마"""
    document_id: UUID = Field(..., description="Document ID to generate embeddings for\n임베딩을 생성할 문서 ID")


class GenerateEmbeddingResponse(BaseModel):
    """Schema for embedding generation response
    임베딩 생성 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID\n문서 ID")
    total_chunks: int = Field(..., description="Total number of chunks\n전체 청크 수")
    embeddings_generated: int = Field(..., description="Number of embeddings generated\n생성된 임베딩 수")
    message: str = Field(..., description="Status message\n상태 메시지")
