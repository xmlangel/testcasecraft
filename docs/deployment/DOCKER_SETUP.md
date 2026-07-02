# TestcaseCraft 도커 설치·운영 가이드

> **대상:** 시스템 운영자 / DevOps / 자체 호스팅을 검토하는 개발자
> **참고:** 사용자 매뉴얼은 [`../manual/new/USER_MANUAL.md`](../manual/new/USER_MANUAL.md) 입니다. 일반 사용자는 매뉴얼만 읽으면 됩니다.
> **버전:** v1.0.83 기준 (`xmlangel/testcasecraft:1.0.83`)

---

## 목차
1. [사전 요구사항](#1-사전-요구사항)
2. [구성 요소 (5개 컨테이너)](#2-구성-요소-5개-컨테이너)
3. [환경 변수 (`.env`)](#3-환경-변수-env)
4. [기동 / 중지 / 재기동](#4-기동--중지--재기동)
5. [헬스체크와 진단](#5-헬스체크와-진단)
6. [기본 admin 계정과 보안 점검](#6-기본-admin-계정과-보안-점검)
7. [데이터 영속성과 백업](#7-데이터-영속성과-백업)
8. [버전 업그레이드](#8-버전-업그레이드)
9. [트러블슈팅](#9-트러블슈팅)

---

## 1. 사전 요구사항

| 항목 | 권장 |
|---|---|
| Docker Engine | 24.0+ (Buildx 포함) |
| Docker Compose | v2 (`docker compose`, 하이픈 없음) |
| 호스트 OS | Linux / macOS (M-series 포함) / WSL2 |
| RAM | 8GB 이상 (PostgreSQL + pgvector + MinIO + RAG 서비스 동시 기동) |
| 디스크 | 컨테이너 이미지 ~6GB + DB·MinIO 볼륨 가변 |
| 호스트 포트 | 기본값 — `8080`(app), `5434`(postgres+pgvector 통합), `9000`/`9001`(MinIO), `8001`(RAG) |

호스트 포트가 다른 프로세스에 점유되어 있으면 §3의 `.env`에서 매핑을 바꾸세요.

```bash
# 점유 여부 확인 (macOS/Linux)
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

---

## 2. 구성 요소 (4개 컨테이너)

`docker-compose-build/docker-compose.yml`이 정의하는 서비스:

> v1.0.93부터 앱 DB와 RAG DB가 단일 PostgreSQL(pgvector) 인스턴스로 통합되어, 컨테이너가 5개에서 4개로 줄었습니다.

| 서비스 | 컨테이너 이름 | 이미지 | 호스트 포트 |
|---|---|---|---|
| Spring Boot 앱 | `testcasecraft` | `xmlangel/testcasecraft:1.0.83` | `${HTTP_PORT}` / `${HTTPS_PORT}` |
| PostgreSQL + pgvector (통합: 앱 DB `testcase_management` + RAG DB `rag_db`) | `testcasecraft-postgres` | `pgvector/pgvector:pg18` | `5434:5432` |
| MinIO (S3 호환 첨부 저장소) | `testcasecraft-minio-rag` | `minio/minio:latest` | `9000`/`9001` |
| FastAPI RAG 서비스 | `testcasecraft-rag-service` | `xmlangel/testcasecraft-rag-service:1.0.11` | `8001:8000` |

앱 컨테이너는 PostgreSQL / MinIO가 `healthy`가 된 다음에 기동되도록 `depends_on`이 설정되어 있습니다.

---

## 3. 환경 변수 (`.env`)

`docker-compose-build/.env` 에서 모든 설정을 관리합니다. **운영 배포 시 다음 값들을 반드시 수정하세요.**

### 3-1. 권장 로컬 개발 값 (HTTP, SSL 비활성)

```bash
# Protocol & 외부 노출
PROTOCOL=http
DOMAIN=localhost
HTTP_PORT=8080
HTTPS_PORT=8443

# 내부 서버
SERVER_PORT=8080
SERVER_SSL_ENABLED=false

# 데이터베이스 (Spring 메인)
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password           # 운영에선 반드시 변경
DATABASE_URL=jdbc:postgresql://postgres:5432/testcase_management

# JWT (HS512용 512-bit 키)
JWT_SECRET=...base64...                        # 운영에선 새로 발급
JWT_EXPIRATION=604800000                       # access 7일
JWT_REFRESH_EXPIRATION=2592000000              # refresh 30일

# RAG / MinIO / Mail
POSTGRES_RAG_PASSWORD=...
MINIO_SECRET_KEY=...
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_HOST=localhost
MAIL_PORT=587

# 프론트엔드 (브라우저가 실제로 접속할 URL과 일치해야 함)
REACT_APP_API_BASE_URL=http://localhost:8080

# 옵션 플래그
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SHOW_EXPLORATORY_SESSION_TAB=true              # 탐색 세션 탭 노출 여부
TESTCASE_INIT_ENABLED=false                    # 시연용 더미 데이터 초기화
```

### 3-2. 운영 배포 권장 (HTTPS, SSL)

```bash
PROTOCOL=https
DOMAIN=testcasecraft.example.com
HTTP_PORT=80
HTTPS_PORT=443
SERVER_SSL_ENABLED=true

REACT_APP_API_BASE_URL=https://testcasecraft.example.com
```

SSL 인증서는 `docker-compose-build/ssl/` 에 마운트하거나 nginx 리버스 프록시를 앞에 두는 방식을 권장합니다 (`docker-compose-build/nginx/` 디렉터리에 nginx 설정 샘플 존재).

### 3-3. ⚠️ `REACT_APP_API_BASE_URL` 주의사항

프론트엔드 정적 빌드에 `localhost:8080`이 기본값으로 포함되어 있어, **브라우저가 접속하는 URL과 다르게 설정하면 회원가입/로그인 모두 `Failed to fetch` 로 실패합니다.**

예: `https://office.example.com` 으로 접속하는데 `REACT_APP_API_BASE_URL=http://localhost:8080` 으로 설정되어 있으면 → 브라우저가 `localhost:8080` 으로 API를 호출하다 실패.

**규칙:** `REACT_APP_API_BASE_URL` = 사용자가 브라우저 주소창에 입력하는 URL과 정확히 같게.

---

## 4. 기동 / 중지 / 재기동

### 4-1. 처음 기동 (앱 컨테이너만, 의존 컨테이너 자동 기동)

```bash
cd docker-compose-build
docker compose -f docker-compose.yml up -d app
```

### 4-2. 전체 스택 기동 (RAG 포함)

```bash
docker compose -f docker-compose.yml up -d
```

### 4-3. 환경 변수 임시 override (재빌드 없이)

```bash
PROTOCOL=http \
DOMAIN=localhost \
HTTP_PORT=8080 \
HTTPS_PORT=8443 \
SERVER_SSL_ENABLED=false \
REACT_APP_API_BASE_URL=http://localhost:8080 \
docker compose -f docker-compose.yml up -d app
```

### 4-4. 중지·재기동

```bash
# 컨테이너 정지(데이터 보존)
docker compose -f docker-compose.yml stop app

# 컨테이너 제거(데이터 보존)
docker compose -f docker-compose.yml rm -f app

# 전체 스택 종료 + 볼륨 유지
docker compose -f docker-compose.yml down

# 전체 스택 종료 + 볼륨까지 삭제 (⚠️ DB·MinIO 데이터 소실)
docker compose -f docker-compose.yml down -v
```

### 4-5. 도움 스크립트

`docker-compose-build/start.sh` 가 wrapper를 제공합니다.

```bash
cd docker-compose-build
./start.sh start         # 전체 기동
./start.sh stop          # 정지(볼륨 유지)
./start.sh stop-clean    # 정지 + 볼륨 삭제
./start.sh restart       # 재기동
./start.sh status        # docker compose ps
./start.sh logs          # app + postgres 로그
```

---

## 5. 헬스체크와 진단

### 5-1. 컨테이너 상태

```bash
docker ps --filter "name=testcasecraft" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

`testcasecraft` 컨테이너가 `Up X seconds (healthy)` 로 표시되어야 합니다.

### 5-2. 애플리케이션 헬스

```bash
# 공개 헬스 엔드포인트
curl http://localhost:8080/actuator/health

# 프론트 런타임 설정 (REACT_APP_API_BASE_URL 정상 적용 확인)
curl http://localhost:8080/api/config
# 기대 응답: {"apiBaseUrl":"http://localhost:8080", ...}
```

`apiBaseUrl` 값이 **브라우저 접속 URL과 다르면 §3-3 항목 재점검**.

### 5-3. 로그 보기

```bash
docker compose -f docker-compose.yml logs -f app           # 앱
docker compose -f docker-compose.yml logs -f postgres     # 메인 DB
docker compose -f docker-compose.yml logs --tail=200 app  # 최근 200줄
```

---

## 6. 기본 admin 계정과 보안 점검

⚠️ **운영 배포 직후 반드시 처리하세요.**

| 항목 | 기본값 | 조치 |
|---|---|---|
| 시스템 admin 계정 | `admin` / `admin123` | 첫 로그인 후 프로필 → 비밀번호 변경 |
| `JWT_SECRET` | `.env` 예시 값 | 새 512-bit 키 발급 (예: `openssl rand -base64 64`) |
| `POSTGRES_PASSWORD` | `testcase_password` | 강한 패스워드로 교체 후 컨테이너 재기동 |
| `MINIO_SECRET_KEY` | `.env` 예시 값 | 새 시크릿으로 교체 |
| `POSTGRES_RAG_PASSWORD` | `.env` 예시 값 | 새 시크릿으로 교체 |
| HTTPS | 비활성 | nginx + 인증서로 활성화 |
| `TESTCASE_INIT_ENABLED` | `false` | 시드 데이터가 필요 없으면 그대로 둠 |

```bash
# JWT_SECRET 새로 발급 예시 (HS512는 512-bit 이상)
openssl rand -base64 64 | tr -d '\n'
```

> ⚠️ **JWT_SECRET 형식 요건**: 값은 **유효한 Base64 문자열**(`A-Z a-z 0-9 + / =`)이어야 하며 디코딩 후 64바이트(512비트) 이상이어야 합니다. 하이픈(`-`)·언더스코어(`_`) 등이 포함된 임의 문자열(UUID 등)을 넣으면 앱이 시작 시점에 명확한 에러와 함께 기동을 거부합니다 (v1.0.83+). 위 `openssl` 명령으로 생성한 값을 그대로 사용하세요.

> 💡 **JWT_SECRET 자동 생성** (v1.0.83+): `JWT_SECRET`을 아예 설정하지 않으면(또는 빈 값이면) 컨테이너가 시작 시 512비트 키를 자동 생성하여 `/app/data/jwt-secret`(권한 0600)에 저장하고 재시작 시 재사용합니다. compose의 `./data/app:/app/data` 볼륨 마운트를 유지해야 컨테이너 재생성에도 키가 보존되어 로그인 세션이 끊기지 않습니다. **명시적으로 설정한 값이 잘못된 경우에는 자동 대체하지 않고 기동을 거부**합니다 — 설정 오류 은폐와 다중 인스턴스 키 불일치를 막기 위함입니다. 다중 인스턴스(스케일아웃) 환경에서는 자동 생성 대신 모든 인스턴스에 동일한 `JWT_SECRET`을 명시 설정하세요.

`admin/admin123`은 `src/main/java/.../config/DataInitializer.java` 에 명시되어 있으므로 **외부 공개 환경에서는 반드시 패스워드 변경 또는 해당 계정 비활성화**.

---

## 7. 데이터 영속성과 백업

기본적으로 다음 3개 도커 볼륨이 영속화됩니다.

| 볼륨 | 용도 |
|---|---|
| `postgres-data` (`./data/postgres`) | 통합 PostgreSQL — 메인 도메인 DB(`testcase_management`) + RAG 벡터 DB(`rag_db`, pgvector) |
| `minio-data` | 첨부 파일 / RAG 원본 문서 |
| `app-logs` | 앱 로그 (옵션) |

### 7-1. 백업 — PostgreSQL (통합 인스턴스)

앱 DB와 RAG DB가 같은 컨테이너(`testcasecraft-postgres`)에 있으므로 각각 백업합니다.

```bash
# 앱 DB
docker exec testcasecraft-postgres \
  pg_dump -U testcase_user testcase_management \
  > backup_main_$(date +%Y%m%d).sql

# RAG 벡터 DB
docker exec testcasecraft-postgres \
  pg_dump -U rag_user rag_db \
  > backup_rag_$(date +%Y%m%d).sql
```

### 7-2. 백업 — MinIO 버킷

`mc` 클라이언트 또는 호스트 마운트 디렉터리를 `tar`로 묶습니다.

### 7-3. 복구

`docker compose down -v` 후 새 컨테이너로 띄우고 `pg_restore` / MinIO 버킷 복원.

자세한 절차는 별도 운영 매뉴얼이 필요하면 추가로 작성합니다.

---

## 8. 버전 업그레이드

### 8-1. 같은 마이너 버전 (1.0.x → 1.0.y)

```bash
# .env 또는 docker-compose.yml의 image 태그 변경 후
docker compose -f docker-compose.yml pull app
docker compose -f docker-compose.yml up -d app
```

`SPRING_JPA_HIBERNATE_DDL_AUTO=update` 로 설정되어 있어 스키마 변경은 자동 반영됩니다 (단, 운영에서는 별도 검토 권장).

### 8-2. 메이저 버전 업그레이드

릴리스 노트(`docs/release_note/`)에서 마이그레이션 요구사항을 먼저 확인하세요.

### 8-3. 이미지 정리

```bash
docker image prune -a               # 사용하지 않는 이미지 정리
docker volume ls                     # 볼륨 확인
```

---

## 9. 트러블슈팅

### 9-1. 회원가입/로그인 시 `Failed to fetch`

| 점검 | 명령 |
|---|---|
| 컨테이너가 healthy인가? | `docker ps --filter name=testcasecraft` |
| `/api/config` 가 응답하는가? | `curl http://localhost:8080/api/config` |
| `apiBaseUrl` 값이 브라우저 URL과 같은가? | 응답 JSON 확인 |
| `REACT_APP_API_BASE_URL` 컨테이너 env가 맞는가? | `docker exec testcasecraft env \| grep REACT` |

→ 다르면 `.env` 또는 shell env override로 수정 후 컨테이너 재생성 (`stop` → `rm -f` → `up -d`).

### 9-2. 호스트 포트 8080 충돌

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
# 다른 프로세스가 점유 중이면
HTTP_PORT=8088 docker compose -f docker-compose.yml up -d app
# 단, REACT_APP_API_BASE_URL 도 같은 포트로 맞춰야 함
REACT_APP_API_BASE_URL=http://localhost:8088 HTTP_PORT=8088 docker compose -f docker-compose.yml up -d app
```

### 9-3. `relation "users" does not exist`

JPA `ddl-auto`가 비활성화된 환경 — `SPRING_JPA_HIBERNATE_DDL_AUTO=update` 또는 `create` 로 한 번 띄워 스키마 생성 후 `update` 로 변경.

### 9-4. `testcasecraft-rag-service` healthy 안 됨

- 통합 PostgreSQL 컨테이너(`testcasecraft-postgres`, pgvector 포함)가 먼저 healthy인지 확인 (`rag_db` 는 init-scripts 가 최초 기동 시 자동 생성)
- MinIO도 healthy여야 함 (`mc alias set`로 버킷 자동 생성 시도)
- 로그: `docker compose logs -f rag-service`

### 9-5. 컨테이너는 healthy인데 브라우저가 404

- nginx 또는 리버스 프록시 설정 확인
- 컨테이너 직접 호출(`curl http://localhost:8080/`)이 200이면 프록시 경로 문제

### 9-6. JWT 만료/리프레시 이슈

`.env`의 `JWT_EXPIRATION`(7일) / `JWT_REFRESH_EXPIRATION`(30일) 값을 늘리거나 줄일 수 있습니다. 토큰 클레임 변경 시에는 모든 사용자가 재로그인해야 합니다.

---

## 참고 파일

- `docker-compose-build/docker-compose.yml` — 컨테이너 정의 (5개 서비스)
- `docker-compose-build/.env` — 환경 변수 (운영 배포 시 반드시 정리)
- `docker-compose-build/start.sh` — wrapper 스크립트
- `docker-compose-build/Dockerfile` — 앱 이미지 빌드 정의
- `docker-compose-build/nginx/` — nginx 리버스 프록시 샘플
- `docker-compose-build/ssl/` — TLS 인증서 마운트 디렉터리
- `docker-compose-build/init-scripts/` — DB 초기화 스크립트
- `src/main/resources/application*.yml` — Spring 프로파일별 설정
