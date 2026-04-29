# AGENTS.md (Unified AI Guidelines)

SINGLE SOURCE OF TRUTH for all agent instructions.

## 1. Core Policies & Constraints

### 1.1. Operational Constraints

- File Deletion: DO NOT delete files (rm) without explicit user approval. Explain reasons first.
- Process Control: DO NOT terminate processes (pkill, kill) or run build commands (./gradlew clean/bootRun) directly. Guide the user to perform these actions.
- Language: ALWAYS respond in Korean (한국어) for all outputs (responses, plans, walkthroughs, commit messages).
- **Documentation Sync**: When modifying this file (`AGENTS.md`), you MUST also update the Korean translation file (`AGENTS_KO.md`) to keep them synchronized for the user.

### 1.2. Backend Modification Workflow

1. Restart Application: Request user to pkill bootRun and restart.
2. Session Verification: Recommend re-login for stable testing.
3. Database State: Check ddl-auto: update for schema changes.

### 1.3. AI Behavioral Guidelines (Karpathy Principles)

#### 1.3.1. Think Before Coding

- **Don't assume**: State assumptions explicitly. If uncertain, stop and ask.
- **Surface tradeoffs**: If multiple interpretations or approaches exist, present them instead of picking silently.
- **Push back**: If a simpler approach exists, suggest it.
- **Stop on confusion**: If something is unclear, name exactly what is confusing and ask for clarification.

#### 1.3.2. Simplicity First

- **Minimum code**: Solve the problem with the least amount of code. No speculative abstractions.
- **No unrequested features**: Do not add "flexibility" or "configurability" that wasn't asked for.
- **Avoid single-use abstractions**: Do not create generic components or functions for one-time use cases.
- **Rewrite if needed**: If a long solution can be simplified significantly, rewrite it for simplicity.

#### 1.3.3. Surgical Changes

- **Targeted edits**: Touch only what you must. Do not "improve" adjacent code, comments, or formatting.
- **Match existing style**: Adhere to the current codebase style, even if you prefer a different approach.
- **Cleanup your own mess**: Remove imports, variables, or functions that YOUR changes made unused. Do not remove pre-existing dead code unless asked.
- **Traceability**: Every changed line should trace directly back to the user's request.

#### 1.3.4. Goal-Driven Execution

- **Define success criteria**: Transform tasks into verifiable goals (e.g., "Fix the bug" → "Write a reproduction test, then make it pass").
- **Step → Verify loop**: For multi-step tasks, follow a "Plan → Execute Step → Verify" cycle.
- **Strong criteria**: Use clear, verifiable metrics for completion rather than vague "make it work" goals.

## 2. Architecture & Design Patterns

For detailed system architecture and data models, refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### 2.1. Backend Layered Architecture

- **Controller**: Request validation, DTO mapping, endpoint definition. No business logic.
- **Service**: Transaction management, business logic, external system calls (MinIO, RAG).
- **Repository**: Spring Data JPA for database access.
- **Model**: JPA Entities. Use Audit fields where applicable.

### 2.2. Frontend Patterns

- **State Management**: React Context API (`AppContext`, `AuthContext`, `ProjectContext`).
- **Data Fetching**: Axios services in `src/main/frontend/src/services/`.
- **Component Structure**: Keep components focused. Extract heavy logic to `hooks/` or `utils/`.

### 2.3. System Components

- **Spring Boot (8080)**: Main API + Serves Frontend Static Files.
- **FastAPI RAG (8001)**: Document processing and vector search.
- **PostgreSQL (5434)**: Main relational data.
- **MinIO (9000)**: Object storage for attachments and RAG documents.

## 3. Project Overview & Tech Stack

### 3.1. Core Stack

- Frontend: React 18, Material-UI, React Router, Recharts.
- Backend: Spring Boot 3.4.12, Java 21, PostgreSQL.
- Auth: JWT (Access/Refresh tokens) + Spring Security 6.
- Build: Gradle with Node.js integration (Vite build).
- Testing: TestNG (Unit), Playwright (E2E), Allure (Reporting).

### 3.2. Key Components

- Test Case Management: Hierarchical tree structure.
- Test Plan/Execution: Collections and result recording.
- Project Management: Multi-project support.
- Dashboard: Progress charts and system metrics.

## 4. File Structure & Key Locations

### 4.1. Frontend

- `src/main/frontend/src/App.jsx`: Main routing.
- `src/main/frontend/src/context/`: Global state management.
- `src/main/frontend/src/components/`: UI components.
- `src/main/frontend/src/services/`: API client services.
- `src/main/frontend/src/utils/`: Tree/progress logic.

### 4.2. Backend

- `src/main/java/com/testcase/testcasemanagement/`: Main package.
- `controller/`, `service/`, `repository/`, `model/`: Standard layered packages.
- `src/main/resources/application.yml`: Configuration.

### 4.3. E2E Testing (Playwright)

- `src/test/e2e/e2e-testcase-app.js`: Main E2E script.
- `src/test/e2e/playwright.config.js`: Configuration.
- `src/test/e2e/authentication/`, `src/test/e2e/dashboard/`: Module tests.

## 5. Development & Testing Commands

### 5.1. Development

- Frontend: `cd src/main/frontend && npm install && npm start`
- Backend/Full: `./gradlew bootRun` (builds frontend to `src/main/resources/static/`)
- Backend port: 8080

### 5.2. Testing

- Backend Unit: `./gradlew test` (Use TestNG, NOT JUnit).
- Specific Test: `./gradlew test --tests "*ControllerTest*"`.
- E2E Execution: `npm run test:ict-138 --prefix src/test/e2e` (Requires backend on 8080).
- Allure Report: `./gradlew allureReport`.

## 6. i18n System (Translation)

### 6.1. Key Locations

- Definitions: `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/`.
- Initializer: `src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationKeyDataInitializer.java`.

### 6.2. Addition Process

1. Keys: Add to appropriate `KeysInitializer` in `keys/`.
2. Korean: Add to `Korean...Translations` in `translations/`.
3. English: Add to `English...Translations` in `translations/`.
4. Register: **CRITICAL** - Register new `KeysInitializer` in `TranslationKeyDataInitializer.java`.

## 7. Infrastructure & Startup

### 7.1. Prerequisites

- Java 21, Docker, Docker Compose.
- Infrastructure: `cd docker-compose-build && docker-compose up -d`.
- Credentials: admin / admin123.
- URL: http://localhost:8080.

## 8. Coding Guidelines

Adhere to the following specialized guidelines for different technical areas:

- **General Development**: [DEVELOPMENT_GUIDE.md](docs/code-guide-line/DEVELOPMENT_GUIDE.md)
- **Design Guidelines**: [README.md](docs/design/README.md)
- **Backend (Java)**: [JAVA_CODING_GUIDELINES.md](docs/code-guide-line/JAVA_CODING_GUIDELINES.md)
- **Backend (FastAPI)**: [FASTAPI_CODING_GUIDELINES.md](docs/code-guide-line/FASTAPI_CODING_GUIDELINES.md)
- **Frontend (React)**: [REACT_CODING_GUIDELINES.md](docs/code-guide-line/REACT_CODING_GUIDELINES.md)
- **API Design**: [API_GUIDE.md](docs/code-guide-line/API_GUIDE.md)
- **Testing**:
  - [TEST_ARCHITECTURE_GUIDE.md](docs/code-guide-line/TEST_ARCHITECTURE_GUIDE.md)
  - [API_TESTING_GUIDE_SUMMARY.md](docs/code-guide-line/API_TESTING_GUIDE_SUMMARY.md)
  - [E2E_TESTING_GUIDE.md](docs/code-guide-line/E2E_TESTING_GUIDE.md)
- **Security & DevOps**:
  - [SECURITY_GUIDE.md](docs/code-guide-line/SECURITY_GUIDE.md)
  - [GITHUB_ACTION_GUIDE.md](docs/code-guide-line/GITHUB_ACTION_GUIDE.md)
