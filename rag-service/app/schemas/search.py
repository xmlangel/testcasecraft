"""Search schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID


class SearchRequest(BaseModel):
    """Schema for similarity search request
    유사도 검색 요청 스키마"""
    query_text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Text to search for similar chunks\n유사한 청크를 검색할 텍스트"
    )
    project_id: Optional[UUID] = Field(
        None,
        description="Filter by project ID\n프로젝트 ID로 필터링"
    )
    similarity_threshold: float = Field(
        0.7,
        ge=0.0,
        le=1.0,
        description="Minimum similarity score (0-1)\n최소 유사도 점수 (0-1)"
    )
    max_results: int = Field(
        10,
        ge=1,
        le=100,
        description="Maximum number of results to return\n반환할 최대 결과 수"
    )


class SearchResult(BaseModel):
    """Schema for a single search result
    단일 검색 결과 스키마"""
    embedding_id: UUID = Field(..., description="Embedding ID\n임베딩 ID")
    document_id: UUID = Field(..., description="Document ID\n문서 ID")
    file_name: str = Field(..., description="File name\n파일명")
    project_id: UUID = Field(..., description="Project ID\n프로젝트 ID")
    chunk_index: int = Field(..., description="Chunk index\n청크 인덱스")
    chunk_text: str = Field(..., description="Chunk text content\n청크 텍스트 내용")
    chunk_metadata: Optional[Dict[str, Any]] = Field(None, description="Chunk metadata\n청크 메타데이터")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score (0-1)\n유사도 점수 (0-1)")
    source_type: str = Field(..., description="Source type: 'document' or 'testcase'\n출처 타입: 'document' 또는 'testcase'")


class SearchResponse(BaseModel):
    """Schema for search response
    검색 응답 스키마"""
    query: str = Field(..., description="Search query text\n검색 쿼리 텍스트")
    total_results: int = Field(..., description="Total number of results\n전체 결과 수")
    results: List[SearchResult] = Field(..., description="Search results\n검색 결과 목록")
    similarity_threshold: float = Field(..., description="Applied similarity threshold\n적용된 유사도 임계값")
    max_results: int = Field(..., description="Maximum results limit\n최대 결과 제한")
