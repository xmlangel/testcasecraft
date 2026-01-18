"""Analysis Summary CRUD API endpoints"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from ...core.database import get_db
from ...schemas.analysis_summary import (
    AnalysisSummaryCreate,
    AnalysisSummaryUpdate,
    AnalysisSummaryResponse,
    AnalysisSummaryListResponse,
    AnalysisSummaryDeleteResponse,
    AnalysisSummaryListItem
)
from ...services.analysis_summary_service import AnalysisSummaryService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("", response_model=AnalysisSummaryResponse, status_code=201)
async def create_summary(
    data: AnalysisSummaryCreate,
    db: Session = Depends(get_db)
):
    """요약 생성 (임시 저장)

    분석 결과를 사용자가 정리하여 요약으로 저장합니다.

    Args:
        data: 요약 생성 데이터
        db: 데이터베이스 세션

    Returns:
        AnalysisSummaryResponse: 생성된 요약
    """
    try:
        service = AnalysisSummaryService(db)
        summary = service.create_summary(data)

        return AnalysisSummaryResponse(
            id=summary.id,
            document_id=summary.document_id,
            job_id=summary.job_id,
            user_id=summary.user_id,
            title=summary.title,
            summary_content=summary.summary_content,
            tags=summary.tags or [],
            is_public=summary.is_public,
            created_at=summary.created_at,
            updated_at=summary.updated_at
        )

    except Exception as e:
        logger.error(f"Summary creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary creation failed: {str(e)}")


@router.get("", response_model=AnalysisSummaryListResponse)
async def list_summaries(
    document_id: Optional[UUID] = Query(None, description="Filter by document ID"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    is_public: Optional[bool] = Query(None, description="Filter by public visibility"),
    skip: int = Query(0, ge=0, description="Skip offset"),
    limit: int = Query(20, ge=1, le=100, description="Result limit"),
    db: Session = Depends(get_db)
):
    """요약 목록 조회

    Args:
        document_id: 문서 ID 필터 (선택)
        user_id: 사용자 ID 필터 (선택)
        is_public: 공개 여부 필터 (선택)
        skip: 오프셋
        limit: 제한
        db: 데이터베이스 세션

    Returns:
        AnalysisSummaryListResponse: 요약 목록
    """
    try:
        service = AnalysisSummaryService(db)
        summaries, total = service.list_summaries(
            document_id=document_id,
            user_id=user_id,
            is_public=is_public,
            skip=skip,
            limit=limit
        )

        summary_items = [
            AnalysisSummaryListItem(
                id=s.id,
                document_id=s.document_id,
                title=s.title,
                tags=s.tags or [],
                is_public=s.is_public,
                created_at=s.created_at,
                updated_at=s.updated_at
            )
            for s in summaries
        ]

        return AnalysisSummaryListResponse(
            summaries=summary_items,
            total=total,
            skip=skip,
            limit=limit
        )

    except Exception as e:
        logger.error(f"Summary list retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary list retrieval failed: {str(e)}")


@router.get("/{summary_id}", response_model=AnalysisSummaryResponse)
async def get_summary(
    summary_id: UUID,
    db: Session = Depends(get_db)
):
    """요약 상세 조회

    Args:
        summary_id: 요약 ID
        db: 데이터베이스 세션

    Returns:
        AnalysisSummaryResponse: 요약 상세 정보
    """
    try:
        service = AnalysisSummaryService(db)
        summary = service.get_summary(summary_id)

        if not summary:
            raise HTTPException(status_code=404, detail="Summary not found")

        return AnalysisSummaryResponse(
            id=summary.id,
            document_id=summary.document_id,
            job_id=summary.job_id,
            user_id=summary.user_id,
            title=summary.title,
            summary_content=summary.summary_content,
            tags=summary.tags or [],
            is_public=summary.is_public,
            created_at=summary.created_at,
            updated_at=summary.updated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summary retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary retrieval failed: {str(e)}")


@router.put("/{summary_id}", response_model=AnalysisSummaryResponse)
async def update_summary(
    summary_id: UUID,
    data: AnalysisSummaryUpdate,
    db: Session = Depends(get_db)
):
    """요약 수정

    Args:
        summary_id: 요약 ID
        data: 업데이트 데이터
        db: 데이터베이스 세션

    Returns:
        AnalysisSummaryResponse: 업데이트된 요약
    """
    try:
        service = AnalysisSummaryService(db)
        summary = service.update_summary(summary_id, data)

        if not summary:
            raise HTTPException(status_code=404, detail="Summary not found")

        return AnalysisSummaryResponse(
            id=summary.id,
            document_id=summary.document_id,
            job_id=summary.job_id,
            user_id=summary.user_id,
            title=summary.title,
            summary_content=summary.summary_content,
            tags=summary.tags or [],
            is_public=summary.is_public,
            created_at=summary.created_at,
            updated_at=summary.updated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summary update failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary update failed: {str(e)}")


@router.delete("/{summary_id}", response_model=AnalysisSummaryDeleteResponse)
async def delete_summary(
    summary_id: UUID,
    db: Session = Depends(get_db)
):
    """요약 삭제

    Args:
        summary_id: 요약 ID
        db: 데이터베이스 세션

    Returns:
        AnalysisSummaryDeleteResponse: 삭제 확인
    """
    try:
        service = AnalysisSummaryService(db)
        success = service.delete_summary(summary_id)

        if not success:
            raise HTTPException(status_code=404, detail="Summary not found")

        return AnalysisSummaryDeleteResponse(
            message="요약이 삭제되었습니다.",
            deleted_id=summary_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summary deletion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary deletion failed: {str(e)}")
