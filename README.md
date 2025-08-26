# Production Docker Compose Setup

This directory contains Docker Compose configuration for deploying the TestCaseCraft application in a production environment. It includes PostgreSQL database, Spring Boot application, Nginx reverse proxy, and Certbot service for SSL/TLS.

## Prerequisites

Before starting, make sure you have the following installed:

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

## Setup

1.  **Application JAR file**:
    Place the `TestCaseCraft-0.0.1-SNAPSHOT.jar` file built from the main TestCaseCraft project in this directory. This JAR file is required for the `app` service.

2.  **Environment variables file (`.env.prod`)**:
    You need to create a `.env.prod` file in this directory. This file contains sensitive information and configuration required for the production environment, including database credentials, JWT secret, JIRA encryption key, domain name, etc.

    **How to create `.env.prod` file:**
    *   Use a text editor to create a new file named `.env.prod`.
    *   Copy and paste the example content below, replacing parts starting with `your_` such as `your_strong_password`, `your_jwt_secret_key_here` with actual values.
    *   **Important**: This file contains sensitive information, so make sure it's added to `.gitignore` to avoid committing it to Git.

    **`.env.prod` file example:**
    ```
    POSTGRES_DB=testcase_management
    POSTGRES_USER=testcase_user
    POSTGRES_PASSWORD=your_strong_password

    JWT_SECRET=your_jwt_secret_key_here
    JIRA_ENCRYPTION_KEY=your_jira_encryption_key_here
    
    UPLOAD_PATH=/app/uploads
    DOMAIN_NAME=yourdomain.com
    
    ENABLE_HTTPS=true
    CERTBOT_EMAIL=your_email@example.com
    CERTBOT_EXTRA_DOMAINS=www.yourdomain.com
    ```
    *`JWT_SECRET` and `JIRA_ENCRYPTION_KEY` must be kept strong and secure.*

    Sample for HTTP only:
    ```
    # PostgreSQL database configuration
    POSTGRES_DB=testcase_management
    POSTGRES_USER=testcase_user
    POSTGRES_PASSWORD=testcase_password

    # ===================================
    # Application Configuration
    # ===================================
    # JWT Secret (for development - Base64 encoded)
    JWT_SECRET=ZGV2X2p3dF9zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5X3RoaXNfbXVzdF9iZV9hdF9sZWFzdF81MTJfYml0c19sb25nX3RvX3dvcmtfcHJvcGVybHlfd2l0aF9zcHJpbmdfc2VjdXJpdHlfYW5kX2p3dF90b2tlbl9nZW5lcmF0aW9uX3N5c3RlbQ==

    # ===================================
    # JIRA Configuration
    # ===================================
    # JIRA encryption key (commonly used in start-dev.sh, start-dev-postgresql.sh)
    JIRA_ENCRYPTION_KEY=5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=

    # Domain and Let's Encrypt configuration (HTTP only enabled)
    ENABLE_HTTPS=false
    ```

## Build and Run

Navigate to this directory in your terminal:

```bash
cd /path/to/your/project/docker-compose-prod
```

1.  **Clean up existing containers (optional but recommended)**:
    Before starting a new build, you can completely stop and remove any previously running containers to start fresh.

    ```bash
    docker-compose --env-file .env.prod down
    ```

2.  **Build Docker images and start services**: 
    This command loads environment variables from the `.env.prod` file, rebuilds Docker images, and starts all services defined in `docker-compose.yml` in the background (`-d`).

    ```bash
    docker-compose --env-file .env.prod up --build -d
    ```

    To start with HTTPS enabled (Certbot will also run):
    ```bash
    docker-compose --profile https --env-file .env.prod up --build -d
    ```

3.  **Stop services**:
    To stop and remove containers, networks, and volumes:

    ```bash
    docker-compose --env-file .env.prod down
    ```

## Application Access

Once the services are running, you can access the application:

*   **Nginx (web server)**:
    *   HTTP: `http://localhost` (or `http://yourdomain.com`)
    *   HTTPS: `https://localhost` (or `https://yourdomain.com`) - when `ENABLE_HTTPS` is `true` and Certbot successfully obtains certificates.
*   **Spring Boot application API**: `http://localhost:8080` (internal access, typically proxied by Nginx)
*   **PostgreSQL database**: `localhost:5432` (internal access, typically not directly exposed)

## Logs

You can view the logs for any service using:

```bash
docker-compose logs -f <service_name>
```
Example: `docker-compose logs -f app`

---

# Production Docker Compose Setup

이 디렉토리에는 TestCaseCraft 애플리케이션을 프로덕션 환경에 배포하기 위한 Docker Compose 설정이 포함되어 있습니다. PostgreSQL 데이터베이스, Spring Boot 애플리케이션, Nginx 리버스 프록시 및 SSL/TLS를 위한 Certbot 서비스가 포함됩니다.

## 전제 조건

시작하기 전에 다음이 설치되어 있는지 확인하십시오:

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

## 설정

1.  **애플리케이션 JAR 파일**:
    메인 TestCaseCraft 프로젝트에서 빌드된 `TestCaseCraft-0.0.1-SNAPSHOT.jar` 파일을 이 디렉토리에 배치하십시오. 이 JAR 파일은 `app` 서비스에 필요합니다.

2.  **환경 변수 파일 (`.env.prod`)**:
    이 디렉토리에 `.env.prod` 파일을 생성해야 합니다. 이 파일은 데이터베이스 자격 증명, JWT 시크릿, JIRA 암호화 키, 도메인 이름 등 프로덕션 환경에 필요한 민감한 정보와 구성을 포함합니다.

    **`.env.prod` 파일 생성 방법:**
    *   텍스트 편집기를 사용하여 `.env.prod`라는 이름의 새 파일을 생성합니다.
    *   아래 예시 내용을 복사하여 붙여넣고, `your_strong_password`, `your_jwt_secret_key_here` 등 `your_`로 시작하는 부분들을 실제 값으로 대체합니다.
    *   **중요**: 이 파일은 민감한 정보를 포함하므로 Git에 커밋하지 않도록 `.gitignore`에 추가되어 있는지 확인하십시오.

    **`.env.prod` 파일 예시:**
    ```
    POSTGRES_DB=testcase_management
    POSTGRES_USER=testcase_user
    POSTGRES_PASSWORD=your_strong_password

    JWT_SECRET=your_jwt_secret_key_here
    JIRA_ENCRYPTION_KEY=your_jira_encryption_key_here
    
    UPLOAD_PATH=/app/uploads
    DOMAIN_NAME=yourdomain.com
    
    ENABLE_HTTPS=true
    CERTBOT_EMAIL=your_email@example.com
    CERTBOT_EXTRA_DOMAINS=www.yourdomain.com
    ```
    *`JWT_SECRET` 및 `JIRA_ENCRYPTION_KEY`는 강력하고 안전하게 유지해야 합니다.*

    http 로 할때 Sample
    ```
    # PostgreSQL 데이터베이스 설정
    POSTGRES_DB=testcase_management
    POSTGRES_USER=testcase_user
    POSTGRES_PASSWORD=testcase_password

    # ===================================
    # Application Configuration
    # ===================================
    # JWT Secret (개발용 - Base64 인코딩)
    JWT_SECRET=ZGV2X2p3dF9zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5X3RoaXNfbXVzdF9iZV9hdF9sZWFzdF81MTJfYml0c19sb25nX3RvX3dvcmtfcHJvcGVybHlfd2l0aF9zcHJpbmdfc2VjdXJpdHlfYW5kX2p3dF90b2tlbl9nZW5lcmF0aW9uX3N5c3RlbQ==

    # ===================================
    # JIRA Configuration
    # ===================================
    # JIRA 암호화 키 (start-dev.sh, start-dev-postgresql.sh에서 공통으로 사용)
    JIRA_ENCRYPTION_KEY=5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=



    # 도메인 및 Let's Encrypt 설정 (HTTP만 활성화)
    ENABLE_HTTPS=false
    ```

## 빌드 및 실행

터미널에서 이 디렉토리로 이동하십시오:

```bash
cd /path/to/your/project/docker-compose-prod
```

1.  **기존 컨테이너 정리 (선택 사항이지만 권장)**:
    새로운 빌드를 시작하기 전에 기존에 실행 중이던 컨테이너를 완전히 중지하고 삭제하여 깨끗한 상태에서 시작할 수 있습니다.

    ```bash
    docker-compose --env-file .env.prod down
    ```

2.  **Docker 이미지 빌드 및 서비스 시작**: 
    이 명령은 `.env.prod` 파일의 환경 변수를 로드하고, Docker 이미지를 다시 빌드한 다음, `docker-compose.yml`에 정의된 모든 서비스를 백그라운드(`-d`)로 시작합니다.

    ```bash
    docker-compose --env-file .env.prod up --build -d
    ```

    HTTPS를 활성화하여 시작하려면 (Certbot도 실행됨):
    ```bash
    docker-compose --profile https --env-file .env.prod up --build -d
    ```

3.  **서비스 중지**:
    컨테이너, 네트워크 및 볼륨을 중지하고 제거하려면:

    ```bash
    docker-compose --env-file .env.prod down
    ```

## 애플리케이션 접근

서비스가 실행되면 애플리케이션에 접근할 수 있습니다:

*   **Nginx (웹 서버)**:
    *   HTTP: `http://localhost` (또는 `http://yourdomain.com`)
    *   HTTPS: `https://localhost` (또는 `https://yourdomain.com`) - `ENABLE_HTTPS`가 `true`이고 Certbot이 성공적으로 인증서를 획득한 경우.
*   **Spring Boot 애플리케이션 API**: `http://localhost:8080` (내부 접근, 일반적으로 Nginx에 의해 프록시됨)
*   **PostgreSQL 데이터베이스**: `localhost:5432` (내부 접근, 일반적으로 직접 노출되지 않음)

## 로그

You can view the logs for any service using:

```bash
docker-compose logs -f <service_name>
```
예시: `docker-compose logs -f app`