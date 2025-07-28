# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack test case management application built with:
- **Frontend**: React 18 with Material-UI and React Router for SPA navigation
- **Backend**: Spring Boot 3.2.4 with Java 21, PostgreSQL database
- **Authentication**: JWT-based authentication with access/refresh token system
- **Build System**: Gradle with integrated Node.js frontend build
- **Testing**: TestNG with Allure reporting, Cypress for E2E tests

## Architecture

### Frontend Structure
- **React SPA** located in `src/main/frontend/` with URL-based routing
- **Context-based state management** with AppContext.jsx providing global state and API integration
- **JWT Authentication** with automatic token refresh and session management
- **Component hierarchy**: App → ProjectManager → TestCaseTree/Forms → Individual components
- **Material-UI components** for consistent styling and layout
- **URL-based navigation**: `/projects/:projectId/testcases/:testCaseId` pattern

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

## API Development Guidelines

### API 개발 시 필수 테스트 수행

새로운 API를 개발하거나 기존 API를 수정할 때는 **반드시** 다음 테스트들을 수행해야 합니다:

#### 1. 단위 테스트 (Unit Tests)
```bash
./gradlew test                    # 모든 Java 단위 테스트 실행
./gradlew test --tests "*ControllerTest*"  # 컨트롤러 테스트만 실행
./gradlew test --tests "*ServiceTest*"     # 서비스 테스트만 실행
```

#### 2. API 스키마 검증 테스트
```bash
# JSON 스키마 기반 API 응답 검증
./gradlew test --tests "*JsonSchemaTest*"
```

#### 3. 통합 테스트 (Integration Tests)
```bash
# 전체 애플리케이션 컨텍스트 로드 및 API 테스트
./gradlew integrationTest
```

#### 4. API 문서화 및 리포트 생성
```bash
./gradlew test allureReport      # 테스트 결과를 Allure 리포트로 생성
```

### API 테스트 작성 규칙

#### Controller 테스트 작성 시:
- **위치**: `src/test/java/com/testcase/testcasemanagement/api/`
- **명명 규칙**: `{ControllerName}JsonSchemaTest.java`
- **필수 검증 항목**:
    - HTTP 상태 코드 검증
    - JSON 스키마 검증 (`src/test/resources/schemas/` 참조)
    - 요청/응답 데이터 검증
    - 오류 케이스 테스트

#### 테스트 스키마 정의:
- **위치**: `src/test/resources/schemas/`
- **파일명**: `{api-name}-{method}.json`
- **예시**: `project-get.json`, `project-post.json`

#### 예시 테스트 코드 구조:
```java
@Test
public void testCreateProject() {
    // Given: 테스트 데이터 준비
    // When: API 호출
    // Then: 응답 검증 (상태 코드, 스키마, 데이터)
}
```

### API 개발 워크플로우

1. **API 개발**
    - Controller, Service, Repository 구현
    - DTO 및 모델 정의

2. **테스트 작성**
    - JSON 스키마 정의
    - 단위 테스트 작성
    - 통합 테스트 작성

3. **테스트 실행**
   ```bash
   ./gradlew test allureReport
   ```

4. **테스트 결과 확인**
    - `allure-report/index.html` 확인
    - 모든 테스트 통과 확인

5. **API 문서화**
    - Swagger/OpenAPI 문서 업데이트
    - README 또는 API 문서 갱신

### 테스트 실패 시 대응

- **스키마 검증 실패**: `src/test/resources/schemas/` 스키마 파일 확인 및 수정
- **단위 테스트 실패**: 비즈니스 로직 검토 및 수정
- **통합 테스트 실패**: 전체 플로우 및 의존성 확인

### 필수 확인 사항

✅ **API 개발 완료 후 체크리스트:**
- [ ] 단위 테스트 작성 완료
- [ ] JSON 스키마 검증 테스트 작성 완료
- [ ] 통합 테스트 작성 완료
- [ ] 모든 테스트 통과 확인
- [ ] Allure 리포트 생성 및 확인
- [ ] 오류 케이스 테스트 포함
- [ ] API 문서화 완료

## Important Notes

- The project is a **full-stack application** that operates with **API-based communication** between frontend and backend
- Frontend React application communicates with Spring Boot backend via REST APIs
- **JWT authentication** is fully implemented with automatic token refresh
- Frontend build is integrated into Gradle build process via Node.js plugin
- URL-based routing with deep linking support for projects and test cases
- State management combines Context API with API persistence
- Comprehensive test coverage with both unit tests and API schema validation
- Allure reporting configured for test result visualization
- **API 개발 시 위의 테스트 가이드라인을 반드시 준수해야 합니다**

## Context7 사용 규칙

- **이 프로젝트에서는 Context7을 통해 최신 공식 문서를 자동으로 참조하길 원합니다.**
- **모든 코드 생성 요청 시 Context7을 자동으로 활성화해 주세요.**
- **Context7이 지원하는 라이브러리, 프레임워크(예: FastAPI, React 등)는 항상 최신 문서를 기반으로 예제를 제공해 주세요.**
- **필요한 경우, 특정 버전을 명시할 수 있습니다. 예: use FastAPI 0.95 with context7**

## Communication Language

- **한국어 사용**: 이 프로젝트와 관련된 모든 답변과 설명은 한국어로 제공해주세요.
- **Korean Language**: Please provide all responses and explanations related to this project in Korean.
