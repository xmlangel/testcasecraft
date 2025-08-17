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
   docker-compose -f docker-compose.prod.yml up -d
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
ENV_FILE=.env.http docker-compose -f docker-compose.prod.yml up -d

# HTTPS 환경  
ENV_FILE=.env.prod docker-compose -f docker-compose.prod.yml up -d
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
   docker-compose -f docker-compose.prod.yml restart app
   
   # 전체 재시작
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

### 로그 확인

```bash
# 애플리케이션 로그
docker logs testcase-app --tail 50 -f

# Nginx 로그
docker logs testcase-nginx --tail 50 -f

# 모든 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f
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