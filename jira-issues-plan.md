
# JIRA 이슈 생성 계획 - 조직-프로젝트 관리 시스템

## Epic 레벨 이슈들

### Epic 1: 조직-프로젝트 데이터 모델 구현 (완료)
**제목**: Organization-Project Data Model Implementation
**설명**: 조직, 프로젝트, 사용자, 그룹 간의 관계를 표현하는 데이터 모델 및 권한 체계 구현
**상태**: Done
**스토리 포인트**: 21

**포함된 작업들**:
- [ ] Entity 클래스 생성 (Organization, Project, User, Group, AuditLog)
- [ ] User-Organization 관계 테이블 및 Entity 생성
- [ ] User-Project 관계 테이블 및 Entity 생성  
- [ ] Group-Member 관계 테이블 및 Entity 생성
- [ ] Repository 레이어 구현
- [ ] 권한 체계 구현 (SecurityService, 역할 기반 접근 제어)

### Epic 2: 비즈니스 로직 및 API 구현 (완료)
**제목**: Business Logic and API Implementation
**설명**: 조직-프로젝트 관리를 위한 서비스 로직, API 엔드포인트, 테스트 구현
**상태**: Done  
**스토리 포인트**: 34

**포함된 작업들**:
- [ ] Service 레이어 권한 검증 로직 구현
- [ ] Controller 레이어 접근 제어 적용
- [ ] 감사 로그 구현
- [ ] 조직 관리 API (CRUD, 멤버 관리, 역할 변경)
- [ ] 프로젝트 관리 API (조직별/독립 프로젝트 관리)
- [ ] 그룹 관리 API (그룹 CRUD, 멤버 추가/제거)
- [ ] DTO 클래스 생성
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성

### Epic 3: 프론트엔드 조직 관리 시스템 (완료)
**제목**: Frontend Organization Management System
**설명**: React 기반 조직-프로젝트 관리 사용자 인터페이스 구현
**상태**: Done
**스토리 포인트**: 21

**포함된 작업들**:
- [ ] 테스트 데이터 초기화
- [ ] 프론트엔드 조직 관리 화면 구현
- [ ] 프론트엔드 프로젝트 관리 화면 구현  
- [ ] 프론트엔드 대시보드 구현
- [ ] API 문서화

## Story 레벨 이슈들 (현재 진행중/차단)

### Story 1: admin 사용자 멤버십 불일치 문제 해결
**제목**: Fix admin user membership inconsistency on H2 restart
**우선순위**: Critical
**상태**: In Progress
**스토리 포인트**: 8
**Epic**: Epic 2 (Business Logic and API Implementation)

**문제 설명**:
- H2 인메모리 DB 재시작 시 사용자 ID가 변경됨
- 초기화 시점과 로그인 시점의 admin ID 불일치
- admin 사용자가 조직 멤버로 등록되지 않아 접근 권한 오류 발생

**수용 기준**:
- [ ] admin 사용자가 재시작 후에도 모든 조직에 정상적으로 멤버십 등록
- [ ] DataInitializer와 OrganizationDataInitializer 실행 순서 보장
- [ ] 최종 사용자 ID 기준으로 멤버십 재등록 로직 구현
- [ ] 권한 체크 로직 일관성 확보 (canAccessOrganization vs isOrganizationMember)

**기술적 세부사항**:
- 초기화 시점 admin ID: `0adcbfef-d7a7-4778-b946-5b60b801fa76`
- 로그인 시점 admin ID: `cad38eae-059d-4d7b-a827-d25d0068bc23`
- OrganizationDataInitializer에서 지연 실행 및 최종 검증 로직 필요

### Story 2: JSON 직렬화 순환 참조 해결 (완료)
**제목**: Resolve JSON circular reference in JPA entities  
**우선순위**: High
**상태**: Done ✅
**스토리 포인트**: 5
**Epic**: Epic 2 (Business Logic and API Implementation)

**문제 설명**:
- Organization과 OrganizationUser 간 양방향 관계로 인한 JSON 직렬화 오류
- "Unexpected token ']'" JSON 파싱 오류 발생

**해결 방법**:
- Organization.java에 `@JsonManagedReference("organization-members")` 적용
- OrganizationUser.java에 `@JsonBackReference("organization-members")` 적용

### Story 3: 조직 멤버 fetch join 적용
**제목**: Apply fetch join for organization members loading
**우선순위**: High  
**상태**: To Do
**스토리 포인트**: 3
**Epic**: Epic 2 (Business Logic and API Implementation)

**문제 설명**:
- 조직 상세 조회 시 organizationUsers 배열이 비어있음
- OrganizationRepository.findByIdWithMembers에서 fetch join 미적용 또는 데이터 초기화 문제

**수용 기준**:
- [ ] 조직 상세 조회 시 멤버 목록 정상 로딩 확인
- [ ] fetch join 쿼리 정상 동작 검증
- [ ] 프론트엔드 "조직 보기" 클릭 시 멤버 목록 표시

### Story 4: Spring Security 인증 개선 (완료)
**제목**: Improve Spring Security authentication setup
**우선순위**: High
**상태**: Done ✅  
**스토리 포인트**: 5
**Epic**: Epic 2 (Business Logic and API Implementation)

**해결된 문제들**:
- admin/admin 로그인 시 "Bad credentials" 오류
- User 모델의 password 필드 JSON 직렬화 문제
- AuthenticationProvider 연결 문제

**적용된 해결책**:
- `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` 사용
- SecurityConfig.java에서 명시적 AuthenticationProvider 등록

## Bug 레벨 이슈들

### Bug 1: 권한 체크 로직 일관성 문제
**제목**: Inconsistency between canAccessOrganization and isOrganizationMember
**우선순위**: Medium
**상태**: To Do
**스토리 포인트**: 3

**문제 설명**:
- canAccessOrganization: 시스템 관리자 권한 포함 ✅
- isOrganizationMember: 실제 멤버십만 확인 ❌
- 권한 체크 메서드 간 불일치로 인한 접근 오류

**수용 기준**:
- [ ] 권한 체크 로직 일관성 확보
- [ ] 시스템 관리자 권한 통일적 적용
- [ ] 권한 체크 메서드별 역할 명확화

## Task 레벨 이슈들

### Task 1: JIRA MCP 서버 활성화
**제목**: Activate JIRA MCP server for project management
**우선순위**: Low
**상태**: To Do  
**스토리 포인트**: 5

**작업 내용**:
- [ ] d_mcpsvr_jira 디렉토리의 의존성 설치
- [ ] 환경변수 설정 (.env 파일 구성)
- [ ] MCP 서버 실행 테스트
- [ ] .claude-mcp.json에 JIRA MCP 서버 등록
- [ ] JIRA 프로젝트 연동 테스트

## 향후 Backlog 이슈들

### Story 5: 프로젝트별 테스트 케이스 통계 대시보드
**제목**: Project-specific test case statistics dashboard
**우선순위**: Medium
**상태**: Backlog
**스토리 포인트**: 13

### Story 6: 조직별 사용량 모니터링
**제목**: Organization usage monitoring and reporting
**우선순위**: Medium  
**상태**: Backlog
**스토리 포인트**: 8

### Story 7: 다국어 지원 (i18n)
**제목**: Internationalization support for organization management
**우선순위**: Low
**상태**: Backlog
**스토리 포인트**: 13

## 스프린트 계획 제안

### Sprint 1 (현재 진행중) - Critical Issues
- Story 1: admin 사용자 멤버십 불일치 문제 해결 (8pt)
- Story 3: 조직 멤버 fetch join 적용 (3pt)
- Bug 1: 권한 체크 로직 일관성 문제 (3pt)
- **총 스토리 포인트**: 14pt

### Sprint 2 (다음 스프린트) - Enhancement & Integration  
- Task 1: JIRA MCP 서버 활성화 (5pt)
- Story 5: 프로젝트별 테스트 케이스 통계 대시보드 (13pt)
- **총 스토리 포인트**: 18pt

## 이슈 라벨 제안

- `organization-management`: 조직 관리 관련 이슈
- `project-management`: 프로젝트 관리 관련 이슈  
- `security`: 보안 및 권한 관련 이슈
- `frontend`: React 프론트엔드 관련 이슈
- `backend`: Spring Boot 백엔드 관련 이슈
- `database`: 데이터베이스 관련 이슈
- `testing`: 테스트 관련 이슈
- `critical-bug`: 긴급 수정 필요한 버그
- `h2-database`: H2 데이터베이스 특이사항 관련

## 컴포넌트 제안

- Frontend (React)
- Backend (Spring Boot)  
- Database (H2/PostgreSQL)
- Security (Spring Security)
- Testing (TestNG/Jest)
- Documentation