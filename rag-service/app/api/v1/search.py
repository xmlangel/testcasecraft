"""Search API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import logging
import numpy as np

from ...core.database import get_db
from ...schemas.search import (
    SearchRequest, SearchResponse, SearchResult,
    AdvancedSearchRequest, SearchMethod
)
from ...models.rag_embedding import RAGEmbedding
from ...models.rag_document import RAGDocument
from ...models.rag_conversation_message import RAGConversationMessage
from ...services.embedding_service import get_embedding_service
from ...services.hybrid_search_service import get_hybrid_search_service
from ...services.reranker_service import get_reranker_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Common project ID for documents accessible from all projects
# 모든 프로젝트에서 접근 가능한 공통 문서용 프로젝트 ID
COMMON_PROJECT_ID = "00000000-0000-0000-0000-000000000000"


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
        # Include both the requested project and common project documents
        # 요청한 프로젝트와 공통 프로젝트 문서 모두 포함
        if request.project_id:
            query = query.filter(
                or_(
                    RAGDocument.project_id == request.project_id,
                    RAGDocument.project_id == COMMON_PROJECT_ID
                )
            )

        # Get all embeddings
        embeddings_with_docs = query.all()

        # Fetch conversation messages with embeddings
        conversation_query = db.query(RAGConversationMessage).filter(
            RAGConversationMessage.embedding.isnot(None)
        )

        # Include both the requested project and common project conversations
        # 요청한 프로젝트와 공통 프로젝트 대화 모두 포함
        if request.project_id:
            conversation_query = conversation_query.filter(
                or_(
                    RAGConversationMessage.project_id == request.project_id,
                    RAGConversationMessage.project_id == COMMON_PROJECT_ID
                )
            )

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
                metadata = conversation.metadata_json.copy() if conversation.metadata_json else {}
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


@router.post("/advanced", response_model=SearchResponse, status_code=status.HTTP_200_OK)
async def advanced_search(
    request: AdvancedSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Advanced search with multiple methods (vector, BM25, hybrid, reranker)
    다양한 방법을 사용한 고급 검색 (벡터, BM25, 하이브리드, reranker)

    Search Methods:
    - vector: Pure vector similarity search
    - bm25: Pure keyword-based BM25 search
    - hybrid: Hybrid search combining vector + BM25 with RRF
    - hybrid_rerank: Hybrid search + Reranker for final ranking

    검색 방법:
    - vector: 순수 벡터 유사도 검색
    - bm25: 순수 키워드 기반 BM25 검색
    - hybrid: 벡터 + BM25를 RRF로 결합한 하이브리드 검색
    - hybrid_rerank: 하이브리드 검색 + Reranker로 최종 순위 결정

    Args:
        request: Advanced search request with method selection
        db: Database session

    Returns:
        Search results with scores for each method
    """
    try:
        # Generate embedding for query
        logger.info(f"Advanced search - Method: {request.search_method}, Query: {request.query_text[:100]}...")
        embedding_service = get_embedding_service()
        query_embedding = embedding_service.generate_embedding(request.query_text)

        # Fetch embeddings from database
        query = db.query(RAGEmbedding, RAGDocument).join(
            RAGDocument, RAGEmbedding.document_id == RAGDocument.id
        ).filter(
            RAGEmbedding.embedding.isnot(None)
        )

        if request.project_id:
            query = query.filter(RAGDocument.project_id == request.project_id)

        embeddings_with_docs = query.all()

        # Fetch conversation messages
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

        # Prepare document list for search
        documents = []

        # Add document chunks
        for embedding, document in embeddings_with_docs:
            similarity_score = compute_cosine_similarity(query_embedding, embedding.embedding)

            source_type = 'testcase' if document.file_type == 'testcase' else 'document'

            documents.append({
                "id": str(embedding.id),
                "text": embedding.chunk_text,
                "score": similarity_score,
                "embedding_id": embedding.id,
                "document_id": document.id,
                "file_name": document.file_name,
                "project_id": document.project_id,
                "chunk_index": embedding.chunk_index,
                "chunk_metadata": embedding.chunk_metadata,
                "source_type": source_type
            })

        # Add conversation chunks
        for conversation in conversation_messages:
            similarity_score = compute_cosine_similarity(query_embedding, conversation.embedding)

            metadata = conversation.metadata_json.copy() if conversation.metadata_json else {}
            metadata.update({
                "threadId": str(conversation.thread_id),
                "messageId": str(conversation.message_id),
                "role": conversation.role,
                "question": conversation.question,
            })

            documents.append({
                "id": str(conversation.message_id),
                "text": conversation.answer or conversation.combined_text,
                "score": similarity_score,
                "embedding_id": conversation.message_id,
                "document_id": conversation.message_id,
                "file_name": metadata.get("threadTitle", "Conversation Thread"),
                "project_id": conversation.project_id,
                "chunk_index": 0,
                "chunk_metadata": metadata,
                "source_type": "conversation"
            })

        # Apply search method
        if request.search_method == SearchMethod.VECTOR:
            # Pure vector search (already computed)
            results = sorted(documents, key=lambda x: x["score"], reverse=True)
            results = [doc for doc in results if doc["score"] >= request.similarity_threshold]
            results = results[:request.max_results]

        elif request.search_method == SearchMethod.BM25:
            # Pure BM25 search
            hybrid_service = get_hybrid_search_service()
            hybrid_service.build_bm25_index(documents, text_field="text", use_korean_tokenizer=True)
            results = hybrid_service.search_bm25(
                request.query_text,
                top_k=request.max_results,
                use_korean_tokenizer=True
            )

        elif request.search_method == SearchMethod.HYBRID:
            # Hybrid search (Vector + BM25 with RRF)
            hybrid_service = get_hybrid_search_service()
            results = hybrid_service.hybrid_search(
                query=request.query_text,
                documents=documents,
                top_k=request.max_results,
                vector_weight=request.vector_weight,
                bm25_weight=request.bm25_weight,
                use_korean_tokenizer=True
            )

        elif request.search_method == SearchMethod.HYBRID_RERANK:
            # Hybrid + Reranker
            hybrid_service = get_hybrid_search_service()

            # First, get hybrid results (more candidates)
            hybrid_results = hybrid_service.hybrid_search(
                query=request.query_text,
                documents=documents,
                top_k=request.max_results * 2,  # Get 2x candidates for reranking
                vector_weight=request.vector_weight,
                bm25_weight=request.bm25_weight,
                use_korean_tokenizer=True
            )

            # Then, apply reranker
            if request.use_reranker and hybrid_results:
                reranker_service = get_reranker_service()
                reranker_top_k = request.reranker_top_k or request.max_results
                results = reranker_service.rerank(
                    query=request.query_text,
                    documents=hybrid_results,
                    top_k=reranker_top_k
                )
            else:
                results = hybrid_results[:request.max_results]

        else:
            # Default to vector search
            results = sorted(documents, key=lambda x: x["score"], reverse=True)
            results = [doc for doc in results if doc["score"] >= request.similarity_threshold]
            results = results[:request.max_results]

        # Convert to SearchResult objects
        search_results = []
        for doc in results:
            search_results.append(SearchResult(
                embedding_id=doc["embedding_id"],
                document_id=doc["document_id"],
                file_name=doc["file_name"],
                project_id=doc["project_id"],
                chunk_index=doc["chunk_index"],
                chunk_text=doc["text"],
                chunk_metadata=doc.get("chunk_metadata"),
                similarity_score=doc.get("score", 0.0),
                source_type=doc["source_type"],
                vector_score=doc.get("vector_score"),
                bm25_score=doc.get("bm25_score"),
                reranker_score=doc.get("reranker_score"),
                rrf_score=doc.get("rrf_score"),
                vector_rank=doc.get("vector_rank"),
                bm25_rank=doc.get("bm25_rank")
            ))

        logger.info(
            f"Advanced search completed - Method: {request.search_method}, "
            f"Results: {len(search_results)}"
        )

        return SearchResponse(
            query=request.query_text,
            total_results=len(search_results),
            results=search_results,
            similarity_threshold=request.similarity_threshold,
            max_results=request.max_results
        )

    except Exception as e:
        logger.error(f"Error in advanced search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Advanced search failed: {str(e)}")
