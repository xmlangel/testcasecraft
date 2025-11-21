# TestcaseCraft
<div align="center">
  <img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/TestcaseCraft.jpeg?raw=true" width="200" alt="TestcaseCraft Logo">
</div>
TestcaseCraft: The Finishing Touch ✨
"코드라는 원석이 완벽한 제품으로 빛나는 순간, 그 마지막 손길을 함께합니다."
<div align="center">
  <img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/SoftwareEnginnering.jpeg?raw=true" width="500" alt="SoftwareEnginnering">
</div>
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

✨ Key Features

## 1. Craftsmanship in Management (정교한 관리)
테스트 자산을 체계적으로 구조화하여 관리의 복잡함을 줄입니다.

계층형 테스트 케이스 관리: 폴더 기반의 트리 구조를 통해 직관적으로 케이스를 분류하고 유연하게 구성할 수 있습니다.

멀티 프로젝트 지원: 여러 프로젝트의 테스트 자산을 하나의 시스템에서 통합 관리하여 업무 효율을 극대화합니다.
## 2. Execution & Traceability (실행과 추적)
테스트 계획부터 실행 결과까지, 완성으로 가는 모든 발자취를 기록합니다.

테스트 플랜 (Test Plan): 릴리즈 및 테스트 사이클 단위로 케이스를 묶어 실행 가능한 플랜을 생성합니다.

실행 이력 추적: Pass / Fail / Skip 등의 결과를 상세히 기록하고, 과거의 실행 이력을 투명하게 추적합니다.

자동화 결과 통합: JUnit 포맷(XML)의 자동화 테스트 결과를 import하여 수동 테스트와 자동화 테스트 결과를 한곳에서 관리합니다.

## 3. Intelligence with AI (AI 기반의 통찰)
단순 반복 업무를 넘어, AI와 함께 더 깊이 있는 테스트를 수행합니다.

LLM 지원: 자연어 질의응답을 통해 테스트 시나리오를 구체화하거나 조언을 얻을 수 있습니다. (Support: Ollama, OpenWebUI, OpenAI, Perplexity, OpenRouter)

RAG (Retrieval-Augmented Generation) 지원: 내부에 등록된 문서와 자료를 기반으로 AI가 맥락을 파악하여 정확도 높은 답변을 제공합니다.

## 4. Connection & Security (연동과 보안)
JIRA 연동: JIRA 이슈와 테스트 케이스를 직접 연결하여 개발 진행 상황과 테스트 현황을 실시간으로 동기화합니다.

보안 인증: JWT 기반의 인증 시스템을 통해 안전한 접근 제어와 데이터 보호를 보장합니다.


## Access URLs:
   -  Application:          http://localhost:8080
   -  Application API Docs: http://localhost:8080/swagger-ui.html
   -  RAG Service API Docs: http://localhost:8001/docs
   -  MinIO:                http://localhost:9001
   -  Health Check:         http://localhost:8080/actuator/health
       
## Account
   * PostgreSQL 18 : localhost:5434
      - Username: testcase_user
      - Password: testcase_password
   * PostgreSQL 18 + pgvector: localhost:5433
      - Username: rag_user
      - Password: rag_dev_password_123
   * Minio
      - Username : minioadmin
      - Password : minioadmin_dev_password_789

## Default Login:
  - Username: admin
  -  Password: admin123

## 커스텀 파라미터로 실행하는 방법
TestcaseCraft를 Docker Compose로 실행할 때, 환경 변수값을 다루는 방법은 여러 가지가 있습니다.

1. .env 파일 사용하기
프로젝트 폴더 내에 .env 파일을 만들어 환경 변수 값을 작성하세요. 예를 들어:

```
PROTOCOL=http
DOMAIN=localhost
SERVER_PORT=8080
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password
MINIO_SECRET_KEY=minioadmin_dev_password_789
POSTGRES_RAG_PASSWORD=rag_dev_password_123
JWT_SECRET=your_512bit_jwt_secret_key
```

작성 후 아래 명령어로 실행하면, Docker Compose가 자동으로 해당 파일을 읽습니다.

```
docker compose up -d --build
```

2. 쉘에서 직접 환경 변수 전달하기
아래처럼 쉘에서 환경 변수를 직접 넘기면서 실행할 수도 있습니다. 이 경우 .env 파일이나 Compose 파일 내 변수보다 우선시되어 실행 시점에 값이 덮어씌워집니다.

```
PROTOCOL=https DOMAIN=mydomain.com SERVER_PORT=443 docker compose up -d --build
```
3. --env-file 옵션 사용하기
기본 .env 파일 외에 별도의 환경 변수 파일을 지정할 수도 있습니다. 예를 들어:

```
docker compose --env-file myenvfile.env up -d --build
```
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


## UI Overview
화면의 이미지들은 아래와 같습니다. 

<table width="100%">
  <tr>
    <td valign="top" width="25%">
      <b>Light Login</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/01_Light_Login.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/01_Light_Login.png?raw=true" alt="Light Login"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light SignUp</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/02_Light_SignUp.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/02_Light_SignUp.png?raw=true" alt="Light SignUp"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Project List</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/03_Light_Project_List.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/03_Light_Project_List.png?raw=true" alt="Light Project List"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Project Dashboard</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/04_Light_Project_Dashboard.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/04_Light_Project_Dashboard.png?raw=true" alt="Light Project Dashboard"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light Test Case Form Input</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/05_Light_Test_CASE_Form_INPUT.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/05_Light_Test_CASE_Form_INPUT.png?raw=true" alt="Light Test Case Form Input"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Case Spreadsheet 01</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/06_Light_Test_CASE_Sprdadsheet_01.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/06_Light_Test_CASE_Sprdadsheet_01.png?raw=true" alt="Light Test Case Spreadsheet 01"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Case Spreadsheet 02</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/07_Light_Test_CASE_Sprdadsheet_02.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/07_Light_Test_CASE_Sprdadsheet_02.png?raw=true" alt="Light Test Case Spreadsheet 02"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Plan List</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/08_Light_Test_Plan_List.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/08_Light_Test_Plan_List.png?raw=true" alt="Light Test Plan List"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light Test Execution List</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_00_Light_Test_Execution_List.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_00_Light_Test_Execution_List.png?raw=true" alt="Light Test Execution List"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Execution 1</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_01_Light_Test_execution_1.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_01_Light_Test_execution_1.png?raw=true" alt="Light Test Execution 1"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Execution Input Result</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_02_Light_Test_execution_Input_result.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_02_Light_Test_execution_Input_result.png?raw=true" alt="Light Test Execution Input Result"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Execution Previous Execution Result</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_03_Light_Test_execution_Previos_Execution_result.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_03_Light_Test_execution_Previos_Execution_result.png?raw=true" alt="Light Test Execution Previous Execution Result"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light Test Result 01</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/10_Light_Test_Result_01.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/10_Light_Test_Result_01.png?raw=true" alt="Light Test Result 01"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Test Result 02</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/11_Light_Test_Result_02.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/11_Light_Test_Result_02.png?raw=true" alt="Light Test Result 02"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Automation Dashboard</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/12_Light_Automation_Dashboard.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/12_Light_Automation_Dashboard.png?raw=true" alt="Light Automation Dashboard"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Automation Recent Result</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/13_Light_Automation_Recent_Result.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/13_Light_Automation_Recent_Result.png?raw=true" alt="Light Automation Recent Result"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light Automation Result Detail Tests</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/14_Light_Automation_Result_Detail_Tests.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/14_Light_Automation_Result_Detail_Tests.png?raw=true" alt="Light Automation Result Detail Tests"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Automation Result Detail Fail Tests</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/15_Light_Automation_Result_Detail_Fail_Tests.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/15_Light_Automation_Result_Detail_Fail_Tests.png?raw=true" alt="Light Automation Result Detail Fail Tests"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light Automation Result Detail Slow Tests</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/16_Light_Automation_Result_Detail_Slow_Tests.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/16_Light_Automation_Result_Detail_Slow_Tests.png?raw=true" alt="Light Automation Result Detail Slow Tests"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light RAG DOC</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/17_Light_RAG_DOC.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/17_Light_RAG_DOC.png?raw=true" alt="Light RAG DOC"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light RAG DOC Chat 01</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/18_Light_RAG_DOC_Chat_01.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/18_Light_RAG_DOC_Chat_01.png?raw=true" alt="Light RAG DOC Chat 01"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light RAG DOC Chat Reference RAC</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/19_Light_RAG_DOC_Chat_Referenct_RAC.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/19_Light_RAG_DOC_Chat_Referenct_RAC.png?raw=true" alt="Light RAG DOC Chat Reference RAC"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light RAG DOC Chat Creation</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/20_00_Light_RAG_DOC_Chat_Creation.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/20_00_Light_RAG_DOC_Chat_Creation.png?raw=true" alt="Light RAG DOC Chat Creation"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light RAG PDF</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/20_01_Light_RAG_PDF.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/20_01_Light_RAG_PDF.png?raw=true" alt="Light RAG PDF"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light RAG View Document Chunks</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/20_02_Light_RAG_View_Document_chunks.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/20_02_Light_RAG_View_Document_chunks.png?raw=true" alt="Light RAG View Document Chunks"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light User Profile Basic Info</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/21_Light_User_Profile_Basic_info.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/21_Light_User_Profile_Basic_info.png?raw=true" alt="Light User Profile Basic Info"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light User Profile Password</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/22_Light_User_Profile_Password.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/22_Light_User_Profile_Password.png?raw=true" alt="Light User Profile Password"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light User Profile Language</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/23_Light_User_Profile_Language.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/23_Light_User_Profile_Language.png?raw=true" alt="Light User Profile Language"></a>
    </td>
  </tr>
  <tr>
    <td valign="top" width="25%">
      <b>Light User Profile Appearance</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/24_Light_User_Profile_Appearance.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/24_Light_User_Profile_Appearance.png?raw=true" alt="Light User Profile Appearance"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light User Profile Jira Settings</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/25_Light_User_Profile_Jira_Settings.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/25_Light_User_Profile_Jira_Settings.png?raw=true" alt="Light User Profile Jira Settings"></a>
    </td>
    <td valign="top" width="25%">
      <b>Light User Profile Add Jira Settings</b><br>
      <a href="https://github.com/xmlangel/testcasecraft/blob/master/doc/26_Light_User_Profile_Add_Jira_Settings.png?raw=true" target="_blank"><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/26_Light_User_Profile_Add_Jira_Settings.png?raw=true" alt="Light User Profile Add Jira Settings"></a>
    </td>
    <td valign="top" width="25%"></td>
  </tr>
</table>

