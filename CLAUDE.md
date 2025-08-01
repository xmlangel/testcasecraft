# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack test case management application built with:
- **Frontend**: React 18 with Material-UI and React Router for SPA navigation
- **Backend**: Spring Boot 3.2.4 with Java 21, PostgreSQL database
- **Authentication**: JWT-based authentication with access/refresh token system
- **Build System**: Gradle with integrated Node.js frontend build
- **Testing**: TestNG with Allure reporting, Cypress for E2E tests
- **Unit Testing Framework**: TestNG (NOT JUnit) - 모든 단위 테스트는 TestNG로 작성

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

**⚠️ Java Version Requirement**: This project requires **Java 21**. Make sure to set JAVA_HOME before running any Gradle commands.

```bash
# Java 21 설정 (macOS 예시)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

# 기본 개발 명령어
./gradlew bootRun                    # Start Spring Boot application
./gradlew build                      # Build entire project (includes frontend)
./gradlew test                       # Run Java tests
./gradlew allureReport              # Generate Allure test reports
./gradlew appNpmInstall             # Install frontend dependencies
./gradlew appNpmBuild               # Build frontend only

# H2 데이터베이스로 테스트 실행
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun  # H2 인메모리 DB로 실행
```

### Testing

**⚠️ Java Version Requirement**: 테스트 실행 시에도 **Java 21**이 필요합니다.

```bash
# Java 21 설정 후 테스트 실행
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

# 백엔드 테스트
./gradlew test allureReport         # Run tests and generate reports

# 로컬 H2 데이터베이스로 테스트
SPRING_PROFILES_ACTIVE=local ./gradlew test

# 테스트 프로파일로 테스트 실행 (VM Option 사용)
./gradlew test -Dspring.profiles.active=test

# 프론트엔드 E2E 테스트
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
# Java 21 설정 필수
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

./gradlew test                    # 모든 Java 단위 테스트 실행
./gradlew test --tests "*ControllerTest*"  # 컨트롤러 테스트만 실행
./gradlew test --tests "*ServiceTest*"     # 서비스 테스트만 실행

# VM Option을 사용한 테스트 프로파일 지정
./gradlew test -Dspring.profiles.active=test  # 테스트 전용 프로파일 사용
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

## Database Configuration

### Development & Testing with H2

이 프로젝트는 개발 및 테스트를 위해 **H2 인메모리 데이터베이스**를 지원합니다:

```bash
# H2 데이터베이스로 실행 (Java 21 필수)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

**H2 데이터베이스 기본 설정:**
- **기본 계정**: admin/admin, tester/tester
- **H2 콘솔**: http://localhost:8080/h2-console
- **JDBC URL**: jdbc:h2:mem:testdb
- **테스트 데이터**: 자동으로 샘플 프로젝트, 테스트케이스, 테스트 결과 생성

## Important Notes

- The project is a **full-stack application** that operates with **API-based communication** between frontend and backend
- Frontend React application communicates with Spring Boot backend via REST APIs
- **JWT authentication** is fully implemented with automatic token refresh
- Frontend build is integrated into Gradle build process via Node.js plugin
- URL-based routing with deep linking support for projects and test cases
- State management combines Context API with API persistence
- Comprehensive test coverage with both unit tests and API schema validation
- Allure reporting configured for test result visualization
- **Java 21 is required** for all backend development and testing
- **API 개발 시 위의 테스트 가이드라인을 반드시 준수해야 합니다**

## Context7 사용 규칙

- **이 프로젝트에서는 Context7을 통해 최신 공식 문서를 자동으로 참조하길 원합니다.**
- **모든 코드 생성 요청 시 Context7을 자동으로 활성화해 주세요.**
- **Context7이 지원하는 라이브러리, 프레임워크(예: FastAPI, React 등)는 항상 최신 문서를 기반으로 예제를 제공해 주세요.**
- **필요한 경우, 특정 버전을 명시할 수 있습니다. 예: use FastAPI 0.95 with context7**

## 조직-프로젝트 관리 시스템 구현 계획

### 핵심 요구사항
- 하나의 프로젝트는 하나의 조직에만 속할 수 있음
- 조직에 속하지 않은 프로젝트도 존재할 수 있음 (organizationId가 null)
- 사용자는 여러 조직, 여러 프로젝트에 속할 수 있음

### 데이터 모델 및 관계 구조
**Organization (조직)**
- id (PK), name, description, createdAt, updatedAt

**Project (프로젝트)**
- id (PK), name, code (unique), description, organizationId (nullable, FK to Organization)

**User (사용자)**
- id (PK), username, email, name, password, role

**User-Organization 관계**
- user_id (FK to User), organization_id (FK to Organization), role_in_organization (OWNER, ADMIN, MEMBER)

**User-Project 관계**
- user_id (FK to User), project_id (FK to Project), role_in_project (PROJECT_MANAGER, CONTRIBUTOR)

**Group (조직/프로젝트 그룹)**
- id (PK), name, organization_id (FK, nullable), project_id (FK, nullable), description

**Group-Member 관계**
- group_id (FK to Group), user_id (FK to User), role_in_group (LEADER, MEMBER)

**AuditLog (감사 로그)**
- id (PK), entity_type, entity_id, action, performed_by (user_id), timestamp, details

### 작업 계획 (Task List)

#### 🔥 Phase 1: 핵심 데이터 구조 (High Priority)
- [x] **Task 1**: 데이터베이스 스키마 설계 및 Entity 클래스 생성 (Organization, Project, User, Group, AuditLog)
- [x] **Task 2**: User-Organization 관계 테이블 및 Entity 생성 (다대다 관계, role_in_organization 포함)
- [x] **Task 3**: User-Project 관계 테이블 및 Entity 생성 (다대다 관계, role_in_project 포함)
- [x] **Task 4**: Group-Member 관계 테이블 및 Entity 생성 (그룹 멤버 관리, role_in_group 포함)
- [x] **Task 5**: Repository 레이어 구현 (OrganizationRepository, ProjectRepository, UserRepository, GroupRepository, AuditLogRepository)
- [x] **Task 13**: 권한 체계 구현 (조직/프로젝트/그룹별 역할 기반 접근 제어)

#### 🟡 Phase 2: 비즈니스 로직 구현 (Medium Priority)
- [x] **Task 6**: ✅ 권한 체계 구현 (조직/프로젝트/그룹별 역할 기반 접근 제어) - 완료
- [x] **Task 7**: ✅ Service 레이어 권한 검증 로직 구현 (조직, 프로젝트, 그룹 관리 서비스) - 완료
  
  **🎯 Task 7 완료 내역:**
  - ✅ **OrganizationService**: 조직 CRUD, 멤버 관리, 역할 변경 + 권한 검증
  - ✅ **ProjectService**: 프로젝트 CRUD, 조직 권한 상속, 멤버 관리 + 기존 코드 호환성
  - ✅ **GroupService**: 조직/프로젝트 그룹 생성, 다중 권한 상속, 멤버 관리
  - ✅ **Repository 확장**: `findByUserId`, `findAccessibleProjectsByUserId`, `findAccessibleGroupsByUserId` 메서드 추가
  - ✅ **보안 통합**: 모든 Service에서 SecurityContextUtil, 도메인별 SecurityService 활용
  - ✅ **권한 검증**: 각 메서드마다 인증 확인 + 비즈니스 로직별 세밀한 권한 제어
  - ✅ **테스트 검증**: ServiceSecurityVerificationTest를 통한 구현 확인
  - ✅ **빌드 성공**: 전체 프로젝트 컴파일 및 테스트 통과
- [x] **Task 8**: Controller 레이어 접근 제어 적용 (조직, 프로젝트 API 보안 적용)
- [x] **Task 9**: 감사 로그 구현 (엔티티 변경 이력 자동 기록 및 조회)
- [x] **Task 10**: Controller 레이어 구현 - 조직 관리 API (CRUD, 멤버 관리, 역할 변경)
- [x] **Task 11**: Controller 레이어 구현 - 프로젝트 관리 API (조직별/독립 프로젝트 관리, 접근권한)
- [x] **Task 12**: Controller 레이어 구현 - 그룹 관리 API (그룹 CRUD, 멤버 추가/제거)
- [x] **Task 14**: DTO 클래스 생성 (각 API 요청/응답을 위한 데이터 전송 객체)
- [x] **Task 15**: 데이터베이스 마이그레이션 스크립트 작성 (기존 테이블 구조 변경)
- [x] **Task 17**: 단위 테스트 작성 (Service 및 Repository 레이어 테스트)
- [x] **Task 18**: 통합 테스트 작성 (API 엔드포인트 및 JSON 스키마 검증)

#### 🟢 Phase 3: 사용자 인터페이스 구현
- [x] **Task 16**: 테스트 데이터 초기화 (샘플 조직, 프로젝트, 사용자, 그룹 데이터)
- [x] **Task 19**: 프론트엔드 조직 관리 화면 구현 (조직 목록, 생성, 수정, 멤버 관리)
- [x] **Task 20**: 프론트엔드 프로젝트 관리 화면 구현 (조직별 프로젝트 뷰, 독립 프로젝트 관리)
- [x] **Task 21**: 프론트엔드 대시보드 구현 (조직/프로젝트 통계, 사용량 모니터링)
- [x] **Task 22**: API 문서화 (Swagger/OpenAPI를 통한 조직-프로젝트 관리 API 문서 작성)

### 주요 기능 및 정책
- 조직/프로젝트별 역할(Role) 체계
- 프로젝트 공개/비공개 설정
- 조직 Owner 복수 지정
- 프로젝트 소유권 이전
- 조직 없는 프로젝트 관리
- 조직/프로젝트 그룹(Group) 기능
- 감사 로그(Audit Log)
- 조직별 사용량/통계 대시보드
- 조직 초대 및 멤버 관리
- 조직/프로젝트별 설정 분리

### 작업 시작 방법
```bash
# 특정 Task부터 시작
"1번 작업부터 시작하여 Entity 클래스들을 구현해줘"

# 특정 Phase부터 시작
"Phase 1 작업들을 순서대로 진행해줘"

# 특정 기능 우선 구현
"조직 관리 API부터 구현해줘"
```

## 보안 및 접근 제어 가이드라인

### 필수 보안 규칙

**⚠️ 모든 API 개발 시 반드시 준수해야 하는 보안 규칙:**

#### 1. 접근 제어 필수 적용
- **모든 Controller 메서드**에는 적절한 권한 검증이 필요합니다
- **조직/프로젝트/그룹 리소스 접근 시** 멤버십 확인 필수
- **역할 기반 권한 체크** 적용 (OWNER, ADMIN, MANAGER 등)

#### 2. 필수 어노테이션 사용
```java
// 프로젝트 접근 권한 검증
@PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")

// 조직 멤버십 검증
@PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")

// 관리 권한 검증
@PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
```

#### 3. 현재 사용자 정보 활용
```java
// 컨트롤러에서 현재 사용자 정보 가져오기
@GetMapping("/my-projects")
public ResponseEntity<?> getMyProjects(Authentication authentication) {
    String currentUsername = authentication.getName();
    // 현재 사용자의 프로젝트만 조회
}
```

#### 4. 데이터 필터링 원칙
- **사용자가 접근 가능한 데이터만** 반환
- **전체 목록 조회 시** 권한 기반 필터링 적용
- **개인정보 보호** - 민감한 정보는 역할에 따라 마스킹

### 보안 체크리스트

✅ **API 개발 완료 후 필수 확인사항:**
- [ ] 현재 사용자 인증 확인 (`Authentication` 파라미터 사용)
- [ ] 리소스 접근 권한 검증 (`@PreAuthorize` 적용)
- [ ] 역할 기반 권한 체크 (OWNER, ADMIN, MEMBER 등)
- [ ] 데이터 필터링 적용 (사용자가 접근 가능한 데이터만 반환)
- [ ] 예외 처리 구현 (권한 부족 시 적절한 HTTP 상태 코드)
- [ ] 보안 테스트 작성 (권한 없는 사용자 접근 차단 확인)

### 권한 계층 구조

#### 조직 권한
- **OWNER**: 조직 전체 관리 권한 (삭제, 설정 변경, 멤버 관리)
- **ADMIN**: 조직 관리 권한 (멤버 관리, 프로젝트 생성)
- **MEMBER**: 조직 읽기 권한, 할당된 프로젝트 접근

#### 프로젝트 권한
- **PROJECT_MANAGER**: 프로젝트 전체 관리 권한
- **LEAD_DEVELOPER**: 기술 리드, 팀 관리 권한
- **DEVELOPER**: 개발 권한 (읽기/쓰기)
- **TESTER**: 테스트 권한 (읽기/쓰기)
- **CONTRIBUTOR**: 기여자 권한 (읽기/쓰기)
- **VIEWER**: 읽기 전용 권한

#### 그룹 권한
- **LEADER**: 그룹 관리 권한
- **CO_LEADER**: 그룹 부리더 권한
- **MEMBER**: 그룹 멤버 권한

### 보안 예외 처리

```java
// 권한 부족 시 403 Forbidden 반환
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<?> handleAccessDenied(AccessDeniedException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "접근 권한이 없습니다."));
}

// 리소스 없음 시 404 Not Found 반환 (보안상 존재 여부 숨김)
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "요청한 리소스를 찾을 수 없습니다."));
}
```

### 개발 시 주의사항

1. **정보 누출 방지**: 오류 메시지에서 시스템 내부 정보 노출 금지
2. **최소 권한 원칙**: 사용자에게 필요한 최소한의 권한만 부여
3. **감사 로그**: 중요한 작업은 AuditLog에 기록
4. **세션 관리**: JWT 토큰 만료 및 갱신 적절히 처리

## 조직-프로젝트 관리 시스템 테스트 가이드라인

### 🔥 각 Task 완료 후 필수 테스트 수행

**⚠️ 중요: 모든 Task 완료 시 반드시 해당하는 테스트를 작성하고 실행해야 합니다.**

#### Phase 1: 핵심 데이터 구조 테스트

**Task 1 완료 후 - Entity 테스트**
```bash
# Entity 관계 및 매핑 테스트
./gradlew test --tests "*EntityTest*"
```
- [ ] Entity 클래스 생성 확인
- [ ] JPA 어노테이션 정확성 검증 
- [ ] 테이블 스키마 자동 생성 확인
- [ ] 외래키 제약조건 검증

**Task 2-4 완료 후 - 관계 테이블 테스트**
```bash
# 관계 매핑 테스트
./gradlew test --tests "*RelationshipTest*"
```
- [ ] 다대다 관계 매핑 확인
- [ ] 역할(Role) 기반 권한 테이블 구조 검증
- [ ] 유니크 제약조건 확인 (같은 사용자가 같은 조직에 중복 가입 불가)

**Task 5 완료 후 - Repository 테스트**
```bash
# Repository 계층 테스트
./gradlew test --tests "*RepositoryTest*"
```
- [ ] CRUD 기본 동작 확인
- [ ] 커스텀 쿼리 메서드 동작 검증
- [ ] 데이터 무결성 제약조건 테스트
- [ ] 대량 데이터 성능 테스트

**Task 6 완료 후 - 보안 프레임워크 테스트**
```bash
# 보안 체계 테스트
./gradlew test --tests "*SecurityTest*"
```
- [ ] 권한 없는 사용자 접근 차단 검증
- [ ] 역할 기반 접근 제어 확인
- [ ] 조직-프로젝트-그룹 권한 상속 테스트
- [ ] 시스템 관리자 전체 접근 권한 확인

#### Phase 2: 비즈니스 로직 테스트

**Task 7-9 완료 후 - Service 계층 테스트**
```bash
# 서비스 로직 테스트
./gradlew test --tests "*ServiceTest*"
```
- [ ] 비즈니스 로직 정확성 검증
- [ ] 트랜잭션 롤백 테스트
- [ ] 예외 상황 처리 확인
- [ ] 감사 로그 자동 기록 확인

**Task 10-12 완료 후 - Controller API 테스트**
```bash
# API 통합 테스트
./gradlew test --tests "*ControllerTest*"
./gradlew test --tests "*JsonSchemaTest*"
```
- [ ] HTTP 상태 코드 검증
- [ ] JSON 스키마 검증
- [ ] 요청/응답 데이터 검증
- [ ] API 권한 체크 확인
- [ ] 오류 케이스 테스트

**각 Phase 완료 후 - 통합 테스트**
```bash
# 전체 시스템 통합 테스트
./gradlew test allureReport
```

### 🧪 테스트 작성 템플릿

#### Entity 테스트 템플릿
```java
@SpringBootTest
@Transactional
public class OrganizationEntityTest {
    
    @Test
    public void testOrganizationUserRelationship() {
        // 조직-사용자 관계 매핑 테스트
    }
    
    @Test  
    public void testRoleEnumValues() {
        // 역할 Enum 값 검증
    }
}
```

#### Repository 테스트 템플릿
```java
@DataJpaTest
public class OrganizationRepositoryTest {
    
    @Test
    public void testFindByOrganizationIdAndUserId() {
        // 커스텀 쿼리 메서드 테스트
    }
    
    @Test
    public void testUniqueConstraintViolation() {
        // 유니크 제약조건 위반 테스트
    }
}
```

#### Service 테스트 템플릿
```java
@SpringBootTest
@Transactional
public class OrganizationServiceTest {
    
    @Test
    public void testCreateOrganization() {
        // 조직 생성 비즈니스 로직 테스트
    }
    
    @Test
    public void testInviteMemberWithPermissionCheck() {
        // 권한 체크를 포함한 멤버 초대 테스트
    }
}
```

#### Controller 테스트 템플릿
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class OrganizationControllerTest {
    
    @Test
    public void testCreateOrganizationAPI() {
        // API 엔드포인트 테스트
        // Given-When-Then 패턴 적용
        // JSON 스키마 검증 포함
    }
    
    @Test
    public void testUnauthorizedAccess() {
        // 권한 없는 접근 차단 테스트
    }
}
```

#### 보안 테스트 템플릿
```java
@SpringBootTest
@ActiveProfiles("test")
public class OrganizationSecurityTest {
    
    @Test
    public void testMembershipRequiredForAccess() {
        // 멤버십 필요한 리소스 접근 테스트
    }
    
    @Test
    public void testRoleBasedPermissions() {
        // 역할 기반 권한 테스트
    }
}
```

### 📋 Task별 테스트 체크리스트

#### ✅ Task 완료 후 필수 검증 항목

**모든 Task 공통:**
- [ ] 코드 컴파일 오류 없음
- [ ] 기본 단위 테스트 통과
- [ ] 코드 커버리지 80% 이상
- [ ] 린트 검사 통과

**Entity/Repository Task:**
- [ ] 데이터베이스 스키마 정상 생성
- [ ] 모든 관계 매핑 정상 동작
- [ ] 제약조건 검증 테스트 통과
- [ ] 성능 테스트 (대량 데이터 처리)

**Service Task:**
- [ ] 비즈니스 로직 정확성 검증
- [ ] 트랜잭션 정상 동작
- [ ] 예외 처리 검증
- [ ] 보안 규칙 준수 확인

**Controller Task:**
- [ ] 모든 API 엔드포인트 테스트
- [ ] JSON 스키마 검증 통과
- [ ] 권한 체크 정상 동작
- [ ] HTTP 상태 코드 정확성
- [ ] API 문서화 완료

**보안 Task:**
- [ ] 권한 없는 사용자 접근 차단
- [ ] 역할 기반 권한 정상 동작
- [ ] 데이터 누출 방지 확인
- [ ] 감사 로그 정상 기록

### 🚀 자동화된 테스트 실행

```bash
# 전체 테스트 스위트 실행
./gradlew clean test allureReport

# 특정 카테고리 테스트만 실행
./gradlew test --tests "*SecurityTest*"
./gradlew test --tests "*EntityTest*" 
./gradlew test --tests "*ServiceTest*"
./gradlew test --tests "*ControllerTest*"

# 커버리지 리포트 포함
./gradlew test jacocoTestReport

# 성능 테스트 실행
./gradlew test --tests "*PerformanceTest*"
```

### 📊 테스트 결과 확인

```bash
# Allure 리포트 확인
./gradlew allureServe

# 커버리지 리포트 확인  
open build/reports/jacoco/test/html/index.html

# 테스트 실행 결과 확인
open build/reports/tests/test/index.html
```

### ⚠️ 테스트 실패 시 대응 절차

1. **실패한 테스트 원인 분석**
   - 로그 확인 및 스택 트레이스 분석
   - 테스트 데이터 상태 확인

2. **수정 및 재테스트**
   - 원인에 따른 코드 수정
   - 테스트 케이스 재실행

3. **회귀 테스트**
   - 전체 테스트 스위트 재실행
   - 다른 기능에 영향 없음 확인

4. **문서화**
   - 발견된 이슈 및 해결 방법 기록
   - 테스트 케이스 개선사항 반영

## 백엔드 개발 및 테스트 워크플로우

### ⚠️ 백엔드 수정 후 필수 절차

백엔드 코드(Java/Spring Boot)를 수정한 후에는 **반드시** 다음 절차를 순서대로 수행해야 합니다:

#### 1. 애플리케이션 재시작
```bash
# 기존 프로세스 종료
pkill -f "bootRun"

# Java 21 환경 설정 후 재시작
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &

# 시작 대기 (약 20초)
sleep 20
```

#### 2. 새로운 JWT 토큰 발급
```bash
# 매번 새로운 토큰을 발급받아야 함 (사용자 ID, 데이터베이스 상태 변경 가능)
NEW_TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

echo "새 토큰: $NEW_TOKEN"
```

#### 3. 새로운 리소스 ID 확인
```bash
# 조직 목록에서 새로운 ID 확인 (H2 인메모리 DB로 인해 ID 변경됨)
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations \
  -s | jq '.[] | {id, name}'
```

#### 4. API 테스트 수행
```bash
# 새 토큰과 새 ID로 테스트
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations/{새로운_조직_ID} \
  -s | jq '.'
```

### 🔄 H2 인메모리 데이터베이스 특성

- **애플리케이션 재시작 시 모든 데이터가 초기화됨**
- **사용자 ID, 조직 ID 등이 매번 새로 생성됨**
- **기존 JWT 토큰은 무효화됨 (사용자 ID 변경으로 인해)**
- **테스트 시에는 항상 새로운 토큰과 새로운 ID를 사용해야 함**

### 💡 효율적인 개발 팁

1. **API 테스트 스크립트 작성**: 위 절차를 스크립트로 만들어 자동화
2. **로그 모니터링**: `tail -f app.log`로 실시간 로그 확인
3. **데이터 초기화 로그 확인**: 애플리케이션 시작 시 데이터 생성 로그 확인
4. **중복 요청 방지**: 동일한 수정사항에 대해 반복 테스트 시 위 절차 준수

### 🚨 주의사항

- **절대 이전 토큰 재사용 금지**: 항상 새로운 토큰 발급
- **절대 하드코딩된 ID 사용 금지**: 동적으로 ID 조회 후 사용
- **애플리케이션 완전 시작 대기**: 급하게 테스트하지 말고 충분히 대기

## 조직 관리 시스템 구현 현황 (2025-07-31)

### ✅ 완료된 작업들

#### 1. JSON 파싱 오류 해결
- **문제**: 조직 페이지 접근 시 "Unexpected token ']'" JSON 파싱 오류
- **원인**: JPA Entity의 순환 참조로 인한 JSON 직렬화 문제
- **해결**: Jackson JSON 어노테이션 적용
  - `@JsonManagedReference`와 `@JsonBackReference` 사용
  - Organization.java에 `@JsonManagedReference("organization-members")` 적용
  - OrganizationUser.java에 `@JsonBackReference("organization-members")` 적용

#### 2. admin/admin 로그인 인증 문제 해결
- **문제**: admin/admin 로그인 시 "Bad credentials" 오류
- **원인**: User 모델의 password 필드에 `@JsonIgnore` 어노테이션으로 인해 로그인 요청 시 비밀번호가 null로 파싱됨
- **해결**: `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` 사용
  - 요청 시에는 비밀번호 수신 가능, 응답 시에는 비밀번호 숨김
  - User.java에서 `@JsonIgnore` → `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` 변경

#### 3. Spring Security 설정 개선
- **문제**: AuthenticationProvider가 제대로 연결되지 않음
- **해결**: SecurityConfig.java에서 명시적으로 AuthenticationProvider 등록
  ```java
  .authenticationProvider(authenticationProvider()) // 추가
  ```

#### 4. 조직 멤버십 데이터 초기화 문제 분석
- **문제**: admin 사용자가 조직 멤버로 등록되지 않아 접근 권한 오류 발생
- **원인**: DataInitializer와 OrganizationDataInitializer가 동시 실행되면서 사용자 ID 불일치
- **해결 시도**: OrganizationDataInitializer에서 지연 실행 및 최종 검증 로직 추가

### 🔧 수정된 주요 파일들

#### Backend (Java/Spring Boot)
1. **User.java**: JSON 직렬화 설정 수정
   - `@JsonIgnore` → `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`

2. **SecurityConfig.java**: AuthenticationProvider 명시적 등록
   - `.authenticationProvider(authenticationProvider())` 추가

3. **Organization.java**: JSON 순환 참조 해결
   - `@JsonManagedReference("organization-members")` 추가

4. **OrganizationUser.java**: JSON 순환 참조 해결
   - `@JsonBackReference("organization-members")` 추가

5. **OrganizationDataInitializer.java**: 초기화 순서 및 검증 로직 개선
   - 지연 실행 (2초, 3초 대기)
   - 최종 멤버십 검증 로직 추가

6. **CustomUserDetailsService.java**: 디버그 로깅 추가
   - 사용자 정보 및 비밀번호 해시 로깅

7. **OrganizationSecurityService.java**: 디버그 로깅 추가
   - 멤버십 확인 과정 상세 로깅

#### Frontend (React)
1. **organizationService.js**: 실제 API 데이터 사용
   - `USE_DEMO_DATA` 로직 수정으로 백엔드 API 연동

### 🧪 확인된 동작들

#### 성공적으로 동작하는 기능
- ✅ admin/admin 로그인 (JWT 토큰 발급)
- ✅ 조직 목록 조회 (시스템 관리자 권한으로)
- ✅ 조직 상세 정보 조회 (시스템 관리자 권한으로)
- ✅ JSON 순환 참조 해결

#### 아직 해결 중인 문제
- ⚠️ 조직 멤버 목록 조회 시 접근 권한 오류 (isOrganizationMember vs canAccessOrganization 권한 차이)
- ⚠️ organizationUsers 배열이 비어있음 (fetch join 미적용 또는 데이터 초기화 문제)

### 🔍 현재 진단된 핵심 문제

#### admin 사용자 멤버십 불일치 문제
- **초기화 시점 admin ID**: `0adcbfef-d7a7-4778-b946-5b60b801fa76`
- **로그인 시점 admin ID**: `cad38eae-059d-4d7b-a827-d25d0068bc23`
- **원인**: H2 인메모리 DB 특성상 재시작 시 ID 재생성 + 초기화 순서 문제

#### 권한 체크 로직 차이
- **canAccessOrganization**: 시스템 관리자 권한 포함 ✅
- **isOrganizationMember**: 실제 멤버십만 확인 ❌

### 📋 다음 작업 계획

1. **admin 멤버십 데이터 초기화 완전 해결**
   - DataInitializer와 OrganizationDataInitializer 실행 순서 조정
   - 최종 사용자 ID 기준으로 멤버십 재등록

2. **조직 멤버 fetch join 적용**
   - OrganizationRepository.findByIdWithMembers 메서드 검증
   - 실제 멤버 데이터 로딩 확인

3. **프론트엔드 조직 관리 기능 검증**
   - 조직 목록, 상세, 멤버 목록 UI 동작 확인
   - "조직 보기" 클릭 시 정상 동작 확인

### 💡 학습한 중요 사항들

1. **H2 인메모리 DB 특성**: 재시작 시 모든 ID 재생성
2. **JSON 직렬화**: `@JsonIgnore` vs `@JsonProperty(access = WRITE_ONLY)` 차이
3. **Spring Security**: AuthenticationProvider 명시적 등록 필요성
4. **JPA 순환 참조**: `@JsonManagedReference`와 `@JsonBackReference` 활용
5. **CommandLineRunner 실행 순서**: 여러 초기화 클래스 간 실행 순서 고려 필요

## JIRA 이슈 관리 및 이력 추적

### 🎯 JIRA 통합 개요

이 프로젝트는 **MCP (Model Context Protocol)를 통한 JIRA 자동 연동**을 지원합니다. 모든 개발 작업은 JIRA 이슈로 생성되고 추적됩니다.

### 📋 JIRA MCP 서버 설정

#### MCP 서버 위치 및 설정
- **서버 위치**: `d_mcpsvr_jira/` 디렉토리 (**⚠️ 중요: 프로젝트 루트에서 d_mcpsvr_jira 디렉토리**)
- **절대 경로**: `/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira/`
- **환경 설정**: `d_mcpsvr_jira/.env` 파일 (JIRA 연결 정보)
- **의존성**: `d_mcpsvr_jira/requirements.txt`에 정의된 Python 패키지들
- **Python 스크립트**: `d_mcpsvr_jira/jira_caller.py`, `jira_workflow.py` 등

#### JIRA 연결 정보
```bash
# d_mcpsvr_jira/.env 파일 내용
JIRA_SERVER=https://kwangmyung.atlassian.net
JIRA_USER=kwangmyung.kim@gmail.com
JIRA_API_TOKEN=[API_TOKEN]
JIRA_PROJECT_NAME=ICT  # 기본 프로젝트: ICT (테스트관리툴)
```

**⚠️ 중요: 모든 개발 작업은 ICT 프로젝트에 이슈를 생성해야 합니다**
- **기본 프로젝트**: ICT (테스트관리툴)
- **프로젝트 키**: ICT
- **JIRA URL**: https://kwangmyung.atlassian.net/browse/ICT-*

### 🔄 작업 시 필수 JIRA 이슈 생성 프로세스

#### 0. 작업 시작 전 유사 작업 검색 (⭐ 추가됨)
**새로운 작업을 시작하기 전에 반드시 JIRA에서 유사한 작업이 있는지 검색하여 중복 작업을 방지하고 이전 경험을 활용합니다:**

```bash
# MCP 서버 디렉토리로 이동 (필수!)
cd d_mcpsvr_jira

# 1. 키워드 기반 유사 작업 검색
python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()

# 작업과 관련된 키워드로 검색 (예: 'admin 사용자', '조직 관리', 'JWT 토큰' 등)
search_keywords = 'admin user organization JWT'  # 본인 작업 키워드로 변경
issues = jira.search_issues(f'project = ICT AND (summary ~ \"{search_keywords}\" OR description ~ \"{search_keywords}\") ORDER BY created DESC', maxResults=10)

print(f'🔍 \"{search_keywords}\" 관련 유사 작업 {len(issues)}개 발견:')
print()

for issue in issues:
    print(f'📋 {issue.key}: {issue.fields.summary}')
    print(f'   상태: {issue.fields.status.name}')
    print(f'   생성일: {issue.fields.created[:10]}')
    print(f'   URL: https://kwangmyung.atlassian.net/browse/{issue.key}')
    print()
"

# 2. 이슈 유형별 최근 작업 검색 (Epic, Story, Bug, Task)
python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()

issue_types = {'Epic': '10005', 'Story': '10042', 'Bug': '10040', 'Task': '10003'}
for type_name, type_id in issue_types.items():
    issues = jira.search_issues(f'project = ICT AND issuetype = {type_id} ORDER BY created DESC', maxResults=3)
    print(f'📊 최근 {type_name} 작업 {len(issues)}개:')
    for issue in issues[:3]:
        print(f'   • {issue.key}: {issue.fields.summary} ({issue.fields.status.name})')
    print()
"

# 3. 특정 컴포넌트/모듈 관련 작업 검색
python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()

# 컴포넌트별 검색 (Spring Boot, React, 조직관리, 인증 등)
components = ['Spring Boot', 'React', '조직', '인증', 'JWT', 'API']
for component in components:
    issues = jira.search_issues(f'project = ICT AND (summary ~ \"{component}\" OR description ~ \"{component}\") ORDER BY updated DESC', maxResults=2)
    if issues:
        print(f'🔧 {component} 관련 작업:')
        for issue in issues:
            print(f'   • {issue.key}: {issue.fields.summary} ({issue.fields.status.name})')
        print()
"
```

**📚 유사 작업 분석 체크리스트:**
- [ ] 동일하거나 비슷한 작업이 이미 완료되었는가?
- [ ] 이전 작업에서 사용한 해결 방법을 재사용할 수 있는가?
- [ ] 이전 작업에서 발견된 문제점이나 주의사항이 있는가?
- [ ] 관련 코드나 설정 파일 변경 내역을 참고할 수 있는가?
- [ ] 테스트 방법이나 검증 기준을 재활용할 수 있는가?

**🎯 검색 결과 활용 방법:**
1. **완료된 유사 작업**: 해결 방법, 코드 변경사항, 테스트 절차 참고
2. **진행 중인 유사 작업**: 중복 방지를 위해 담당자와 협의
3. **실패한 유사 작업**: 실패 원인 분석 후 개선된 접근 방법 수립
4. **관련 Epic/Story**: 전체적인 맥락과 요구사항 이해

#### 1. 새로운 작업 시작 전 이슈 생성
**유사 작업 검색 완료 후 새로운 JIRA 이슈를 생성합니다:**

```bash
# MCP 서버 환경 설정 (**⚠️ 중요: 반드시 d_mcpsvr_jira 디렉토리로 이동**)
cd d_mcpsvr_jira
export JIRA_SERVER="https://kwangmyung.atlassian.net"
export JIRA_USER="kwangmyung.kim@gmail.com" 
export JIRA_API_TOKEN="[실제_토큰]"

# 또는 Bash 명령어 사용 시:
# cd /Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira

# 이슈 생성 예제
python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()

issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '[작업_유형] 작업_제목',
    'description': '''**작업 내용**:
• 구체적인 작업 설명
• 기술적 요구사항
• 수용 기준

**관련 파일**:
• src/main/java/...
• src/main/frontend/...

**우선순위**: [High/Medium/Low]
**예상 스토리 포인트**: [숫자]''',
    'issuetype': {'id': '10003'}  # 작업: 10003 (기본값), 스토리: 10042, 버그: 10040, 에픽: 10005
}

issue = jira.create_issue(fields=issue_dict)
print(f'이슈 생성 완료: {issue.key} - {issue.fields.summary}')
print(f'URL: {issue.permalink()}')
"
```

#### 2. 이슈 유형별 생성 가이드

**Epic (10036)** - 대규모 기능 개발
```python
'summary': '[EPIC] 대규모_기능_명',
'description': '''Epic 설명 및 포함되는 Story들 목록'''
```

**Story (10039)** - 사용자 기능 구현
```python
'summary': '[STORY] 기능_설명',
'description': '''**사용자 스토리**: 
As a [사용자], I want [기능] so that [목적]

**수용 기준**:
• 구체적인 검증 조건들'''
```

**Bug (10037)** - 버그 수정
```python
'summary': '[BUG] 버그_설명',
'description': '''**문제 설명**:
• 현재 동작
• 예상 동작
• 재현 방법

**해결 방안**:
• 수정 계획'''
```

**Task (10038)** - 일반 작업
```python
'summary': '[TASK] 작업_설명',
'description': '''**작업 내용**:
• 세부 작업 목록'''
```

#### 3. 작업 진행 중 상황 업데이트

```bash
# 작업 진행 상황 코멘트 추가
python3 -c "
from jira_workflow import add_progress_comment
add_progress_comment(
    issue_key='FIR-XX',
    completed_tasks=[
        '요구사항 분석 완료',
        '설계 문서 작성 완료'
    ],
    current_tasks=[
        '코드 구현 진행 중',
        '단위 테스트 작성 중'
    ],
    findings=[
        '기존 코드와의 호환성 이슈 발견',
        '성능 최적화 필요 구간 확인'
    ],
    next_steps=[
        '호환성 이슈 해결',
        '성능 최적화 적용',
        '통합 테스트 실행'
    ]
)
"
```

#### 4. 작업 완료 시 이슈 업데이트

```bash
# 작업 완료 시 이슈 상태 변경 및 완료 코멘트 추가
python3 -c "
from jira_workflow import add_completion_comment
add_completion_comment(
    issue_key='FIR-XX',
    completed_work=[
        '새로운 기능 구현 완료',
        '단위 테스트 작성 완료',
        '통합 테스트 작성 완료',
        '코드 리뷰 완료'
    ],
    modified_files=[
        'src/main/java/.../SomeController.java',
        'src/main/java/.../SomeService.java',
        'src/test/java/.../SomeServiceTest.java'
    ],
    test_results='모든 테스트 통과 (단위 테스트 12개, 통합 테스트 5개)',
    validation_items=[
        'API 응답 스키마 검증 완료',
        '권한 체크 정상 동작 확인',
        '성능 기준 충족 확인'
    ]
)
"
```

#### 5. 간단한 코멘트 추가

```bash
# 일반 코멘트 추가 (버그 발견, 질문, 공지사항 등)
python3 -c "
from jira_workflow import add_issue_comment
add_issue_comment(
    issue_key='FIR-XX',
    comment_text='''코드 리뷰 중 다음 사항을 발견했습니다:

• 예외 처리 로직 강화 필요
• 로그 레벨 조정 필요  
• 성능 최적화 가능 구간 있음

추가 논의가 필요합니다.''',
    comment_type='코드 리뷰'
)
"
```

### 🚀 새로운 상세 요약 시스템 (2025-07-31 추가)

#### 포괄적인 작업 요약 기능 추가됨

이제 JIRA 코멘트 시스템에 **상세한 요약 정보를 자동으로 생성**하는 기능이 추가되었습니다.

##### 주요 기능
- **기술적 상세사항**: 사용된 기술 스택, 아키텍처 패턴, 프레임워크 정보
- **코드 변경 통계**: 수정된 파일 수, 라인 변경량, 복잡도 변화
- **테스트 상세 결과**: 단위/통합/E2E 테스트 결과와 커버리지
- **성능 메트릭**: 응답 시간, 메모리 사용량, CPU 사용률 등
- **보안 검증**: 취약점 스캔, 권한 검증, 데이터 검증 결과
- **문제점 및 해결책**: 발생한 문제와 해결 과정 상세 기록
- **학습 내용**: 작업 과정에서 얻은 인사이트와 교훈
- **품질 지표**: 코드 품질, 테스트 커버리지, 성능/보안 점수

##### 사용법

```python
# 간단한 자동 요약 생성
from d_mcpsvr_jira.jira_workflow import create_comprehensive_work_summary
create_comprehensive_work_summary("FIR-9", "development")

# 맞춤형 상세 요약 생성
from d_mcpsvr_jira.jira_workflow import add_detailed_summary_comment
summary_data = {
    'overview': '작업 개요',
    'start_time': '2025-07-31 09:00:00',
    'end_time': '2025-07-31 17:30:00',
    'actual_hours': 8.5,
    'tech_stack': ['Java 21', 'Spring Boot', 'H2'],
    'code_stats': {'files_modified': 8, 'lines_added': 156},
    'performance_metrics': {'response_time': 45, 'memory_usage': 128},
    # ... 더 많은 상세 정보
}
add_detailed_summary_comment("FIR-9", summary_data)
```

##### 상세 요약을 사용해야 하는 경우
- ✅ 복잡한 기술적 문제 해결 완료 후
- ✅ 새로운 기능 구현 완료 후  
- ✅ 성능 최적화 작업 완료 후
- ✅ 보안 이슈 해결 완료 후
- ✅ 아키텍처 변경 작업 완료 후

이 기능을 통해 **모든 중요한 개발 작업의 상세한 기술적 정보를 체계적으로 보존**하고, 팀 전체가 참고할 수 있는 풍부한 지식 베이스를 구축할 수 있습니다.

---

### 📊 현재 등록된 JIRA 이슈들

#### Epic 레벨 (완료된 대형 작업들)
- **FIR-6**: [EPIC] 조직-프로젝트 데이터 모델 구현 ✅
- **FIR-7**: [EPIC] 비즈니스 로직 및 API 구현 ✅  
- **FIR-8**: [EPIC] 프론트엔드 조직 관리 시스템 ✅

#### Story 레벨 (핵심 기능 스토리들)
- **FIR-9**: [CRITICAL] admin 사용자 멤버십 불일치 문제 해결 🚨
- **FIR-10**: [DONE] JSON 직렬화 순환 참조 해결 ✅
- **FIR-11**: [HIGH] 조직 멤버 fetch join 적용 🔥
- **FIR-12**: [DONE] Spring Security 인증 개선 ✅

#### Bug 및 Task
- **FIR-13**: [BUG] 권한 체크 로직 일관성 문제
- **FIR-14**: [COMPLETED] JIRA MCP 서버 활성화 ✅
- **FIR-15**: [BACKLOG] 프로젝트별 테스트 케이스 통계 대시보드

### 🔧 JIRA 이슈 생성 자동화 스크립트

프로젝트에는 `d_mcpsvr_jira/create_issues.py` 스크립트가 포함되어 있어 일괄 이슈 생성을 지원합니다.

### ⚠️ 필수 준수사항

#### 개발 작업 시 필수 절차
1. **작업 시작 전**: 반드시 JIRA 이슈 생성
2. **작업 중**: 이슈에 진행 상황 코멘트 추가
3. **작업 완료 후**: 이슈 상태 변경 및 완료 요약 작성
4. **코드 커밋 시**: 커밋 메시지에 이슈 번호 포함 (`[FIR-XX] 커밋 내용`)

#### 이슈 생성이 필요한 작업들
- 새로운 기능 개발
- 버그 수정
- 리팩토링 작업
- 성능 개선
- 테스트 코드 작성
- 문서화 작업
- 설정 변경

#### 이슈 생성 예외 사항
- 단순한 타이포 수정
- 코드 포맷팅만 변경
- 주석 추가/수정
- README 업데이트 (기능 변경 없는 경우)

### 📈 이력 관리 및 추적

#### 진행 상황 추적
- **JIRA 대시보드**: https://kwangmyung.atlassian.net/jira/dashboards
- **프로젝트 보드**: Kanban 또는 Scrum 보드 활용
- **이슈 링크**: 관련 이슈들 간의 연결 관계 설정

#### 보고 및 분석
- **Burndown 차트**: 스프린트 진행 상황 추적
- **Velocity 차트**: 팀 생산성 측정
- **이슈 유형별 통계**: Epic, Story, Bug, Task 비율 분석

### 🛠️ MCP 서버 관리 명령어

```bash
# MCP 서버 의존성 설치
cd d_mcpsvr_jira && pip3 install -r requirements.txt

# 서버 연결 테스트
python3 -c "from server import echo; print(echo('test'))"

# 프로젝트 초기화
python3 -c "from server import init_project; print(init_project('FIR'))"

# 이슈 검색
python3 -c "from server import search; print(search('FIR', 'admin user', '', 5, 'readable'))"
```

이 시스템을 통해 모든 개발 작업이 체계적으로 추적되고 관리됩니다.

## Communication Language

- **한국어 사용**: 이 프로젝트와 관련된 모든 답변과 설명은 한국어로 제공해주세요.
- **Korean Language**: Please provide all responses and explanations related to this project in Korean.
