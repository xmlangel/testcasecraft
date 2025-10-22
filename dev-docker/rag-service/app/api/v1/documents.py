"""Document API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID, uuid4
import os
from datetime import datetime

from ...core.database import get_db
from ...models.rag_document import RAGDocument
from ...schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
    DocumentListResponse,
    DocumentUploadResponse
)
from ...services.minio_service import get_minio_service, MinIOService

router = APIRouter()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    uploaded_by: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    minio_service: MinIOService = Depends(get_minio_service)
):
    """
    Upload a document file to MinIO and save metadata to database

    Accepts PDF, DOCX, DOC, TXT files up to 50MB
    """
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file to check size
    file_content = await file.read()
    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )

    # Reset file pointer
    await file.seek(0)

    # Generate unique object key
    document_id = uuid4()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    object_key = f"{project_id}/{timestamp}_{document_id}{file_ext}"

    # Upload to MinIO
    upload_result = await minio_service.upload_file(
        file=file,
        object_key=object_key,
        content_type=file.content_type
    )

    # Save metadata to database
    db_document = RAGDocument(
        id=document_id,
        project_id=UUID(project_id),
        file_name=file.filename,
        file_path=object_key,
        file_type=file_ext,
        file_size=file_size,
        uploaded_by=uploaded_by,
        minio_bucket=upload_result["bucket"],
        minio_object_key=upload_result["object_key"],
        analysis_status="pending"
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return DocumentUploadResponse(
        id=db_document.id,
        file_name=db_document.file_name,
        file_size=db_document.file_size,
        file_type=db_document.file_type,
        minio_bucket=db_document.minio_bucket,
        minio_object_key=db_document.minio_object_key,
        upload_date=db_document.upload_date,
        analysis_status=db_document.analysis_status,
        message="Document uploaded successfully"
    )


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db)
):
    """Create a new document"""
    db_document = RAGDocument(**document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a document by ID"""
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    minio_service: MinIOService = Depends(get_minio_service)
):
    """
    Download a document file from MinIO

    Returns the file as a streaming response
    """
    # Get document metadata from database
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Download file from MinIO
    file_stream = minio_service.download_file(document.minio_object_key)

    # Determine media type
    media_type_map = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain'
    }
    media_type = media_type_map.get(document.file_type, 'application/octet-stream')

    # Return as streaming response
    return StreamingResponse(
        file_stream,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename=\"{document.file_name}\""
        }
    )


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    project_id: Optional[UUID] = Query(None, description="Filter by project ID"),
    analysis_status: Optional[str] = Query(None, description="Filter by analysis status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """List documents with pagination"""
    query = db.query(RAGDocument)

    if project_id:
        query = query.filter(RAGDocument.project_id == project_id)
    if analysis_status:
        query = query.filter(RAGDocument.analysis_status == analysis_status)

    total = query.count()
    documents = query.offset(skip).limit(limit).all()

    return DocumentListResponse(
        total=total,
        page=skip // limit + 1,
        page_size=limit,
        documents=documents
    )


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update a document"""
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = document_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    minio_service: MinIOService = Depends(get_minio_service)
):
    """
    Delete a document from both database and MinIO storage

    Deletes the document metadata from the database and the file from MinIO
    """
    # Get document from database
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from MinIO
    minio_service.delete_file(document.minio_object_key)

    # Delete document metadata from database
    db.delete(document)
    db.commit()

    return None
