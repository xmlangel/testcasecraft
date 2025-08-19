# GEMINI.md - Test Case Manager

This file provides guidance to Gemini for working with the Test Case Manager application.

---

## 1. 🚀 Project Overview

### 1.1. General
This is a full-stack test case management application.
- **Frontend**: React 18 with Material-UI, using React Router for navigation.
- **Backend**: Spring Boot with Java 21.
- **Database**: Supports H2 (in-memory/file-based for `dev`) and PostgreSQL (for `dev-postgresql` and `prod`).
- **Authentication**: JWT-based authentication.
- **Build System**: Gradle for the backend, which also integrates the Node.js frontend build.
- **Containerization**: Docker and Docker Compose for managing development and production services (PostgreSQL, Redis, Nginx).

### 1.2. Architecture
- **Backend**: A standard layered architecture (Controller, Service, Repository) built with Spring Boot.
- **Frontend**: A React Single-Page Application (SPA) located in `src/main/frontend/`. It uses a context-based approach for state management.
- **Integration**: The Gradle build is configured to build the frontend and bundle it into the final Spring Boot JAR for a single, deployable artifact.

---

## 2. 💻 Development Environment & Workflow

### 2.1. Core Development Script: `start-dev.sh`
The primary script for managing the development environment is `start-dev.sh`. It supports starting, stopping, restarting, and checking the status of the backend application.

**Usage:**
```bash
# Show usage instructions
./start-dev.sh

# Start the server (H2 database by default)
./start-dev.sh start

# Stop the server
./start-dev.sh stop

# Check the status of the app and related services
./start-dev.sh status
```

### 2.2. Frontend Access: Port 3000 vs 8080
This project has two primary ways to run and access the frontend, which can be confusing:

-   **Integrated Mode (Port 8080):** When you run the application using `./start-dev.sh` or `./gradlew bootRun`, the Spring Boot backend serves *both* the API and the compiled frontend files. In this mode, you access the entire application through **`http://localhost:8080`**. This is the standard way to run the full application.

-   **Development Mode (Port 3000):** For frontend-specific development, you can run the React development server separately using `npm start`. This server runs on **`http://localhost:3000`** and provides features like hot-reloading. When using this, the React app (on port 3000) makes API calls to the backend running on port 8080.

### 2.3. Database Environments
The script can manage two different development database configurations. **This functionality was removed at the user's request but is documented here for context.** The current script defaults to the `dev` (H2) profile.

- **H2 Environment (`dev` profile):**
  - This is the default. It uses a file-based H2 database.
  - The data is persisted in the `/data` directory.
  - Start command: `./start-dev.sh start`

- **PostgreSQL Environment (`dev-postgresql` profile):**
  - This requires the `testcase-postgres-dev` Docker container to be running.
  - The `start-dev-postgresql.sh` script can be used to set up this environment completely (starts Docker containers and the app).
  - To run only the application against an already-running PG database, you would modify `start-dev.sh` to support this profile.

### 2.4. Standalone Frontend Development (Port 3000)
For a better hot-reloading experience when focusing on UI changes, the frontend development server can be run separately as described in "Development Mode" above.

```bash
# Navigate to the frontend directory
cd src/main/frontend

# Install dependencies
npm install

# Start the development server on http://localhost:3000
npm start
```

---

## 3. 🧪 Testing Guidelines

### 3.1. Backend Testing (TestNG)
The project uses **TestNG** for backend unit and integration tests.

```bash
# Run all backend tests
./gradlew test

# Generate a visual test report after running tests
./gradlew allureReport
```

### 3.2. E2E Testing (Playwright)
Playwright is used for end-to-end testing. Tests are located in the `e2e-tests/` directory.

**Running E2E Tests:**
1.  **Start the application** using the desired development environment (e.g., `./start-dev.sh start`).
2.  **Run the Playwright tests:**
    ```bash
    # Run a specific test file
    npx playwright test e2e-tests/e2e-testcase-app.js

    # View the last test report
    npx playwright show-report
    ```

---

## 4. 📝 JIRA & Process Guidelines

The project has a defined workflow for JIRA integration, managed by scripts in the `d_mcpsvr_jira/` directory. Adherence to this workflow is important. For detailed instructions, refer to `docs/JIRA_INTEGRATION.md`.

---

## 5. 🔧 Environment & Configuration

### 5.1. Key Configuration Files
- `build.gradle`: Defines backend dependencies and the build process, including frontend integration.
- `package.json`: Defines frontend dependencies and scripts.
- `docker-compose.dev.yml`: Defines development services (PostgreSQL, Redis).
- `docker-compose.prod.yml`: Defines production services.
- `application.yml` (and its profiles `application-dev.yml`, etc.): Spring Boot configuration.

### 5.2. Environment Variables
- Sensitive information (like DB passwords and JWT secrets) is managed via `.env` files (`.env.dev`, `.env.prod`, etc.).
- The `JIRA_ENCRYPTION_KEY` is a 256-bit symmetric key used for securing JIRA credentials. It can be generated with `openssl rand -base64 32`.