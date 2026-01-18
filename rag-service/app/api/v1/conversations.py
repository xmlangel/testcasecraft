"""Conversation message API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from ...core.database import get_db
from ...schemas.conversation import ConversationMessageCreate, ConversationMessageResponse
from ...models.rag_conversation_message import RAGConversationMessage
from ...services.embedding_service import get_embedding_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/messages", response_model=ConversationMessageResponse, status_code=status.HTTP_200_OK)
async def upsert_conversation_message(
    request: ConversationMessageCreate,
    db: Session = Depends(get_db)
):
    """Create or update a conversation message and generate its embedding"""
    try:
        embedding_service = get_embedding_service()
        embedding = embedding_service.generate_embedding(request.combined_text)

        existing = db.query(RAGConversationMessage).filter(
            RAGConversationMessage.message_id == request.message_id
        ).first()

        metadata = request.metadata or {}

        if existing:
            existing.project_id = request.project_id
            existing.thread_id = request.thread_id
            existing.role = request.role
            existing.question = request.question
            existing.answer = request.answer
            existing.combined_text = request.combined_text
            existing.metadata_json = metadata
            existing.embedding = embedding
            db.commit()
            logger.info("Updated conversation message embedding: message_id=%s", request.message_id)
        else:
            message = RAGConversationMessage(
                message_id=request.message_id,
                project_id=request.project_id,
                thread_id=request.thread_id,
                role=request.role,
                question=request.question,
                answer=request.answer,
                combined_text=request.combined_text,
                metadata_json=metadata,
                embedding=embedding
            )
            db.add(message)
            db.commit()
            logger.info("Indexed new conversation message: message_id=%s", request.message_id)

        return ConversationMessageResponse(message_id=request.message_id, status="indexed")

    except Exception as exc:
        db.rollback()
        logger.error("Failed to upsert conversation message: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversation message indexing failed: {exc}"
        ) from exc


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation_message(
    message_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a conversation message"""
    try:
        message = db.query(RAGConversationMessage).filter(
            RAGConversationMessage.message_id == message_id
        ).first()

        if not message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation message not found")

        db.delete(message)
        db.commit()
        logger.info("Deleted conversation message: message_id=%s", message_id)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error("Failed to delete conversation message %s: %s", message_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversation message deletion failed: {exc}"
        ) from exc
