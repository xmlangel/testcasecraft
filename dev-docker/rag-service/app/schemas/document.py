"""Document schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class DocumentBase(BaseModel):
    """Base document schema"""
    project_id: UUID
    file_name: str = Field(..., max_length=512)
    file_path: str
    file_type: str = Field(..., max_length=50)
    file_size: int = Field(..., gt=0)
    uploaded_by: Optional[str] = Field(None, max_length=255)
    minio_bucket: str = Field(..., max_length=255)
    minio_object_key: str
    metadata: Optional[Dict[str, Any]] = None


class DocumentCreate(DocumentBase):
    """Schema for creating a document"""
    pass


class DocumentUpdate(BaseModel):
    """Schema for updating a document"""
    analysis_status: Optional[str] = Field(None, max_length=50)
    total_chunks: Optional[int] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra='forbid')


class DocumentResponse(BaseModel):
    """Schema for document response"""
    id: UUID
    project_id: UUID
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: Optional[str] = None
    minio_bucket: str
    minio_object_key: str
    upload_date: datetime
    analysis_status: str
    analysis_date: Optional[datetime] = None
    total_chunks: int
    meta_data: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class DocumentListResponse(BaseModel):
    """Schema for paginated document list response"""
    total: int
    page: int
    page_size: int
    documents: List[DocumentResponse]


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response"""
    id: UUID
    file_name: str
    file_size: int
    file_type: str
    minio_bucket: str
    minio_object_key: str
    upload_date: datetime
    analysis_status: str
    message: str = "Document uploaded successfully"

    model_config = ConfigDict(from_attributes=True)
