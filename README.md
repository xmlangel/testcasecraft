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