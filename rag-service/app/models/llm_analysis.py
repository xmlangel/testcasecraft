"""LLM Analysis models for sequential chunk processing"""
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, ForeignKey, DECIMAL, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid


class LlmAnalysisJob(Base):
    """분석 작업 메타데이터 테이블"""

    __tablename__ = "llm_analysis_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('rag_documents.id', ondelete='CASCADE'), nullable=False, index=True)

    # LLM 설정
    llm_provider = Column(String(50), nullable=False)  # openai, anthropic, ollama
    llm_model = Column(String(100), nullable=False)  # gpt-4, claude-3-sonnet 등
    llm_config_id = Column(String(36))  # Backend LLM Config ID (UUID)
    llm_base_url = Column(String(255))  # 커스텀 엔드포인트 URL
    prompt_template = Column(Text, nullable=False)

    # 배치 처리 설정
    chunk_batch_size = Column(Integer, default=10)
    pause_after_batch = Column(Boolean, default=True)

    # 진행 상황
    status = Column(String(20), default='pending', index=True)  # pending, processing, paused, completed, failed, cancelled
    total_chunks = Column(Integer)
    processed_chunks = Column(Integer, default=0)

    # 비용 추적
    total_tokens_used = Column(Integer, default=0)
    total_cost_usd = Column(DECIMAL(10, 4), default=0)

    # 시간 정보
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    paused_at = Column(DateTime(timezone=True))

    # 오류 정보
    error_message = Column(Text)

    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    results = relationship("LlmAnalysisResult", back_populates="job", cascade="all, delete-orphan")
    summaries = relationship("AnalysisSummary", back_populates="job")

    def __repr__(self):
        return f"<LlmAnalysisJob(id={self.id}, document_id={self.document_id}, status={self.status})>"


class LlmAnalysisResult(Base):
    """청크별 분석 결과 테이블"""

    __tablename__ = "llm_analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('llm_analysis_jobs.id', ondelete='CASCADE'), nullable=False, index=True)

    # 청크 정보
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)

    # LLM 응답
    llm_response = Column(Text, nullable=False)

    # 성능 메트릭
    tokens_used = Column(Integer, nullable=False)
    processing_time_ms = Column(Integer, nullable=False)

    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job = relationship("LlmAnalysisJob", back_populates="results")

    def __repr__(self):
        return f"<LlmAnalysisResult(id={self.id}, job_id={self.job_id}, chunk_index={self.chunk_index})>"


class AnalysisSummary(Base):
    """분석 결과 요약 테이블 (사용자가 정리한 내용)"""

    __tablename__ = "analysis_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('rag_documents.id', ondelete='CASCADE'), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey('llm_analysis_jobs.id', ondelete='SET NULL'), index=True)

    # 작성자 (선택)
    user_id = Column(UUID(as_uuid=True), index=True)

    # 요약 내용
    title = Column(String(255), nullable=False)
    summary_content = Column(Text, nullable=False)

    # 태그 및 메타데이터
    tags = Column(ARRAY(String(100)))  # 태그 배열
    is_public = Column(Boolean, default=False)

    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    job = relationship("LlmAnalysisJob", back_populates="summaries")

    def __repr__(self):
        return f"<AnalysisSummary(id={self.id}, title={self.title})>"
