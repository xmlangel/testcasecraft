"""LLM Analysis schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


# ============================================================================
# 비용 추정 스키마
# ============================================================================

class CostEstimateRequest(BaseModel):
    """비용 추정 요청 스키마"""
    llm_provider: str = Field(..., max_length=50, description="LLM provider (openai, anthropic, ollama)")
    llm_model: str = Field(..., max_length=100, description="LLM model name (gpt-4, claude-3-sonnet)")
    prompt_template: str = Field(..., description="Prompt template with {chunk_text} placeholder")
    max_tokens: int = Field(500, gt=0, le=4000, description="Maximum tokens per response")

    model_config = ConfigDict(extra='forbid')


class ModelPricing(BaseModel):
    """모델 가격 정보"""
    provider: str = Field(..., description="LLM provider")
    model: str = Field(..., description="Model name")
    input_price_per_1k: float = Field(..., description="Input price per 1K tokens (USD)")
    output_price_per_1k: float = Field(..., description="Output price per 1K tokens (USD)")


class CostBreakdown(BaseModel):
    """비용 분석"""
    input_cost_usd: float = Field(..., description="Input cost (USD)")
    output_cost_usd: float = Field(..., description="Output cost (USD)")
    total_cost_usd: float = Field(..., description="Total cost (USD)")


class CostEstimateResponse(BaseModel):
    """비용 추정 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID")
    total_chunks: int = Field(..., description="Total number of chunks")
    estimated_input_tokens: int = Field(..., description="Estimated input tokens")
    estimated_output_tokens: int = Field(..., description="Estimated output tokens")
    estimated_total_tokens: int = Field(..., description="Estimated total tokens")
    cost_breakdown: CostBreakdown = Field(..., description="Cost breakdown")
    cost_per_chunk_usd: float = Field(..., description="Cost per chunk (USD)")
    model_pricing: ModelPricing = Field(..., description="Model pricing information")
    warnings: List[str] = Field(default_factory=list, description="Warning messages")


# ============================================================================
# 분석 작업 스키마
# ============================================================================

class LlmAnalysisRequest(BaseModel):
    """LLM 분석 시작 요청 스키마"""
    llm_provider: str = Field(..., max_length=50, description="LLM provider")
    llm_model: str = Field(..., max_length=100, description="LLM model name")
    llm_config_id: Optional[str] = Field(None, max_length=36, description="Backend LLM Config ID (optional)")
    llm_api_key: Optional[str] = Field(None, description="LLM API key (optional)")
    llm_base_url: Optional[str] = Field(None, description="Custom LLM endpoint URL (optional)")
    prompt_template: str = Field(..., description="Prompt template with {chunk_text}")
    chunk_batch_size: int = Field(10, gt=0, le=50, description="Chunk batch size")
    pause_after_batch: bool = Field(True, description="Pause after each batch")
    max_tokens: int = Field(500, gt=0, le=4000, description="Maximum tokens per response")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="LLM temperature")

    model_config = ConfigDict(extra='forbid')


class LlmAnalysisResponse(BaseModel):
    """LLM 분석 시작 응답 스키마"""
    status: str = Field(..., description="Analysis status")
    document_id: UUID = Field(..., description="Document ID")
    job_id: UUID = Field(..., description="Job ID")
    total_chunks: int = Field(..., description="Total number of chunks")
    message: str = Field(..., description="Status message")


class ProgressInfo(BaseModel):
    """진행 상황 정보"""
    total_chunks: int = Field(..., description="Total chunks")
    processed_chunks: int = Field(..., description="Processed chunks")
    percentage: float = Field(..., description="Progress percentage")


class CostInfo(BaseModel):
    """비용 정보"""
    total_tokens_used: int = Field(..., description="Total tokens used")
    total_cost_usd: float = Field(..., description="Total cost (USD)")


class LlmAnalysisStatusResponse(BaseModel):
    """LLM 분석 진행 상황 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID")
    job_id: UUID = Field(..., description="Job ID")
    llm_config_id: Optional[str] = Field(None, description="Backend LLM Config ID (for resume)")
    status: str = Field(..., description="Analysis status")
    progress: ProgressInfo = Field(..., description="Progress information")
    actual_cost_so_far: Optional[CostInfo] = Field(None, description="Actual cost so far")
    started_at: Optional[datetime] = Field(None, description="Started timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completed timestamp")
    paused_at: Optional[datetime] = Field(None, description="Paused timestamp")
    error_message: Optional[str] = Field(None, description="Error message if failed")


class LlmAnalysisResultItem(BaseModel):
    """LLM 분석 결과 항목"""
    chunk_index: int = Field(..., description="Chunk index")
    chunk_text: str = Field(..., description="Original chunk text")
    llm_response: str = Field(..., description="LLM response")
    tokens_used: int = Field(..., description="Tokens used")
    processing_time_ms: int = Field(..., description="Processing time (ms)")


class LlmAnalysisResultsResponse(BaseModel):
    """LLM 분석 결과 목록 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID")
    job_id: UUID = Field(..., description="Job ID")
    results: List[LlmAnalysisResultItem] = Field(default_factory=list, description="Analysis results")
    total: int = Field(..., description="Total result count")
    skip: int = Field(..., description="Skip offset")
    limit: int = Field(..., description="Result limit")


class PauseAnalysisResponse(BaseModel):
    """분석 일시정지 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID")
    job_id: UUID = Field(..., description="Job ID")
    status: str = Field(..., description="Status (paused)")
    processed_chunks: int = Field(..., description="Processed chunks")
    total_chunks: int = Field(..., description="Total chunks")
    actual_cost_so_far: CostInfo = Field(..., description="Actual cost so far")
    message: str = Field(..., description="Status message")


class ResumeAnalysisRequest(BaseModel):
    """분석 재개 요청 스키마"""
    llm_config_id: Optional[str] = Field(None, max_length=36, description="Backend LLM Config ID (optional)")
    llm_api_key: Optional[str] = Field(None, description="LLM API key (optional)")
    llm_base_url: Optional[str] = Field(None, description="Custom LLM endpoint URL (optional)")

    model_config = ConfigDict(extra='forbid')


class ResumeAnalysisResponse(BaseModel):
    """분석 재개 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID")
    job_id: UUID = Field(..., description="Job ID")
    status: str = Field(..., description="Status (processing)")
    processed_chunks: int = Field(..., description="Already processed chunks")
    remaining_chunks: int = Field(..., description="Remaining chunks")
    message: str = Field(..., description="Status message")


class CancelAnalysisResponse(BaseModel):
    """분석 취소 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID")
    job_id: UUID = Field(..., description="Job ID")
    status: str = Field(..., description="Status (cancelled)")
    processed_chunks: int = Field(..., description="Processed chunks")
    total_cost_usd: float = Field(..., description="Total cost (USD)")
    message: str = Field(..., description="Status message")


# ============================================================================
# LLM 분석 작업 목록 스키마
# ============================================================================

class LlmAnalysisJobSummary(BaseModel):
    """LLM 분석 작업 요약 정보"""
    job_id: UUID = Field(..., description="Job ID")
    document_id: UUID = Field(..., description="Document ID")
    file_name: str = Field(..., description="File name")
    project_id: Optional[UUID] = Field(None, description="Project ID")
    llm_provider: str = Field(..., description="LLM provider")
    llm_model: str = Field(..., description="LLM model")
    status: str = Field(..., description="Job status")
    total_chunks: int = Field(..., description="Total chunks")
    processed_chunks: int = Field(..., description="Processed chunks")
    percentage: float = Field(..., description="Progress percentage")
    total_cost_usd: float = Field(..., description="Total cost (USD)")
    total_tokens: int = Field(..., description="Total tokens used")
    started_at: Optional[datetime] = Field(None, description="Started timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completed timestamp")
    paused_at: Optional[datetime] = Field(None, description="Paused timestamp")
    error_message: Optional[str] = Field(None, description="Error message if failed")


class LlmAnalysisJobListResponse(BaseModel):
    """LLM 분석 작업 목록 응답 스키마"""
    jobs: List[LlmAnalysisJobSummary] = Field(default_factory=list, description="Job list")
    total_count: int = Field(..., description="Total job count")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Page size")
