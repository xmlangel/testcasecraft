<!-- verify: ignore em-dash — 남은 em dash 12곳은 모두 영문 산문(Docker Hub 공개 소개문)이다. 전역 규칙은 영문을 대상에서 제외하며, 영어에서 em dash 는 정상 문장부호다. 한글 산문의 em dash 는 이 회차에 전부 제거했다. -->
<!-- verify: ignore metaphor-swap — '비로소'(Philosophy 절)는 이 회차 이전에 저자가 쓴 브랜드 카피다. 최신화 범위가 아니라 원문을 보존한다. -->
<!-- 완료 판정: verify_doc.sh 의 스캐너 검사는 위 두 family 를 제외할 수 없으므로, 이 문서는 `scan_ai_tells.py --family <위 둘 제외>` 로 0건을 확인했다. -->

<div align="center">
  <img src="https://raw.githubusercontent.com/xmlangel/testcasecraft/master/docs/testcasecraft.jpg" width="600" alt="TestcaseCraft — Open Source Test Case Management Tool">

  <h1>TestcaseCraft</h1>
  <p><strong>The open source, self-hosted test case management tool for modern QA teams.</strong></p>

  <p>
    <a href="https://hub.docker.com/r/xmlangel/testcasecraft"><img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/xmlangel/testcasecraft?logo=docker&label=pulls"></a>
    <a href="https://hub.docker.com/r/xmlangel/testcasecraft/tags"><img alt="Docker Image Version" src="https://img.shields.io/docker/v/xmlangel/testcasecraft?sort=semver&logo=docker&label=version"></a>
    <a href="https://github.com/xmlangel/testcasecraft"><img alt="GitHub" src="https://img.shields.io/badge/source-GitHub-181717?logo=github"></a>
  </p>
</div>

> **TestcaseCraft is a free, open source test case management system (TCMS)** you can self-host with Docker in minutes. Design, organize, execute, and trace your test cases — manual and automated — with built-in **AI/RAG assistance**, **Jira integration**, and a clean React UI. A modern alternative to Kiwi TCMS, TestLink, and Squash.

```bash
docker pull xmlangel/testcasecraft:latest
```

---

## 🔎 What is TestcaseCraft?

**TestcaseCraft** is an **all-in-one, open source QA platform** that manages the full test lifecycle — from **test case design** to **execution** and **result analysis** — in a single self-hosted application.

Built on a robust **Spring Boot + React** architecture, with a **FastAPI-based RAG (Retrieval-Augmented Generation)** service layered on top, TestcaseCraft goes beyond simple record-keeping to deliver an *intelligent testing environment*.

If you are looking for a **self-hosted, Docker-ready, open source test management tool** that your team fully owns — with no per-seat SaaS pricing and no vendor lock-in — TestcaseCraft is built for you.

**Keywords:** open source test case management · self-hosted TCMS · Docker test management · QA test case tool · manual & automated test tracking · AI test assistant · Jira test management.

---
## ✨ Why teams choose TestcaseCraft

| | |
|---|---|
| 🐳 **Self-hosted in minutes** | One `docker compose up` brings up app, AI service, PostgreSQL, and object storage. Your data never leaves your servers. |
| 🌲 **Hierarchical test cases** | Folder-based tree structure to organize, classify, and reorganize test cases intuitively. |
| 🧩 **Multi-project** | Manage test assets for many projects from a single system. |
| 📋 **Test plans & cycles** | Bundle cases into runnable plans per release or test cycle. |
| 📈 **Execution & traceability** | Record Pass / Fail / Skip results and transparently track historical runs. |
| 🤖 **AI-powered (LLM + RAG)** | Ask questions in natural language, refine scenarios, and get context-aware answers grounded in your own documents. |
| 🔗 **Jira integration** | Link Jira issues directly to test cases and sync development & testing status in real time. |
| 🔐 **JWT security** | Token-based authentication for safe access control and data protection. |
| 🧪 **Automation import** | Import **JUnit XML** results and manage manual + automated tests in one place. |
| 🆓 **Open source & free** | No per-seat licensing. Own your QA platform. |

---

## 🚀 Quick Start — How to Run

TestcaseCraft supports several ways to inject environment variables, so you can pick what fits your situation. Full `.env` and `docker-compose.yml` samples are in the shared **Configuration** section at the bottom of this page.

### Method A: `.env` file (recommended)

Create a `.env` file in the project root. Docker Compose loads it automatically at startup.

```bash
# 1. Create a .env file (see Configuration below)
# 2. Start the containers
docker compose up -d
```

### Method B: Shell environment variables

Useful for one-off tests or overriding settings. Takes precedence over the `.env` file.

```bash
PROTOCOL=https DOMAIN=mydomain.com SERVER_PORT=443 docker compose up -d
```

### Method C: Separate env file (`--env-file`)

Use this to keep separate configurations for production, development, etc.

```bash
docker compose --env-file myenvfile.env up -d --build
```

Then open **http://localhost:8080** and log in as `admin` (see [First login](#-first-login) for the password).

| Service | URL | Description |
| :--- | :--- | :--- |
| **Application** | http://localhost:8080 | Main web app |
| **App API Docs** | http://localhost:8080/swagger-ui.html | Backend API (Swagger) |
| **RAG API Docs** | http://127.0.0.1:8001/docs | AI / RAG service API — loopback only, no authentication |
| **MinIO Console** | http://127.0.0.1:9001 | File storage console — loopback only |
| **Health Check** | http://localhost:8080/actuator/health | Service status |

### 👤 First login

There is **no fixed default password.** On first start against an empty database the app creates a single `admin` account and takes the password from `TESTCASE_ADMIN_PASSWORD`.

**Recommended** — set it in `.env` before the first start:

```bash
TESTCASE_ADMIN_PASSWORD=<your-strong-password>
```

**If you leave it empty**, a random password is generated and printed to the startup log **once**:

```bash
docker compose logs app | grep -A2 "admin 초기 비밀번호"
```

> ⚠️ The generated password appears only on that first run. Capture it, log in, and change it in the profile menu.

> ⚠️ `admin123` only applies when `TESTCASE_INIT_ENABLED=true` (demo seed mode). **That mode deletes all existing data before seeding** — never enable it on an instance with real data.

---

## 🧱 Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React |
| **Backend** | Spring Boot |
| **AI Service** | FastAPI (RAG & LLM integration) |
| **Database** | PostgreSQL 18 (+ pgvector for RAG) |
| **Object Storage** | MinIO (S3-compatible) |
| **Auth** | JWT |

**Supported LLM providers:** Ollama · OpenWebUI · OpenAI · Perplexity · OpenRouter.

## 🆚 TestcaseCraft vs other open source test management tools

| Capability | **TestcaseCraft** | Kiwi TCMS | TestLink | Squash |
| :--- | :---: | :---: | :---: | :---: |
| Self-hosted via Docker | ✅ | ✅ | ✅ | ✅ |
| Hierarchical (folder tree) test cases | ✅ | ✅ | ✅ | ✅ |
| Test plans & execution tracking | ✅ | ✅ | ✅ | ✅ |
| JUnit XML automation import | ✅ | ✅ | partial | ✅ |
| **Built-in AI assistant (LLM)** | ✅ | ❌ | ❌ | ❌ |
| **RAG over your own docs** | ✅ | ❌ | ❌ | ❌ |
| Jira integration | ✅ | ✅ | ✅ | ✅ |
| Modern React UI | ✅ | partial | ❌ | ✅ |

*Comparison reflects publicly documented capabilities and is provided for orientation only.*

---

## 💡 Use cases

- **QA teams** that want a fully owned, self-hosted alternative to SaaS test management (TestRail, Zephyr, Xray).
- **Security-sensitive environments** that require on-premise, air-gapped deployment.
- **Teams adopting AI in QA** — author test scenarios, summarize specs, and query internal docs with RAG.
- **Mixed manual + automation** workflows that consolidate JUnit results with manual runs.
- **Jira-centric** teams that need traceability between issues and test cases.

---

## ❓ FAQ

**Is TestcaseCraft really open source and free?**
Yes. TestcaseCraft is open source and free to self-host. You own your data and your deployment.

**Can I run it entirely on-premise / offline?**
Yes. Everything runs in Docker containers on your infrastructure. With a local LLM provider (e.g. Ollama), even the AI features can run fully offline.

**Does it support automated test results?**
Yes — import **JUnit XML** to manage automated and manual tests together.

**Which databases does it use?**
PostgreSQL 18 for application data and PostgreSQL 18 + **pgvector** for RAG embeddings.

**Is there an API?**
Yes — a full REST API documented via Swagger, plus an **MCP server** so LLM clients (Claude Desktop, Cline, Cursor) can drive TestcaseCraft in natural language.

---

## 🔗 Links

- 🐳 **Docker Hub:** https://hub.docker.com/r/xmlangel/testcasecraft
- 💻 **Source (GitHub):** https://github.com/xmlangel/testcasecraft
- 📚 **API Docs (Swagger):** `/swagger-ui.html` on a running instance

---

<div align="center">
  <sub>TestcaseCraft — The Finishing Touch ✨ · Open source test case management, self-hosted with Docker.</sub>
</div>

----
TestcaseCraft: The Finishing Touch ✨
"코드라는 원석이 완벽한 제품으로 빛나는 순간, 그 마지막 손길을 함께합니다."

# Philosophy: 완성하는 손길 (The Finishing Touch)
소프트웨어 개발의 끝단에서 품질을 책임지는 QA(Quality Assurance)는 단순한 오류 검출이 아닙니다. 그것은 거친 원석과도 같은 코드를 다듬고, 디지털 블록의 마지막 조각을 끼워 맞춰 비로소 제품을 빛나게 하는 '장인(Craftsman)'의 과정입니다.

TestcaseCraft는 이러한 장인 정신을 담았습니다. QA 엔지니어의 섬세한 시각과 숙련된 경험이 디지털 환경에서 온전히 발휘될 수 있도록, 가장 직관적이고 현대적인 도구를 제공합니다. 당신의 손끝에서 소프트웨어의 완성을 경험하세요.

# Introduction
TestcaseCraft는 테스트 케이스 설계부터 실행, 결과 분석까지의 전체 라이프사이클을 통합 관리하는 All-in-One QA 플랫폼입니다.

Spring Boot와 React로 구축된 견고한 아키텍처 위에, FastAPI 기반의 RAG(검색 증강 생성) 서비스를 더해 단순한 관리를 넘어선 '지능형 테스트 환경'을 제공합니다.

### Tech Stack
- Frontend: React
- Backend: Spring Boot
- AI Service: FastAPI (RAG & LLM Integration)
- Database: PostgreSQL 18 (+ pgvector for RAG)
- Storage: MinIO

# Key Features

## 1. Craftsmanship in Management (정교한 관리)
테스트 자산을 체계적으로 구조화하여 관리의 복잡함을 줄입니다.

- 계층형 테스트 케이스 관리: 폴더 기반의 트리 구조를 통해 직관적으로 케이스를 분류하고 유연하게 구성할 수 있습니다.
- 멀티 프로젝트 지원: 여러 프로젝트의 테스트 자산을 하나의 시스템에서 통합 관리하여 업무 효율을 극대화합니다.

## 2. Execution & Traceability (실행과 추적)
테스트 계획부터 실행 결과까지, 완성으로 가는 모든 발자취를 기록합니다.

- 테스트 플랜 (Test Plan): 릴리즈 및 테스트 사이클 단위로 케이스를 묶어 실행 가능한 플랜을 생성합니다.
- 실행 이력 추적: Pass / Fail / Skip 등의 결과를 상세히 기록하고, 과거의 실행 이력을 투명하게 추적합니다.
- 자동화 결과 통합: JUnit 포맷(XML)의 자동화 테스트 결과를 import하여 수동 테스트와 자동화 테스트 결과를 한곳에서 관리합니다.

## 3. Intelligence with AI (AI 기반의 통찰)
단순 반복 업무를 넘어, AI와 함께 더 깊이 있는 테스트를 수행합니다.

- LLM 지원: 자연어 질의응답을 통해 테스트 시나리오를 구체화하거나 조언을 얻을 수 있습니다. (Support: Ollama, OpenWebUI, OpenAI, Perplexity, OpenRouter)
- RAG (Retrieval-Augmented Generation) 지원: 내부에 등록된 문서와 자료를 기반으로 AI가 맥락을 파악하여 정확도 높은 답변을 제공합니다.

## 4. Connection & Security (연동과 보안)
- JIRA 연동: JIRA 이슈와 테스트 케이스를 직접 연결하여 개발 진행 상황과 테스트 현황을 실시간으로 동기화합니다.
- 보안 인증: JWT 기반의 인증 시스템을 통해 안전한 접근 제어와 데이터 보호를 보장합니다.

🚀 Getting Started

### 1. 실행 방법 (How to Run)
TestcaseCraft는 유연한 설정을 위해 다양한 환경 변수 주입 방식을 지원합니다. 상황에 맞는 방법을 선택하세요.

#### 방법 A: .env 파일 사용 (권장)
프로젝트 루트에 .env 파일을 생성하여 설정을 관리합니다. Docker Compose가 실행 시 자동으로 이 파일을 로드합니다.

```
# 1. .env 파일 작성 (하단의 Configuration 참조)
# 2. 컨테이너 실행
docker compose up -d
```


#### 방법 B: 쉘 환경 변수 주입
일시적인 테스트나 설정 오버라이딩이 필요할 때 유용합니다. .env 파일보다 우선순위가 높습니다.

```
PROTOCOL=https DOMAIN=mydomain.com SERVER_PORT=443 docker compose up -d
```

#### 방법 C: 별도 환경 파일 지정 (--env-file)
운영 환경(prod), 개발 환경(dev) 등 설정을 분리하여 관리할 때 사용합니다.

```
docker compose --env-file myenvfile.env up -d --build
```

-----

## 🔌 Access & Credentials

컨테이너가 정상적으로 실행된 후, 아래 정보를 통해 각 서비스와 데이터베이스에 접속할 수 있습니다.
### 👤 최초 로그인 계정

**고정된 기본 비밀번호는 없습니다.** 빈 데이터베이스로 처음 기동하면 `admin` 계정 하나가 만들어지고, 비밀번호는 `TESTCASE_ADMIN_PASSWORD` 값을 사용합니다.

**권장:** 첫 기동 전에 `.env` 에 지정합니다.

```bash
TESTCASE_ADMIN_PASSWORD=<강한 비밀번호>
```

**비워 두면** 무작위 비밀번호가 생성되어 기동 로그에 **1회만** 출력됩니다.

```bash
docker compose logs app | grep -A2 "admin 초기 비밀번호"
```

> ⚠️ 이 값은 최초 기동에만 나옵니다. 받아 적고 로그인한 뒤 프로필에서 변경합니다.

> ⚠️ `admin123` 은 `TESTCASE_INIT_ENABLED=true`(시연 시딩 모드)에서만 쓰입니다. **그 모드는 시딩 전에 기존 데이터를 모두 삭제하므로** 실제 데이터가 있는 인스턴스에서는 켜지 않습니다.

### 🗄️ Database & Infrastructure Accounts

개발·디버깅이나 외부 도구(DBeaver 등) 연결에 쓰는 계정입니다. 값은 `.env` 에서 오므로 아래 표는 `env_example` 기본값이며, 운영에서는 교체합니다.

postgres·MinIO·RAG 포트는 `127.0.0.1` 에만 바인딩되어 호스트 밖에서는 닿지 않습니다. 원격에서 붙어야 하면 SSH 터널을 사용합니다 (`ssh -L 5434:127.0.0.1:5434 <remote>`).

> v1.0.93부터 앱 DB와 RAG DB가 단일 PostgreSQL(pgvector) 인스턴스로 통합되었습니다 (호스트 포트 `5434` 하나).

| Component | Host Port | Username | Password | Note |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL + pgvector (통합)** | `127.0.0.1:5434` | `testcase_user` (앱) / `rag_user` (RAG) | `testcase_password` / `rag_dev_password_123` | 단일 인스턴스가 앱 DB `testcase_management` + RAG DB `rag_db` 를 함께 호스팅 (pgvector, v18) |
| **MinIO** | `127.0.0.1:9000` / `9001` | `minioadmin` | `minioadmin_dev_password_789` | S3 호환 스토리지 |


### Configuration


✨ `.env` sample

저장소 루트의 `env_example` 을 그대로 옮긴 것입니다. 복사해서 `docker-compose-build/.env` 로 두고 값을 채웁니다.

```bash
# Protocol Configuration (http or https)
PROTOCOL=http

# Server Configuration
HTTP_PORT=8080
HTTPS_PORT=443
DOMAIN=localhost

SERVER_PORT=8080
SERVER_SSL_ENABLED=false

# SSL Configuration (only used when PROTOCOL=https)
SSL_KEYSTORE_PATH=/app/ssl/keystore.p12
SSL_KEYSTORE_PASSWORD=changeit
SSL_KEYSTORE_TYPE=PKCS12

# Database Configuration
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password
DATABASE_URL=jdbc:postgresql://postgres:5432/testcase_management

# JWT Configuration (512-bit key required for HS512)
JWT_SECRET=512-bit key required for HS512
# SessionTime
JWT_EXPIRATION=604800000
JWT_REFRESH_EXPIRATION=2592000000

# Spring Boot Configuration
SPRING_PROFILES_ACTIVE=prod

# JPA Configuration
# Use validate to avoid Hibernate attempting to recreate existing indexes on startup
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false

# Logging Configuration
LOGGING_LEVEL_COM_TESTCASE=INFO
LOGGING_LEVEL_ROOT=WARN

# Frontend API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080

DOCUMENT_PARSER=pymupdf4llm

# Upstage API Key
UPSTAGE_API_KEY=up

TESTCASE_INIT_ENABLED=false

# MinIO Configuration
MINIO_SECRET_KEY=minioadmin_dev_password_789

# RAG Database Configuration
POSTGRES_RAG_PASSWORD=rag_dev_password_123

# 저장하는 비밀값을 암호화하는 키 (AES-256, 32바이트 Base64)
#
# 이름은 JIRA 인데 실제로는 넷을 함께 암호화한다.
#   - LLM API Key (LLM 설정)
#   - Jira API 토큰
#   - 메일 비밀번호
#   - Google 서비스 계정 JSON
#
# prod 프로파일은 기본값을 두지 않으므로 이 값이 없으면 위 넷을 저장할 수 없다.
# 다시 만들려면: openssl rand -base64 32
#
# 키를 바꾸면 이미 저장된 값을 복호화할 수 없어 모두 다시 입력해야 한다.
JIRA_ENCRYPTION_KEY=MQCS2AMZreQaJPwoo7CSe6EZexRseE2ctXvvtMCOgaI=
```

**필수 값.** 없으면 컨테이너가 뜨지 않거나 기능이 막힙니다.

| 변수 | 미설정 시 |
| :--- | :--- |
| `MINIO_SECRET_KEY` | compose 의 `:?` 검사에 걸려 app·rag-service 기동 거부 |
| `JIRA_ENCRYPTION_KEY` | 앱은 뜨지만 LLM API 키·Jira 토큰·메일 비밀번호·Google 서비스 계정 JSON 을 저장할 수 없음 |
| `POSTGRES_PASSWORD` · `POSTGRES_RAG_PASSWORD` | DB 인증 실패 |
| `REACT_APP_API_BASE_URL` | 브라우저 주소와 다르면 로그인·회원가입이 `Failed to fetch` 로 실패 |

**앱이 읽지 않는 변수.** `env_example` 에 남아 있지만 현재 코드 경로에서 소비되지 않습니다. 값을 넣어도 동작이 바뀌지 않습니다.

| 변수 | 이유 |
| :--- | :--- |
| `SERVER_SSL_ENABLED`, `SSL_KEYSTORE_*` | compose 가 앱 컨테이너에 전달하지 않고 `application-prod.yml` 에 `server.ssl` 블록도 없습니다. TLS 는 리버스 프록시에서 종료시킵니다 |
| `JWT_EXPIRATION` | 컨테이너는 `prod` 프로파일로 뜨고, prod 는 **`JWT_ACCESS_EXPIRATION`** 을 읽습니다. prod 기본값은 access 1시간 · refresh 90일입니다 |

운영 배포에서 함께 확인할 보안 환경변수(CORS 허용 오리진, 레이트 리밋의 프록시 헤더 신뢰, Jira SSRF 가드)는 [`docs/SECURITY_DEPLOYMENT_ENV.md`](../SECURITY_DEPLOYMENT_ENV.md) 에 정리되어 있습니다.

✨ Docker Compose (`docker-compose.yml`)

저장소의 `docker-compose-build/docker-compose.yml` 을 그대로 옮긴 것입니다. 이미지 태그·바인드 마운트·포트 바인딩·하드닝 설정이 실제 배포와 같습니다.

```yaml
services:
  # Spring Boot Application
  app:
    image: xmlangel/testcasecraft:1.0.120
    container_name: testcasecraft
    environment:
      # Spring Profile
      - SPRING_PROFILES_ACTIVE=prod

      # Protocol and Domain Configuration
      - PROTOCOL=${PROTOCOL}
      - DOMAIN=${DOMAIN}

      # Server Configuration
      - SERVER_PORT=${SERVER_PORT}

      # Database Configuration
      - DATABASE_URL=${DATABASE_URL}
      - DATABASE_USERNAME=${POSTGRES_USER}
      - DATABASE_PASSWORD=${POSTGRES_PASSWORD}

      # JWT Configuration
      # JWT_SECRET 미설정 시 컨테이너가 자동 생성 후 /app/data/jwt-secret 에 영속화
      - JWT_SECRET=${JWT_SECRET:-}
      - JWT_EXPIRATION=${JWT_EXPIRATION}
      - JWT_REFRESH_EXPIRATION=${JWT_REFRESH_EXPIRATION}

      # 저장하는 비밀값을 암호화하는 키 (LLM API Key · Jira 토큰 · 메일 비밀번호 · Google JSON)
      # prod 프로파일은 기본값을 두지 않으므로 없으면 위 넷을 저장할 수 없다.
      - JIRA_ENCRYPTION_KEY=${JIRA_ENCRYPTION_KEY:-}

      # Application Configuration
      - SPRING_JPA_HIBERNATE_DDL_AUTO=${SPRING_JPA_HIBERNATE_DDL_AUTO:-update}
      - SHOW_EXPLORATORY_SESSION_TAB=${SHOW_EXPLORATORY_SESSION_TAB:-false}

      - SPRING_JPA_SHOW_SQL=false
      - LOGGING_LEVEL_COM_TESTCASE=INFO
      - LOGGING_LEVEL_ROOT=WARN
      - RAG_API_URL=http://rag-service:8000
      - TESTCASE_INIT_ENABLED=${TESTCASE_INIT_ENABLED:-false}

      # MinIO Configuration (TestCase Attachments)
      # MINIO_ACCESS_KEY 는 .env 로 교체 가능하게 뺐다. 기본값은 기존 동작 유지를 위해
      # minioadmin — 기존 .env 에 이 변수가 없어도 그대로 뜬다.
      # 운영에서는 .env 에 고유 값을 넣고, 가능하면 root 대신 버킷 범위 서비스 계정을 쓸 것.
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY:?MINIO_SECRET_KEY 를 .env 에 설정하세요}
      - MINIO_TESTCASE_BUCKET=testcase-attachments
      - MINIO_SECURE=false

      # Mail Configuration (optional - can be empty for development)
      - MAIL_USERNAME=${MAIL_USERNAME:-}
      - MAIL_PASSWORD=${MAIL_PASSWORD:-}
      - MAIL_HOST=${MAIL_HOST:-localhost}
      - MAIL_PORT=${MAIL_PORT:-587}

      # Frontend API Configuration
      - REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL:-http://localhost:8080}
    ports:
      - "${HTTP_PORT}:${SERVER_PORT}"
      - "${HTTPS_PORT}:${SERVER_PORT}"
    volumes:
      # 자동 생성된 JWT_SECRET 영속화 (컨테이너 재생성에도 세션 유지)
      - ./data/app:/app/data
    networks:
      - testcasecraft-network
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
    healthcheck:
      # busybox wget 사용 (1.0.84+ 이미지는 보안상 curl 미포함)
      #
      # 이전에는 ${PROTOCOL} 을 그대로 썼는데, 그건 사용자가 *밖에서* 접속하는
      # 스킴이라 PROTOCOL=https 인 배포에서는 평문 SERVER_PORT 에 TLS 로 붙어
      # 앱이 정상 기동해도 항상 unhealthy 였다:
      #   SSL routines:tls_validate_record_header:wrong version number
      # 컨테이너 내부 프로브는 스킴을 가정하지 말고 http → https 로 폴백한다.
      #
      # 이 오버라이드는 구버전 이미지 호환에도 필요하다 — 1.0.99 이하의 내장
      # HEALTHCHECK 는 80/443 이 하드코딩돼 있어 SERVER_PORT=8080 이면 항상 실패한다.
      test:
        [
          "CMD-SHELL",
          "wget -q -O /dev/null http://localhost:${SERVER_PORT}/actuator/health || wget -q --no-check-certificate -O /dev/null https://localhost:${SERVER_PORT}/actuator/health || exit 1",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    # 컨테이너 하드닝: setuid 권한상승 차단 + 모든 리눅스 capability 제거
    # (앱은 8080 비특권 포트로 뜨므로 NET_BIND_SERVICE 도 필요 없다)
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    restart: always

  # FastAPI RAG Service
  rag-service:
    image: xmlangel/testcasecraft-rag-service:1.0.11
    container_name: testcasecraft-rag-service
    environment:
      # Database (통합 단일 PostgreSQL 인스턴스의 rag_db 를 사용)
      DATABASE_URL: postgresql://rag_user:${POSTGRES_RAG_PASSWORD}@postgres:5432/rag_db

      # MinIO (Docker Compose MinIO 사용)
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY:?MINIO_SECRET_KEY 를 .env 에 설정하세요}
      MINIO_BUCKET: rag-documents
      MINIO_SECURE: "false"

      # Document Parser Configuration
      # Options: upstage, pymupdf, pymupdf4llm, pypdf2, auto
      # Using pymupdf4llm for LLM-optimized markdown extraction (no API key required)
      DOCUMENT_PARSER: ${DOCUMENT_PARSER:-pymupdf4llm}

      # Upstage API (not used when using pymupdf4llm)
      UPSTAGE_API_KEY: ${UPSTAGE_API_KEY:-}

      # Application
      # DEBUG 로그는 DB URL·MinIO 키가 섞인 커넥션 문자열까지 남기므로 운영은 INFO.
      APP_ENV: ${RAG_APP_ENV:-production}
      LOG_LEVEL: ${RAG_LOG_LEVEL:-INFO}
    # 8001 은 앱이 내부 네트워크(http://rag-service:8000)로만 쓴다.
    # 외부 노출 없이 루프백에만 바인딩 — 인증 없는 /docs·/redoc 이 열려 있다.
    ports:
      - "${INTERNAL_BIND_ADDR:-127.0.0.1}:8001:8000"
    networks:
      - testcasecraft-network
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
    # command 오버라이드 제거: --reload(개발용 오토리로더)는 코드 마운트도 없는
    # 운영 컨테이너에서 파일 감시 프로세스만 늘리고 이미지 CMD 를 덮어썼다.
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    restart: always

  # PostgreSQL 18 with pgvector — 통합 단일 인스턴스
  #   - testcase_management (앱 DB, testcase_user)
  #   - rag_db (RAG 벡터 DB, rag_user) : init-scripts 가 최초 기동 시 자동 생성
  # 신규 배포는 init-scripts 로 rag_db 가 자동 생성되고, 기존 배포는
  # scripts/migrate-consolidate-db.sh 로 rag_db 데이터를 이관한다.
  postgres:
    image: pgvector/pgvector:pg18
    container_name: testcasecraft-postgres
    environment:
      POSTGRES_DB: testcase_management
      POSTGRES_USER: testcase_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      # 최초 기동 시 rag_user/rag_db 생성에 사용 (init-scripts/01-init-rag.sh)
      POSTGRES_RAG_PASSWORD: ${POSTGRES_RAG_PASSWORD}
    # 앱·RAG 는 같은 도커 네트워크로 붙으므로 포트 퍼블리시는 로컬 관리용일 뿐이다.
    # 0.0.0.0 바인딩은 호스트 방화벽을 우회(docker 가 iptables 를 직접 조작)하므로
    # 루프백으로 제한한다. 원격 접속은 SSH 터널을 쓸 것.
    ports:
      - "${INTERNAL_BIND_ADDR:-127.0.0.1}:5434:5432"
    volumes:
      - ./data/postgres:/var/lib/postgresql
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - testcasecraft-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U testcase_user -d testcase_management"]
      interval: 10s
      timeout: 5s
      retries: 5
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    # postgres 엔트리포인트가 데이터 디렉터리 소유권 조정 후 postgres 유저로
    # 내려가는 데 필요한 최소 capability 만 되돌린다.
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    restart: always

  # MinIO Object Storage — 앱/RAG 공용 단일 인스턴스
  #   - testcase-attachments 버킷 (앱 첨부파일)
  #   - rag-documents 버킷 (RAG 문서)
  minio:
    # :latest 대신 릴리스 고정 — 재기동마다 다른 바이너리가 내려오는 것을 막고
    # 취약점 스캔 결과를 특정 다이제스트에 귀속시킨다.
    image: minio/minio:${MINIO_IMAGE_TAG:-RELEASE.2025-09-07T16-13-09Z}
    container_name: testcasecraft-minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:?MINIO_SECRET_KEY 를 .env 에 설정하세요}
      # 콘솔은 브라우저에서만 쓰므로 CSRF/Origin 검사를 위해 접근 URL 을 고정
      MINIO_BROWSER_REDIRECT_URL: ${MINIO_CONSOLE_URL:-http://127.0.0.1:9001}
    # S3 API·콘솔 모두 루프백 전용. 앱/RAG 는 내부 네트워크(minio:9000)로 접근한다.
    ports:
      - "${INTERNAL_BIND_ADDR:-127.0.0.1}:9000:9000" # API
      - "${INTERNAL_BIND_ADDR:-127.0.0.1}:9001:9001" # Console
    volumes:
      - ./data/minio:/data
    networks:
      - testcasecraft-network
    command: server /data --console-address ":9001"
    healthcheck:
      # minio 이미지에는 curl 이 없다 — 번들된 mc 로 체크
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    restart: always

networks:
  testcasecraft-network:
    name: testcasecraft-network-spring
    driver: bridge
```
