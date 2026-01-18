"""Document schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class DocumentBase(BaseModel):
    """Base document schema
    기본 문서 스키마"""
    project_id: UUID = Field(..., description="Project ID\n프로젝트 ID")
    file_name: str = Field(..., max_length=512, description="File name\n파일명")
    file_path: str = Field(..., description="File path\n파일 경로")
    file_type: str = Field(..., max_length=50, description="File type (extension)\n파일 타입 (확장자)")
    file_size: int = Field(..., gt=0, description="File size in bytes\n파일 크기 (바이트)")
    uploaded_by: Optional[str] = Field(None, max_length=255, description="Uploader username\n업로더 사용자명")
    minio_bucket: str = Field(..., max_length=255, description="MinIO bucket name\nMinIO 버킷 이름")
    minio_object_key: str = Field(..., description="MinIO object key\nMinIO 객체 키")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata\n추가 메타데이터")


class DocumentCreate(DocumentBase):
    """Schema for creating a document
    문서 생성 스키마"""
    pass


class DocumentUpdate(BaseModel):
    """Schema for updating a document
    문서 업데이트 스키마"""
    analysis_status: Optional[str] = Field(None, max_length=50, description="Analysis status\n분석 상태")
    total_chunks: Optional[int] = Field(None, ge=0, description="Total number of chunks\n전체 청크 수")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata\n추가 메타데이터")

    model_config = ConfigDict(extra='forbid')


class MoveDocumentRequest(BaseModel):
    """Schema for moving a document to another project
    문서를 다른 프로젝트로 이동시키는 요청 스키마"""
    target_project_id: UUID = Field(..., description="Target project ID\n대상 프로젝트 ID")
    requested_by: Optional[str] = Field(None, description="Requester username\n요청자")
    reason: Optional[str] = Field(None, description="Move reason\n이동 사유")

    model_config = ConfigDict(extra='forbid')


class DocumentResponse(BaseModel):
    """Schema for document response
    문서 응답 스키마"""
    id: UUID = Field(..., description="Document ID\n문서 ID")
    project_id: UUID = Field(..., description="Project ID\n프로젝트 ID")
    file_name: str = Field(..., description="File name\n파일명")
    file_path: str = Field(..., description="File path\n파일 경로")
    file_type: str = Field(..., description="File type\n파일 타입")
    file_size: int = Field(..., description="File size in bytes\n파일 크기 (바이트)")
    uploaded_by: Optional[str] = Field(None, description="Uploader username\n업로더 사용자명")
    minio_bucket: str = Field(..., description="MinIO bucket name\nMinIO 버킷 이름")
    minio_object_key: str = Field(..., description="MinIO object key\nMinIO 객체 키")
    upload_date: datetime = Field(..., description="Upload date\n업로드 날짜")
    analysis_status: str = Field(..., description="Analysis status\n분석 상태")
    analysis_date: Optional[datetime] = Field(None, description="Analysis completion date\n분석 완료 날짜")
    total_chunks: int = Field(..., description="Total number of chunks\n전체 청크 수")
    meta_data: Optional[Dict[str, Any]] = Field(None, description="Metadata\n메타데이터")
    created_at: datetime = Field(..., description="Creation timestamp\n생성 시각")
    updated_at: datetime = Field(..., description="Last update timestamp\n마지막 업데이트 시각")

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    """Schema for paginated document list response
    페이징된 문서 목록 응답 스키마"""
    total: int = Field(..., description="Total number of documents\n전체 문서 수")
    page: int = Field(..., description="Current page number\n현재 페이지 번호")
    page_size: int = Field(..., description="Number of documents per page\n페이지당 문서 수")
    documents: List[DocumentResponse] = Field(..., description="List of documents\n문서 목록")


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response
    문서 업로드 응답 스키마"""
    id: UUID = Field(..., description="Document ID\n문서 ID")
    file_name: str = Field(..., description="File name\n파일명")
    file_size: int = Field(..., description="File size in bytes\n파일 크기 (바이트)")
    file_type: str = Field(..., description="File type\n파일 타입")
    minio_bucket: str = Field(..., description="MinIO bucket name\nMinIO 버킷 이름")
    minio_object_key: str = Field(..., description="MinIO object key\nMinIO 객체 키")
    upload_date: datetime = Field(..., description="Upload date\n업로드 날짜")
    analysis_status: str = Field(..., description="Analysis status\n분석 상태")
    message: str = Field("Document uploaded successfully", description="Status message\n상태 메시지")

    model_config = ConfigDict(from_attributes=True)


class ChunkResponse(BaseModel):
    """Schema for text chunk response
    텍스트 청크 응답 스키마"""
    id: UUID = Field(..., description="Chunk ID\n청크 ID")
    document_id: UUID = Field(..., description="Document ID\n문서 ID")
    chunk_index: int = Field(..., description="Chunk index\n청크 인덱스")
    chunk_text: str = Field(..., description="Chunk text content\n청크 텍스트 내용")
    chunk_metadata: Optional[Dict[str, Any]] = Field(None, description="Chunk metadata\n청크 메타데이터")
    created_at: datetime = Field(..., description="Creation timestamp\n생성 시각")

    model_config = ConfigDict(from_attributes=True)


class ChunkListResponse(BaseModel):
    """Schema for paginated chunk list response
    페이징된 청크 목록 응답 스키마"""
    total: int = Field(..., description="Total number of chunks\n전체 청크 수")
    document_id: UUID = Field(..., description="Document ID\n문서 ID")
    chunks: List[ChunkResponse] = Field(..., description="List of chunks\n청크 목록")


class DocumentAnalysisResponse(BaseModel):
    """Schema for document analysis response
    문서 분석 응답 스키마"""
    document_id: UUID = Field(..., description="Document ID\n문서 ID")
    status: str = Field(..., description="Analysis status\n분석 상태")
    total_chunks: int = Field(..., description="Total number of chunks created\n생성된 전체 청크 수")
    analysis_result: Optional[Dict[str, Any]] = Field(None, description="Analysis results\n분석 결과")
    message: str = Field("Document analysis completed", description="Status message\n상태 메시지")
