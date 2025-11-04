"""Conversation schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID


class ConversationMessageCreate(BaseModel):
    """Schema for creating/updating a conversation message"""
    message_id: UUID = Field(..., description="Unique message ID from backend")
    project_id: UUID = Field(..., description="Project ID")
    thread_id: UUID = Field(..., description="Conversation thread ID")
    role: str = Field(..., description="Message role (assistant, user)")
    question: Optional[str] = Field(None, description="User question text")
    answer: str = Field(..., description="Assistant answer text")
    combined_text: str = Field(..., description="Text used for embedding")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class ConversationMessageResponse(BaseModel):
    """Schema for conversation message response"""
    message_id: UUID = Field(..., description="Message ID")
    status: str = Field(..., description="Indexing status")

    model_config = ConfigDict(from_attributes=True)
