"""Document API endpoints"""
import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID, uuid4
import os
from datetime import datetime

from ...core.database import get_db, SessionLocal
from ...models.rag_document import RAGDocument
from ...models.rag_embedding import RAGEmbedding
from ...schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
    DocumentListResponse,
    DocumentUploadResponse,
    DocumentAnalysisResponse,
    ChunkResponse,
    ChunkListResponse,
    MoveDocumentRequest
)
from ...services.minio_service import get_minio_service, MinIOService
from ...services.upstage_service import UpstageService

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


async def _run_document_analysis(
    document_id: UUID,
    parser: Optional[str],
    upstage_api_key: Optional[str]
) -> None:
    """
    Background task to process document analysis and chunk creation.
    문서 분석과 청크 생성을 비동기로 처리하는 백그라운드 작업
    """
    minio_service = get_minio_service()
    document_info: Optional[dict] = None
    file_stream = None
    file_content: bytes = b""

    # Step 1: Fetch document metadata in a short-lived session
    meta_db = SessionLocal()
    try:
        document_record = meta_db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
        if not document_record:
            logger.warning("Document %s not found during async analysis", document_id)
            return

        document_info = {
            "file_name": document_record.file_name,
            "object_key": document_record.minio_object_key
        }
    finally:
        meta_db.close()

    if document_info is None:
        logger.warning("Document metadata missing for %s during async analysis", document_id)
        return

    try:
        try:
            # Download original file
            file_stream = minio_service.download_file(document_info["object_key"])
            file_content = file_stream.read()
        finally:
            if file_stream and hasattr(file_stream, "close"):
                try:
                    file_stream.close()
                except Exception:
                    pass
                file_stream = None

        # Run analysis and chunking outside of any active DB session
        upstage_service = UpstageService(parser=parser, api_key=upstage_api_key)
        result = await upstage_service.analyze_and_chunk(file_content, document_info["file_name"])

        # Step 3: Persist results using a fresh session (short transaction)
        persist_db = SessionLocal()
        try:
            # Remove existing chunks first
            persist_db.query(RAGEmbedding).filter(RAGEmbedding.document_id == document_id).delete()

            # Insert new chunks in bulk to minimize transaction time
            chunk_entities = [
                RAGEmbedding(
                    document_id=document_id,
                    chunk_index=chunk["index"],
                    chunk_text=chunk["text"],
                    chunk_metadata=chunk["metadata"]
                )
                for chunk in result["chunks"]
            ]
            if chunk_entities:
                persist_db.bulk_save_objects(chunk_entities)

            # Update document metadata
            document_query = persist_db.query(RAGDocument).filter(RAGDocument.id == document_id)
            document_to_update = document_query.first()
            if document_to_update:
                existing_meta = document_to_update.meta_data or {}
                parser_meta = result.get("analysis", {}).get("metadata") or {}
                merged_meta = {**existing_meta, **parser_meta}
                if "embedding_status" not in merged_meta:
                    merged_meta["embedding_status"] = "pending"
                if "embedding_chunks" not in merged_meta:
                    merged_meta["embedding_chunks"] = result["total_chunks"]

                document_query.update(
                    {
                        "analysis_status": "completed",
                        "analysis_date": datetime.utcnow(),
                        "total_chunks": result["total_chunks"],
                        "meta_data": merged_meta
                    },
                    synchronize_session=False
                )

            persist_db.commit()
            logger.info(
                "Document %s analysis completed asynchronously (%s chunks)",
                document_id,
                result["total_chunks"]
            )
        finally:
            persist_db.close()

    except Exception as exc:
        logger.exception("Document %s analysis failed asynchronously: %s", document_id, exc)

        # Update status to failed using a separate short-lived session
        fail_db = SessionLocal()
        try:
            document_query = fail_db.query(RAGDocument).filter(RAGDocument.id == document_id)
            document_to_fail = document_query.first()
            if document_to_fail:
                document_query.update(
                    {
                        "analysis_status": "failed",
                        "analysis_date": datetime.utcnow(),
                        "total_chunks": 0,
                        "meta_data": {
                            "embedding_status": "failed",
                            "embedding_error": "analysis_failed"
                        }
                    },
                    synchronize_session=False
                )
                fail_db.commit()
        except Exception as status_exc:
            logger.exception("Failed to persist failure status for document %s: %s", document_id, status_exc)
        finally:
            fail_db.close()


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    project_id: str = Form(...),  # 글로벌 문서는 특정 GUID 사용 (00000000-0000-0000-0000-000000000000)
    uploaded_by: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    minio_service: MinIOService = Depends(get_minio_service)
):
    """
    Upload a document file to MinIO and save metadata to database
    MinIO에 문서 파일을 업로드하고 메타데이터를 데이터베이스에 저장

    Accepts PDF, DOCX, DOC, TXT files up to 50MB
    PDF, DOCX, DOC, TXT 파일 최대 50MB까지 허용
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
        analysis_status="pending",
        meta_data={
            "embedding_status": "pending",
            "embedding_chunks": 0
        }
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
    """
    Create a new document
    새 문서 생성
    """
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
    """
    Get a document by ID
    ID로 문서 조회
    """
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
    MinIO에서 문서 파일 다운로드

    Returns the file as a streaming response
    스트리밍 응답으로 파일 반환
    """
    from urllib.parse import quote

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

    # RFC 2231 형식으로 파일명 인코딩 (한글 지원)
    encoded_filename = quote(document.file_name)

    # Return as streaming response
    return StreamingResponse(
        file_stream,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
    )


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    project_id: Optional[UUID] = Query(None, description="Filter by project ID\n프로젝트 ID로 필터링"),
    analysis_status: Optional[str] = Query(None, description="Filter by analysis status\n분석 상태로 필터링"),
    skip: Optional[int] = Query(None, ge=0, description="Number of records to skip\n건너뛸 레코드 수"),
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Number of records to return (max 1000)\n반환할 레코드 수 (최대 1000)"),
    page: Optional[int] = Query(None, ge=1, description="Page number (alternative to skip)\n페이지 번호 (skip 대안)"),
    page_size: Optional[int] = Query(None, ge=1, le=1000, description="Page size (alternative to limit)\n페이지 크기 (limit 대안)"),
    db: Session = Depends(get_db)
):
    """
    List documents with pagination
    페이징된 문서 목록 조회

    Supports two pagination styles:
    1. skip/limit (offset-based)
    2. page/page_size (page-based)

    If both are provided, page/page_size takes precedence.
    """
    # ICT-388: page/page_size 파라미터 지원 (Spring Boot 호환성)
    if page is not None and page_size is not None:
        # page-based pagination
        actual_skip = (page - 1) * page_size
        actual_limit = page_size
    else:
        # offset-based pagination (기본값)
        actual_skip = skip if skip is not None else 0
        actual_limit = limit if limit is not None else 10

    query = db.query(RAGDocument)

    if project_id:
        query = query.filter(RAGDocument.project_id == project_id)
    if analysis_status:
        query = query.filter(RAGDocument.analysis_status == analysis_status)

    total = query.count()
    documents = query.offset(actual_skip).limit(actual_limit).all()

    return DocumentListResponse(
        total=total,
        page=actual_skip // actual_limit + 1 if actual_limit > 0 else 1,
        page_size=actual_limit,
        documents=documents
    )


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a document
    문서 업데이트
    """
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = document_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)
    return document


@router.post("/{document_id}/move-to-project", response_model=DocumentResponse)
async def move_document_to_project(
    document_id: UUID,
    request: MoveDocumentRequest,
    db: Session = Depends(get_db)
):
    """
    Move a document to another project (e.g., global knowledge base)
    문서를 다른 프로젝트(예: 글로벌 지식 베이스)로 이동
    """
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.project_id == request.target_project_id:
        raise HTTPException(status_code=400, detail="Document already belongs to the target project")

    metadata = document.meta_data or {}
    move_history = metadata.get("move_history", [])
    move_history.append({
        "from_project": str(document.project_id),
        "to_project": str(request.target_project_id),
        "requested_by": request.requested_by,
        "reason": request.reason,
        "moved_at": datetime.utcnow().isoformat()
    })
    metadata["move_history"] = move_history

    document.project_id = request.target_project_id
    document.meta_data = metadata
    document.updated_at = datetime.utcnow()

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
    데이터베이스와 MinIO 스토리지에서 문서 삭제

    Deletes the document metadata from the database and the file from MinIO
    데이터베이스에서 문서 메타데이터를 삭제하고 MinIO에서 파일을 삭제
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


@router.post("/{document_id}/analyze", response_model=DocumentAnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_document(
    document_id: UUID,
    parser: str = Query(None, description="Parser to use: upstage, pymupdf, pymupdf4llm, pypdf2, auto (default: use environment variable)\n사용할 파서: upstage, pymupdf, pymupdf4llm, pypdf2, auto (기본값: 환경변수 사용)"),
    upstage_api_key: str = Query(None, description="Upstage API key (required only for upstage parser)\nUpstage API 키 (upstage 파서 사용 시 필수)"),
    db: Session = Depends(get_db)
):
    """
    Analyze document using specified parser
    지정된 파서를 사용하여 문서 분석

    Available parsers:
    사용 가능한 파서:
    - upstage: Cloud API with advanced layout analysis (requires upstage_api_key)
              고급 레이아웃 분석이 가능한 클라우드 API (upstage_api_key 필요)
    - pymupdf: Fast local parser with rich features
              다양한 기능을 갖춘 빠른 로컬 파서
    - pymupdf4llm: LLM-optimized markdown extraction
                  LLM 최적화 마크다운 추출
    - pypdf2: Basic local parser
             기본 로컬 파서
    - auto: Auto-select best available parser (default)
           최적의 파서 자동 선택 (기본값)

    Extracts text, creates chunks, and stores them in the database asynchronously.
    텍스트를 추출하고 청크를 생성하여 비동기로 데이터베이스에 저장합니다.

    This endpoint returns immediately with status "analyzing" while processing continues.
    이 엔드포인트는 처리가 비동기로 진행되는 동안 즉시 \"analyzing\" 상태를 반환합니다.
    """
    # Get document from database
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check if already analyzed
    if document.analysis_status == "completed":
        raise HTTPException(status_code=400, detail="Document already analyzed")
    if document.analysis_status == "analyzing":
        raise HTTPException(status_code=400, detail="Document analysis already in progress")

    # Validate parser parameter
    valid_parsers = ["upstage", "pymupdf", "pymupdf4llm", "pypdf2", "auto"]
    if parser and parser not in valid_parsers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid parser. Must be one of: {', '.join(valid_parsers)}"
        )

    # Validate upstage_api_key if upstage parser is selected
    if parser == "upstage" and not upstage_api_key:
        raise HTTPException(
            status_code=400,
            detail="upstage_api_key is required when using upstage parser"
        )

    # Update status to analyzing
    document.analysis_status = "analyzing"
    document.analysis_date = None
    document.total_chunks = 0
    document.meta_data = None
    db.commit()

    # Kick off asynchronous analysis task
    asyncio.create_task(_run_document_analysis(document_id, parser, upstage_api_key))

    return DocumentAnalysisResponse(
        document_id=document_id,
        status="analyzing",
        total_chunks=0,
        analysis_result=None,
        message="Document analysis started"
    )


@router.get("/{document_id}/chunks", response_model=ChunkListResponse)
async def get_document_chunks(
    document_id: UUID,
    skip: int = Query(0, ge=0, description="Number of chunks to skip (offset)\n건너뛸 청크 수 (오프셋)"),
    limit: int = Query(50, ge=1, le=100, description="Number of chunks to return (page size)\n반환할 청크 수 (페이지 크기)"),
    db: Session = Depends(get_db)
):
    """
    Get paginated text chunks for a document
    문서의 페이징된 텍스트 청크 조회

    Supports pagination with skip and limit parameters for efficient loading
    효율적인 로딩을 위해 skip과 limit 파라미터로 페이지네이션 지원

    Parameters:
    - skip: Number of chunks to skip (default: 0)
    - limit: Number of chunks to return (default: 50, max: 100)

    Returns paginated chunks created from the document analysis
    문서 분석으로 생성된 페이징된 청크 반환
    """
    # Verify document exists
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get total count
    total = db.query(RAGEmbedding).filter(
        RAGEmbedding.document_id == document_id
    ).count()

    # Get paginated chunks
    chunks = db.query(RAGEmbedding).filter(
        RAGEmbedding.document_id == document_id
    ).order_by(RAGEmbedding.chunk_index).offset(skip).limit(limit).all()

    return ChunkListResponse(
        total=total,
        document_id=document_id,
        chunks=chunks
    )
