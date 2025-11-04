"""Search API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
import logging
import numpy as np

from ...core.database import get_db
from ...schemas.search import SearchRequest, SearchResponse, SearchResult
from ...models.rag_embedding import RAGEmbedding
from ...models.rag_document import RAGDocument
from ...models.rag_conversation_message import RAGConversationMessage
from ...services.embedding_service import get_embedding_service

router = APIRouter()
logger = logging.getLogger(__name__)


def compute_cosine_similarity(vec1: list, vec2: list) -> float:
    """
    Compute cosine similarity between two vectors

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Cosine similarity score (0-1)
    """
    try:
        v1 = np.array(vec1)
        v2 = np.array(vec2)

        dot_product = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        similarity = dot_product / (norm1 * norm2)

        # Convert from [-1, 1] to [0, 1]
        normalized_similarity = (similarity + 1) / 2

        return float(normalized_similarity)
    except Exception as e:
        logger.error(f"Error computing cosine similarity: {str(e)}")
        return 0.0


@router.post("/similar", response_model=SearchResponse, status_code=status.HTTP_200_OK)
async def search_similar_chunks(
    request: SearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search for similar text chunks using vector similarity
    벡터 유사도를 사용하여 유사한 텍스트 청크 검색

    This endpoint:
    이 엔드포인트는:
    1. Generates embedding for the query text
       쿼리 텍스트에 대한 임베딩을 생성합니다
    2. Computes cosine similarity with all stored embeddings
       저장된 모든 임베딩과 코사인 유사도를 계산합니다
    3. Returns top N most similar chunks above the threshold
       임계값 이상의 상위 N개 유사 청크를 반환합니다

    Args:
    매개변수:
        request: Search request with query text and filters
                쿼리 텍스트 및 필터가 포함된 검색 요청
        db: Database session
            데이터베이스 세션

    Returns:
    반환값:
        Search results with similarity scores
        유사도 점수가 포함된 검색 결과
    """
    try:
        # Generate embedding for query text
        logger.info(f"Generating embedding for query: {request.query_text[:100]}...")
        embedding_service = get_embedding_service()
        query_embedding = embedding_service.generate_embedding(request.query_text)

        # Build query to get all embeddings with documents
        query = db.query(RAGEmbedding, RAGDocument).join(
            RAGDocument, RAGEmbedding.document_id == RAGDocument.id
        ).filter(
            RAGEmbedding.embedding.isnot(None)
        )

        # Filter by project if specified
        if request.project_id:
            query = query.filter(RAGDocument.project_id == request.project_id)

        # Get all embeddings
        embeddings_with_docs = query.all()

        # Fetch conversation messages with embeddings
        conversation_query = db.query(RAGConversationMessage).filter(
            RAGConversationMessage.embedding.isnot(None)
        )

        if request.project_id:
            conversation_query = conversation_query.filter(RAGConversationMessage.project_id == request.project_id)

        conversation_messages = conversation_query.all()

        if not embeddings_with_docs and not conversation_messages:
            logger.warning("No embeddings found in database")
            return SearchResponse(
                query=request.query_text,
                total_results=0,
                results=[],
                similarity_threshold=request.similarity_threshold,
                max_results=request.max_results
            )

        # Compute similarity scores
        results = []
        for embedding, document in embeddings_with_docs:
            similarity_score = compute_cosine_similarity(query_embedding, embedding.embedding)

            # Only include results above threshold
            if similarity_score >= request.similarity_threshold:
                # Determine source type based on file_type
                source_type = 'testcase' if document.file_type == 'testcase' else 'document'

                results.append(SearchResult(
                    embedding_id=embedding.id,
                    document_id=document.id,
                    file_name=document.file_name,
                    project_id=document.project_id,
                    chunk_index=embedding.chunk_index,
                    chunk_text=embedding.chunk_text,
                    chunk_metadata=embedding.chunk_metadata,
                    similarity_score=similarity_score,
                    source_type=source_type
                ))

        # Append conversation message results
        for conversation in conversation_messages:
            similarity_score = compute_cosine_similarity(query_embedding, conversation.embedding)

            if similarity_score >= request.similarity_threshold:
                metadata = conversation.metadata.copy() if conversation.metadata else {}
                metadata.update({
                    "threadId": str(conversation.thread_id),
                    "messageId": str(conversation.message_id),
                    "role": conversation.role,
                    "question": conversation.question,
                })

                results.append(SearchResult(
                    embedding_id=conversation.message_id,
                    document_id=conversation.message_id,
                    file_name=metadata.get("threadTitle", "Conversation Thread"),
                    project_id=conversation.project_id,
                    chunk_index=0,
                    chunk_text=conversation.answer or conversation.combined_text,
                    chunk_metadata=metadata,
                    similarity_score=similarity_score,
                    source_type="conversation"
                ))

        # Sort by similarity score (descending)
        results.sort(key=lambda x: x.similarity_score, reverse=True)

        # Limit to max_results
        results = results[:request.max_results]

        logger.info(f"Found {len(results)} similar chunks above threshold {request.similarity_threshold}")

        return SearchResponse(
            query=request.query_text,
            total_results=len(results),
            results=results,
            similarity_threshold=request.similarity_threshold,
            max_results=request.max_results
        )

    except Exception as e:
        logger.error(f"Error searching for similar chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
