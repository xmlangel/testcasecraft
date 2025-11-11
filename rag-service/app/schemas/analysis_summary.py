"""Analysis Summary schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class AnalysisSummaryBase(BaseModel):
    """Base analysis summary schema"""
    title: str = Field(..., max_length=255, description="Summary title")
    summary_content: str = Field(..., description="Summary content")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags")
    is_public: bool = Field(False, description="Public visibility")


class AnalysisSummaryCreate(AnalysisSummaryBase):
    """Schema for creating an analysis summary"""
    document_id: UUID = Field(..., description="Document ID")
    job_id: Optional[UUID] = Field(None, description="LLM Analysis Job ID (optional)")
    user_id: Optional[UUID] = Field(None, description="User ID (optional)")

    model_config = ConfigDict(extra='forbid')


class AnalysisSummaryUpdate(BaseModel):
    """Schema for updating an analysis summary"""
    title: Optional[str] = Field(None, max_length=255, description="Summary title")
    summary_content: Optional[str] = Field(None, description="Summary content")
    tags: Optional[List[str]] = Field(None, description="Tags")
    is_public: Optional[bool] = Field(None, description="Public visibility")

    model_config = ConfigDict(extra='forbid')


class AnalysisSummaryResponse(BaseModel):
    """Schema for analysis summary response"""
    id: UUID = Field(..., description="Summary ID")
    document_id: UUID = Field(..., description="Document ID")
    job_id: Optional[UUID] = Field(None, description="LLM Analysis Job ID")
    user_id: Optional[UUID] = Field(None, description="User ID")
    title: str = Field(..., description="Summary title")
    summary_content: str = Field(..., description="Summary content")
    tags: List[str] = Field(default_factory=list, description="Tags")
    is_public: bool = Field(..., description="Public visibility")
    created_at: datetime = Field(..., description="Created timestamp")
    updated_at: datetime = Field(..., description="Updated timestamp")

    model_config = ConfigDict(from_attributes=True)


class AnalysisSummaryListItem(BaseModel):
    """Schema for summary list item (minimal)"""
    id: UUID = Field(..., description="Summary ID")
    document_id: UUID = Field(..., description="Document ID")
    title: str = Field(..., description="Summary title")
    tags: List[str] = Field(default_factory=list, description="Tags")
    is_public: bool = Field(..., description="Public visibility")
    created_at: datetime = Field(..., description="Created timestamp")
    updated_at: datetime = Field(..., description="Updated timestamp")

    model_config = ConfigDict(from_attributes=True)


class AnalysisSummaryListResponse(BaseModel):
    """Schema for summary list response"""
    summaries: List[AnalysisSummaryListItem] = Field(default_factory=list, description="Summary list")
    total: int = Field(..., description="Total summary count")
    skip: int = Field(..., description="Skip offset")
    limit: int = Field(..., description="Result limit")


class AnalysisSummaryDeleteResponse(BaseModel):
    """Schema for summary delete response"""
    message: str = Field(..., description="Status message")
    deleted_id: UUID = Field(..., description="Deleted summary ID")
