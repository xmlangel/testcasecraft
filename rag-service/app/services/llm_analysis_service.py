"""LLM Analysis Service for sequential chunk processing"""
import asyncio
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from decimal import Decimal

from ..models.rag_embedding import RAGEmbedding
from ..models.llm_analysis import LlmAnalysisJob, LlmAnalysisResult
from .llm_client import LlmClientFactory, retry_with_exponential_backoff
from .cost_estimator import CostEstimator

logger = logging.getLogger(__name__)


class LlmAnalysisService:
    """LLM 순차 분석 서비스"""

    def __init__(self, db: Session):
        self.db = db
        self.cost_estimator = CostEstimator(db)

    async def start_analysis(
        self,
        document_id: UUID,
        llm_provider: str,
        llm_model: str,
        llm_config_id: Optional[str],
        llm_api_key: Optional[str],
        llm_base_url: Optional[str],
        prompt_template: str,
        chunk_batch_size: int = 10,
        pause_after_batch: bool = True,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> LlmAnalysisJob:
        """분석 시작

        Args:
            document_id: 문서 ID
            llm_provider: LLM 제공자
            llm_model: 모델명
            llm_config_id: Backend LLM Config ID (resume 시 재사용)
            llm_api_key: API 키
            llm_base_url: 커스텀 엔드포인트
            prompt_template: 프롬프트 템플릿
            chunk_batch_size: 배치 크기
            pause_after_batch: 배치마다 일시정지 여부
            max_tokens: 최대 토큰
            temperature: LLM 온도

        Returns:
            LlmAnalysisJob: 생성된 작업
        """
        # 청크 조회
        chunks = self.db.query(RAGEmbedding)\
            .filter(RAGEmbedding.document_id == document_id)\
            .order_by(RAGEmbedding.chunk_index)\
            .all()

        if not chunks:
            raise ValueError(f"Document {document_id} has no chunks")

        # 작업 생성
        job = LlmAnalysisJob(
            document_id=document_id,
            llm_provider=llm_provider,
            llm_model=llm_model,
            llm_config_id=llm_config_id,
            llm_base_url=llm_base_url,
            prompt_template=prompt_template,
            chunk_batch_size=chunk_batch_size,
            pause_after_batch=pause_after_batch,
            total_chunks=len(chunks),
            processed_chunks=0,
            status='processing',
            started_at=datetime.utcnow()
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)

        logger.info(
            f"Started analysis job {job.id} for document {document_id} "
            f"with {len(chunks)} chunks"
        )

        return job

    async def process_chunks(
        self,
        job_id: UUID,
        llm_api_key: Optional[str],
        llm_base_url: Optional[str],
        max_tokens: int = 500,
        temperature: float = 0.7
    ):
        """청크 순차 처리 (비동기)

        Args:
            job_id: 작업 ID
            llm_api_key: API 키
            llm_base_url: 커스텀 엔드포인트
            max_tokens: 최대 토큰
            temperature: LLM 온도
        """
        job = self.db.query(LlmAnalysisJob).filter(LlmAnalysisJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        try:
            # LLM 클라이언트 생성
            llm_client = LlmClientFactory.create_client(
                provider=job.llm_provider,
                api_key=llm_api_key,
                model=job.llm_model,
                base_url=llm_base_url
            )

            # 청크 조회
            chunks = self.db.query(RAGEmbedding)\
                .filter(RAGEmbedding.document_id == job.document_id)\
                .order_by(RAGEmbedding.chunk_index)\
                .all()

            # 배치 단위 처리
            chunk_batch_size = job.chunk_batch_size
            processed_count = job.processed_chunks

            for i in range(processed_count, len(chunks), chunk_batch_size):
                # 취소 확인
                self.db.refresh(job)
                if job.status == 'cancelled':
                    logger.info(f"Job {job_id} cancelled by user")
                    return

                # 배치 추출
                batch = chunks[i:i + chunk_batch_size]

                # 배치 처리
                await self._process_batch(
                    job=job,
                    llm_client=llm_client,
                    batch=batch,
                    max_tokens=max_tokens,
                    temperature=temperature
                )

                # 최신 진행 상황 반영
                self.db.refresh(job)
                logger.info(
                    f"Job {job_id}: Processed {job.processed_chunks}/{job.total_chunks} chunks"
                )

                # 배치마다 일시정지 확인
                if job.pause_after_batch and job.processed_chunks < job.total_chunks:
                    job.status = 'paused'
                    job.paused_at = datetime.utcnow()
                    self.db.commit()
                    logger.info(f"Job {job_id} paused after batch")
                    return

            # 완료 처리
            job.status = 'completed'
            job.completed_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"Job {job_id} completed successfully")

        except Exception as e:
            # 에러 처리
            job.status = 'failed'
            job.error_message = str(e)
            self.db.commit()
            logger.error(f"Job {job_id} failed: {e}")
            raise

    async def _process_batch(
        self,
        job: LlmAnalysisJob,
        llm_client,
        batch,
        max_tokens: int,
        temperature: float
    ):
        """배치 처리 (병렬)

        Args:
            job: 작업 객체
            llm_client: LLM 클라이언트
            batch: 청크 배치
            max_tokens: 최대 토큰
            temperature: LLM 온도
        """
        tasks = []

        for chunk in batch:
            task = self._process_single_chunk(
                job=job,
                llm_client=llm_client,
                chunk=chunk,
                max_tokens=max_tokens,
                temperature=temperature
            )
            tasks.append(task)

        # 병렬 실행
        await asyncio.gather(*tasks)

    async def _process_single_chunk(
        self,
        job: LlmAnalysisJob,
        llm_client,
        chunk,
        max_tokens: int,
        temperature: float
    ):
        """단일 청크 처리

        Args:
            job: 작업 객체
            llm_client: LLM 클라이언트
            chunk: 청크 객체
            max_tokens: 최대 토큰
            temperature: LLM 온도
        """
        start_time = datetime.utcnow()

        # 프롬프트 생성
        prompt = job.prompt_template.format(chunk_text=chunk.chunk_text)

        # LLM 질의 (재시도 로직 포함)
        async def call_llm():
            return await llm_client.generate(prompt, max_tokens, temperature)

        response = await retry_with_exponential_backoff(call_llm, max_retries=3)

        processing_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        # 결과 저장
        result = LlmAnalysisResult(
            job_id=job.id,
            chunk_index=chunk.chunk_index,
            chunk_text=chunk.chunk_text,
            llm_response=response["text"],
            tokens_used=response["tokens_used"],
            processing_time_ms=processing_time_ms
        )
        self.db.add(result)

        # 비용 업데이트
        job.total_tokens_used += response["tokens_used"]

        # 비용 계산 (간단한 추정)
        pricing = self.cost_estimator._get_pricing(job.llm_provider, job.llm_model)
        cost_increment = (
            response.get("input_tokens", 0) / 1000 * pricing["input"] +
            response.get("output_tokens", 0) / 1000 * pricing["output"]
        )
        current_cost = float(job.total_cost_usd or 0)
        job.total_cost_usd = current_cost + cost_increment
        # 청크 진행상황을 개별 단위로 업데이트
        job.processed_chunks = min((job.processed_chunks or 0) + 1, job.total_chunks or (job.processed_chunks or 0) + 1)

        self.db.commit()

        logger.debug(
            f"Job {job.id}: Processed chunk {chunk.chunk_index}, "
            f"tokens: {response['tokens_used']}, "
            f"time: {processing_time_ms}ms"
        )

    async def pause_analysis(self, job_id: UUID) -> LlmAnalysisJob:
        """분석 일시정지

        Args:
            job_id: 작업 ID

        Returns:
            LlmAnalysisJob: 업데이트된 작업
        """
        job = self.db.query(LlmAnalysisJob).filter(LlmAnalysisJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        if job.status != 'processing':
            raise ValueError(f"Job {job_id} is not processing (status: {job.status})")

        job.status = 'paused'
        job.paused_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(job)

        logger.info(f"Job {job_id} paused manually")
        return job

    async def resume_analysis(
        self,
        job_id: UUID,
        llm_api_key: Optional[str],
        llm_base_url: Optional[str],
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> LlmAnalysisJob:
        """분석 재개

        Args:
            job_id: 작업 ID
            llm_api_key: API 키
            llm_base_url: 커스텀 엔드포인트
            max_tokens: 최대 토큰
            temperature: LLM 온도

        Returns:
            LlmAnalysisJob: 업데이트된 작업
        """
        job = self.db.query(LlmAnalysisJob).filter(LlmAnalysisJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        if job.status != 'paused':
            raise ValueError(f"Job {job_id} is not paused (status: {job.status})")

        job.status = 'processing'
        job.paused_at = None
        self.db.commit()
        self.db.refresh(job)

        logger.info(f"Job {job_id} resumed")

        # 비동기로 처리 계속
        # 주의: 실제 운영에서는 BackgroundTasks로 처리해야 함
        # await self.process_chunks(job_id, llm_api_key, llm_base_url, max_tokens, temperature)

        return job

    async def cancel_analysis(self, job_id: UUID) -> LlmAnalysisJob:
        """분석 취소

        Args:
            job_id: 작업 ID

        Returns:
            LlmAnalysisJob: 업데이트된 작업
        """
        job = self.db.query(LlmAnalysisJob).filter(LlmAnalysisJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        if job.status in ('completed', 'failed', 'cancelled'):
            raise ValueError(f"Job {job_id} cannot be cancelled (status: {job.status})")

        job.status = 'cancelled'
        job.completed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(job)

        logger.info(f"Job {job_id} cancelled")
        return job

    def get_job_status(self, job_id: UUID) -> LlmAnalysisJob:
        """작업 상태 조회

        Args:
            job_id: 작업 ID

        Returns:
            LlmAnalysisJob: 작업 객체
        """
        job = self.db.query(LlmAnalysisJob).filter(LlmAnalysisJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        return job

    def get_results(
        self,
        job_id: UUID,
        skip: int = 0,
        limit: int = 50
    ) -> tuple:
        """분석 결과 조회

        Args:
            job_id: 작업 ID
            skip: 오프셋
            limit: 제한

        Returns:
            tuple: (결과 목록, 총 개수)
        """
        total = self.db.query(LlmAnalysisResult)\
            .filter(LlmAnalysisResult.job_id == job_id)\
            .count()

        results = self.db.query(LlmAnalysisResult)\
            .filter(LlmAnalysisResult.job_id == job_id)\
            .order_by(LlmAnalysisResult.chunk_index)\
            .offset(skip)\
            .limit(limit)\
            .all()

        return results, total
