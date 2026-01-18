"""Analysis Summary CRUD Service"""
import logging
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.llm_analysis import AnalysisSummary
from ..schemas.analysis_summary import (
    AnalysisSummaryCreate,
    AnalysisSummaryUpdate
)

logger = logging.getLogger(__name__)


class AnalysisSummaryService:
    """분석 요약 CRUD 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def create_summary(
        self,
        data: AnalysisSummaryCreate
    ) -> AnalysisSummary:
        """요약 생성

        Args:
            data: 요약 생성 데이터

        Returns:
            AnalysisSummary: 생성된 요약
        """
        summary = AnalysisSummary(
            document_id=data.document_id,
            job_id=data.job_id,
            user_id=data.user_id,
            title=data.title,
            summary_content=data.summary_content,
            tags=data.tags or [],
            is_public=data.is_public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        self.db.add(summary)
        self.db.commit()
        self.db.refresh(summary)

        logger.info(f"Created summary {summary.id} for document {data.document_id}")
        return summary

    def get_summary(self, summary_id: UUID) -> Optional[AnalysisSummary]:
        """요약 상세 조회

        Args:
            summary_id: 요약 ID

        Returns:
            Optional[AnalysisSummary]: 요약 객체 또는 None
        """
        summary = self.db.query(AnalysisSummary)\
            .filter(AnalysisSummary.id == summary_id)\
            .first()

        return summary

    def list_summaries(
        self,
        document_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        is_public: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple:
        """요약 목록 조회

        Args:
            document_id: 문서 ID (선택)
            user_id: 사용자 ID (선택)
            is_public: 공개 여부 (선택)
            skip: 오프셋
            limit: 제한

        Returns:
            tuple: (요약 목록, 총 개수)
        """
        query = self.db.query(AnalysisSummary)

        # 필터링
        if document_id:
            query = query.filter(AnalysisSummary.document_id == document_id)

        if user_id:
            query = query.filter(AnalysisSummary.user_id == user_id)

        if is_public is not None:
            query = query.filter(AnalysisSummary.is_public == is_public)

        # 총 개수
        total = query.count()

        # 페이지네이션
        summaries = query\
            .order_by(AnalysisSummary.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

        return summaries, total

    def update_summary(
        self,
        summary_id: UUID,
        data: AnalysisSummaryUpdate
    ) -> Optional[AnalysisSummary]:
        """요약 수정

        Args:
            summary_id: 요약 ID
            data: 업데이트 데이터

        Returns:
            Optional[AnalysisSummary]: 업데이트된 요약 또는 None
        """
        summary = self.db.query(AnalysisSummary)\
            .filter(AnalysisSummary.id == summary_id)\
            .first()

        if not summary:
            return None

        # 업데이트
        if data.title is not None:
            summary.title = data.title

        if data.summary_content is not None:
            summary.summary_content = data.summary_content

        if data.tags is not None:
            summary.tags = data.tags

        if data.is_public is not None:
            summary.is_public = data.is_public

        summary.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(summary)

        logger.info(f"Updated summary {summary_id}")
        return summary

    def delete_summary(self, summary_id: UUID) -> bool:
        """요약 삭제

        Args:
            summary_id: 요약 ID

        Returns:
            bool: 삭제 성공 여부
        """
        summary = self.db.query(AnalysisSummary)\
            .filter(AnalysisSummary.id == summary_id)\
            .first()

        if not summary:
            return False

        self.db.delete(summary)
        self.db.commit()

        logger.info(f"Deleted summary {summary_id}")
        return True

    def delete_summaries_by_document(self, document_id: UUID) -> int:
        """문서의 모든 요약 삭제

        Args:
            document_id: 문서 ID

        Returns:
            int: 삭제된 요약 수
        """
        count = self.db.query(AnalysisSummary)\
            .filter(AnalysisSummary.document_id == document_id)\
            .delete()

        self.db.commit()

        logger.info(f"Deleted {count} summaries for document {document_id}")
        return count

    def delete_summaries_by_job(self, job_id: UUID) -> int:
        """작업의 모든 요약 삭제 (작업 삭제 시 사용)

        Args:
            job_id: 작업 ID

        Returns:
            int: 삭제된 요약 수
        """
        # job_id가 NULL이 되도록 업데이트 (ON DELETE SET NULL)
        count = self.db.query(AnalysisSummary)\
            .filter(AnalysisSummary.job_id == job_id)\
            .update({"job_id": None})

        self.db.commit()

        logger.info(f"Unlinked {count} summaries from job {job_id}")
        return count
