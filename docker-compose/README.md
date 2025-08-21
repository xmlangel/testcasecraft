# TestcaseCraft Docker Deployment Guide

This guide explains how to run the TestcaseCraft application using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## 1. Create Environment File

Create a `.env.prod` file in the **`docker-compose` directory** with the following content.

**⚠️ IMPORTANT: You MUST provide values for all variables in this file. The application will not start otherwise.**

```env
# PostgreSQL Database Settings
POSTGRES_DB=testcase_management
POSTGRES_USER=testcasecraft_user
POSTGRES_PASSWORD=your_strong_postgres_password # <-- CHANGE THIS to a secure password

# Application Settings
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/testcase_management

# -- You must generate these keys and keep them secret --
# JWT Secret Key (generate a random 64-byte hex string)
# Example: openssl rand -base64 64
JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random

# JIRA Integration Encryption Key (generate a random 32-byte base64 string)
# Example: openssl rand -base64 32
JIRA_ENCRYPTION_KEY=your_jira_encryption_key
```

## 3. Access the Application

- **Web Application**: [http://localhost:8080](http://localhost:8080)
- **Default Login**: `admin` / `admin`

## 5. Stop the Application

To stop the running containers:

```bash
docker-compose --env-file .env.prod down
```
To stop and remove the data volume (resets the database):
```bash
docker-compose --env-file .env.prod down -v
```