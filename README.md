# Production Docker Compose Setup

This directory contains the Docker Compose setup for deploying the TestCaseCraft application in a production environment. It includes services for the PostgreSQL database, the Spring Boot application, Nginx reverse proxy, and Certbot for SSL/TLS.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

## Setup

1.  **Application JAR File**:
    Place the `TestCaseCraft-0.0.1-SNAPSHOT.jar` file (built from the main TestCaseCraft project) into this directory. This JAR file is required for the `app` service.

2.  **Environment Variables**:
    Create a `.env.prod` file in this directory based on the `.env.prod.example` (if provided, otherwise create it manually). This file will contain sensitive information and configuration for your production environment.

    Example `.env.prod` content:
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
    *Ensure `JWT_SECRET` and `JIRA_ENCRYPTION_KEY` are strong and kept secure.*

## Building and Running

Navigate to this directory in your terminal:

```bash
cd /path/to/your/project/docker-compose-prod
```

1.  **Build Docker Images**:
    This command builds the Docker images for your services.

    ```bash
    docker-compose build
    ```

2.  **Start Services**:
    This command starts all the services defined in `docker-compose.yml` in detached mode (`-d`).

    ```bash
    docker-compose up -d
    ```

    To start with HTTPS enabled (which will also run Certbot):
    ```bash
    docker-compose --profile https up -d
    ```

3.  **Stop Services**:
    To stop and remove the containers, networks, and volumes created by `docker-compose up`:

    ```bash
    docker-compose down
    ```

## Accessing the Application

Once the services are running, you can access the application:

*   **Nginx (Web Server)**:
    *   HTTP: `http://localhost` (or `http://yourdomain.com`)
    *   HTTPS: `https://localhost` (or `https://yourdomain.com`) - if `ENABLE_HTTPS` is `true` and Certbot has successfully obtained certificates.
*   **Spring Boot Application API**: `http://localhost:8080` (internal access, usually proxied by Nginx)
*   **PostgreSQL Database**: `localhost:5432` (internal access, usually not directly exposed)

## Logs

You can view the logs for any service using:

```bash
docker-compose logs -f <service_name>
```
Example: `docker-compose logs -f app`
