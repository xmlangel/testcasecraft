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
docker compose up -d --build
```

### Method B: Shell environment variables

Useful for one-off tests or overriding settings. Takes precedence over the `.env` file.

```bash
PROTOCOL=https DOMAIN=mydomain.com SERVER_PORT=443 docker compose up -d --build
```

### Method C: Separate env file (`--env-file`)

Use this to keep separate configurations for production, development, etc.

```bash
docker compose --env-file myenvfile.env up -d --build
```

Then open **http://localhost:8080** and log in with the default admin account.

| Service | URL | Description |
| :--- | :--- | :--- |
| **Application** | http://localhost:8080 | Main web app |
| **App API Docs** | http://localhost:8080/swagger-ui.html | Backend API (Swagger) |
| **RAG API Docs** | http://localhost:8001/docs | AI / RAG service API |
| **MinIO Console** | http://localhost:9001 | File storage console |
| **Health Check** | http://localhost:8080/actuator/health | Service status |

### 👤 Default login

| Username | Password |
| :--- | :--- |
| `admin` | `admin123` |

> ⚠️ **Security note:** Change the default password immediately after your first login.

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
docker compose up -d --build
```


#### 방법 B: 쉘 환경 변수 주입
일시적인 테스트나 설정 오버라이딩이 필요할 때 유용합니다. .env 파일보다 우선순위가 높습니다.

```
PROTOCOL=https DOMAIN=mydomain.com SERVER_PORT=443 docker compose up -d --build
```

#### 방법 C: 별도 환경 파일 지정 (--env-file)
운영 환경(prod), 개발 환경(dev) 등 설정을 분리하여 관리할 때 사용합니다.

```
docker compose --env-file myenvfile.env up -d --build
```

-----

## 🔌 Access & Credentials

컨테이너가 정상적으로 실행된 후, 아래 정보를 통해 각 서비스와 데이터베이스에 접속할 수 있습니다.
### 👤 Default Application Login

시스템 최초 접속 시 사용되는 관리자 계정입니다.

> ⚠️ **보안 주의:** 최초 로그인 후 반드시 비밀번호를 변경하시기 바랍니다.

  * **Username:** `admin`
  * **Password:** `admin123`

### 🗄️ Database & Infrastructure Accounts

개발, 디버깅 또는 외부 도구(DBeaver 등) 연결 시 사용하는 계정 정보입니다.

| Component | Host Port | Username | Password | Note |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL (Main)** | `localhost:5434` | `testcase_user` | `testcase_password` | 주요 데이터 저장소 (v18) |
| **PostgreSQL (RAG)** | `localhost:5433` | `rag_user` | `rag_dev_password_123` | 벡터 DB (pgvector + v18) |
| **MinIO** | `localhost:9000` / `9001` | `minioadmin` | `minioadmin_dev_password_789` | S3 호환 스토리지 |


### Configuration


✨ .env sample 

```
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
REACT_APP_API_BASE_URL=http://:localhost:8080

DOCUMENT_PARSER=pymupdf4llm

# Upstage API Key 
UPSTAGE_API_KEY=up

TESTCASE_INIT_ENABLED=false

# MinIO Configuration
MINIO_SECRET_KEY=minioadmin_dev_password_789

# RAG Database Configuration
POSTGRES_RAG_PASSWORD=rag_dev_password_123

```

✨ Docker Compose sample(docker-compose.yml)

```
services:
  # Spring Boot Application
  app:
    image: xmlangel/testcasecraft:latest
    container_name: testcasecraft
    environment:
      # Spring Profile
      - SPRING_PROFILES_ACTIVE=prod
      
      # Protocol and Domain Configuration
      - PROTOCOL=${PROTOCOL}
      - DOMAIN=${DOMAIN}
      
      # Server Configuration
      - SERVER_PORT=${SERVER_PORT}
      
      # SSL Configuration (only when HTTPS)
      - SERVER_SSL_ENABLED=${SERVER_SSL_ENABLED}
      - SERVER_SSL_KEYSTORE=${SSL_KEYSTORE_PATH}
      - SERVER_SSL_KEYSTORE_PASSWORD=${SSL_KEYSTORE_PASSWORD}
      - SERVER_SSL_KEYSTORE_TYPE=${SSL_KEYSTORE_TYPE}
      
      # Database Configuration
      - DATABASE_URL=${DATABASE_URL}
      - DATABASE_USERNAME=${POSTGRES_USER}
      - DATABASE_PASSWORD=${POSTGRES_PASSWORD}
      
      # JWT Configuration
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=${JWT_EXPIRATION}
      - JWT_REFRESH_EXPIRATION=${JWT_REFRESH_EXPIRATION}
      
      # Application Configuration
      - SPRING_JPA_HIBERNATE_DDL_AUTO=${SPRING_JPA_HIBERNATE_DDL_AUTO:-update}

      - SPRING_JPA_SHOW_SQL=false
      - LOGGING_LEVEL_COM_TESTCASE=INFO
      - LOGGING_LEVEL_ROOT=WARN
      - RAG_API_URL=http://rag-service:8000
      - TESTCASE_INIT_ENABLED=${TESTCASE_INIT_ENABLED:-false}

      # MinIO Configuration (TestCase Attachments)
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
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
      - ./logs:/app/logs
      - ./ssl:/app/ssl:ro
    networks:
      - testcasecraft-network
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -f -k ${PROTOCOL}://localhost:${SERVER_PORT}/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped
    platform: linux/amd64
  
  # FastAPI RAG Service
  rag-service:
    image: xmlangel/testcasecraft-rag-service:latest
    container_name: testcasecraft-rag-service
    environment:
      # Database
      DATABASE_URL: postgresql://rag_user:${POSTGRES_RAG_PASSWORD}@postgres-rag:5432/rag_db

      # MinIO (Docker Compose MinIO 사용)
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET: rag-documents
      MINIO_SECURE: "false"

      # Document Parser Configuration
      # Options: upstage, pymupdf, pymupdf4llm, pypdf2, auto
      # Using pymupdf4llm for LLM-optimized markdown extraction (no API key required)
      DOCUMENT_PARSER: ${DOCUMENT_PARSER:-pymupdf4llm}

      # Upstage API (not used when using pymupdf4llm)
      UPSTAGE_API_KEY: ${UPSTAGE_API_KEY:-your_upstage_api_key}

      # Application
      APP_ENV: development
      LOG_LEVEL: DEBUG
    ports:
      - "8001:8000"
    networks:
      - testcasecraft-network
    depends_on:
      postgres-rag:
        condition: service_healthy
      minio:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# PostgreSQL 18 Database
  postgres:
    image: postgres:18
    container_name: testcasecraft_postgres_spring
    environment:
      POSTGRES_DB: testcase_management
      POSTGRES_USER: testcase_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5434:5432"
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

  # PostgreSQL 18 with pgvector extension (RAG)
  postgres-rag:
    image: pgvector/pgvector:pg18
    container_name: testcasecraft-postgres-rag
    environment:
      POSTGRES_DB: rag_db
      POSTGRES_USER: rag_user
      POSTGRES_PASSWORD: ${POSTGRES_RAG_PASSWORD}
    ports:
      - "5433:5432"
    volumes:
      - ./data/postgres-rag:/var/lib/postgresql
      - ./postgres-init:/docker-entrypoint-initdb.d
    networks:
      - testcasecraft-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rag_user -d rag_db"]
      interval: 10s
      timeout: 5s
      retries: 5

# MinIO Object Storage (RAG)
  minio:
    image: minio/minio:latest
    container_name: testcasecraft-minio-rag
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - ./data/minio:/data
    networks:
      - testcasecraft-network
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  testcasecraft-network:
    name: testcasecraft-network-spring
    driver: bridge
```