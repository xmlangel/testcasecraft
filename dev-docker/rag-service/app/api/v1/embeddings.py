"""Embedding API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from ...core.database import get_db
from ...models.rag_document import RAGDocument
from ...models.rag_embedding import RAGEmbedding
from ...schemas.embedding import GenerateEmbeddingRequest, GenerateEmbeddingResponse
from ...services.embedding_service import get_embedding_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=GenerateEmbeddingResponse, status_code=status.HTTP_200_OK)
async def generate_embeddings(
    request: GenerateEmbeddingRequest,
    db: Session = Depends(get_db)
):
    """
    Generate embeddings for all chunks of a document
    문서의 모든 청크에 대한 임베딩 생성

    This endpoint:
    이 엔드포인트는:
    1. Retrieves all chunks for the specified document
       지정된 문서의 모든 청크를 검색합니다
    2. Generates 768-dimensional embedding vectors using Sentence Transformers
       Sentence Transformers를 사용하여 768차원 임베딩 벡터를 생성합니다
    3. Updates the database with the generated embeddings
       생성된 임베딩으로 데이터베이스를 업데이트합니다

    Args:
    매개변수:
        request: Document ID to generate embeddings for
                임베딩을 생성할 문서 ID
        db: Database session
            데이터베이스 세션

    Returns:
    반환값:
        Generation status with counts
        생성 상태 및 개수
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

    try:
        # Get embedding service
        embedding_service = get_embedding_service()

        # Extract texts from chunks
        texts = [chunk.chunk_text for chunk in chunks]

        # Generate embeddings in batch
        logger.info(f"Generating embeddings for {len(texts)} chunks (document: {document_id})")
        embeddings = embedding_service.generate_embeddings_batch(texts)

        # Update each chunk with its embedding
        embeddings_generated = 0
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embedding = embedding
            embeddings_generated += 1

        db.commit()

        logger.info(f"Successfully generated {embeddings_generated} embeddings for document {document_id}")

        return GenerateEmbeddingResponse(
            document_id=document_id,
            total_chunks=len(chunks),
            embeddings_generated=embeddings_generated,
            message=f"Successfully generated embeddings for {embeddings_generated} chunks"
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Error generating embeddings for document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")
