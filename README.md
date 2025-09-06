# Test Case Manager

This is a full-stack web application for managing test cases. The frontend is built with React and the backend is built with Spring Boot.

## Project Structure

```
.
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
├── src
│   ├── main
│   │   ├── frontend
│   │   │   ├── public
│   │   │   │   └── index.html
│   │   │   ├── src
│   │   │   │   ├── components
│   │   │   │   ├── context
│   │   │   │   ├── models
│   │   │   │   └── utils
│   │   │   ├── package.json
│   │   │   └── ...
│   │   ├── java
│   │   │   └── com/testcase/testcasemanagement
│   │   │       ├── controller
│   │   │       ├── model
│   │   │       ├── repository
│   │   │       └── service
│   │   └── resources
│   │       ├── application.properties
│   │       └── static
│   └── test
│       ├── java
│       └── resources
└── ...
```

### Frontend (`src/main/frontend`)

*   **Framework:** React
*   **UI Library:** Material-UI
*   **State Management:** Context API
*   **Data Storage:** localStorage
*   **Routing:** React Router
*   **Key Directories:**
    *   `src/components`: Contains reusable React components.
    *   `src/context`: Holds the application's global state using Context API.
    *   `src/models`: Defines data structures used in the application.
    *   `src/utils`: Provides utility functions.

### Backend (`src/main/java`)

*   **Framework:** Spring Boot
*   **Database:** PostgreSQL (with JPA)
*   **Authentication:** JWT
*   **Build Tool:** Gradle
*   **Key Packages:**
    *   `controller`: Handles incoming HTTP requests.
    *   `model`: Defines data entities.
    *   `repository`: Manages data access using Spring Data JPA.
    *   `service`: Implements business logic.

## Getting Started

### Prerequisites

*   Java 21 or later
*   Node.js 20.11.1 or later
*   PostgreSQL

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/test-case-manager.git
    cd test-case-manager
    ```

2.  **Install frontend dependencies:**
    ```bash
    cd src/main/frontend
    npm install
    ```

3.  **Run the application:**
    *   **Frontend:**
        ```bash
        npm start
        ```
    *   **Backend:**
        Open a new terminal and run:
        ```bash
        ./gradlew bootRun
        ```

The application will be available at `http://localhost:3000`.

## Copilot Commit Message Configuration

This project is configured to generate commit messages in both English and Korean using GitHub Copilot. The configuration includes:

### Files Created:
- `.copilot/settings.json`: Copilot-specific settings
- `.copilot/commit-template.md`: Commit message template and examples
- `.gitmessage`: Git commit template
- `.vscode/settings.json`: VS Code workspace settings

### Commit Message Format:
```
[EN] English summary / [KO] Korean summary
```

### Examples:
- `[EN] Add user authentication feature / [KO] 사용자 인증 기능 추가`
- `[EN] Fix login validation bug / [KO] 로그인 검증 버그 수정`
- `[EN] Update dashboard UI components / [KO] 대시보드 UI 컴포넌트 업데이트`

### How to Use:
1. When committing changes, Copilot will automatically suggest bilingual commit messages
2. You can also manually use the template by running `git commit` (without `-m` flag)
3. The template will open in your default editor

## Available Scripts

### Frontend (`package.json`)

*   `npm start`: Runs the app in development mode.
*   `npm test`: Launches the test runner in interactive watch mode.
*   `npm run build`: Builds the app for production to the `build` folder.

### Backend (`build.gradle`)

*   `./gradlew bootRun`: Runs the Spring Boot application.
*   `./gradlew build`: Builds the project.
*   `./gradlew test`: Runs the tests.

---

# 테스트 케이스 관리자

이것은 테스트 케이스 관리를 위한 풀스택 웹 애플리케이션입니다. 프론트엔드는 React로, 백엔드는 Spring Boot로 구축되었습니다.

## 프로젝트 구조

```
.
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
├── src
│   ├── main
│   │   ├── frontend
│   │   │   ├── public
│   │   │   │   └── index.html
│   │   │   ├── src
│   │   │   │   ├── components
│   │   │   │   ├── context
│   │   │   │   ├── models
│   │   │   │   └── utils
│   │   │   ├── package.json
│   │   │   └── ...
│   │   ├── java
│   │   │   └── com/testcase/testcasemanagement
│   │   │       ├── controller
│   │   │       ├── model
│   │   │       ├── repository
│   │   │       └── service
│   │   └── resources
│   │       ├── application.properties
│   │       └── static
│   └── test
│       ├── java
│       └── resources
└── ...
```

### 프론트엔드 (`src/main/frontend`)

*   **프레임워크:** React
*   **UI 라이브러리:** Material-UI
*   **상태 관리:** Context API
*   **데이터 저장소:** localStorage
*   **라우팅:** React Router
*   **주요 디렉토리:**
    *   `src/components`: 재사용 가능한 React 컴포넌트를 포함합니다.
    *   `src/context`: Context API를 사용하여 애플리케이션의 전역 상태를 관리합니다.
    *   `src/models`: 애플리케이션에서 사용되는 데이터 구조를 정의합니다.
    *   `src/utils`: 유틸리티 함수를 제공합니다.

### 백엔드 (`src/main/java`)

*   **프레임워크:** Spring Boot
*   **데이터베이스:** PostgreSQL (JPA 사용)
*   **인증:** JWT
*   **빌드 도구:** Gradle
*   **주요 패키지:**
    *   `controller`: 들어오는 HTTP 요청을 처리합니다.
    *   `model`: 데이터 엔티티를 정의합니다.
    *   `repository`: Spring Data JPA를 사용하여 데이터 액세스를 관리합니다.
    *   `service`: 비즈니스 로직을 구현합니다.

## 시작하기

### 요구 사항

*   Java 21 이상
*   Node.js 20.11.1 이상
*   PostgreSQL

### 설치 및 실행

1.  **저장소 복제:**
    ```bash
    git clone https://github.com/your-username/test-case-manager.git
    cd test-case-manager
    ```

2.  **프론트엔드 종속성 설치:**
    ```bash
    cd src/main/frontend
    npm install
    ```

3.  **애플리케이션 실행:**
    *   **프론트엔드:**
        ```bash
        npm start
        ```
    *   **백엔드:**
        새 터미널을 열고 다음을 실행합니다:
        ```bash
        ./gradlew bootRun
        ```

애플리케이션은 `http://localhost:3000`에서 사용할 수 있습니다.

## 🐳 Docker Compose 개발 환경

### 개요

**통합 개발 환경**으로 PostgreSQL, Spring Boot, Nginx를 한 번에 실행할 수 있는 Docker Compose 환경을 제공합니다.

### 구성 요소

| 서비스 | 컨테이너명 | 포트 | 설명 |
|--------|------------|------|------|
| **PostgreSQL** | `testcase-postgres-dev` | 5433:5432 | 데이터베이스 |
| **Spring Boot** | `testcraft-app` | 8080:8080 | 백엔드 API |
| **Nginx** | `testcase-nginx` | 80:80, 443:443 | 리버스 프록시 |

## 🏗️ 빌드 및 배포 방법

Docker Compose 환경에서 애플리케이션을 빌드하고 실행하는 두 가지 방법을 제공합니다.

### 방법 1: 자동 빌드 및 배포 (권장)

Docker가 자동으로 소스코드를 컴파일하고 컨테이너를 빌드하는 방식입니다.

#### 1-1. 전체 자동 빌드
```bash
# docker-compose-dev 디렉토리로 이동
cd docker-compose-dev

# 방법 A: docker-compose 직접 사용
docker-compose up -d --build

# 방법 B: 관리 스크립트 사용 (권장)
chmod +x manage.sh
./manage.sh start
```

#### 1-2. 단계별 빌드 (문제 해결 시 유용)
```bash
cd docker-compose-dev

# 1단계: 소스코드 컴파일 (프로젝트 루트에서)
cd ..
./gradlew clean bootJar

# 2단계: Docker 이미지 빌드
cd docker-compose-dev
docker-compose build --no-cache testcraft-app

# 3단계: 전체 서비스 시작
docker-compose up -d
```

#### 1-3. 개발 중 빠른 재빌드
```bash
# 코드 변경 후 Spring Boot만 재빌드
cd docker-compose-dev
docker-compose up -d --build testcraft-app

# 또는 관리 스크립트로 재시작
./manage.sh restart
```

### 방법 2: 수동 JAR 복사 후 배포

미리 빌드된 JAR 파일을 docker-compose-dev 디렉토리에 복사하는 방식입니다.

#### 2-1. JAR 파일 빌드
```bash
# 프로젝트 루트에서 JAR 빌드
./gradlew clean bootJar

# 빌드된 JAR 파일 확인
ls -la build/libs/
# 출력 예: TestCaseCraft-0.0.2-SNAPSHOT.jar
```

#### 2-2. JAR 파일 복사 및 Dockerfile 수정

**Step 1: JAR 파일 복사**
```bash
# docker-compose-dev 디렉토리에 JAR 파일 복사
cp build/libs/TestCaseCraft-*.jar docker-compose-dev/app.jar

# 복사 확인
ls -la docker-compose-dev/app.jar
```

**Step 2: 수정된 Dockerfile 생성**
```bash
# docker-compose-dev 디렉토리에서
cat > Dockerfile.manual-jar << 'EOF'
# Manual JAR Deployment Dockerfile
FROM openjdk:21-jdk-slim

# Install necessary tools
RUN apt-get update && \
    apt-get install -y dumb-init curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

WORKDIR /app

# Copy pre-built JAR file
COPY --chown=appuser:appgroup app.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

USER appuser
EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["java", \
     "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-dev}", \
     "-Dserver.port=${SERVER_PORT:-8080}", \
     "-jar", "app.jar"]
EOF
```

**Step 3: docker-compose.yml 수정**
```bash
# 임시로 docker-compose-manual.yml 생성
cat > docker-compose-manual.yml << 'EOF'
version: '3.8'

services:
  testcase-postgres-dev:
    image: postgres:15-alpine
    container_name: testcase-postgres-dev
    restart: unless-stopped
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d
    environment:
      POSTGRES_DB: "${POSTGRES_DB}"
      POSTGRES_USER: "${POSTGRES_USER}"  
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
    networks:
      - testcase-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  testcraft-app:
    build:
      context: .
      dockerfile: Dockerfile.manual-jar  # 수동 JAR 파일 사용
    container_name: testcraft-app
    restart: unless-stopped
    ports:
      - "${SERVER_PORT}:8080"
    environment:
      SPRING_PROFILES_ACTIVE: "${SPRING_PROFILES_ACTIVE}"
      SPRING_DATASOURCE_URL: "jdbc:postgresql://testcase-postgres-dev:5432/${POSTGRES_DB}"
      SPRING_DATASOURCE_USERNAME: "${POSTGRES_USER}"
      SPRING_DATASOURCE_PASSWORD: "${POSTGRES_PASSWORD}"
      SPRING_DATASOURCE_DRIVER_CLASS_NAME: "org.postgresql.Driver"
      JWT_SECRET: "${JWT_SECRET}"
      JWT_EXPIRATION: "${JWT_EXPIRATION}"
    depends_on:
      testcase-postgres-dev:
        condition: service_healthy
    networks:
      - testcase-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  testcase-nginx:
    image: nginx:alpine
    container_name: testcase-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      testcraft-app:
        condition: service_healthy
    networks:
      - testcase-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local

networks:
  testcase-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
EOF
```

#### 2-3. 수동 JAR 방식으로 실행
```bash
# docker-compose-dev 디렉토리에서
docker-compose -f docker-compose-manual.yml up -d --build

# 또는 기존 컨테이너가 있는 경우 강제 재빌드
docker-compose -f docker-compose-manual.yml up -d --build --force-recreate
```

### 🔧 관리 스크립트 (manage.sh)

편리한 Docker Compose 관리를 위해 `manage.sh` 스크립트를 제공합니다.

#### 사용법
```bash
cd docker-compose-dev
chmod +x manage.sh

# 서비스 시작 (SSL 인증서 자동 생성)
./manage.sh start

# 서비스 중지
./manage.sh stop

# 서비스 재시작
./manage.sh restart

# 서비스 상태 확인
./manage.sh status

# SSL 인증서 재생성
./manage.sh ssl-cert

# 로그 확인 (실시간)
./manage.sh logs
```

#### 관리 스크립트 기능
- **자동 SSL 인증서 생성**: 인증서가 없으면 자체 서명 인증서 자동 생성
- **서비스 상태 모니터링**: 모든 컨테이너 상태와 Nginx 로그 확인
- **편리한 명령어**: 복잡한 docker-compose 명령을 간단하게 실행
- **에러 처리**: 각 단계별 성공/실패 상태 확인

### 📊 빌드 방법 비교

| 구분 | 방법 1: 자동 빌드 | 방법 2: 수동 JAR 복사 |
|------|-------------------|---------------------|
| **편의성** | ⭐⭐⭐⭐⭐ 매우 편함 | ⭐⭐⭐ 보통 |
| **속도** | ⭐⭐⭐ 컴파일 시간 포함 | ⭐⭐⭐⭐⭐ 빠름 |
| **디스크 사용량** | ⭐⭐⭐ 소스 코드 복사 | ⭐⭐⭐⭐⭐ JAR만 복사 |
| **개발 효율성** | ⭐⭐⭐⭐⭐ 코드 변경 시 편함 | ⭐⭐ 매번 빌드 필요 |
| **문제 해결** | ⭐⭐⭐ 컨텍스트 포함 | ⭐⭐⭐⭐ 단순함 |
| **운영 배포** | ⭐⭐⭐⭐ 권장 | ⭐⭐⭐⭐⭐ 최적 |

### 🎯 권장 워크플로우

#### 개발 환경
```bash
# 1. 초기 설정 (한 번만)
cd docker-compose-dev
chmod +x manage.sh

# 2. 개발 시작
./manage.sh start

# 3. 코드 수정 후 재빌드
./manage.sh restart

# 4. 개발 완료
./manage.sh stop
```

#### 프로덕션 배포
```bash
# 1. JAR 빌드
./gradlew clean bootJar

# 2. JAR 파일 복사
cp build/libs/TestCaseCraft-*.jar docker-compose-dev/app.jar

# 3. 프로덕션 환경으로 배포
docker-compose -f docker-compose-manual.yml up -d --build
```

## 🧪 테스트 및 접속 방법

### 접속 URL
완전한 Docker Compose 환경이 실행되면 다음 URL로 접속할 수 있습니다:

#### HTTP 접속
- **로컬**: http://localhost
- **IP**: http://192.168.29.184

#### HTTPS 접속 (SSL 인증서)
- **로컬**: https://localhost
- **IP**: https://192.168.29.184

#### API 직접 접속
- **Spring Boot 직접**: http://localhost:8080
- **Nginx를 통한 API**: https://localhost/api/ 또는 https://192.168.29.184/api/

### 🔍 상태 확인 방법

#### 1. 서비스 상태 확인
```bash
cd docker-compose-dev

# 관리 스크립트로 상태 확인 (권장)
./manage.sh status

# 또는 docker-compose 직접 사용
docker-compose ps
```

#### 2. Health Check 확인
```bash
# Spring Boot Health Check
curl -k https://localhost/actuator/health
curl http://localhost:8080/actuator/health

# Nginx 상태 확인
curl -I http://localhost
curl -I -k https://localhost
```

#### 3. 로그 확인
```bash
# 실시간 로그 확인
./manage.sh logs

# 개별 서비스 로그
docker-compose logs testcraft-app
docker-compose logs testcase-nginx
docker-compose logs testcase-postgres-dev
```

### 🧪 종합 테스트 스크립트

프로젝트 루트에 포함된 `test-docker-compose.sh` 스크립트로 전체 환경을 종합 테스트할 수 있습니다.

```bash
# 테스트 스크립트 실행
./test-docker-compose.sh
```

**테스트 항목**:
1. Docker Compose 서비스 상태 확인
2. Spring Boot Health Check (직접 접속)
3. Nginx HTTPS Health Check
4. HTTP → HTTPS 리디렉션 테스트
5. 인증 API 테스트 (localhost:8080)
6. HTTPS 로그인 테스트
7. JWT 토큰 기반 API 테스트
8. PostgreSQL 데이터베이스 연결 테스트
9. IP 주소 HTTPS 접속 테스트 (192.168.29.184)
10. 시스템 리소스 사용량 확인

### 🚨 문제 해결

#### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:80 | xargs kill -9
lsof -ti:443 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5433 | xargs kill -9
```

#### SSL 인증서 문제
```bash
cd docker-compose-dev

# SSL 인증서 재생성
./manage.sh ssl-cert

# 또는 수동으로 재생성
./nginx/ssl/generate-cert.sh
```

#### 컨테이너 완전 초기화
```bash
cd docker-compose-dev

# 모든 컨테이너와 볼륨 삭제
docker-compose down -v

# Docker 이미지 삭제 (필요시)
docker rmi $(docker images "docker-compose-dev*" -q)

# 재시작
./manage.sh start
```

#### 네트워크 문제
```bash
# Docker 네트워크 확인
docker network ls
docker network inspect docker-compose-dev_testcase-network

# 네트워크 재생성 (필요시)
docker network prune
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

### 🔐 기본 로그인 정보

Docker Compose 환경에서 애플리케이션이 정상 실행되면 다음 로그인 정보로 접속할 수 있습니다:

```
사용자명: admin
비밀번호: admin
```

### 📝 추가 정보

#### Docker 이미지 크기 최적화
- **방법 1 (자동 빌드)**: 약 800MB-1GB (소스 코드 + 빌드 도구 포함)
- **방법 2 (수동 JAR)**: 약 400-500MB (JAR 파일만 포함)

#### 개발 팁
- 코드 수정이 빈번한 경우: **방법 1 (자동 빌드)** 권장
- 운영 배포나 빠른 테스트: **방법 2 (수동 JAR)** 권장
- SSL 인증서 문제 발생 시: `./manage.sh ssl-cert`로 재생성
- 포트 충돌 발생 시: `.env` 파일에서 포트 변경 가능

### 📋 빌드 방법 비교

| 구분 | 자동 빌드 | 수동 JAR 복사 |
|------|-----------|---------------|
| **편의성** | ⭐⭐⭐⭐⭐ 매우 편함 | ⭐⭐⭐ 보통 |
| **빌드 시간** | 더 오래 걸림 | 빠름 (JAR 재사용) |
| **디스크 사용량** | 빌드 캐시 사용 | JAR 파일 복사 필요 |
| **개발 워크플로우** | 코드 변경 시 자동 반영 | 수동 빌드 및 복사 필요 |
| **CI/CD 적합성** | ⭐⭐⭐⭐⭐ 최적 | ⭐⭐⭐ 보통 |
| **문제 해결** | 빌드 과정 자동화 | 단계별 제어 가능 |

### 🚀 권장 워크플로우

#### 개발 환경
```bash
# 1. 초기 설정
cd docker-compose-dev
./manage.sh start

# 2. 코드 수정 후 재빌드
./manage.sh restart

# 3. 로그 확인
./manage.sh logs

# 4. 개발 완료 후 정리
./manage.sh stop
```

#### 운영 배포
```bash
# 1. 최종 빌드 및 테스트
./gradlew clean bootJar
./test-docker-compose.sh

# 2. Docker 이미지 빌드
cd docker-compose-dev
docker-compose build --no-cache

# 3. 서비스 배포
./manage.sh start

# 4. 배포 확인
./manage.sh status
curl -k https://192.168.29.184/actuator/health
```

### 설정하는 법

#### 1. 디렉토리 이동
```bash
cd docker-compose-dev
```

#### 2. 환경 설정 파일 확인
`docker-compose-dev/.env` 파일이 자동으로 생성되어 있습니다:

```bash
# 데이터베이스 설정
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password
POSTGRES_DEV_PORT=5433

# 네트워크 설정
SERVER_IP=192.168.29.184
SERVER_PORT=8080

# Nginx 설정
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# Spring Boot 설정
SPRING_PROFILES_ACTIVE=dev-postgresql
SPRING_DATASOURCE_URL=jdbc:postgresql://testcase-postgres-dev:5432/testcase_management
SPRING_DATASOURCE_USERNAME=testcase_user
SPRING_DATASOURCE_PASSWORD=testcase_password
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver

# JWT 설정 (512비트 이상 필수)
JWT_SECRET=testcraftjwtsecretkeyfordevelopmentonlychangeinproductionenvironmentwiththislongsecret
JWT_EXPIRATION=86400000

# 파일 업로드 설정
UPLOAD_MAX_SIZE=50MB
UPLOAD_PATH=/app/uploads

# SSL 인증서 경로
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# SSL 인증서 정보 (자체 서명)
SSL_COUNTRY=KR
SSL_STATE=Seoul
SSL_CITY=Seoul
SSL_ORG=TestCase Management
SSL_UNIT=Development
```

#### 3. SSL 인증서 생성
```bash
# SSL 디렉토리 생성 및 인증서 생성
mkdir -p nginx/ssl
cd nginx/ssl
chmod +x generate-cert.sh
./generate-cert.sh
```

### 실행하는 법

#### 방법 1: 전체 서비스 일괄 시작
```bash
cd docker-compose-dev
docker-compose up -d
```

#### 방법 2: 단계별 시작 (권장)
```bash
cd docker-compose-dev

# 1단계: PostgreSQL 먼저 시작
docker-compose up -d testcase-craft-postgres-dev

# 2단계: Spring Boot 애플리케이션 시작
docker-compose up -d testcraft-app

# 3단계: Nginx 시작
docker-compose up -d nginx
```

#### 방법 3: 특정 서비스만 시작
```bash
# PostgreSQL만 시작
docker-compose up -d testcase-craft-postgres-dev

# Spring Boot만 시작 (PostgreSQL 필수)
docker-compose up -d testcraft-app

# Nginx만 시작 (Spring Boot 필수)
docker-compose up -d nginx
```

### 환경설정파일

#### 주요 설정 파일 위치
```
docker-compose-dev/
├── .env                           # 환경 변수 설정
├── docker-compose.yml             # Docker Compose 구성
├── Dockerfile.testcraft-app       # Spring Boot 컨테이너 빌드 설정
└── nginx/
    ├── conf/nginx.conf            # Nginx 설정
    └── ssl/
        ├── generate-cert.sh       # SSL 인증서 생성 스크립트
        ├── cert.pem              # SSL 인증서
        └── key.pem               # SSL 개인키
```

#### 환경 변수 커스터마이징
`.env` 파일에서 다음 값들을 수정 가능:

- **IP 주소 변경**: `SERVER_IP=192.168.29.184`를 원하는 IP로 변경
- **포트 변경**: `POSTGRES_DEV_PORT`, `NGINX_HTTP_PORT`, `NGINX_HTTPS_PORT` 수정
- **데이터베이스 설정**: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` 변경
- **SSL 설정**: SSL 인증서 정보 커스터마이징

### 접속방법

#### 1. 웹 애플리케이션 접속
- **HTTPS (권장)**: https://localhost 또는 https://192.168.29.184
- **HTTP**: http://localhost 또는 http://192.168.29.184 (자동으로 HTTPS로 리디렉션)
- **직접 접속**: http://localhost:8080 (Spring Boot 직접)

#### 2. 기본 로그인 정보
```
사용자명: admin
비밀번호: admin
```

#### 3. API 엔드포인트
- **API Base URL**: https://localhost/api 또는 http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: https://localhost/actuator/health

#### 4. 데이터베이스 직접 접속
```bash
# PostgreSQL 접속
docker exec -it testcase-postgres-dev psql -U testcase_user -d testcase_management

# 또는 외부에서 접속
psql -h localhost -p 5433 -U testcase_user -d testcase_management
```

### 상태 확인 및 관리

#### 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker logs testcraft-app --tail 50 -f
docker logs testcase-nginx --tail 50 -f
docker logs testcase-postgres-dev --tail 50 -f
```

#### 서비스 관리
```bash
# 서비스 중지
docker-compose down

# 데이터 포함 완전 중지
docker-compose down -v

# 특정 서비스 재시작
docker-compose restart testcraft-app

# 서비스 재빌드
docker-compose up -d --build testcraft-app
```

### 문제 해결

#### 1. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인 및 종료
lsof -ti:80 | xargs kill -9
lsof -ti:443 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5433 | xargs kill -9
```

#### 2. PostgreSQL 인증 문제
```bash
# 데이터 초기화
docker-compose down -v
rm -rf postgres_data
docker-compose up -d
```

#### 3. SSL 인증서 문제
```bash
# 인증서 재생성
cd nginx/ssl
rm cert.pem key.pem
./generate-cert.sh
docker-compose restart nginx
```

#### 4. JWT 토큰 오류
JWT 시크릿 키가 512비트(64바이트) 이상이어야 합니다:
```bash
# .env 파일에서 JWT_SECRET을 긴 값으로 변경
JWT_SECRET=your_very_long_jwt_secret_key_that_is_at_least_64_bytes_long_for_hs512_algorithm
```

### 개발 워크플로우

1. **초기 설정**: `docker-compose up -d`로 전체 환경 시작
2. **개발 작업**: Spring Boot 코드 수정
3. **컨테이너 재빌드**: `docker-compose up -d --build testcraft-app`
4. **테스트**: https://localhost에서 기능 확인
5. **로그 확인**: `docker logs testcraft-app -f`로 실시간 로그 모니터링

### 성능 및 보안

#### 성능 최적화
- **메모리 설정**: Docker 메모리 4GB 이상 권장
- **포트 매핑**: 개발 시에만 8080 포트 직접 사용
- **캐시**: Nginx 정적 파일 캐싱 활성화

#### 보안 설정
- **SSL/TLS**: 자체 서명 인증서 사용 (개발용)
- **CORS**: API 접근을 위한 CORS 설정 적용
- **JWT**: 강력한 시크릿 키 사용 필수

---

이 Docker Compose 환경은 개발 및 테스트 용도로 설계되었습니다. 운영 환경에서는 별도의 보안 설정이 필요합니다.

## 🧪 Docker Compose 환경 테스트 및 접속 가이드

### 📋 빠른 테스트 체크리스트

#### 1. 서비스 상태 확인
```bash
# 모든 컨테이너 상태 확인 (모두 healthy여야 함)
docker-compose ps

# 개별 서비스 상태 확인
docker logs testcraft-app --tail 10        # Spring Boot 로그
docker logs testcase-nginx --tail 10       # Nginx 로그
docker logs testcase-postgres-dev --tail 10 # PostgreSQL 로그
```

#### 2. 기본 연결 테스트
```bash
# Spring Boot 직접 연결 (200 응답 확인)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health

# Nginx HTTPS 연결 (200 응답 확인)
curl -k -s -o /dev/null -w "%{http_code}" https://localhost/actuator/health

# HTTP → HTTPS 리디렉션 (301 응답 확인)
curl -s -o /dev/null -w "%{http_code}" http://localhost/
```

#### 3. 로그인 API 테스트
```bash
# 로컬호스트 로그인 테스트
curl -s "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq '.user.username'

# HTTPS 로그인 테스트
curl -k -s "https://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq '.user.username'
```

#### 4. 데이터베이스 연결 테스트
```bash
# 데이터베이스 직접 접속 테스트
docker exec testcase-postgres-dev psql -U testcase_user -d testcase_management -c "SELECT count(*) FROM users;"

# 외부에서 데이터베이스 접속 테스트 (PostgreSQL 클라이언트 필요)
psql -h localhost -p 5433 -U testcase_user -d testcase_management -c "SELECT version();"
```

### 🌐 접속 방법

#### 웹 브라우저 접속

**1. 로컬 접속 방법들**
- **HTTPS (권장)**: https://localhost
- **HTTP**: http://localhost (자동으로 HTTPS로 리디렉션)
- **직접 접속**: http://localhost:8080

**2. IP 주소 접속 (설정된 IP로 접속)**
- **HTTPS**: https://192.168.29.184
- **HTTP**: http://192.168.29.184 (자동으로 HTTPS로 리디렉션)

**3. SSL 인증서 경고 처리**
- 자체 서명 인증서 사용으로 브라우저에서 보안 경고 표시
- Chrome/Edge: "고급" → "localhost로 이동(안전하지 않음)" 클릭
- Firefox: "고급" → "위험을 감수하고 계속" 클릭

#### API 접속

**1. REST API Base URL**
- **HTTPS**: `https://localhost/api/`
- **HTTP**: `http://localhost:8080/api/`
- **IP 접속**: `https://192.168.29.184/api/`

**2. 주요 API 엔드포인트**
```bash
# 로그인
POST https://localhost/api/auth/login
Content-Type: application/json
{"username":"admin","password":"admin"}

# 프로젝트 목록 조회 (인증 필요)
GET https://localhost/api/projects
Authorization: Bearer YOUR_JWT_TOKEN

# Health Check
GET https://localhost/actuator/health
```

**3. JWT 토큰 사용 예시**
```bash
# 1. 로그인하여 토큰 획득
TOKEN=$(curl -k -s "https://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.accessToken')

# 2. 토큰을 사용하여 API 호출
curl -k -s "https://localhost/api/projects" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```

#### 데이터베이스 접속

**1. 컨테이너 내부 접속**
```bash
# PostgreSQL 콘솔 접속
docker exec -it testcase-postgres-dev psql -U testcase_user -d testcase_management

# 기본 쿼리 실행
docker exec testcase-postgres-dev psql -U testcase_user -d testcase_management -c "SELECT * FROM users LIMIT 5;"
```

**2. 외부 툴로 접속**
- **Host**: localhost
- **Port**: 5433
- **Database**: testcase_management
- **Username**: testcase_user
- **Password**: testcase_password

**3. 연결 문자열**
```
postgresql://testcase_user:testcase_password@localhost:5433/testcase_management
```

### 🔧 고급 테스트

#### 1. 성능 테스트
```bash
# API 응답 시간 측정
time curl -k -s "https://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' > /dev/null

# 동시 연결 테스트 (Apache Bench 필요)
ab -n 100 -c 10 -H "Content-Type: application/json" \
  -p login.json https://localhost/api/auth/login
```

#### 2. 네트워크 테스트
```bash
# 포트 연결 상태 확인
netstat -tulpn | grep -E ":(80|443|8080|5433)"

# SSL 인증서 정보 확인
openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | openssl x509 -noout -text

# DNS 해상도 확인 (IP 설정 시)
nslookup 192.168.29.184
```

#### 3. 부하 테스트
```bash
# 여러 동시 로그인 시뮬레이션
for i in {1..10}; do
  curl -k -s "https://localhost/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}' &
done
wait
```

### 🚨 문제 해결 테스트

#### 1. 서비스 재시작 테스트
```bash
# 개별 서비스 재시작 후 상태 확인
docker-compose restart testcraft-app
sleep 10
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health

# 전체 서비스 재시작
docker-compose down && docker-compose up -d
sleep 30
curl -k -s -o /dev/null -w "%{http_code}" https://localhost/
```

#### 2. 장애 복구 테스트
```bash
# 데이터베이스 일시 중단 후 복구
docker stop testcase-postgres-dev
curl -s "http://localhost:8080/api/projects" # 오류 확인
docker start testcase-postgres-dev
sleep 10
curl -s "http://localhost:8080/api/projects" # 복구 확인
```

#### 3. 로그 분석
```bash
# 에러 로그 검색
docker logs testcraft-app 2>&1 | grep -i error
docker logs testcase-nginx 2>&1 | grep -i error

# 최근 활동 로그
docker logs testcraft-app --since 10m -f
```

### 📱 브라우저 기능 테스트

#### 1. 기본 기능 테스트 시나리오
1. **웹사이트 접속**: https://localhost 접속
2. **로그인 테스트**: admin/admin으로 로그인
3. **대시보드 확인**: 메인 대시보드 로드 확인
4. **프로젝트 관리**: 프로젝트 생성/수정/삭제 테스트
5. **테스트케이스 관리**: 테스트케이스 CRUD 테스트
6. **로그아웃**: 정상 로그아웃 확인

#### 2. 반응형 디자인 테스트
- **데스크톱**: 1920x1080 해상도에서 레이아웃 확인
- **태블릿**: 768x1024 해상도에서 반응형 확인
- **모바일**: 375x667 해상도에서 모바일 최적화 확인

#### 3. 브라우저 호환성
- **Chrome**: 최신 버전에서 모든 기능 테스트
- **Firefox**: 최신 버전에서 모든 기능 테스트
- **Safari**: macOS Safari에서 기본 기능 테스트
- **Edge**: Windows Edge에서 기본 기능 테스트

### ⚡ 자동화 테스트 스크립트

#### 종합 테스트 스크립트
```bash
#!/bin/bash
echo "=== Docker Compose 환경 종합 테스트 ==="

# 1. 서비스 상태 확인
echo "1. 서비스 상태 확인..."
docker-compose ps

# 2. Health Check
echo "2. Health Check..."
health_status=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost/actuator/health)
if [ "$health_status" = "200" ]; then
  echo "✅ Health Check 통과"
else
  echo "❌ Health Check 실패: $health_status"
fi

# 3. 로그인 테스트
echo "3. 로그인 테스트..."
login_result=$(curl -k -s "https://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.user.username')
if [ "$login_result" = "admin" ]; then
  echo "✅ 로그인 테스트 통과"
else
  echo "❌ 로그인 테스트 실패"
fi

# 4. 데이터베이스 연결 테스트
echo "4. 데이터베이스 테스트..."
db_result=$(docker exec testcase-postgres-dev psql -U testcase_user -d testcase_management -t -c "SELECT count(*) FROM users;")
if [ "$db_result" -gt 0 ]; then
  echo "✅ 데이터베이스 연결 통과 (사용자 수: $db_result)"
else
  echo "❌ 데이터베이스 연결 실패"
fi

echo "=== 테스트 완료 ==="
```

이 스크립트를 `test-docker-compose.sh`로 저장하고 실행 권한을 부여한 후 사용하세요:
```bash
chmod +x test-docker-compose.sh
./test-docker-compose.sh
```

## 🐳 Docker 빌드 및 배포

### 환경별 배포 방법

#### 1. HTTP 배포 (개발/테스트용)

1. **환경변수 설정:**
   ```bash
   # .env.http.example을 .env.http로 복사하고 설정값 수정
   cp .env.http.example .env.http
   # 필요한 값들을 편집 (데이터베이스 비밀번호, JWT 시크릿 등)
   ```

2. **HTTP 배포 실행:**
   ```bash
   # 스크립트를 통한 자동 배포
   ./deploy-http.sh
   
   # 또는 수동 Docker Compose 실행
   docker-compose -f docker-compose.yml up -d
   ```

3. **접속:**
   ```
   애플리케이션: http://localhost
   PostgreSQL: localhost:5432
   Redis: localhost:6379
   ```

#### 2. HTTPS 배포 (운영용)

1. **환경변수 설정:**
   ```bash
   # .env.prod.example을 .env.prod로 복사하고 설정값 수정
   cp .env.prod.example .env.prod
   # 도메인, SSL 인증서, 보안 키 등 설정
   ```

2. **HTTPS 배포 실행:**
   ```bash
   # Let's Encrypt SSL 인증서 자동 발급 및 배포
   ./deploy-https.sh
   ```

3. **접속:**
   ```
   애플리케이션: https://your-domain.com
   ```

### 환경 구성

#### 개발 환경 (단독 실행)
```bash
# 개발 환경 설정으로 시작
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun

# 또는 개발용 스크립트 사용
./start-dev.sh
```

#### 운영 환경 (Docker Compose)
```bash
# HTTP 환경
ENV_FILE=.env.http docker-compose -f docker-compose.yml up -d

# HTTPS 환경  
ENV_FILE=.env.prod docker-compose -f docker-compose.yml up -d
```

### 주요 컨테이너 서비스

| 서비스 | 포트 | 설명 |
|--------|------|------|
| `nginx` | 80, 443 | 리버스 프록시 및 정적 파일 서빙 |
| `app` | 8080 (내부) | Spring Boot 애플리케이션 |
| `postgres` | 5432 | PostgreSQL 데이터베이스 |
| `redis` | 6379 | Redis 캐시 서버 |

### 배포 스크립트

#### HTTP 배포 스크립트 (`deploy-http.sh`)
- 환경변수 로드 및 검증
- Docker 이미지 빌드
- 컨테이너 시작 및 헬스체크
- 배포 상태 확인

#### HTTPS 배포 스크립트 (`deploy-https.sh`)
- Let's Encrypt SSL 인증서 자동 발급
- Nginx SSL 설정 적용
- HTTPS 리다이렉션 설정
- 인증서 자동 갱신 설정

### 주요 환경변수

#### 필수 환경변수

**⚠️ 중요: JWT_SECRET과 JIRA_ENCRYPTION_KEY는 반드시 Base64로 인코딩된 값을 사용해야 합니다.**

```bash
# 보안 설정 (Base64 인코딩 필수)
JWT_SECRET=your_very_strong_512_bit_jwt_secret_key
JIRA_ENCRYPTION_KEY=your_32_byte_base64_encoded_key

# 데이터베이스
POSTGRES_PASSWORD=your_strong_database_password
REDIS_PASSWORD=your_strong_redis_password

# 도메인 (HTTPS용)
DOMAIN_NAME=your-domain.com
CERTBOT_EMAIL=admin@your-domain.com
```

#### Base64 인코딩 방법

**JWT_SECRET 생성:**
```bash
# 방법 1: 문자열을 Base64로 인코딩
echo -n "MyVeryLongSecretString512Bits" | base64

# 방법 2: 랜덤 64바이트 키 생성 후 Base64 인코딩
openssl rand -base64 64
```

**JIRA_ENCRYPTION_KEY 생성:**
```bash
# 32바이트 랜덤 키를 Base64로 인코딩
openssl rand -base64 32
```

**온라인 도구 사용:**
- https://www.base64encode.org/ (문자열 → Base64)
- 기존 키가 있다면 온라인 Base64 인코더 사용 가능

#### 기본값 정보

애플리케이션 구동을 위해 모든 환경변수에는 기본값이 제공됩니다. **운영환경에서는 반드시 환경변수를 설정하여 기본값을 덮어쓰세요.**

| 환경변수 | 기본값 | 보안 수준 | 설명 |
|---------|--------|-----------|------|
| `DATABASE_PASSWORD` | `testcase_default_password` | 🔴 **HIGH** | PostgreSQL 데이터베이스 비밀번호 |
| `REDIS_PASSWORD` | `redis_default_password` | 🟡 **MEDIUM** | Redis 캐시 비밀번호 |
| `JWT_SECRET` | `default_jwt_secret_key_for_development_only_please_change_in_production_environment` | 🔴 **HIGH** | JWT 토큰 서명 키 |
| `JIRA_ENCRYPTION_KEY` | `5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=` | 🟡 **MEDIUM** | JIRA API 토큰 암호화 키 |

**🚨 보안 경고:**
- 🔴 **HIGH** 설정은 운영환경에서 반드시 변경해야 합니다
- 🟡 **MEDIUM** 설정은 보안을 위해 변경을 권장합니다
- 기본값 사용 시 애플리케이션 시작 시 경고 로그가 출력됩니다
- `/actuator/health` 엔드포인트에서 기본값 사용 여부를 확인할 수 있습니다

**올바른 환경변수 설정 예시:**
```bash
# .env.prod 파일에 설정
DATABASE_PASSWORD=MySecureDbPassword123!
REDIS_PASSWORD=MySecureRedisPassword456!
JWT_SECRET=$(openssl rand -base64 64)
JIRA_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### 트러블슈팅

#### 일반적인 문제들

1. **포트 충돌:**
   ```bash
   # 사용 중인 포트 확인
   lsof -ti:80 | xargs kill -9
   lsof -ti:5432 | xargs kill -9
   ```

2. **Docker 디스크 공간 부족:**
   ```bash
   # Docker 정리
   docker system prune -f
   docker volume prune -f
   ```

3. **환경변수 미설정:**
   ```bash
   # 환경변수 확인
   docker exec testcase-app env | grep JWT_SECRET
   ```

4. **컨테이너 재시작:**
   ```bash
   # 특정 서비스만 재시작
   docker-compose -f docker-compose.yml restart app
   
   # 전체 재시작
   docker-compose -f docker-compose.yml down
   docker-compose -f docker-compose.yml up -d
   ```

### 로그 확인

```bash
# 애플리케이션 로그
docker logs testcase-app --tail 50 -f

# Nginx 로그
docker logs testcase-nginx --tail 50 -f

# 모든 서비스 로그
docker-compose -f docker-compose.yml logs -f
```

## 사용 가능한 스크립트

### 프론트엔드 (`package.json`)

*   `npm start`: 개발 모드에서 앱을 실행합니다.
*   `npm test`: 대화형 감시 모드에서 테스트 러너를 시작합니다.
*   `npm run build`: `build` 폴더에 프로덕션용 앱을 빌드합니다.

### 백엔드 (`build.gradle`)

*   `./gradlew bootRun`: Spring Boot 애플리케이션을 실행합니다.
*   `./gradlew build`: 프로젝트를 빌드합니다.
*   `./gradlew test`: 테스트를 실행합니다.

---

# 📋 환경별 테스트 가이드

## 🧪 개발환경 테스트 방법

### H2 개발환경 (기본)

#### 1. 환경 시작
```bash
# H2 인메모리 데이터베이스로 개발환경 시작
./start-dev.sh
# 또는
./gradlew bootRun
```

#### 2. 접속 정보
- **웹 애플리케이션**: http://localhost:8080
- **H2 콘솔**: http://localhost:8080/h2-console
- **API 문서**: http://localhost:8080/swagger-ui.html
- **기본 로그인**: `admin` / `admin`

#### 3. H2 콘솔 접속 정보
```
JDBC URL: jdbc:h2:mem:testdb
User Name: sa
Password: (비워둠)
```

### PostgreSQL 개발환경

#### 1. 환경 시작
```bash
# PostgreSQL Docker 환경 + 애플리케이션 시작
./start-dev-postgresql.sh

# 또는 수동 시작
docker-compose -f docker-compose.dev.yml up -d
export SPRING_PROFILES_ACTIVE=dev-postgresql
./gradlew bootRun --args="--spring.profiles.active=dev-postgresql"
```

#### 2. 접속 정보
- **웹 애플리케이션**: http://localhost:8080
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6380
- **기본 로그인**: `admin` / `admin`

#### 3. 데이터베이스 직접 접속
```bash
# PostgreSQL 접속
docker exec -it testcase-postgres-dev psql -U testcase_user -d testcase_management_dev

# Redis 접속
docker exec -it testcase-redis-dev redis-cli -a redis_dev_password
```

#### 4. 서비스 상태 확인
```bash
# 개발환경 컨테이너 상태 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 서비스 중지
docker-compose -f docker-compose.dev.yml down
```

### 개발환경 테스트 시나리오

#### 1. 기본 기능 테스트
1. **로그인 테스트**
   - http://localhost:8080 접속
   - admin/admin으로 로그인
   - 대시보드 페이지 정상 로드 확인

2. **프로젝트 관리 테스트**
   - 새 프로젝트 생성
   - 프로젝트 목록 조회
   - 프로젝트 수정/삭제

3. **테스트케이스 관리 테스트**
   - 테스트케이스 생성
   - 계층 구조 트리 확인
   - 테스트케이스 실행

4. **사용자 관리 테스트**
   - 사용자 목록 페이지 접속 (PostgreSQL 오류 수정 확인)
   - 새 사용자 생성
   - 사용자 검색 기능 테스트

#### 2. API 테스트
```bash
# 로그인 API 테스트
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 프로젝트 목록 API 테스트 (토큰 필요)
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.accessToken')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects
```

## 🚀 배포환경 테스트 방법

### 배포환경 시작

#### 1. Docker 배포 (권장)
```bash
# 환경 설정 파일 생성
cp .env.prod.example .env.prod
# .env.prod 파일의 값들을 실제 운영 값으로 수정

# HTTPS 배포
./deploy-https.sh

# HTTP 배포 (개발용)
./deploy-http.sh
```

#### 2. 직접 JAR 실행
```bash
# 빌드
./gradlew build

# 운영환경으로 실행
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET="your_very_strong_512_bit_secret_key"
export DATABASE_PASSWORD="your_strong_db_password"
java -jar build/libs/testcasemanagement-0.0.1-SNAPSHOT.jar
```

### 배포환경 접속 정보

#### HTTPS 배포 시
- **웹 애플리케이션**: https://localhost (또는 설정된 도메인)
- **API**: https://localhost/api (또는 설정된 도메인/api)
- **모니터링**: https://localhost:8083/actuator

#### HTTP 배포 시
- **웹 애플리케이션**: http://localhost
- **API**: http://localhost/api
- **모니터링**: http://localhost:8083/actuator

### 배포환경 테스트 시나리오

#### 1. 전체 시스템 테스트
1. **로드밸런싱 및 SSL 테스트**
   ```bash
   # HTTPS 접속 테스트
   curl -k https://localhost
   
   # SSL 인증서 확인
   openssl s_client -connect localhost:443 -servername localhost
   ```

2. **데이터베이스 연결 테스트**
   ```bash
   # PostgreSQL 연결 확인
   docker exec testcase-postgres psql -U testcase_user -d testcase_management
   
   # Redis 연결 확인
   docker exec testcase-redis redis-cli ping
   ```

3. **API 성능 테스트**
   ```bash
   # 로그인 성능 테스트
   time curl -X POST https://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}' -k
   
   # 대량 데이터 조회 성능 테스트
   TOKEN=$(curl -X POST https://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}' -k | jq -r '.accessToken')
   
   time curl -H "Authorization: Bearer $TOKEN" \
     https://localhost/api/projects -k
   ```

#### 2. 보안 테스트
1. **JWT 토큰 테스트**
   - 만료된 토큰으로 API 호출 시 401 응답 확인
   - 잘못된 토큰으로 API 호출 시 403 응답 확인

2. **HTTPS 강제 리다이렉트 테스트**
   ```bash
   # HTTP로 접속 시 HTTPS로 리다이렉트되는지 확인
   curl -I http://localhost
   ```

#### 3. 장애 복구 테스트
1. **데이터베이스 장애 시뮬레이션**
   ```bash
   # PostgreSQL 컨테이너 중지
   docker stop testcase-postgres
   
   # 애플리케이션 오류 응답 확인
   curl https://localhost/api/projects -k
   
   # PostgreSQL 재시작
   docker start testcase-postgres
   
   # 서비스 복구 확인
   curl https://localhost/api/projects -k
   ```

2. **Redis 장애 시뮬레이션**
   ```bash
   # Redis 컨테이너 중지
   docker stop testcase-redis
   
   # 캐시 없이도 정상 동작하는지 확인
   curl https://localhost/api/projects -k
   
   # Redis 재시작
   docker start testcase-redis
   ```

### 모니터링 및 로그 확인

#### 1. 애플리케이션 로그
```bash
# 컨테이너 로그 확인
docker logs testcase-app -f

# 특정 에러 로그 검색
docker logs testcase-app 2>&1 | grep ERROR

# 성능 관련 로그 확인
docker logs testcase-app 2>&1 | grep "response time"
```

#### 2. 시스템 상태 모니터링
```bash
# 모든 컨테이너 상태 확인
docker ps

# 리소스 사용량 확인
docker stats

# 디스크 사용량 확인
docker system df
```

#### 3. 네트워크 연결 테스트
```bash
# 포트 연결 상태 확인
netstat -tulpn | grep :80
netstat -tulpn | grep :443
netstat -tulpn | grep :8080

# DNS 해상도 확인
nslookup localhost
```

## 🔧 문제 해결

### 일반적인 문제

#### 1. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:8080
lsof -ti:80
lsof -ti:443

# 프로세스 종료
kill -9 $(lsof -ti:8080)
```

#### 2. Docker 관련 문제
```bash
# Docker 데몬 상태 확인
docker info

# 컨테이너 재시작
docker-compose restart

# 볼륨 및 네트워크 정리
docker system prune -a
```

#### 3. 데이터베이스 연결 문제
```bash
# PostgreSQL 연결 테스트
docker exec testcase-postgres pg_isready -U testcase_user

# PostgreSQL 로그 확인
docker logs testcase-postgres
```

#### 4. JWT 토큰 문제
- JWT 시크릿 키가 512비트 이상인지 확인
- 환경변수 `JWT_SECRET` 설정 확인
- 토큰 만료 시간 설정 확인

### 성능 최적화

#### 1. 메모리 사용량 최적화
```bash
# JVM 힙 사이즈 조정
export JAVA_OPTS="-Xmx2g -Xms1g"
```

#### 2. 데이터베이스 성능 최적화
```bash
# PostgreSQL 연결 풀 모니터링
docker exec testcase-app curl http://localhost:8083/actuator/metrics/hikaricp.connections.active
```

### 주요 차이점 요약

| 구분 | 개발환경 | 배포환경 |
|------|----------|----------|
| **데이터베이스** | H2 (메모리) 또는 PostgreSQL (Docker) | PostgreSQL (Docker) |
| **접속 주소** | http://localhost:8080 | http://localhost 또는 https://domain |
| **로그인** | admin/admin | admin/admin |
| **포트** | 8080 (직접), 5433/6380 (개발용 Docker) | 80/443 (Nginx), 5432/6379 (운영용 Docker) |
| **SSL** | 미사용 | HTTPS 배포 시 사용 |
| **모니터링** | 개발용 엔드포인트 전체 | 운영용 제한된 엔드포인트 |
| **데이터 영속성** | 메모리 (H2) 또는 Docker 볼륨 | Docker 볼륨 |

### 빠른 테스트 체크리스트

#### 개발환경
- [ ] 애플리케이션 시작: `./start-dev.sh` 또는 `./start-dev-postgresql.sh`
- [ ] 웹 접속: http://localhost:8080
- [ ] 로그인: admin/admin
- [ ] 사용자 관리 페이지 접속 (PostgreSQL 오류 수정 확인)

#### 배포환경  
- [ ] 배포 실행: `./deploy-http.sh` 또는 `./deploy-https.sh`
- [ ] 웹 접속: http://localhost 또는 https://domain
- [ ] 로그인: admin/admin
- [ ] 컨테이너 상태 확인: `docker ps`
- [ ] 로그 확인: `docker logs testcase-app`

## 📞 지원

문제 발생 시:
1. 애플리케이션 로그 확인
2. Docker 컨테이너 상태 확인
3. 네트워크 연결 상태 확인
4. 환경 변수 설정 확인

자세한 설정 정보는 `CLAUDE.md` 파일을 참조하세요.