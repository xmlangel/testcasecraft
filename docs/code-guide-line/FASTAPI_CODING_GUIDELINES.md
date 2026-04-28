# FastAPI 코딩 가이드라인

본 문서는 TestCaseCraft 프로젝트의 RAG 서비스(`rag-service/`) 개발을 위한 FastAPI 코딩 가이드라인을 정의합니다.

---

## 1. 프로젝트 구조 및 아키텍처

FastAPI의 추천 아키텍처를 따르며, 관심사 분리를 준수합니다.

| 레이어 | 패키지 | 역할 |
|-------|-------|------|
| **Router** | `app/api/v1/` | REST 엔드포인트 정의, 요청 경로 및 파라미터 매핑 |
| **Service** | `app/services/` | 비즈니스 로직, 외부 API 호출(OpenAI, Upstage 등), 파일 처리(MinIO) |
| **Schema** | `app/schemas/` | Pydantic 기반의 데이터 검증 및 응답 포맷 정의 |
| **Model** | `app/models/` | SQLAlchemy 기반의 DB 엔티티 정의 |
| **Core** | `app/core/` | 설정(Settings), DB 연결 관리, 보안 설정 |

---

## 2. 네이밍 컨벤션

Python의 **PEP 8** 가이드를 기본으로 합니다.

- **모듈/패키지/변수/함수**: `snake_case` (예: `embedding_service.py`, `get_document_by_id`)
- **클래스**: `PascalCase` (예: `RAGDocument`, `DocumentCreate`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_FILE_SIZE`)
- **DB 테이블/컬럼**: `snake_case` (예: `rag_documents`, `created_at`)

---

## 3. 데이터 모델링

### 3.1. Pydantic Schemas (`app/schemas/`)
- 모든 요청(Request)과 응답(Response)은 Pydantic 모델을 통해 정의합니다.
- `Field`를 사용하여 OpenAPI(Swagger) 문서에 표시될 설명을 추가합니다 (한글 설명 포함).
    ```python
    project_id: UUID = Field(..., description="Project ID\n프로젝트 ID")
    ```
- ORM 호환성을 위해 `ConfigDict(from_attributes=True)`를 설정합니다.

### 3.2. SQLAlchemy Models (`app/models/`)
- `declarative_base`를 상속받은 모델을 사용합니다.
- PostgreSQL 전용 타입(`UUID`, `JSONB`)과 `pgvector`를 적극 활용합니다.
- `created_at`, `updated_at` 등 공통 필드를 포함하여 데이터를 관리합니다.

---

## 4. 의존성 주입 (Dependency Injection)

- FastAPI의 `Depends()`를 사용하여 DB 세션, 서비스 인스턴스 등을 주입합니다.
    ```python
    db: Session = Depends(get_db)
    minio_service: MinIOService = Depends(get_minio_service)
    ```
- 싱글톤 패턴이 필요한 서비스는 `get_..._service` 팩토리 함수를 통해 주입합니다.

---

## 5. 비동기 처리 (Asynchronous)

- I/O 바운드 작업(네트워크 호출, DB 쿼리 등)은 `async`/`await`를 기본으로 사용합니다.
- 오래 걸리는 작업(문서 분석, 대량 임베딩 등)은 `asyncio.create_task`를 활용하여 백그라운드 태스크로 처리합니다.
- CPU 바운드 작업이나 비동기를 지원하지 않는 라이브러리 사용 시 주의가 필요합니다.

---

## 6. 설정 관리 (Configuration)

- `pydantic-settings`의 `BaseSettings`를 사용하여 환경 변수를 관리합니다.
- `.env` 파일을 통해 로컬 환경 설정을 관리하며, 프로덕션에서는 시스템 환경 변수를 우선합니다.

---

## 7. 예외 처리 및 로깅

- **예외 처리**: `HTTPException`을 사용하여 클라이언트에 표준화된 에러 응답을 반환합니다.
- **로깅**: 표준 `logging` 모듈을 사용하며, `app/main.py`에서 전역 설정을 수행합니다. 클래스별로 `logger = logging.getLogger(__name__)`를 생성하여 사용합니다.

---

## 8. 문서화 및 다국어 지원

- 모든 엔드포인트에는 `summary`와 `description`을 작성합니다.
- Pydantic 필드 및 API 설명에 한국어 설명을 병기하여 개발 편의성을 높입니다.

---

## 9. 코드 스타일 및 도구

- **타입 힌트**: 모든 함수 파라미터와 반환 값에 타입 힌트를 명시합니다.
- **Docstring**: 클래스와 주요 메서드 상단에 역할과 인자 설명을 작성합니다.
- **미사용 코드**: 사용하지 않는 import 및 변수는 제거하여 청결한 코드베이스를 유지합니다.
