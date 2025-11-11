"""Search schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum


class SearchMethod(str, Enum):
    """Search method types"""
    VECTOR = "vector"  # Pure vector similarity
    BM25 = "bm25"  # Pure keyword-based BM25
    HYBRID = "hybrid"  # Hybrid (vector + BM25 with RRF)
    HYBRID_RERANK = "hybrid_rerank"  # Hybrid + Reranker


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


class AdvancedSearchRequest(BaseModel):
    """Schema for advanced search request with multiple methods
    여러 방법을 사용한 고급 검색 요청 스키마"""
    query_text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Search query text\n검색 쿼리 텍스트"
    )
    project_id: Optional[UUID] = Field(
        None,
        description="Filter by project ID\n프로젝트 ID로 필터링"
    )
    search_method: SearchMethod = Field(
        SearchMethod.HYBRID_RERANK,
        description="Search method to use\n사용할 검색 방법"
    )
    similarity_threshold: float = Field(
        0.6,
        ge=0.0,
        le=1.0,
        description="Minimum similarity threshold\n최소 유사도 임계값"
    )
    max_results: int = Field(
        10,
        ge=1,
        le=100,
        description="Maximum results\n최대 결과 수"
    )
    vector_weight: float = Field(
        0.6,
        ge=0.0,
        le=1.0,
        description="Weight for vector search in hybrid mode\n하이브리드 모드에서 벡터 검색 가중치"
    )
    bm25_weight: float = Field(
        0.4,
        ge=0.0,
        le=1.0,
        description="Weight for BM25 search in hybrid mode\n하이브리드 모드에서 BM25 검색 가중치"
    )
    use_reranker: bool = Field(
        True,
        description="Use reranker for final ranking\n최종 순위 지정에 reranker 사용"
    )
    reranker_top_k: Optional[int] = Field(
        None,
        ge=1,
        le=50,
        description="Top K results to keep after reranking\nReranking 후 유지할 상위 K 결과"
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

    # Advanced search scores
    vector_score: Optional[float] = Field(None, description="Vector similarity score\n벡터 유사도 점수")
    bm25_score: Optional[float] = Field(None, description="BM25 keyword score\nBM25 키워드 점수")
    reranker_score: Optional[float] = Field(None, description="Reranker score\nReranker 점수")
    rrf_score: Optional[float] = Field(None, description="RRF fusion score\nRRF 융합 점수")
    vector_rank: Optional[int] = Field(None, description="Rank in vector search\n벡터 검색에서의 순위")
    bm25_rank: Optional[int] = Field(None, description="Rank in BM25 search\nBM25 검색에서의 순위")


class SearchResponse(BaseModel):
    """Schema for search response
    검색 응답 스키마"""
    query: str = Field(..., description="Search query text\n검색 쿼리 텍스트")
    total_results: int = Field(..., description="Total number of results\n전체 결과 수")
    results: List[SearchResult] = Field(..., description="Search results\n검색 결과 목록")
    similarity_threshold: float = Field(..., description="Applied similarity threshold\n적용된 유사도 임계값")
    max_results: int = Field(..., description="Maximum results limit\n최대 결과 제한")
