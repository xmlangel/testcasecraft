# Docker Compose Development Environment

This directory contains Docker Compose configurations for setting up a PostgreSQL development environment.

## Files:
- `docker-compose.dev.yml`: Defines the PostgreSQL service.
- `.env.dev`: Contains environment variables for the PostgreSQL container.

## Usage:

1.  **Navigate to this directory:**
    ```bash
    cd docker-compose-dev
    ```

2.  **Start the PostgreSQL container:**
    ```bash
    docker-compose -f docker-compose.yml --env-file ../.env.dev up -d
    ```

3.  **Stop the PostgreSQL container:**
    ```bash
    docker-compose -f docker-compose.yml --env-file ../.env.dev stop
    ```

4.  **Remove the PostgreSQL container and its data (data will be lost!):**
    ```bash
    docker-compose -f docker-compose.yml --env-file ../.env.dev down
    rm -rf ./postgres_data
    ```

## Notes:
 The PostgreSQL database will be accessible on `localhost:5433`.
# ===================================
# Database Configuration (For dev-postgresql profile)
# ===================================
POSTGRES_DB=testcase_craft_dev
POSTGRES_USER=testcase_craft_user
POSTGRES_PASSWORD=testcase_craft_dev_password
POSTGRES_DEV_PORT=5433
