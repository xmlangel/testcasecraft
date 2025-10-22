# RAG Service - Docker Development Environment

Docker 기반 RAG (Retrieval-Augmented Generation) 서비스 개발 환경입니다.

## 구성 요소

- **PostgreSQL with pgvector**: 벡터 임베딩 저장 및 유사도 검색
- **FastAPI RAG Service**: 문서 분석 및 벡터 검색 API
- **MinIO Integration**: 기존 호스트 MinIO (localhost:9000) 연동

## 빠른 시작

### 1. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에서 UPSTAGE_API_KEY 설정
```

### 2. Docker 컨테이너 시작

```bash
cd dev-docker
docker-compose up -d
```

### 3. 서비스 확인

- **RAG API**: http://localhost:8001
- **API 문서**: http://localhost:8001/docs
- **헬스체크**: http://localhost:8001/health
- **PostgreSQL**: localhost:5433

### 4. 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# RAG 서비스 로그만
docker-compose logs -f rag-service

# PostgreSQL 로그만
docker-compose logs -f postgres-rag
```

## 서비스 포트

| 서비스 | 포트 | 설명 |
|--------|------|------|
| RAG FastAPI | 8001 | RAG API 서비스 |
| PostgreSQL (pgvector) | 5433 | 벡터 데이터베이스 |
| MinIO (호스트) | 9000 | 문서 스토리지 (기존 시스템) |

## 데이터베이스 스키마

### rag_documents
문서 메타데이터 저장

- `id`: UUID (Primary Key)
- `project_id`: 프로젝트 ID
- `file_name`: 파일명
- `minio_bucket`, `minio_object_key`: MinIO 저장 정보
- `analysis_status`: 분석 상태 (pending, processing, completed, failed)

### rag_embeddings
텍스트 청크 및 벡터 임베딩 저장

- `id`: UUID (Primary Key)
- `document_id`: 문서 ID (Foreign Key)
- `chunk_index`: 청크 인덱스
- `chunk_text`: 텍스트 내용
- `embedding`: 768차원 벡터 (paraphrase-multilingual-mpnet-base-v2)

### search_similar_chunks()
코사인 유사도 기반 유사 청크 검색 함수

```sql
SELECT * FROM search_similar_chunks(
    query_embedding := '[0.1, 0.2, ...]'::vector(768),
    similarity_threshold := 0.7,
    max_results := 10
);
```

## 개발 명령어

```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 컨테이너 재빌드
docker-compose up -d --build

# 볼륨 포함 전체 삭제
docker-compose down -v

# PostgreSQL 접속
docker exec -it testcase-postgres-rag psql -U rag_user -d rag_db
```

## PostgreSQL 직접 접속

```bash
psql -h localhost -p 5433 -U rag_user -d rag_db
# Password: rag_dev_password_123
```

## API 엔드포인트 (예정)

- `POST /api/v1/documents/upload` - 문서 업로드
- `GET /api/v1/documents/{document_id}` - 문서 조회
- `POST /api/v1/documents/{document_id}/analyze` - 문서 분석
- `POST /api/v1/search/similar` - 유사도 검색
- `GET /api/v1/testcases/suggestions` - 테스트케이스 제안

## 트러블슈팅

### 포트 충돌

```bash
# 5433 포트 사용 중인 프로세스 확인
lsof -ti:5433

# 8001 포트 사용 중인 프로세스 확인
lsof -ti:8001
```

### 컨테이너 로그 확인

```bash
docker-compose logs --tail=100 rag-service
docker-compose logs --tail=100 postgres-rag
```

### 데이터베이스 초기화

```bash
# 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up -d
```

## 관련 JIRA 이슈

- **Epic**: ICT-376 - 독립 RAG 시스템 구축
- **Story 1**: ICT-377 - PostgreSQL pgvector 확장 설치 및 벡터 스키마 구축
