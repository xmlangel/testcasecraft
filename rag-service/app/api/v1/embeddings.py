"""Embedding API endpoints"""
import asyncio
import logging
from datetime import datetime
from typing import Optional, List, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from ...core.database import get_db, SessionLocal
from ...models.rag_document import RAGDocument
from ...models.rag_embedding import RAGEmbedding
from ...schemas.embedding import GenerateEmbeddingRequest, GenerateEmbeddingResponse
from ...services.embedding_service import get_embedding_service

router = APIRouter()
logger = logging.getLogger(__name__)


def _set_embedding_status(document_id: UUID, status: str, extra: Optional[dict] = None) -> None:
    """Update embedding status metadata for a document"""
    session = SessionLocal()
    try:
        document_query = session.query(RAGDocument).filter(RAGDocument.id == document_id)
        document = document_query.first()
        if not document:
            logger.warning("Document %s not found when updating embedding status", document_id)
            return

        meta = document.meta_data or {}
        meta["embedding_status"] = status
        if extra:
            meta.update(extra)
        document_query.update({"meta_data": meta}, synchronize_session=False)
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.exception("Failed to update embedding status for document %s: %s", document_id, exc)
    finally:
        session.close()


def _run_embedding_generation(document_id: UUID) -> None:
    """Background task to generate embeddings without blocking API responses

    This function runs in a separate thread/process managed by FastAPI BackgroundTasks,
    allowing the API to respond immediately while embedding generation continues.
    """
    chunk_data: List[Tuple[UUID, str]] = []

    # Step 1: Fetch chunk texts outside of long-lived sessions
    fetch_session = SessionLocal()
    try:
        document = fetch_session.query(RAGDocument).filter(RAGDocument.id == document_id).first()
        if not document:
            logger.warning("Document %s not found during embedding generation", document_id)
            return

        chunk_rows = fetch_session.query(
            RAGEmbedding.id,
            RAGEmbedding.chunk_text
        ).filter(
            RAGEmbedding.document_id == document_id
        ).order_by(
            RAGEmbedding.chunk_index
        ).all()

        chunk_data = [(row[0], row[1]) for row in chunk_rows]
    finally:
        fetch_session.close()

    if not chunk_data:
        logger.warning("No chunks available for embedding generation (document: %s)", document_id)
        _set_embedding_status(
            document_id,
            "failed",
            {
                "embedding_error": "No chunks found for embedding generation",
                "embedding_completed_at": datetime.utcnow().isoformat()
            }
        )
        return

    chunk_texts = [text for _, text in chunk_data]
    logger.info("Starting embedding generation for document %s (%s chunks)", document_id, len(chunk_texts))

    try:
        embedding_service = get_embedding_service()
        embeddings = embedding_service.generate_embeddings_batch(chunk_texts)
    except Exception as exc:
        logger.exception("Embedding generation failed for document %s: %s", document_id, exc)
        _set_embedding_status(
            document_id,
            "failed",
            {
                "embedding_error": str(exc),
                "embedding_completed_at": datetime.utcnow().isoformat()
            }
        )
        return

    if len(embeddings) != len(chunk_data):
        logger.error(
            "Embedding generation count mismatch for document %s: expected %s, got %s",
            document_id,
            len(chunk_data),
            len(embeddings)
        )
        _set_embedding_status(
            document_id,
            "failed",
            {
                "embedding_error": "Embedding count mismatch",
                "embedding_completed_at": datetime.utcnow().isoformat()
            }
        )
        return

    # Step 3: Persist embeddings and update metadata in a fresh session
    persist_session = SessionLocal()
    try:
        for (chunk_id, _), embedding in zip(chunk_data, embeddings):
            persist_session.query(RAGEmbedding).filter(
                RAGEmbedding.id == chunk_id
            ).update(
                {"embedding": embedding},
                synchronize_session=False
            )

        completed_at = datetime.utcnow().isoformat()

        document = persist_session.query(RAGDocument).filter(RAGDocument.id == document_id).first()
        if document:
            meta = document.meta_data or {}
            meta["embedding_status"] = "completed"
            meta["embedding_generated_at"] = completed_at
            meta["embedding_chunks"] = len(embeddings)
            persist_session.query(RAGDocument).filter(
                RAGDocument.id == document_id
            ).update(
                {"meta_data": meta},
                synchronize_session=False
            )

        persist_session.commit()

        # Use shared helper to guarantee metadata is persisted even if the document
        # instance above was stale or another session overwrote it.
        _set_embedding_status(
            document_id,
            "completed",
            {
                "embedding_generated_at": completed_at,
                "embedding_chunks": len(embeddings),
            }
        )

        logger.info("Embeddings generated successfully for document %s (%s chunks)", document_id, len(embeddings))

    except Exception as exc:
        persist_session.rollback()
        logger.exception("Failed to persist embeddings for document %s: %s", document_id, exc)
        _set_embedding_status(
            document_id,
            "failed",
            {
                "embedding_error": str(exc),
                "embedding_completed_at": datetime.utcnow().isoformat()
            }
        )
    finally:
        persist_session.close()


@router.post("/generate", response_model=GenerateEmbeddingResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_embeddings(
    request: GenerateEmbeddingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate embeddings for all chunks of a document (Non-blocking)
    문서의 모든 청크에 대한 임베딩 생성 (비차단 방식)

    This endpoint immediately returns after starting the background task,
    allowing other requests to be processed concurrently.
    이 엔드포인트는 백그라운드 태스크를 시작한 후 즉시 반환하여
    다른 요청을 동시에 처리할 수 있도록 합니다.

    Process:
    처리 과정:
    1. Validates document and chunks exist
       문서와 청크가 존재하는지 검증합니다
    2. Marks embedding status as "generating"
       임베딩 상태를 "생성 중"으로 표시합니다
    3. Starts background task for embedding generation
       임베딩 생성을 위한 백그라운드 태스크를 시작합니다
    4. Returns immediately with 202 Accepted status
       202 Accepted 상태로 즉시 반환합니다

    Args:
    매개변수:
        request: Document ID to generate embeddings for
                임베딩을 생성할 문서 ID
        background_tasks: FastAPI background task manager
                         FastAPI 백그라운드 태스크 관리자
        db: Database session
            데이터베이스 세션

    Returns:
    반환값:
        Generation status with counts (202 Accepted)
        생성 상태 및 개수 (202 Accepted)
    """
    document_id = request.document_id

    # Verify document exists
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get all chunks for this document
    chunks = db.query(RAGEmbedding).filter(
        RAGEmbedding.document_id == document_id
    ).order_by(RAGEmbedding.chunk_index).all()

    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks found for this document. Please analyze the document first.")

    # Prevent duplicate generation requests
    meta = document.meta_data or {}
    embedding_status = (meta.get("embedding_status") or "").lower()
    if embedding_status == "generating":
        raise HTTPException(status_code=400, detail="Embedding generation already in progress for this document.")

    try:
        # Mark embedding generation as in-progress
        meta.update({
            "embedding_status": "generating",
            "embedding_started_at": datetime.utcnow().isoformat(),
            "embedding_chunks": len(chunks)
        })
        document.meta_data = meta
        db.commit()

        # Add background task - this is non-blocking and allows other requests to proceed
        background_tasks.add_task(_run_embedding_generation, document_id)

        logger.info(f"Embedding generation task queued for document {document_id} ({len(chunks)} chunks)")

        return GenerateEmbeddingResponse(
            document_id=document_id,
            total_chunks=len(chunks),
            embeddings_generated=0,
            message="Embedding generation started in background. API is now available for other requests."
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Error starting embedding generation for document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start embedding generation: {str(e)}")


@router.get("/status/{document_id}", status_code=status.HTTP_200_OK)
async def get_embedding_status(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get embedding generation status for a document
    문서의 임베딩 생성 상태 조회

    This endpoint allows clients to poll the embedding generation status
    while it's running in the background.
    이 엔드포인트를 통해 클라이언트는 백그라운드에서 실행 중인
    임베딩 생성 상태를 폴링할 수 있습니다.

    Args:
    매개변수:
        document_id: UUID of the document
                    문서의 UUID
        db: Database session
            데이터베이스 세션

    Returns:
    반환값:
        Embedding status information
        임베딩 상태 정보

    Status values:
    상태 값:
        - "pending": No embedding generation started yet
                    아직 임베딩 생성이 시작되지 않음
        - "generating": Embedding generation in progress
                       임베딩 생성 진행 중
        - "completed": Embedding generation completed successfully
                      임베딩 생성 완료
        - "failed": Embedding generation failed
                   임베딩 생성 실패
    """
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    meta = document.meta_data or {}
    embedding_status = meta.get("embedding_status", "pending")

    # Get chunk count information
    total_chunks = db.query(RAGEmbedding).filter(
        RAGEmbedding.document_id == document_id
    ).count()

    embedded_chunks = db.query(RAGEmbedding).filter(
        RAGEmbedding.document_id == document_id,
        RAGEmbedding.embedding.isnot(None)
    ).count()

    response = {
        "document_id": str(document_id),
        "status": embedding_status,
        "total_chunks": total_chunks,
        "embedded_chunks": embedded_chunks,
        "progress_percentage": round((embedded_chunks / total_chunks * 100), 2) if total_chunks > 0 else 0
    }

    # Add timestamps if available
    if "embedding_started_at" in meta:
        response["started_at"] = meta["embedding_started_at"]

    if "embedding_generated_at" in meta:
        response["completed_at"] = meta["embedding_generated_at"]

    if "embedding_error" in meta:
        response["error_message"] = meta["embedding_error"]

    if "embedding_completed_at" in meta and embedding_status == "failed":
        response["failed_at"] = meta["embedding_completed_at"]

    return response
