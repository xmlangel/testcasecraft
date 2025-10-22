"""Search schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID


class SearchRequest(BaseModel):
    """Schema for similarity search request"""
    query_text: str = Field(..., min_length=1, max_length=10000, description="Text to search for similar chunks")
    project_id: Optional[UUID] = Field(None, description="Filter by project ID")
    similarity_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Minimum similarity score (0-1)")
    max_results: int = Field(10, ge=1, le=100, description="Maximum number of results to return")


class SearchResult(BaseModel):
    """Schema for a single search result"""
    embedding_id: UUID
    document_id: UUID
    file_name: str
    project_id: UUID
    chunk_index: int
    chunk_text: str
    chunk_metadata: Optional[Dict[str, Any]] = None
    similarity_score: float = Field(..., ge=0.0, le=1.0)


class SearchResponse(BaseModel):
    """Schema for search response"""
    query: str
    total_results: int
    results: List[SearchResult]
    similarity_threshold: float
    max_results: int
