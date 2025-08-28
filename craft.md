# 🚧 UNDER ACTIVE DEVELOPMENT 🚧  

⚠️ This project is currently **under active development**.  
Features, configuration, and setup instructions may change frequently.  
Use at your own risk and do not use in production environments yet.  
----
TestcaseCraft is a powerful, modern, and intuitive web application for managing test cases, plans, and executions. Built with a robust backend and a responsive frontend, it provides a centralized platform for QA teams and developers to streamline their testing lifecycle.

[GitHub Repository](https://github.com/xmlangel/testcasecraft)

✨ Key Features

- 🗂️ Hierarchical Test Case Management: Organize test cases in a flexible tree structure with folders.
- 📋 Test Plan Creation: Group test cases into executable test plans for different releases or test cycles.
- 🚀 Test Execution & History: Run test plans, record results (Pass, Fail, Skip), and track execution history.
- 📊 Insightful Dashboard: Visualize testing progress and results with interactive charts.
- 🔐 Secure Authentication: JWT-based authentication system ensures your data is secure.
- 👥 Multi-Project Support: Manage test assets across multiple projects seamlessly.
- JIRA Integration: Connect with JIRA to link test cases with development tasks.

🛠️ Technology Stack

- Backend: Java 21, Spring Boot 3
- Frontend: React 18, Material-UI
- Database: PostgreSQL 15
- Web Server: Nginx (as Reverse Proxy)
- Authentication: JWT (JSON Web Tokens)
- Build Tool: Gradle

🚀 Getting Started with Docker

This application is designed to be run easily using Docker Compose by pulling a pre-built image.

**Prerequisites**

- Docker (https://docs.docker.com/get-docker/) (v20.10+)
- Docker Compose (https://docs.docker.com/compose/install/) (v2.0+)

**Step 1: Create Configuration Files**

First, create a directory for your configuration and download the necessary files.

```bash
mkdir testcasecraft && cd testcasecraft

# Download docker-compose.yml
# Note: The source file is docker-compose.prod.yml, but we save it as docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/xmlangel/testcasecraft/main/docker-compose.prod.yml

# Download Nginx configuration
mkdir -p nginx/conf.d
curl -o nginx/nginx.conf https://raw.githubusercontent.com/xmlangel/testcasecraft/main/nginx/nginx.conf
curl -o nginx/conf.d/default.conf https://raw.githubusercontent.com/xmlangel/testcasecraft/main/nginx/conf.d/default.conf
```
**Step 2: Create Environment File (.env.prod)**

Create a file named `.env.prod` in the `testcasecraft` directory. This file will store your secret keys and passwords.

Copy and paste the following template into `.env.prod` and replace the placeholder values.
```
# .env.prod
# === PostgreSQL Settings ===
# You can change the user and DB name, but the password is required.
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=your_strong_postgres_password

# === Application Secrets ===
# IMPORTANT: Replace these with strong, randomly generated strings.
# You can use 'openssl rand -base64 48' to generate them.
JWT_SECRET=your_super_strong_jwt_secret_key_with_at_least_512_bits_long
JIRA_ENCRYPTION_KEY=your_super_strong_jira_encryption_key_for_production

# === Optional Settings ===
# Port for PostgreSQL database if you want to expose it
# POSTGRES_PORT=5432
```
**Security Note**: It is crucial to use strong, unique values for `POSTGRES_PASSWORD`, `JWT_SECRET`, and `JIRA_ENCRYPTION_KEY`.

**Step 3: Run the Application**

Now, you can start the entire application stack with a single command. This command automatically downloads (pulls) the latest version of the application image from Docker Hub before starting.
```bash
docker-compose -f docker-compose.yml --env-file .env.prod up -d
```
The application will be available at http://localhost after a few moments. The initial startup might take some time to download images and initialize the database.

**Step 4: Access the Application**

- URL: http://localhost
- Default Username: `admin`
- Default Password: `admin`

**How to Stop the Application**

To stop the application and its services, run:
```bash
docker-compose -f docker-compose.yml down
```
⚙️ Configuration

All configuration is managed through the `.env.prod` file. See the `docker-compose.yml` file for more advanced configuration options.

---

# 🚧 활발하게 개발 중 🚧

⚠️ 이 프로젝트는 현재 **활발하게 개발 중**입니다.  
기능, 설정 및 설치 방법이 자주 변경될 수 있습니다.  
사용에 따른 위험은 본인에게 있으며, 아직 운영 환경에서는 사용하지 마십시오.  
----
TestcaseCraft는 테스트 케이스, 계획, 실행을 관리하기 위한 강력하고 현대적이며 직관적인 웹 애플리케이션입니다. 견고한 백엔드와 반응형 프론트엔드로 구축되어 QA팀과 개발자가 테스트 라이프사이클을 간소화할 수 있는 중앙 집중식 플랫폼을 제공합니다.

[GitHub 저장소](https://github.com/xmlangel/testcasecraft)

✨ 주요 기능

- 🗂️ 계층적 테스트 케이스 관리: 유연한 트리 구조로 테스트 케이스를 폴더와 함께 정리합니다.
- 📋 테스트 계획 생성: 다양한 릴리스 또는 테스트 주기에 맞춰 테스트 케이스를 실행 가능한 테스트 계획으로 그룹화합니다.
- 🚀 테스트 실행 및 이력: 테스트 계획을 실행하고 결과(성공, 실패, 건너뜀)를 기록하며 실행 이력을 추적합니다.
- 📊 통찰력 있는 대시보드: 대화형 차트로 테스트 진행 상황과 결과를 시각화합니다.
- 🔐 보안 인증: JWT 기반 인증 시스템으로 데이터를 안전하게 보호합니다.
- 👥 멀티 프로젝트 지원: 여러 프로젝트의 테스트 자산을 원활하게 관리합니다.
- JIRA 통합: JIRA와 연결하여 테스트 케이스를 개발 작업과 연동합니다.

🛠️ 기술 스택

- 백엔드: Java 21, Spring Boot 3
- 프론트엔드: React 18, Material-UI
- 데이터베이스: PostgreSQL 15
- 웹 서버: Nginx (리버스 프록시)
- 인증: JWT (JSON Web Tokens)
- 빌드 도구: Gradle

🚀 Docker로 시작하기

이 애플리케이션은 미리 빌드된 이미지를 가져와 Docker Compose를 사용하여 쉽게 실행할 수 있도록 설계되었습니다.

**사전 준비**

- Docker (https://docs.docker.com/get-docker/) (v20.10+)
- Docker Compose (https://docs.docker.com/compose/install/) (v2.0+)

**1단계: 설정 파일 생성**

먼저 설정을 위한 디렉토리를 만들고 필요한 파일들을 다운로드합니다.

```bash
mkdir testcasecraft && cd testcasecraft

# docker-compose.yml 다운로드
# 참고: 원본 파일명은 docker-compose.prod.yml 이지만, docker-compose.yml 로 저장합니다.
curl -o docker-compose.yml https://raw.githubusercontent.com/xmlangel/testcasecraft/main/docker-compose.prod.yml

# Nginx 설정 다운로드
mkdir -p nginx/conf.d
curl -o nginx/nginx.conf https://raw.githubusercontent.com/xmlangel/testcasecraft/main/nginx/nginx.conf
curl -o nginx/conf.d/default.conf https://raw.githubusercontent.com/xmlangel/testcasecraft/main/nginx/conf.d/default.conf
```
**2단계: 환경 파일 생성 (.env)**

`testcasecraft` 디렉토리에 `.env.prod` 라는 이름의 파일을 생성합니다. 이 파일은 비밀 키와 암호를 저장합니다.

아래 템플릿을 `.env.prod`에 복사하여 붙여넣고, 플레이스홀더 값을 실제 값으로 교체하세요.
```
# .env.prod
# === PostgreSQL 설정 ===
# 사용자명과 DB 이름은 변경할 수 있지만, 암호는 필수로 입력해야 합니다.
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=your_strong_postgres_password

# === 애플리케이션 비밀 키 ===
# 중요: 강력하고 무작위로 생성된 문자열로 교체하세요.
# 'openssl rand -base64 48' 명령어로 생성할 수 있습니다.
JWT_SECRET=your_super_strong_jwt_secret_key_with_at_least_512_bits_long
JIRA_ENCRYPTION_KEY=your_super_strong_jira_encryption_key_for_production

# === 선택적 설정 ===
# PostgreSQL 데이터베이스 포트를 외부에 노출하고 싶을 때 사용
# POSTGRES_PORT=5432
```
**보안 참고**: `POSTGRES_PASSWORD`, `JWT_SECRET`, `JIRA_ENCRYPTION_KEY`에 강력하고 고유한 값을 사용하는 것이 매우 중요합니다.

**3단계: 애플리케이션 실행**

이제 단일 명령어로 전체 애플리케이션 스택을 시작할 수 있습니다. 이 명령어는 시작하기 전에 Docker Hub에서 최신 버전의 애플리케이션 이미지를 자동으로 다운로드(pull)합니다.
```bash
docker-compose -f docker-compose.yml --env-file .env up -d
```
잠시 후 http://localhost 에서 애플리케이션을 사용할 수 있습니다. 초기 시작 시 이미지를 다운로드하고 데이터베이스를 초기화하는 데 시간이 걸릴 수 있습니다.

**4단계: 애플리케이션 접속**

- URL: http://localhost
- 기본 사용자명: `admin`
- 기본 비밀번호: `admin`

**애플리케이션 중지 방법**

애플리케이션과 관련 서비스를 중지하려면 다음을 실행하세요:
```bash
docker-compose -f docker-compose.yml down
```
⚙️ 설정

모든 설정은 `.env.prod` 파일을 통해 관리됩니다. 더 고급 설정 옵션은 `docker-compose.yml` 파일을 참조하세요.
