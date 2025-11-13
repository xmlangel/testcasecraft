"""LLM Analysis API endpoints"""
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from ...core.database import get_db, SessionLocal
from ...models.llm_analysis import LlmAnalysisJob
from ...schemas.llm_analysis import (
    CostEstimateRequest,
    CostEstimateResponse,
    LlmAnalysisRequest,
    LlmAnalysisResponse,
    LlmAnalysisStatusResponse,
    LlmAnalysisResultsResponse,
    PauseAnalysisResponse,
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
    CancelAnalysisResponse,
    ProgressInfo,
    CostInfo,
    LlmAnalysisResultItem
)
from ...services.cost_estimator import CostEstimator
from ...services.llm_analysis_service import LlmAnalysisService

router = APIRouter()
logger = logging.getLogger(__name__)


async def _run_llm_analysis_background(
    job_id: UUID,
    llm_api_key: Optional[str],
    llm_base_url: Optional[str],
    max_tokens: int,
    temperature: float
):
    """백그라운드에서 LLM 분석 실행

    Args:
        job_id: 작업 ID
        llm_api_key: API 키
        llm_base_url: 커스텀 엔드포인트
        max_tokens: 최대 토큰
        temperature: LLM 온도
    """
    db = SessionLocal()
    try:
        service = LlmAnalysisService(db)
        await service.process_chunks(
            job_id=job_id,
            llm_api_key=llm_api_key,
            llm_base_url=llm_base_url,
            max_tokens=max_tokens,
            temperature=temperature
        )
    except Exception as e:
        logger.error(f"Background LLM analysis failed for job {job_id}: {e}")
    finally:
        db.close()


@router.post("/{document_id}/estimate-analysis-cost", response_model=CostEstimateResponse)
async def estimate_analysis_cost(
    document_id: UUID,
    request: CostEstimateRequest,
    db: Session = Depends(get_db)
):
    """비용 추정 (분석 시작 전)

    청크 순차 LLM 질의에 소요될 예상 비용을 계산합니다.

    Args:
        document_id: 문서 ID
        request: 비용 추정 요청 (LLM 설정 포함)
        db: 데이터베이스 세션

    Returns:
        CostEstimateResponse: 예상 비용 및 경고 메시지
    """
    try:
        estimator = CostEstimator(db)
        result = estimator.estimate_analysis_cost(
            document_id=document_id,
            llm_provider=request.llm_provider,
            llm_model=request.llm_model,
            prompt_template=request.prompt_template,
            max_tokens=request.max_tokens
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Cost estimation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cost estimation failed: {str(e)}")


@router.post("/{document_id}/analyze-chunks-with-llm", response_model=LlmAnalysisResponse)
async def analyze_chunks_with_llm(
    document_id: UUID,
    request: LlmAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """청크 순차 LLM 분석 시작

    문서의 모든 청크를 순차적으로 LLM에게 질의합니다.
    배치 확인 메커니즘(10개 단위)을 통해 비용을 제어할 수 있습니다.

    Args:
        document_id: 문서 ID
        request: 분석 요청 (LLM 설정, 프롬프트 등)
        background_tasks: 백그라운드 작업
        db: 데이터베이스 세션

    Returns:
        LlmAnalysisResponse: 작업 시작 정보
    """
    try:
        service = LlmAnalysisService(db)

        # 작업 생성
        job = await service.start_analysis(
            document_id=document_id,
            llm_provider=request.llm_provider,
            llm_model=request.llm_model,
            llm_config_id=request.llm_config_id,
            llm_api_key=request.llm_api_key,
            llm_base_url=request.llm_base_url,
            prompt_template=request.prompt_template,
            chunk_batch_size=request.chunk_batch_size,
            pause_after_batch=request.pause_after_batch,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )

        # 백그라운드 작업 시작
        background_tasks.add_task(
            _run_llm_analysis_background,
            job_id=job.id,
            llm_api_key=request.llm_api_key,
            llm_base_url=request.llm_base_url,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )

        return LlmAnalysisResponse(
            status=job.status,
            document_id=document_id,
            job_id=job.id,
            total_chunks=job.total_chunks,
            message="분석이 시작되었습니다. 진행 상황을 확인하세요."
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis start failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis start failed: {str(e)}")


@router.get("/{document_id}/llm-analysis-status", response_model=LlmAnalysisStatusResponse)
async def get_llm_analysis_status(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """LLM 분석 진행 상황 조회

    Args:
        document_id: 문서 ID
        db: 데이터베이스 세션

    Returns:
        LlmAnalysisStatusResponse: 진행 상황 정보
    """
    try:
        # 최신 작업 조회
        job = db.query(LlmAnalysisJob)\
            .filter(LlmAnalysisJob.document_id == document_id)\
            .order_by(LlmAnalysisJob.started_at.desc())\
            .first()

        if not job:
            raise HTTPException(status_code=404, detail="No analysis job found")

        percentage = 0
        if job.total_chunks > 0:
            percentage = (job.processed_chunks / job.total_chunks) * 100

        cost_info = None
        if job.total_tokens_used > 0:
            cost_info = CostInfo(
                total_tokens_used=job.total_tokens_used,
                total_cost_usd=float(job.total_cost_usd)
            )

        return LlmAnalysisStatusResponse(
            document_id=document_id,
            job_id=job.id,
            llm_config_id=job.llm_config_id,
            status=job.status,
            progress=ProgressInfo(
                total_chunks=job.total_chunks,
                processed_chunks=job.processed_chunks,
                percentage=round(percentage, 2)
            ),
            actual_cost_so_far=cost_info,
            started_at=job.started_at,
            completed_at=job.completed_at,
            paused_at=job.paused_at,
            error_message=job.error_message
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")


@router.get("/{document_id}/llm-analysis-results", response_model=LlmAnalysisResultsResponse)
async def get_llm_analysis_results(
    document_id: UUID,
    skip: int = Query(0, ge=0, description="Skip offset"),
    limit: int = Query(50, ge=1, le=200, description="Result limit"),
    db: Session = Depends(get_db)
):
    """LLM 분석 결과 조회

    Args:
        document_id: 문서 ID
        skip: 오프셋
        limit: 제한
        db: 데이터베이스 세션

    Returns:
        LlmAnalysisResultsResponse: 분석 결과 목록
    """
    try:
        # 최신 작업 조회
        job = db.query(LlmAnalysisJob)\
            .filter(LlmAnalysisJob.document_id == document_id)\
            .order_by(LlmAnalysisJob.started_at.desc())\
            .first()

        if not job:
            raise HTTPException(status_code=404, detail="No analysis job found")

        service = LlmAnalysisService(db)
        results, total = service.get_results(job.id, skip, limit)

        result_items = [
            LlmAnalysisResultItem(
                chunk_index=r.chunk_index,
                chunk_text=r.chunk_text,
                llm_response=r.llm_response,
                tokens_used=r.tokens_used,
                processing_time_ms=r.processing_time_ms
            )
            for r in results
        ]

        return LlmAnalysisResultsResponse(
            document_id=document_id,
            job_id=job.id,
            results=result_items,
            total=total,
            skip=skip,
            limit=limit
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Results retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Results retrieval failed: {str(e)}")


@router.post("/{document_id}/pause-analysis", response_model=PauseAnalysisResponse)
async def pause_analysis(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """LLM 분석 일시정지

    Args:
        document_id: 문서 ID
        db: 데이터베이스 세션

    Returns:
        PauseAnalysisResponse: 일시정지 정보
    """
    try:
        # 최신 작업 조회
        job = db.query(LlmAnalysisJob)\
            .filter(LlmAnalysisJob.document_id == document_id)\
            .filter(LlmAnalysisJob.status == 'processing')\
            .order_by(LlmAnalysisJob.started_at.desc())\
            .first()

        if not job:
            raise HTTPException(status_code=404, detail="No processing job found")

        service = LlmAnalysisService(db)
        job = await service.pause_analysis(job.id)

        return PauseAnalysisResponse(
            document_id=document_id,
            job_id=job.id,
            status=job.status,
            processed_chunks=job.processed_chunks,
            total_chunks=job.total_chunks,
            actual_cost_so_far=CostInfo(
                total_tokens_used=job.total_tokens_used,
                total_cost_usd=float(job.total_cost_usd)
            ),
            message="분석이 일시정지되었습니다. 재개하려면 resume-analysis를 호출하세요."
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Pause failed: {e}")
        raise HTTPException(status_code=500, detail=f"Pause failed: {str(e)}")


@router.post("/{document_id}/resume-analysis", response_model=ResumeAnalysisResponse)
async def resume_analysis(
    document_id: UUID,
    request: ResumeAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """LLM 분석 재개

    Args:
        document_id: 문서 ID
        request: 재개 요청 (API key, config ID 등)
        background_tasks: 백그라운드 작업
        db: 데이터베이스 세션

    Returns:
        ResumeAnalysisResponse: 재개 정보
    """
    try:
        # 최신 일시정지된 작업 조회
        job = db.query(LlmAnalysisJob)\
            .filter(LlmAnalysisJob.document_id == document_id)\
            .filter(LlmAnalysisJob.status == 'paused')\
            .order_by(LlmAnalysisJob.started_at.desc())\
            .first()

        if not job:
            raise HTTPException(status_code=404, detail="No paused job found")

        service = LlmAnalysisService(db)

        # API key 결정: request -> 없음
        # Base URL 결정: request -> Job 저장값
        api_key = request.llm_api_key if request.llm_api_key else None
        base_url = request.llm_base_url if request.llm_base_url else job.llm_base_url

        logger.info(
            f"Resuming job {job.id}: provider={job.llm_provider}, model={job.llm_model}, "
            f"config_id={job.llm_config_id}, base_url={base_url}, api_key_provided={api_key is not None}"
        )

        job = await service.resume_analysis(
            job_id=job.id,
            llm_api_key=api_key,
            llm_base_url=base_url,
            max_tokens=500,
            temperature=0.7
        )

        # 백그라운드 작업 재시작
        background_tasks.add_task(
            _run_llm_analysis_background,
            job_id=job.id,
            llm_api_key=api_key,
            llm_base_url=base_url,
            max_tokens=500,
            temperature=0.7
        )

        return ResumeAnalysisResponse(
            document_id=document_id,
            job_id=job.id,
            status=job.status,
            processed_chunks=job.processed_chunks,
            remaining_chunks=job.total_chunks - job.processed_chunks,
            message="분석이 재개되었습니다."
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Resume failed: {e}")
        raise HTTPException(status_code=500, detail=f"Resume failed: {str(e)}")


@router.post("/{document_id}/cancel-analysis", response_model=CancelAnalysisResponse)
async def cancel_analysis(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """LLM 분석 취소

    Args:
        document_id: 문서 ID
        db: 데이터베이스 세션

    Returns:
        CancelAnalysisResponse: 취소 정보
    """
    try:
        # 최신 진행 중/일시정지 작업 조회
        job = db.query(LlmAnalysisJob)\
            .filter(LlmAnalysisJob.document_id == document_id)\
            .filter(LlmAnalysisJob.status.in_(['processing', 'paused']))\
            .order_by(LlmAnalysisJob.started_at.desc())\
            .first()

        if not job:
            raise HTTPException(status_code=404, detail="No active job found")

        service = LlmAnalysisService(db)
        job = await service.cancel_analysis(job.id)

        return CancelAnalysisResponse(
            document_id=document_id,
            job_id=job.id,
            status=job.status,
            processed_chunks=job.processed_chunks,
            total_cost_usd=float(job.total_cost_usd),
            message="분석이 취소되었습니다. 지금까지 처리된 결과는 보존됩니다."
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Cancel failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cancel failed: {str(e)}")
