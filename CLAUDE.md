# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack test case management application built with:
- **Frontend**: React 18 with Material-UI, using local storage for data persistence
- **Backend**: Spring Boot 3.2.4 with Java 21, PostgreSQL database
- **Build System**: Gradle with integrated Node.js frontend build
- **Testing**: TestNG with Allure reporting, Cypress for E2E tests

## Architecture

### Frontend Structure
- **React SPA** located in `src/main/frontend/`
- **Context-based state management** with AppContext.jsx providing global state
- **Component hierarchy**: App → ProjectManager → TestCaseTree/Forms → Individual components
- **Local storage persistence** for UI state and data (key: "testcase-manager-ui-state")
- **Material-UI components** for consistent styling and layout

### Backend Structure
- **Spring Boot REST API** with standard layered architecture:
  - Controllers: Handle HTTP requests and responses
  - Services: Business logic implementation
  - Repositories: Data access layer using Spring Data JPA
  - DTOs: Data transfer objects for API communication
  - Models: JPA entities representing database tables

### Key Components
- **Test Case Management**: Hierarchical tree structure with parent-child relationships
- **Test Plan Management**: Collections of test cases for execution planning
- **Test Execution**: Running test plans and recording results
- **Project Management**: Multi-project support with user authentication
- **Dashboard**: Progress tracking and reporting with charts

## Development Commands

### Frontend Development
```bash
cd src/main/frontend
npm install          # Install dependencies
npm start           # Start development server (port 3000)
npm run build       # Build for production
npm test            # Run Jest tests
```

### Backend Development
```bash
./gradlew bootRun                    # Start Spring Boot application
./gradlew build                      # Build entire project (includes frontend)
./gradlew test                       # Run Java tests
./gradlew allureReport              # Generate Allure test reports
./gradlew appNpmInstall             # Install frontend dependencies
./gradlew appNpmBuild               # Build frontend only
```

### Testing
```bash
./gradlew test allureReport         # Run tests and generate reports
cd src/test/front && npx cypress run  # Run Cypress E2E tests
cd src/test/front && npx cypress open # Open Cypress interactive mode
```

## Key Files and Locations

### Frontend Key Files
- `src/main/frontend/src/App.jsx` - Main application component with routing
- `src/main/frontend/src/context/AppContext.jsx` - Global state management
- `src/main/frontend/src/components/` - All React components
- `src/main/frontend/src/models/` - Data models and demo data
- `src/main/frontend/src/utils/` - Utility functions for tree operations and progress calculation

### Backend Key Files
- `src/main/java/com/testcase/testcasemanagement/` - Main application package
- `src/main/resources/application.yml` - Spring configuration
- `src/test/java/` - Java test files with JSON schema validation
- `src/test/resources/schemas/` - JSON schemas for API testing

### Configuration
- `build.gradle` - Main build configuration with frontend integration
- `src/main/frontend/package.json` - Frontend dependencies and scripts
- `src/test/resources/allure.properties` - Allure reporting configuration

## Data Storage Strategy

This application uses **local storage** for data persistence in the frontend-only mode:
- All application data stored in browser localStorage
- State automatically saved on changes and restored on app load
- No backend API calls for data operations in current configuration

## Important Notes

- The project includes both frontend and backend code, but operates in frontend-only mode with local storage
- Frontend build is integrated into Gradle build process via Node.js plugin
- JWT authentication and Google OAuth2 configuration present but not active in local storage mode
- Comprehensive test coverage with both unit tests and API schema validation
- Allure reporting configured for test result visualization

## Context7 사용 규칙

- **이 프로젝트에서는 Context7을 통해 최신 공식 문서를 자동으로 참조하길 원합니다.**
- **모든 코드 생성 요청 시 Context7을 자동으로 활성화해 주세요.**
- **Context7이 지원하는 라이브러리, 프레임워크(예: FastAPI, React 등)는 항상 최신 문서를 기반으로 예제를 제공해 주세요.**
- **필요한 경우, 특정 버전을 명시할 수 있습니다. 예: use FastAPI 0.95 with context7**

## Communication Language

- **한국어 사용**: 이 프로젝트와 관련된 모든 답변과 설명은 한국어로 제공해주세요.
- **Korean Language**: Please provide all responses and explanations related to this project in Korean.
