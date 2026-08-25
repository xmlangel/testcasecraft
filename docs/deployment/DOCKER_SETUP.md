# TestcaseCraft 도커 설치·운영 가이드

최종 갱신: 2026-08-23 22:20 KST · 기준 버전 `xmlangel/testcasecraft:1.0.120`

> **대상:** 시스템 운영자 / DevOps / 자체 호스팅을 검토하는 개발자
> **참고:** 사용자 매뉴얼은 [`../manual/new/USER_MANUAL.md`](../manual/new/USER_MANUAL.md) 입니다. 일반 사용자는 매뉴얼만 읽으면 됩니다.
> **정본:** 컨테이너 정의는 `docker-compose-build/docker-compose.yml`, 보안 환경변수는 [`../SECURITY_DEPLOYMENT_ENV.md`](../SECURITY_DEPLOYMENT_ENV.md) 입니다. 이 문서와 어긋나면 그 두 파일을 기준으로 삼습니다.

---

## 목차
1. [사전 요구사항](#1-사전-요구사항)
2. [구성 요소 (4개 컨테이너)](#2-구성-요소-4개-컨테이너)
3. [환경 변수 (`.env`)](#3-환경-변수-env)
4. [기동 / 중지 / 재기동](#4-기동--중지--재기동)
5. [첫 로그인: admin 비밀번호](#5-첫-로그인-admin-비밀번호)
6. [헬스체크와 진단](#6-헬스체크와-진단)
7. [배포 직후 보안 점검](#7-배포-직후-보안-점검)
8. [데이터 영속성과 백업](#8-데이터-영속성과-백업)
9. [버전 업그레이드](#9-버전-업그레이드)
10. [트러블슈팅](#10-트러블슈팅)

---

## 1. 사전 요구사항

| 항목 | 권장 |
|---|---|
| Docker Engine | 24.0+ (Buildx 포함) |
| Docker Compose | v2 (`docker compose`, 하이픈 없음) |
| 호스트 OS | Linux / macOS (M-series 포함) / WSL2 |
| RAM | 8GB 이상 (PostgreSQL + pgvector + MinIO + RAG 서비스 동시 기동) |
| 디스크 | 컨테이너 이미지 ~6GB + DB·MinIO 데이터 가변 |
| 호스트 포트 | `${HTTP_PORT}`·`${HTTPS_PORT}`(app) · `5434`(postgres) · `9000`/`9001`(MinIO) · `8001`(RAG) |

앱을 뺀 세 서비스는 기본적으로 **`127.0.0.1` 에만** 바인딩되므로 호스트 밖에서는 닿지 않습니다(3-4절).

```bash
# 점유 여부 확인 (macOS/Linux)
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

---

## 2. 구성 요소 (4개 컨테이너)

`docker-compose-build/docker-compose.yml` 이 정의하는 서비스입니다.

> v1.0.93부터 앱 DB와 RAG DB가 단일 PostgreSQL(pgvector) 인스턴스로 통합되어, 컨테이너가 5개에서 4개로 줄었습니다.

| 서비스 | 컨테이너 이름 | 이미지 | 호스트 바인딩 |
|---|---|---|---|
| Spring Boot 앱 | `testcasecraft` | `xmlangel/testcasecraft:1.0.120` | `${HTTP_PORT}` / `${HTTPS_PORT}` → `${SERVER_PORT}` |
| PostgreSQL + pgvector (앱 DB `testcase_management` + RAG DB `rag_db`) | `testcasecraft-postgres` | `pgvector/pgvector:pg18` | `127.0.0.1:5434` → 5432 |
| MinIO (S3 호환 첨부 저장소) | `testcasecraft-minio` | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | `127.0.0.1:9000` / `127.0.0.1:9001` |
| FastAPI RAG 서비스 | `testcasecraft-rag-service` | `xmlangel/testcasecraft-rag-service:1.0.11` | `127.0.0.1:8001` → 8000 |

앱 컨테이너는 PostgreSQL·MinIO 가 `healthy` 가 된 다음에 기동됩니다(`depends_on`).

### 앱과 RAG 서비스 버전은 따로 올라간다

앱은 `1.0.120`, RAG 서비스는 `1.0.11` 입니다. 두 이미지가 독립적으로 태깅되므로 앱만 올려도 RAG 서비스 태그는 그대로입니다.

### 컨테이너 하드닝

네 서비스 모두 `no-new-privileges:true` + `cap_drop: ALL` 로 뜹니다. PostgreSQL 만 엔트리포인트가 데이터 디렉터리 소유권을 조정하는 데 필요한 capability 다섯 개(`CHOWN`·`DAC_OVERRIDE`·`FOWNER`·`SETGID`·`SETUID`)를 되돌려 받습니다. 이 설정을 지우면 컨테이너 안에서 setuid 바이너리를 통한 권한 상승이 열립니다.

MinIO 이미지는 릴리스 태그로 고정되어 있습니다. `:latest` 로 바꾸면 재기동마다 다른 바이너리가 내려와 취약점 스캔 결과를 특정 다이제스트에 귀속시킬 수 없습니다. 버전을 바꿔야 하면 `MINIO_IMAGE_TAG` 로 지정합니다.

---

## 3. 환경 변수 (`.env`)

`docker-compose-build/.env` 에서 설정합니다. 저장소 루트의 `env_example` 을 복사해 시작합니다.

```bash
cp env_example docker-compose-build/.env
```

### 3-1. 기동을 막는 필수 값

미설정 시 컨테이너가 뜨지 않거나 기능이 막히는 값입니다.

| 변수 | 미설정 시 |
|---|---|
| `MINIO_SECRET_KEY` | compose 의 `:?` 검사에 걸려 **app·rag-service 기동 거부** |
| `POSTGRES_PASSWORD` · `POSTGRES_RAG_PASSWORD` | DB 인증 실패 |
| `HTTP_PORT` · `HTTPS_PORT` · `SERVER_PORT` | 포트 매핑이 비어 compose 파싱 실패 |
| `DATABASE_URL` | 앱이 DB 를 찾지 못함 |
| `JIRA_ENCRYPTION_KEY` | 앱은 뜨지만 **LLM API 키·Jira 토큰·메일 비밀번호·Google 서비스 계정 JSON 을 저장할 수 없습니다**(prod 프로파일은 기본값 없음) |

### 3-2. 권장 로컬 개발 값

```bash
# Protocol & 외부 노출
PROTOCOL=http
DOMAIN=localhost
HTTP_PORT=8080
HTTPS_PORT=8443
SERVER_PORT=8080

# 데이터베이스
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password           # 운영에선 반드시 변경
POSTGRES_RAG_PASSWORD=rag_dev_password_123    # 운영에선 반드시 변경
DATABASE_URL=jdbc:postgresql://postgres:5432/testcase_management

# JWT — 미설정이면 컨테이너가 자동 생성한다 (5-2절)
JWT_SECRET=
JWT_ACCESS_EXPIRATION=3600000                 # access 1시간
JWT_REFRESH_EXPIRATION=7776000000             # refresh 90일

# 저장 비밀값 암호화 키 (AES-256 Base64 32바이트)
JIRA_ENCRYPTION_KEY=...                        # openssl rand -base64 32

# MinIO
MINIO_ACCESS_KEY=minioadmin                    # 운영에선 고유 값
MINIO_SECRET_KEY=...                           # 필수

# 메일 (선택)
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_HOST=localhost
MAIL_PORT=587

# 프론트엔드 — 브라우저가 실제로 접속할 URL과 같아야 한다 (3-3절)
REACT_APP_API_BASE_URL=http://localhost:8080

# 옵션
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SHOW_EXPLORATORY_SESSION_TAB=false             # 탐색 세션 탭 노출
TESTCASE_INIT_ENABLED=false                    # 시연용 더미 데이터 (5-1절 참고)
TESTCASE_ADMIN_PASSWORD=                       # 최초 admin 비밀번호 (5-1절)
```

### ⚠️ 3-3. `REACT_APP_API_BASE_URL` 은 브라우저 주소와 같아야 한다

프론트엔드 정적 빌드에 `localhost:8080` 이 기본값으로 들어 있어, **브라우저가 접속하는 URL과 다르게 설정하면 회원가입·로그인이 모두 `Failed to fetch` 로 실패합니다.**

예를 들어 `https://office.example.com` 으로 접속하는데 `REACT_APP_API_BASE_URL=http://localhost:8080` 이면, 브라우저가 자기 `localhost:8080` 을 호출하다 실패합니다.

**규칙:** `REACT_APP_API_BASE_URL` = 사용자가 브라우저 주소창에 입력하는 URL.

리버스 프록시 뒤에 둘 때는 `APP_CORS_ALLOWED_ORIGINS` 도 함께 실제 도메인으로 바꿉니다. 기본값이 `localhost` 세 개뿐이라 운영 도메인 요청이 CORS 로 차단됩니다([보안 환경변수](../SECURITY_DEPLOYMENT_ENV.md) 참고).

### 3-4. 포트는 루프백에만 열려 있다

postgres·minio·rag-service 는 `${INTERNAL_BIND_ADDR:-127.0.0.1}` 로 바인딩합니다. 앱과 RAG 는 도커 내부 네트워크(`postgres:5432`·`minio:9000`·`rag-service:8000`)로 붙으므로 외부 노출이 필요하지 않습니다.

**`INTERNAL_BIND_ADDR=0.0.0.0` 으로 바꾸면 호스트 방화벽을 우회합니다.** 도커가 iptables 를 직접 조작하기 때문에 ufw 규칙으로는 막히지 않습니다. RAG 서비스는 자체 인증이 없고 `/docs`·`/redoc` 이 열려 있으므로 특히 그렇습니다. 원격에서 DB 나 MinIO 콘솔을 봐야 하면 SSH 터널을 사용합니다.

```bash
ssh -L 5434:127.0.0.1:5434 -L 9001:127.0.0.1:9001 <remote>
```

### ⚠️ 3-5. `.env` 에 있으나 앱이 읽지 않는 변수

`env_example` 에 남아 있지만 현재 코드 경로에서 소비되지 않는 값들입니다. 아래 변수에 값을 넣어도 동작이 바뀌지 않으므로, 기대하고 설정하면 원인을 엉뚱한 곳에서 찾게 됩니다.

| 변수 | 상태 |
|---|---|
| `SERVER_SSL_ENABLED` | compose 가 앱 컨테이너에 전달하지 않고, `application-prod.yml` 에 `server.ssl` 블록도 없습니다. `start.sh` 가 `PROTOCOL` 을 보고 export 하지만 그 값을 읽는 곳이 없습니다 |
| `SSL_KEYSTORE_PATH` · `SSL_KEYSTORE_PASSWORD` · `SSL_KEYSTORE_TYPE` | 위와 같습니다. compose·Spring 설정 어디에도 참조가 없습니다 |
| `JWT_EXPIRATION` | 컨테이너는 `SPRING_PROFILES_ACTIVE=prod` 로 뜨고, prod 프로파일은 **`JWT_ACCESS_EXPIRATION`** 을 읽습니다. `JWT_EXPIRATION` 은 dev·local·remote 프로파일 전용이라 도커 배포에서는 무시됩니다 |

**TLS 는 앱이 아니라 앞단에서 종료시킵니다.** nginx·Traefik 같은 리버스 프록시나 로드밸런서를 두고, 앱은 평문 `SERVER_PORT` 로 받습니다. `docker-compose-build/ssl/` 에 인증서를 두는 경로는 남아 있지만 nginx 설정 샘플 디렉터리는 저장소에 없습니다.

### 3-6. 토큰 만료 기본값

도커 배포(prod 프로파일) 기준입니다.

| 토큰 | 환경변수 | 기본값 |
|---|---|---|
| Access | `JWT_ACCESS_EXPIRATION` | 3,600,000ms = **1시간** |
| Refresh | `JWT_REFRESH_EXPIRATION` | 7,776,000,000ms = **90일** |

---

## 4. 기동 / 중지 / 재기동

### 4-1. 처음 기동 (앱만 — 의존 컨테이너 자동 기동)

```bash
cd docker-compose-build
docker compose up -d app
```

### 4-2. 전체 스택 기동 (RAG 포함)

```bash
docker compose up -d
```

### 4-3. 환경 변수 임시 override (재빌드 없이)

```bash
PROTOCOL=http \
DOMAIN=localhost \
HTTP_PORT=8080 \
HTTPS_PORT=8443 \
SERVER_PORT=8080 \
REACT_APP_API_BASE_URL=http://localhost:8080 \
docker compose up -d app
```

### 4-4. 중지·재기동

```bash
# 컨테이너 정지 (데이터 보존)
docker compose stop app

# 컨테이너 제거 (데이터 보존 — 데이터는 ./data 바인드 마운트에 있다)
docker compose rm -f app

# 전체 스택 종료
docker compose down
```

`docker compose down -v` 는 **named volume 만** 지웁니다. 이 프로젝트는 DB·MinIO·JWT 시크릿을 모두 `./data/` 바인드 마운트에 두므로 `-v` 로는 데이터가 지워지지 않습니다. 실제로 지우려면 `./data/` 를 직접 삭제해야 하며(8절), 그러면 되돌릴 수 없습니다.

### 4-5. 도움 스크립트

```bash
cd docker-compose-build
./start.sh start          # 전체 기동
./start.sh stop           # 정지 (데이터 보존)
./start.sh stop-clean     # 정지 + 볼륨 삭제
./start.sh stop-no-clean  # 정지 (stop 과 같음, 명시형)
./start.sh restart        # 재기동
./start.sh status         # docker compose ps
```

`logs` 서브커맨드는 없습니다. 로그는 `docker compose logs` 를 직접 실행합니다(6-3절).

`start.sh` 는 `PROTOCOL` 에 따라 `SERVER_PORT` 를 8080 또는 8443 으로 export 합니다. `.env` 의 `SERVER_PORT` 를 다른 값으로 두었다면 이 스크립트를 거치면 덮어써집니다.

---

## 5. 첫 로그인: admin 비밀번호

### ⚠️ 5-1. admin 비밀번호는 `TESTCASE_INIT_ENABLED` 에 따라 갈린다

admin 계정 비밀번호는 `TESTCASE_INIT_ENABLED` 값에 따라 갈립니다. **compose 기본값은 `false`** 입니다.

| `TESTCASE_INIT_ENABLED` | 동작 | admin 비밀번호 |
|---|---|---|
| **`false`** (기본) | 기존 사용자가 있으면 아무것도 하지 않음. 없으면 admin 하나만 생성 | `TESTCASE_ADMIN_PASSWORD` 값. **미설정이면 무작위 생성해 기동 로그에 1회만 출력** |
| `true` | 기존 데이터를 **전부 삭제**한 뒤 시연용 데이터를 시딩 (admin + tester 계정) | `TESTCASE_ADMIN_PASSWORD` 값. 미설정이면 `admin123` |

기본 배포에서 `admin / admin123` 으로는 로그인되지 않습니다. 둘 중 하나를 택합니다.

**방법 A. 비밀번호를 미리 정한다 (권장)**

```bash
# .env
TESTCASE_ADMIN_PASSWORD=<강한 비밀번호>
```

**방법 B. 생성된 값을 로그에서 읽는다**

```bash
docker compose logs app | grep -A2 "admin 초기 비밀번호"
```

```
============================================================
⚠️ TESTCASE_ADMIN_PASSWORD 미설정 — 임시 관리자 비밀번호를 무작위 생성했습니다.
   이 값은 최초 1회만 로그에 출력됩니다. 로그인 후 즉시 변경하세요.
   admin 초기 비밀번호: xxxxxxxxxxxxxxxxxxxxxxxx
============================================================
```

**최초 1회만 출력됩니다.** 로그를 잃고 비밀번호도 모르면 DB 에서 사용자 행을 지우고 재기동하거나(빈 DB 로 판정되어 새로 생성됩니다) DB 에서 직접 해시를 갱신해야 합니다.

### ⚠️ `TESTCASE_INIT_ENABLED=true` 는 기존 데이터를 지운다

시딩 모드는 프로젝트·케이스·실행·결과·사용자·감사 로그를 모두 `deleteAll()` 한 뒤 시연 데이터를 넣습니다. **운영 DB 에서 켜면 데이터가 사라집니다.** 새로 만든 빈 인스턴스에서 화면을 둘러볼 때만 켭니다.

### 5-2. JWT_SECRET 자동 생성

`JWT_SECRET` 을 비워 두면 엔트리포인트가 512비트 키를 생성해 `/app/data/jwt-secret`(권한 0600)에 저장하고 재시작 때 재사용합니다. compose 의 `./data/app:/app/data` 마운트를 유지해야 컨테이너를 재생성해도 키가 보존되어 로그인 세션이 끊기지 않습니다.

명시적으로 넣은 값이 형식에 맞지 않으면 **자동 대체하지 않고 기동을 거부합니다.** 설정 오류를 감추지 않으려고, 그리고 다중 인스턴스에서 키가 서로 달라지는 것을 막으려고 그렇게 동작합니다.

값이 만족해야 하는 조건은 아래 두 가지입니다.

- 유효한 Base64 문자열 (`A-Z a-z 0-9 + / =`). 하이픈·언더스코어가 든 UUID 류를 넣으면 기동 실패합니다.
- 디코딩 후 64바이트(512비트) 이상. HS512 로 서명합니다.

```bash
openssl rand -base64 64 | tr -d '\n'
```

여러 인스턴스로 스케일아웃하는 배포에서는 자동 생성에 맡기지 않고 모든 인스턴스에 **같은 `JWT_SECRET`** 을 명시합니다.

---

## 6. 헬스체크와 진단

### 6-1. 컨테이너 상태

```bash
docker ps --filter "name=testcasecraft" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

`testcasecraft` 가 `Up X (healthy)` 로 표시되어야 합니다. 앱 헬스체크는 `start_period: 60s` 를 두므로 기동 직후 1분간은 `starting` 이 정상입니다.

컨테이너 헬스체크는 **`wget` 으로 http 를 먼저 시도하고 실패하면 https 로 폴백**합니다. 1.0.84+ 이미지에는 보안상 `curl` 이 없으므로, 헬스체크를 손볼 때 `curl` 을 쓰면 항상 unhealthy 가 됩니다.

### 6-2. 애플리케이션 헬스

```bash
# 공개 헬스 엔드포인트 (인증 불필요)
curl http://localhost:8080/actuator/health

# 프론트 런타임 설정 — REACT_APP_API_BASE_URL 반영 확인
curl http://localhost:8080/api/config
# 기대: {"apiBaseUrl":"http://localhost:8080", ...}

# RAG 서비스 (루프백 전용)
curl http://127.0.0.1:8001/health
```

`apiBaseUrl` 이 브라우저 접속 URL과 다르면 3-3절을 재점검합니다.

`/actuator/health` 계열만 비인증으로 열려 있고 **나머지 `/actuator/**` 는 인증이 필요합니다.** 스케줄 목록·환경 정보가 새는 것을 막는 설정이므로 되돌리지 않습니다.

### 6-3. 로그 보기

```bash
docker compose logs -f app             # 앱
docker compose logs -f postgres        # DB
docker compose logs -f rag-service     # RAG
docker compose logs --tail=200 app     # 최근 200줄
```

앱 로그 레벨 기본값은 `LOGGING_LEVEL_COM_TESTCASE=INFO` · `LOGGING_LEVEL_ROOT=WARN` 입니다. RAG 는 `RAG_LOG_LEVEL=INFO` 입니다. **DEBUG 로 내리면 DB 커넥션 문자열과 MinIO 키가 로그에 남습니다.** 진단 목적으로 임시로 켰다면 되돌리고, 그 사이 로그는 폐기합니다.

---

## 7. 배포 직후 보안 점검

⚠️ **외부에 공개하기 전에 처리합니다.**

| 항목 | 기본값 | 조치 |
|---|---|---|
| admin 비밀번호 | 무작위 생성 (로그 1회 출력) | `TESTCASE_ADMIN_PASSWORD` 를 미리 설정하거나 첫 로그인 후 변경 (5-1절) |
| `JWT_SECRET` | 비어 있으면 자동 생성·영속화 | 단일 인스턴스면 자동 생성으로 충분. 스케일아웃이면 명시 설정 |
| `JIRA_ENCRYPTION_KEY` | prod 는 기본값 없음 | `openssl rand -base64 32`. 이 키를 잃으면 저장된 API 키·토큰·비밀번호를 전부 다시 입력해야 합니다 |
| `POSTGRES_PASSWORD` | `testcase_password` | 강한 비밀번호로 교체 후 재기동 |
| `POSTGRES_RAG_PASSWORD` | `rag_dev_password_123` | 교체 |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | `minioadmin` / 예시 값 | 교체. 가능하면 root 대신 버킷 범위 서비스 계정 발급 |
| `APP_CORS_ALLOWED_ORIGINS` | `localhost` 3개 | 실제 프론트 도메인 |
| `APP_RATELIMIT_TRUST_FORWARDED_HEADERS` | `false` | 리버스 프록시 뒤일 때만 `true`. 프록시 없이 직접 노출이면 `false` 유지 (`true` 면 헤더 위조로 레이트 리밋 우회) |
| `APP_JIRA_ALLOW_PRIVATE_TARGETS` | `false` | 사설 IP on-prem Jira 연동에만 `true`. 클라우드에서는 켜지 않습니다 (SSRF 가드 해제) |
| `INTERNAL_BIND_ADDR` | `127.0.0.1` | 그대로 둡니다 (3-4절) |
| TLS | 앱은 평문 | 리버스 프록시에서 종료 (3-5절) |
| `TESTCASE_INIT_ENABLED` | `false` | 그대로 둡니다. `true` 는 기존 데이터를 삭제합니다 |

각 항목의 판정 근거와 미설정 시 증상은 [보안 환경변수 문서](../SECURITY_DEPLOYMENT_ENV.md)에 정리되어 있습니다.

`config/DefaultConfigurationWarning` 이 DB 비밀번호·JWT 시크릿·암호화 키가 기본값인지 검사해 기동 로그에 경고를 출력합니다. 배포 직후 로그를 확인하는 것이 가장 빠른 점검입니다.

---

## 8. 데이터 영속성과 백업

데이터는 **named volume 이 아니라 `docker-compose-build/data/` 아래 바인드 마운트**에 있습니다.

| 경로 | 컨테이너 경로 | 용도 |
|---|---|---|
| `./data/postgres` | `/var/lib/postgresql` | 통합 PostgreSQL: 앱 DB(`testcase_management`) + RAG 벡터 DB(`rag_db`) |
| `./data/minio` | `/data` | 첨부파일(`testcase-attachments`) · RAG 원본 문서(`rag-documents`) |
| `./data/app` | `/app/data` | 자동 생성된 `jwt-secret` |

`docker compose down -v` 로는 이 디렉터리가 지워지지 않습니다. 반대로 **`./data/` 를 지우면 되돌릴 수 없습니다.**

`./data/` 가 `.env`·`ssl/` 과 같은 디렉터리에 있어 빌드 컨텍스트에 섞일 수 있습니다. `docker-compose-build/.dockerignore` 가 allow-list 로 막고 있으니 그 파일을 지우지 않습니다.

### 8-1. PostgreSQL 백업 — 두 DB 를 각각

```bash
cd docker-compose-build

docker exec testcasecraft-postgres \
  pg_dump -U testcase_user -d testcase_management -Fc \
  > backup_main_$(date +%Y%m%d).dump

docker exec testcasecraft-postgres \
  pg_dump -U rag_user -d rag_db -Fc \
  > backup_rag_$(date +%Y%m%d).dump
```

`-Fc`(custom 포맷)로 뜨면 `pg_restore` 로 선택 복원이 됩니다.

### 8-2. MinIO 백업

컨테이너를 정지한 뒤 디렉터리를 묶는 것이 가장 단순합니다.

```bash
docker compose stop minio
tar czf backup_minio_$(date +%Y%m%d).tgz data/minio
docker compose start minio
```

실행 중에 떠야 하면 `mc mirror` 로 버킷 두 개(`testcase-attachments`·`rag-documents`)를 각각 내립니다.

### 8-3. 복구

```bash
# DB — 빈 DB 에 복원
docker exec -i testcasecraft-postgres \
  pg_restore -U testcase_user -d testcase_management --clean --if-exists \
  < backup_main_YYYYMMDD.dump

# MinIO — 컨테이너 정지 후 디렉터리 교체
docker compose stop minio
rm -rf data/minio && tar xzf backup_minio_YYYYMMDD.tgz
docker compose start minio
```

첨부파일 메타데이터는 DB 에, 실물은 MinIO 에 있습니다. **두 백업 시점이 어긋나면 목록에는 보이는데 내려받을 수 없는 첨부가 생깁니다.** 같은 정지 구간에서 함께 뜨는 것을 권장합니다.

---

## 9. 버전 업그레이드

### 9-1. 패치 버전 (1.0.x → 1.0.y)

```bash
cd docker-compose-build

# docker-compose.yml 의 image 태그를 새 버전으로 바꾼 뒤
docker compose pull app
docker compose up -d app
```

스키마는 `SPRING_JPA_HIBERNATE_DDL_AUTO=update` 로 자동 반영됩니다. 다만 `update` 는 **추가만** 합니다. 컬럼 삭제·타입 변경·nullable → not-null 전환은 반영되지 않으므로, 릴리즈 노트에 그런 변경이 적혀 있으면 SQL 을 직접 실행합니다.

업그레이드 전에 8-1절 백업을 뜹니다. `update` 는 되돌리는 기능이 없습니다.

### 9-2. RAG 서비스만 올리기

```bash
docker compose pull rag-service
docker compose up -d rag-service
```

임베딩 모델이 바뀌는 릴리즈라면 벡터 차원이 달라져 **기존 벡터를 재생성해야 합니다.** 재생성하지 않으면 검색이 오류 없이 엉뚱한 결과를 냅니다. 릴리즈 노트에서 `EMBEDDING_MODEL`·`EMBEDDING_DIMENSION` 변경 여부를 먼저 확인합니다.

### 9-3. 릴리즈 노트

`docs/release_note/RELEASE_NOTE_<버전>_KO.md` 에 버전별로 있습니다. 여러 버전을 건너뛸 때는 중간 버전의 노트도 모두 확인합니다.

### 9-4. 이미지 정리

```bash
docker image prune -a     # 사용하지 않는 이미지 제거
docker system df          # 디스크 사용량 확인
```

---

## 10. 트러블슈팅

### 10-1. 로그인이 안 된다 — `admin123` 을 넣었는데 실패

기본 배포에서는 `admin123` 이 아닙니다. 5-1절을 봅니다.

```bash
docker compose logs app | grep -A2 "admin 초기 비밀번호"
```

### 10-2. 회원가입·로그인 시 `Failed to fetch`

| 점검 | 명령 |
|---|---|
| 컨테이너가 healthy 인가 | `docker ps --filter name=testcasecraft` |
| `/api/config` 가 응답하는가 | `curl http://localhost:8080/api/config` |
| `apiBaseUrl` 이 브라우저 URL 과 같은가 | 위 응답 JSON 확인 |
| 컨테이너 env 가 맞는가 | `docker exec testcasecraft env \| grep REACT` |
| CORS 로 막혔는가 | 브라우저 콘솔에서 CORS 오류 확인 → `APP_CORS_ALLOWED_ORIGINS` |

다르면 `.env` 를 고치고 컨테이너를 재생성합니다(`stop` → `rm -f` → `up -d`). `up -d` 만으로는 환경변수 변경이 반영되지 않는 경우가 있습니다.

### 10-3. `MINIO_SECRET_KEY 를 .env 에 설정하세요` 로 기동 실패

compose 가 `:?` 로 필수 검사를 합니다. `.env` 에 값을 넣습니다. 의도한 동작이며 우회하지 않습니다.

### 10-4. 앱이 healthy 인데 계속 unhealthy 로 보인다

헬스체크를 손봤다면 `curl` 을 썼는지 확인합니다. 1.0.84+ 이미지에는 `curl` 이 없어 `wget` 을 사용합니다. 또 컨테이너 **내부** 프로브는 `${PROTOCOL}` 을 참조하지 않습니다. `PROTOCOL=https` 인 배포에서 평문 포트에 TLS 로 붙어 항상 실패합니다.

### 10-5. 호스트 포트 충돌

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN

# 포트를 바꿀 때는 REACT_APP_API_BASE_URL 도 함께 맞춘다
HTTP_PORT=8088 REACT_APP_API_BASE_URL=http://localhost:8088 \
  docker compose up -d app
```

### 10-6. `relation "users" does not exist`

`SPRING_JPA_HIBERNATE_DDL_AUTO` 가 `none`·`validate` 로 되어 있습니다. `update` 로 한 번 띄워 스키마를 만든 뒤 그대로 둡니다.

### 10-7. `rag-service` 가 healthy 가 되지 않는다

- `testcasecraft-postgres` 가 먼저 healthy 인지 확인합니다. `rag_db` 는 `init-scripts/01-init-rag.sh` 가 **최초 기동 시에만** 생성합니다. `./data/postgres` 가 이미 있는 상태에서 처음 붙이면 init-script 가 돌지 않아 `rag_db` 가 없습니다. 이때는 [DB 통합 마이그레이션 런북](./DB_CONSOLIDATION_MIGRATION.md)의 스크립트로 만듭니다.
- MinIO 도 healthy 여야 합니다(버킷 자동 생성).
- `docker compose logs -f rag-service` 로 실제 오류를 봅니다.

### 10-8. 컨테이너는 healthy 인데 브라우저가 404

리버스 프록시 경로 설정을 확인합니다. `curl http://localhost:8080/` 이 200 이면 프록시 쪽 문제입니다. SPA 라우팅이므로 알 수 없는 경로를 `index.html` 로 넘겨야 합니다.

### 10-9. 로그인 세션이 재기동마다 끊긴다

`JWT_SECRET` 을 비워 둔 상태에서 `./data/app:/app/data` 마운트가 빠졌거나 쓰기 권한이 없어, 매 기동마다 새 키가 생성되고 있습니다. 기동 로그에 다음 경고가 남습니다.

```
[entrypoint] WARNING: could not persist to /app/data/jwt-secret.
```

마운트를 되살리거나 `JWT_SECRET` 을 명시합니다.

### 10-10. Jira·LLM·메일 설정이 저장되지 않는다

`JIRA_ENCRYPTION_KEY` 가 없습니다. prod 프로파일은 기본값을 두지 않아 fail-closed 로 거부합니다. 저장소에 커밋된 개발용 기본 키를 넣어도 운영에서는 `EncryptionUtil` 이 거부합니다.

```bash
openssl rand -base64 32
```

`/actuator/health` 의 `jiraEncryption` 항목으로 설정 상태를 확인할 수 있습니다.

---

## 참고 파일

| 파일 | 역할 |
|---|---|
| `docker-compose-build/docker-compose.yml` | **정본.** 컨테이너 정의 (4개 서비스) |
| `docker-compose-build/.env` | 환경 변수 (`env_example` 을 복사해 작성) |
| `docker-compose-build/.dockerignore` | 빌드 컨텍스트 allow-list (`.env`·`ssl/`·`data/` 유출 차단) |
| `docker-compose-build/start.sh` | 기동·정지 wrapper |
| `docker-compose-build/Dockerfile` | 앱 이미지 빌드 정의 |
| `docker-compose-build/docker-entrypoint.sh` | JWT_SECRET 자동 생성·영속화 |
| `docker-compose-build/init-scripts/01-init-rag.sh` | 최초 기동 시 `rag_user`·`rag_db` 생성 |
| `docker-compose-build/scripts/migrate-consolidate-db.sh` | 구 2-DB 배포에서 `rag_db` 이관 |
| `docker-compose-build/ssl/` | TLS 인증서 마운트 경로 |
| `docs/SECURITY_DEPLOYMENT_ENV.md` | **정본.** 운영 보안 환경변수 |
| `src/main/resources/application-prod.yml` | 컨테이너가 활성화하는 프로파일 |

---

## 관련 문서

- [DB 통합 마이그레이션 런북](./DB_CONSOLIDATION_MIGRATION.md): 구 2-PostgreSQL 배포를 단일 인스턴스로 통합
- [Docker Hub README](./DOCKERHUB_README.md): 외부 공개용 소개·Quick Start
- [운영 배포 보안 환경변수](../SECURITY_DEPLOYMENT_ENV.md): CORS·레이트 리밋·SSRF 가드·CVE 대응
- [사용자 매뉴얼](../manual/new/USER_MANUAL.md): 화면 사용법
- [보안 가이드](../code-guide-line/SECURITY_GUIDE.md): 인증·인가·데이터 보호 구현
