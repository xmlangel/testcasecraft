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
    docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d
    ```

3.  **Stop the PostgreSQL container:**
    ```bash
    docker-compose -f docker-compose.dev.yml --env-file .env.dev stop
    ```

4.  **Remove the PostgreSQL container and its volume (data will be lost!):**
    ```bash
    docker-compose -f docker-compose.dev.yml --env-file .env.dev down -v
    ```

## Notes:
- The PostgreSQL database will be accessible on `localhost:5433`.
- Database name: `testcase_management_dev`
- User: `testcase_user`
- Password: `testcase_dev_password`
