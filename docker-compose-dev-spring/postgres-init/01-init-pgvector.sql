-- PostgreSQL pgvector 확장 설치 및 RAG 스키마 초기화
-- ICT-377: PostgreSQL pgvector 확장 설치 및 벡터 스키마 구축

-- pgvector 확장 생성
CREATE EXTENSION IF NOT EXISTS vector;

-- RAG 문서 메타데이터 테이블
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    file_name VARCHAR(512) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255),
    minio_bucket VARCHAR(255) NOT NULL,
    minio_object_key TEXT NOT NULL,
    analysis_status VARCHAR(50) DEFAULT 'pending',
    analysis_date TIMESTAMP WITH TIME ZONE,
    total_chunks INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 문서 청크 및 벡터 임베딩 테이블
CREATE TABLE IF NOT EXISTS rag_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB,
    embedding vector(768),  -- sentence-transformers/paraphrase-multilingual-mpnet-base-v2 차원
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_document_chunk UNIQUE (document_id, chunk_index)
);

-- 벡터 유사도 검색을 위한 HNSW 인덱스 생성
-- HNSW (Hierarchical Navigable Small World): 빠른 근사 최근접 이웃 검색
CREATE INDEX IF NOT EXISTS idx_rag_embeddings_vector
ON rag_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 문서 조회 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_rag_documents_project_id ON rag_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_upload_date ON rag_documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_rag_documents_analysis_status ON rag_documents(analysis_status);

-- 임베딩 조회 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_rag_embeddings_document_id ON rag_embeddings(document_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_rag_documents_updated_at BEFORE UPDATE ON rag_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 공통 RAG 문서 이동/요청 기록 테이블
CREATE TABLE IF NOT EXISTS rag_global_document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    document_name VARCHAR(512) NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    request_message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    processed_by VARCHAR(100),
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_rag_global_doc_req_status CHECK (status IN ('PENDING','APPROVED','REJECTED','FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_rag_global_doc_req_status ON rag_global_document_requests(status);
CREATE INDEX IF NOT EXISTS idx_rag_global_doc_req_document ON rag_global_document_requests(document_id);

-- 유사도 검색 함수 (코사인 유사도)
CREATE OR REPLACE FUNCTION search_similar_chunks(
    query_embedding vector(768),
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    embedding_id UUID,
    document_id UUID,
    chunk_index INTEGER,
    chunk_text TEXT,
    chunk_metadata JSONB,
    similarity_score FLOAT,
    file_name VARCHAR,
    project_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS embedding_id,
        e.document_id,
        e.chunk_index,
        e.chunk_text,
        e.chunk_metadata,
        1 - (e.embedding <=> query_embedding) AS similarity_score,
        d.file_name,
        d.project_id
    FROM rag_embeddings e
    JOIN rag_documents d ON e.document_id = d.id
    WHERE 1 - (e.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 테이블 설명 추가
COMMENT ON TABLE rag_documents IS 'RAG 시스템 문서 메타데이터';
COMMENT ON TABLE rag_embeddings IS 'RAG 시스템 텍스트 청크 및 벡터 임베딩';
COMMENT ON COLUMN rag_embeddings.embedding IS '768차원 벡터 임베딩 (paraphrase-multilingual-mpnet-base-v2)';
COMMENT ON INDEX idx_rag_embeddings_vector IS 'HNSW 인덱스: 빠른 벡터 유사도 검색';
COMMENT ON FUNCTION search_similar_chunks IS '코사인 유사도 기반 유사 청크 검색 함수';

-- 초기 데이터 확인
SELECT 'pgvector extension installed successfully' AS status;
SELECT version() AS postgres_version;
SELECT extversion AS pgvector_version FROM pg_extension WHERE extname = 'vector';
