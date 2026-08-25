# FastAPI 코딩 가이드라인

최종 갱신: 2026-08-23 21:40 KST · 기준 스택: FastAPI 0.122 · Pydantic 2.10 · SQLAlchemy 2.0 · pgvector

본 문서는 TestCaseCraft RAG 서비스(`rag-service/`)의 FastAPI 코딩 규칙을 정의합니다. 이 서비스는 Spring Boot 앱이 내부 네트워크로만 호출하는 **문서 처리·벡터 검색 전용 서비스**입니다.

---

## 1. 프로젝트 구조 및 아키텍처

관심사 분리를 준수합니다. 라우터는 `/api/v1` 접두로 `app/main.py` 에서 한 번에 등록합니다.

| 레이어 | 패키지 | 역할 |
| :--- | :--- | :--- |
| **Router** | `app/api/v1/` | REST 엔드포인트 정의, 경로·파라미터 매핑 |
| **Service** | `app/services/` | 비즈니스 로직, 외부 API 호출(OpenAI·Anthropic·Upstage·Ollama), 파일 처리(MinIO) |
| **Schema** | `app/schemas/` | Pydantic 기반 요청·응답 검증 |
| **Model** | `app/models/` | SQLAlchemy DB 엔티티 |
| **Core** | `app/core/` | `config.py`(Settings), `database.py`(세션·엔진) |

### 현재 라우터

| 파일 | 담당 |
| :--- | :--- |
| `documents.py` | 문서 업로드·조회·삭제 |
| `embeddings.py` | 청킹·임베딩 생성 |
| `search.py` | 벡터·하이브리드 검색 |
| `conversations.py` | RAG 대화 스레드·메시지 |
| `llm_analysis.py` | 청크 순차 분석 |
| `analysis_summary.py` | 분석 결과 요약 저장·조회 |

### 현재 서비스

| 파일 | 담당 |
| :--- | :--- |
| `minio_service.py` | 객체 스토리지 입출력 |
| `embedding_service.py` | 임베딩 생성 (제공자 분기) |
| `advanced_chunking_service.py`, `korean_chunking_service.py` | 청킹 전략 |
| `hybrid_search_service.py`, `reranker_service.py` | BM25 + 벡터 결합 검색, 재정렬 |
| `llm_client.py`, `llm_analysis_service.py` | LLM 호출 및 분석 |
| `upstage_service.py` | Upstage 문서 파싱 API |
| `analysis_summary_service.py` | 요약 영속화 |
| `cost_estimator.py` | 토큰·비용 추정 |

새 기능을 넣을 때는 위 목록에서 담당 서비스를 먼저 찾습니다. 검색·청킹은 이미 전략별로 갈라져 있으므로 새 파일보다 기존 서비스의 분기를 늘리는 편이 맞는 경우가 많습니다.

---

## 2. 네이밍 컨벤션

Python **PEP 8** 을 따릅니다.

- **모듈/패키지/변수/함수**: `snake_case` (예: `embedding_service.py`, `get_document_by_id`)
- **클래스**: `PascalCase` (예: `RAGDocument`, `DocumentCreate`)
- **상수·설정 필드**: `UPPER_SNAKE_CASE` (예: `MAX_SEARCH_RESULTS`)
- **DB 테이블/컬럼**: `snake_case` (예: `rag_documents`, `created_at`)

---

## 3. 데이터 모델링

### 3.1. Pydantic Schemas (`app/schemas/`)

- 모든 요청·응답을 Pydantic 모델로 정의합니다.
- `Field` 로 OpenAPI 문서에 표시될 설명을 넣습니다(영문·한글 병기).

```python
project_id: UUID = Field(..., description="Project ID\n프로젝트 ID")
```

- ORM 호환성을 위해 `ConfigDict(from_attributes=True)` 를 설정합니다(Pydantic 2 문법이며, v1 의 `orm_mode` 는 사용하지 않습니다).

### 3.2. SQLAlchemy Models (`app/models/`)

- `declarative_base` 를 상속한 모델을 사용합니다.
- PostgreSQL 전용 타입(`UUID`, `JSONB`)과 `pgvector` 를 적극 활용합니다.
- `created_at`·`updated_at` 공통 필드를 포함합니다.

### 3.3. 임베딩 차원은 설정과 스키마가 함께 묶인다

`EMBEDDING_DIMENSION`(기본 768, `paraphrase-multilingual-mpnet-base-v2`)은 `pgvector` 컬럼 정의와 일치해야 합니다. 모델을 바꿔 차원이 달라지면 **기존 벡터를 재생성**해야 하며, 그러지 않으면 검색이 조용히 엉뚱한 결과를 냅니다. 차원이 바뀌는 변경은 재임베딩 계획과 함께 진행합니다.

---

## 4. 의존성 주입 (Dependency Injection)

`Depends()` 로 DB 세션과 서비스 인스턴스를 주입합니다.

```python
db: Session = Depends(get_db)
minio_service: MinIOService = Depends(get_minio_service)
```

임베딩 모델처럼 로딩 비용이 큰 객체를 요청마다 새로 만들지 않으려고, 싱글턴이 필요한 서비스는 `get_..._service` 팩토리 함수로 주입합니다.

---

## 5. 비동기 처리 (Asynchronous)

- I/O 바운드 작업(네트워크 호출, DB 쿼리)은 `async`/`await` 를 기본으로 합니다.
- 오래 걸리는 작업(문서 분석, 대량 임베딩)은 `asyncio.create_task` 로 백그라운드에 넘기고 진행 상태를 조회할 수 있게 합니다.
- **CPU 바운드 작업을 코루틴 안에서 그대로 돌리면 이벤트 루프가 멈춥니다.** `sentence-transformers` 추론과 PDF 파싱이 여기 해당하므로 스레드 풀로 넘깁니다.

---

## 6. 설정 관리 (Configuration)

`pydantic-settings` 의 `BaseSettings`(`app/core/config.py`)로 환경 변수를 관리합니다. `.env` 로 로컬 설정을 두고, 컨테이너에서는 시스템 환경 변수가 우선합니다.

아래 표의 설정값이 문서 파싱·임베딩·검색 동작을 결정합니다.

| 축 | 변수 | 기본값 |
| :--- | :--- | :--- |
| 문서 파서 | `DOCUMENT_PARSER` | `pymupdf4llm` (그 외 `upstage`·`pypdf`·`pymupdf`·`auto`) |
| 임베딩 제공자 | `EMBEDDING_PROVIDER` | `sentence-transformers` (그 외 `ollama`) |
| 검색 | `SIMILARITY_THRESHOLD` / `MAX_SEARCH_RESULTS` | `0.7` / `10` |

**설정 기본값에 개발용 비밀값이 들어 있습니다**(`DATABASE_URL`·`MINIO_SECRET_KEY`). 운영에서는 환경 변수로 반드시 덮어써야 합니다. 기본값을 그대로 두면 저장소에 공개된 자격증명으로 서비스가 뜹니다.

---

## 7. 예외 처리 및 로깅

- **예외 처리**: `HTTPException` 으로 표준화된 오류 응답을 반환합니다.
- **로깅**: 표준 `logging` 모듈을 쓰고, 전역 설정은 `app/main.py` 에서 합니다. 클래스·모듈별로 `logger = logging.getLogger(__name__)` 을 만듭니다.
- **로그 레벨**: 운영은 `INFO` 입니다(`RAG_LOG_LEVEL`). `DEBUG` 로 내리면 DB 커넥션 문자열과 MinIO 키가 섞인 문장이 그대로 남습니다.

---

## 8. 문서화 및 다국어 지원

- 모든 엔드포인트에 `summary` 와 `description` 을 작성합니다.
- Pydantic 필드와 API 설명에 한국어를 병기합니다.

### ⚠️ `/docs`·`/redoc` 은 비인증으로 열린다

이 서비스에는 자체 인증이 없습니다. 그래서 `docker-compose.yml` 이 포트를 **루프백에만 바인딩**합니다.

```yaml
ports:
  - "${INTERNAL_BIND_ADDR:-127.0.0.1}:8001:8000"
```

Spring Boot 앱은 도커 내부 네트워크(`http://rag-service:8000`)로 붙으므로 외부 노출이 필요하지 않습니다. 이 바인딩을 `0.0.0.0` 으로 바꾸면 인증 없는 API 와 스펙 문서가 그대로 열립니다. 원격에서 봐야 하면 SSH 터널을 사용합니다.

---

## 9. 코드 스타일 및 도구

- **타입 힌트**: 모든 함수 파라미터와 반환값에 명시합니다.
- **Docstring**: 클래스와 주요 메서드 상단에 역할과 인자를 기록합니다.
- **미사용 코드**: 사용하지 않는 import 와 변수는 제거합니다.
- **의존성 버전**: `requirements.txt` 는 대부분 `==` 로 고정되어 있습니다. `starlette>=0.49.1` 처럼 CVE 대응으로 하한을 둔 줄은 주석에 사유가 붙어 있으니 내리지 않습니다.

---

## 10. 버전과 릴리즈

`APP_VERSION`(`app/core/config.py`)은 앱 버전과 별개로 올라갑니다. 도커 이미지도 `testcasecraft-rag-service` 로 분리되어 있습니다.

```bash
# RAG 서비스만 버전을 올린다
./gradlew incrementVersion -PtargetComponent=rag
```

`targetComponent` 를 지정하지 않으면 앱 버전만 오르고 RAG 이미지 태그는 그대로입니다.

---

## 📚 관련 문서

- [개발 가이드](./DEVELOPMENT_GUIDE.md): RAG 시스템 아키텍처 흐름과 인프라 구동
- [보안 가이드](./SECURITY_GUIDE.md): 인증·인가·데이터 보호
- [GitHub Actions 가이드](./GITHUB_ACTION_GUIDE.md): `rag` 타겟 빌드·배포
