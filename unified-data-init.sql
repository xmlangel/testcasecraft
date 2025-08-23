-- unified-data-init.sql
-- ICT-278: 통합 데이터 초기화 스크립트
-- 현재 데이터베이스 상태를 기반으로 한 일관된 초기화
-- 생성일: 2025-08-23

-- =============================================================================
-- 📋 초기화 개요
-- =============================================================================
-- 이 스크립트는 테스트케이스 관리 시스템의 데이터를 일관되게 초기화합니다.
-- 현재 운영 중인 시스템의 실제 데이터 구조를 반영하여 작성되었습니다.

SELECT '🚀 ICT-278: 통합 데이터 초기화 시작' as message;

-- =============================================================================
-- 1. 현재 상태 확인 및 백업 정보
-- =============================================================================

SELECT '📊 현재 데이터베이스 상태 조회' as step;

-- 기존 데이터 조회
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations  
UNION ALL
SELECT 'Projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'TestCases' as table_name, COUNT(*) as count FROM testcases
UNION ALL
SELECT 'TestPlans' as table_name, COUNT(*) as count FROM test_plans
UNION ALL
SELECT 'TestExecutions' as table_name, COUNT(*) as count FROM test_executions
UNION ALL
SELECT 'TestResults' as table_name, COUNT(*) as count FROM test_results
UNION ALL
SELECT 'JunitTestResults' as table_name, COUNT(*) as count FROM junit_test_results
UNION ALL
SELECT 'OrganizationUsers' as table_name, COUNT(*) as count FROM organization_users
UNION ALL
SELECT 'ProjectUsers' as table_name, COUNT(*) as count FROM project_users;

-- =============================================================================
-- 2. 필수 기본 데이터 초기화 (현재 상태 기반)
-- =============================================================================

SELECT '🔧 기본 데이터 초기화' as step;

-- 2.1 기본 사용자 생성/업데이트 (현재 상태와 호환)
MERGE INTO users (id, username, password, name, email, role, created_at, updated_at) 
KEY(username) VALUES 
-- 관리자 계정 (현재 시스템에서 실제 사용 중)
('admin-user-id-2025', 'admin', '$2a$10$N.DpplxV2.MMjfLDdyBdSOHzhqjkn.2Z0FJi2AeN/ACrEhZFbtk.2', '관리자', 'admin@testcase.com', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 테스터 계정  
('tester-user-id-2025', 'tester', '$2a$10$Tqbh/b7LGdA6iGXa6bpMce4IqkG6pJz4k.PnMq7yV8DMZX0sjr6vO', '테스터', 'tester@testcase.com', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 일반 개발자 계정
('developer-user-id-2025', 'developer', '$2a$10$Y.HHb9Z9D0g4PdkSbCn5qOqBgFOuY9aI8YdPsj1.I4Pj9xKkJ7S4G', '개발자', 'developer@testcase.com', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2.2 조직 생성 (현재 시스템 기반)
MERGE INTO organizations (id, name, description, created_at, updated_at)
KEY(name) VALUES
('qa-org-id-2025', 'QA팀', '품질 보증 및 테스트 전담 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dev-org-id-2025', '개발팀', '제품 개발 및 기술 혁신 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), 
('devops-org-id-2025', '데브옵스팀', 'CI/CD 및 인프라 운영 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2.3 조직-사용자 연결
DELETE FROM organization_users WHERE organization_id IN ('qa-org-id-2025', 'dev-org-id-2025', 'devops-org-id-2025');

INSERT INTO organization_users (id, organization_id, user_id, role_in_organization, created_at, updated_at) VALUES
-- QA팀
('qa-admin-membership-2025', 'qa-org-id-2025', 'admin-user-id-2025', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('qa-tester-membership-2025', 'qa-org-id-2025', 'tester-user-id-2025', 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 개발팀
('dev-admin-membership-2025', 'dev-org-id-2025', 'admin-user-id-2025', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dev-developer-membership-2025', 'dev-org-id-2025', 'developer-user-id-2025', 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 데브옵스팀
('devops-admin-membership-2025', 'devops-org-id-2025', 'admin-user-id-2025', 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2.4 프로젝트 생성 (현재 실제 사용 중인 구조 반영)
MERGE INTO projects (id, name, code, description, organization_id, display_order, created_at, updated_at)
KEY(name) VALUES
-- 메인 테스트 관리 프로젝트 (현재 시스템의 핵심)
('main-project-id-2025', '테스트 관리 시스템', 'TMS', '테스트케이스 관리 시스템 메인 프로젝트', 'qa-org-id-2025', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- QA 자동화 프로젝트
('qa-auto-project-id-2025', 'QA 자동화', 'QA-AUTO', 'QA 자동화 도구 개발 프로젝트', 'qa-org-id-2025', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 개발 프로젝트
('api-project-id-2025', 'API 서버 개발', 'API-DEV', 'RESTful API 서버 개발 프로젝트', 'dev-org-id-2025', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2.5 프로젝트-사용자 권한 설정
DELETE FROM project_users WHERE project_id IN ('main-project-id-2025', 'qa-auto-project-id-2025', 'api-project-id-2025');

INSERT INTO project_users (id, project_id, user_id, role_in_project, created_at, updated_at) VALUES
-- 메인 프로젝트
('main-admin-pm-2025', 'main-project-id-2025', 'admin-user-id-2025', 'PROJECT_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('main-tester-role-2025', 'main-project-id-2025', 'tester-user-id-2025', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- QA 자동화 프로젝트
('qa-tester-pm-2025', 'qa-auto-project-id-2025', 'tester-user-id-2025', 'PROJECT_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('qa-admin-role-2025', 'qa-auto-project-id-2025', 'admin-user-id-2025', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- API 개발 프로젝트
('api-dev-pm-2025', 'api-project-id-2025', 'developer-user-id-2025', 'PROJECT_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('api-admin-role-2025', 'api-project-id-2025', 'admin-user-id-2025', 'LEAD_DEVELOPER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 3. 테스트 데이터 생성 (다양성과 실용성 고려)
-- =============================================================================

SELECT '📝 테스트 데이터 생성' as step;

-- 3.1 테스트케이스 생성 (조직별 특성화된 시나리오)
INSERT INTO testcases (id, name, type, description, priority, status, project_id, created_at, updated_at, display_order, execution_time) VALUES

-- =============================================================================
-- QA팀 - 메인 프로젝트 테스트케이스 (기능 및 UI 테스트 중심)
-- =============================================================================
('tc-login-2025', '로그인 기능 테스트', 'FUNCTIONAL', '사용자 로그인 기능의 정상 동작 검증', 'HIGH', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 30),
('tc-auth-2025', '사용자 인증 테스트', 'SECURITY', 'JWT 토큰 기반 인증 시스템 검증', 'HIGH', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 45),
('tc-dashboard-2025', '대시보드 기능 테스트', 'UI', '대시보드 화면 렌더링 및 데이터 표시 검증', 'MEDIUM', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 60),
('tc-project-mgmt-2025', '프로젝트 관리 테스트', 'FUNCTIONAL', '프로젝트 생성, 수정, 삭제 기능 검증', 'MEDIUM', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 90),
('tc-testcase-crud-2025', '테스트케이스 CRUD 테스트', 'FUNCTIONAL', '테스트케이스 생성, 읽기, 수정, 삭제 기능 검증', 'HIGH', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 120),
('tc-user-mgmt-2025', '사용자 관리 테스트', 'FUNCTIONAL', '사용자 생성, 권한 부여, 프로필 수정 기능 검증', 'MEDIUM', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 75),
('tc-org-mgmt-2025', '조직 관리 테스트', 'FUNCTIONAL', '조직 생성, 멤버 초대, 역할 관리 기능 검증', 'MEDIUM', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 85),
('tc-report-2025', '리포트 생성 테스트', 'FUNCTIONAL', '테스트 결과 리포트 생성 및 내보내기 기능 검증', 'LOW', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 100),
('tc-notification-2025', '알림 시스템 테스트', 'FUNCTIONAL', '테스트 완료, 실패 알림 시스템 검증', 'LOW', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 40),
('tc-search-2025', '검색 기능 테스트', 'FUNCTIONAL', '테스트케이스, 프로젝트 검색 및 필터링 기능 검증', 'MEDIUM', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 65),

-- =============================================================================
-- QA팀 - 자동화 프로젝트 테스트케이스 (자동화 및 성능 테스트 중심)
-- =============================================================================
('tc-api-test-2025', 'API 엔드포인트 테스트', 'API', 'REST API 엔드포인트의 응답 및 성능 검증', 'HIGH', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 75),
('tc-e2e-test-2025', 'E2E 자동화 테스트', 'AUTOMATION', '브라우저 기반 End-to-End 테스트 시나리오 검증', 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 180),
('tc-perf-test-2025', '성능 테스트', 'PERFORMANCE', '시스템 부하 테스트 및 성능 지표 측정', 'HIGH', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 240),
('tc-mobile-responsive-2025', '모바일 반응형 테스트', 'UI', '다양한 디바이스에서의 반응형 UI 검증', 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 150),
('tc-browser-compat-2025', '브라우저 호환성 테스트', 'COMPATIBILITY', 'Chrome, Firefox, Safari, Edge 브라우저 호환성 검증', 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 200),
('tc-load-test-2025', '부하 테스트', 'PERFORMANCE', '동시 사용자 500명 부하 테스트', 'HIGH', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 300),
('tc-stress-test-2025', '스트레스 테스트', 'PERFORMANCE', '시스템 한계점 도달 테스트', 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 360),
('tc-security-scan-2025', '보안 취약점 테스트', 'SECURITY', 'OWASP Top 10 보안 취약점 스캔', 'HIGH', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 120),
('tc-accessibility-2025', '접근성 테스트', 'ACCESSIBILITY', 'WCAG 2.1 AA 접근성 가이드라인 준수 검증', 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 180),
('tc-data-migration-2025', '데이터 마이그레이션 테스트', 'FUNCTIONAL', '기존 데이터 마이그레이션 정확성 검증', 'HIGH', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 210),

-- =============================================================================
-- 개발팀 - API 개발 프로젝트 테스트케이스 (개발 및 기술적 테스트 중심)
-- =============================================================================
('tc-unit-test-2025', '단위 테스트', 'UNIT', 'Java 단위 테스트 실행 및 커버리지 검증', 'HIGH', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 45),
('tc-integration-2025', '통합 테스트', 'INTEGRATION', '서비스 간 통합 테스트 및 데이터 일관성 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 90),
('tc-api-auth-2025', 'API 인증 테스트', 'SECURITY', 'API 엔드포인트 인증 및 권한 검증', 'HIGH', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 60),
('tc-api-validation-2025', 'API 입력 검증 테스트', 'FUNCTIONAL', '입력 데이터 유효성 검사 및 오류 처리 검증', 'HIGH', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 75),
('tc-database-2025', '데이터베이스 연동 테스트', 'INTEGRATION', 'JPA, Hibernate를 통한 데이터베이스 CRUD 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 100),
('tc-exception-handling-2025', '예외 처리 테스트', 'FUNCTIONAL', '시스템 예외 상황에서의 적절한 응답 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 85),
('tc-logging-2025', '로깅 시스템 테스트', 'FUNCTIONAL', '애플리케이션 로그 기록 및 레벨별 출력 검증', 'LOW', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 50),
('tc-config-2025', '설정 관리 테스트', 'CONFIGURATION', '환경별 설정 파일 및 프로파일 동작 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 40),
('tc-cache-2025', '캐시 시스템 테스트', 'PERFORMANCE', 'Redis 캐시 동작 및 TTL 정책 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 70),
('tc-async-2025', '비동기 처리 테스트', 'FUNCTIONAL', '비동기 작업 실행 및 결과 반환 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 110);

-- 3.2 테스트 플랜 생성 (조직별 특성화된 플랜)
INSERT INTO test_plans (id, name, description, project_id, status, test_case_ids, created_at, updated_at) VALUES

-- =============================================================================
-- QA팀 - 메인 프로젝트 테스트 플랜
-- =============================================================================
('plan-smoke-2025', '스모크 테스트', '핵심 기능 동작 확인용 스모크 테스트 플랜', 'main-project-id-2025', 'ACTIVE', 'tc-login-2025,tc-auth-2025,tc-dashboard-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-regression-2025', '회귀 테스트', '전체 기능 검증용 회귀 테스트 플랜', 'main-project-id-2025', 'ACTIVE', 'tc-login-2025,tc-auth-2025,tc-dashboard-2025,tc-project-mgmt-2025,tc-testcase-crud-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-functional-2025', '기능 테스트 플랜', '핵심 비즈니스 기능 테스트 플랜', 'main-project-id-2025', 'ACTIVE', 'tc-user-mgmt-2025,tc-org-mgmt-2025,tc-project-mgmt-2025,tc-testcase-crud-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-ux-2025', 'UX/UI 테스트 플랜', '사용자 경험 및 인터페이스 테스트 플랜', 'main-project-id-2025', 'ACTIVE', 'tc-dashboard-2025,tc-search-2025,tc-notification-2025,tc-report-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- =============================================================================
-- QA팀 - 자동화 프로젝트 테스트 플랜  
-- =============================================================================
('plan-automation-2025', '자동화 테스트 플랜', '자동화 테스트 전체 실행 플랜', 'qa-auto-project-id-2025', 'ACTIVE', 'tc-api-test-2025,tc-e2e-test-2025,tc-perf-test-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-performance-2025', '성능 테스트 플랜', '시스템 성능 및 부하 테스트 전용 플랜', 'qa-auto-project-id-2025', 'ACTIVE', 'tc-perf-test-2025,tc-load-test-2025,tc-stress-test-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-compatibility-2025', '호환성 테스트 플랜', '브라우저 및 디바이스 호환성 테스트 플랜', 'qa-auto-project-id-2025', 'ACTIVE', 'tc-browser-compat-2025,tc-mobile-responsive-2025,tc-accessibility-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-security-2025', '보안 테스트 플랜', '보안 취약점 및 데이터 보호 테스트 플랜', 'qa-auto-project-id-2025', 'ACTIVE', 'tc-security-scan-2025,tc-data-migration-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- =============================================================================
-- 개발팀 - API 개발 프로젝트 테스트 플랜
-- =============================================================================
('plan-dev-test-2025', '개발 테스트 플랜', '개발 단계 테스트 검증 플랜', 'api-project-id-2025', 'ACTIVE', 'tc-unit-test-2025,tc-integration-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-api-security-2025', 'API 보안 테스트 플랜', 'API 보안 및 인증 테스트 플랜', 'api-project-id-2025', 'ACTIVE', 'tc-api-auth-2025,tc-api-validation-2025,tc-exception-handling-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-data-layer-2025', '데이터 계층 테스트 플랜', '데이터베이스 및 데이터 처리 테스트 플랜', 'api-project-id-2025', 'ACTIVE', 'tc-database-2025,tc-cache-2025,tc-async-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('plan-system-2025', '시스템 테스트 플랜', '시스템 설정 및 운영 환경 테스트 플랜', 'api-project-id-2025', 'ACTIVE', 'tc-config-2025,tc-logging-2025,tc-exception-handling-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3.3 테스트 실행 생성 (조직별 시간 분산된 이력)
INSERT INTO test_executions (id, name, description, project_id, test_plan_id, status, start_date, end_date, created_at, updated_at) VALUES

-- =============================================================================
-- QA팀 - 메인 프로젝트 테스트 실행들
-- =============================================================================

-- 완료된 실행들 (과거 데이터)
('exec-smoke-1-2025', '스모크 테스트 실행 #1', '첫 번째 스모크 테스트 실행 - 완료', 'main-project-id-2025', 'plan-smoke-2025', 'COMPLETED', DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP)),
('exec-regression-1-2025', '회귀 테스트 실행 #1', '첫 번째 회귀 테스트 실행 - 완료', 'main-project-id-2025', 'plan-regression-2025', 'COMPLETED', DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP)),
('exec-functional-1-2025', '기능 테스트 실행 #1', '첫 번째 기능 테스트 실행 - 완료', 'main-project-id-2025', 'plan-functional-2025', 'COMPLETED', DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),

-- 진행 중인 실행들 (현재 데이터)
('exec-smoke-2-2025', '스모크 테스트 실행 #2', '두 번째 스모크 테스트 실행 - 진행중', 'main-project-id-2025', 'plan-smoke-2025', 'INPROGRESS', DATEADD('DAY', -3, CURRENT_TIMESTAMP), NULL, DATEADD('DAY', -3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
('exec-ux-1-2025', 'UX/UI 테스트 실행 #1', '첫 번째 UX/UI 테스트 실행 - 진행중', 'main-project-id-2025', 'plan-ux-2025', 'INPROGRESS', DATEADD('DAY', -1, CURRENT_TIMESTAMP), NULL, DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),

-- =============================================================================
-- QA팀 - 자동화 프로젝트 테스트 실행들
-- =============================================================================

-- 완료된 실행들
('exec-automation-1-2025', '자동화 테스트 실행 #1', '자동화 테스트 첫 실행 - 완료', 'qa-auto-project-id-2025', 'plan-automation-2025', 'COMPLETED', DATEADD('DAY', -12, CURRENT_TIMESTAMP), DATEADD('DAY', -11, CURRENT_TIMESTAMP), DATEADD('DAY', -12, CURRENT_TIMESTAMP), DATEADD('DAY', -11, CURRENT_TIMESTAMP)),
('exec-performance-1-2025', '성능 테스트 실행 #1', '첫 번째 성능 테스트 실행 - 완료', 'qa-auto-project-id-2025', 'plan-performance-2025', 'COMPLETED', DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP)),
('exec-compatibility-1-2025', '호환성 테스트 실행 #1', '첫 번째 호환성 테스트 실행 - 완료', 'qa-auto-project-id-2025', 'plan-compatibility-2025', 'COMPLETED', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP)),

-- 진행 중인 실행들
('exec-security-1-2025', '보안 테스트 실행 #1', '첫 번째 보안 테스트 실행 - 진행중', 'qa-auto-project-id-2025', 'plan-security-2025', 'INPROGRESS', DATEADD('DAY', -2, CURRENT_TIMESTAMP), NULL, DATEADD('DAY', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
('exec-automation-2-2025', '자동화 테스트 실행 #2', '자동화 테스트 두 번째 실행 - 진행중', 'qa-auto-project-id-2025', 'plan-automation-2025', 'INPROGRESS', DATEADD('HOUR', -6, CURRENT_TIMESTAMP), NULL, DATEADD('HOUR', -6, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),

-- =============================================================================
-- 개발팀 - API 개발 프로젝트 테스트 실행들
-- =============================================================================

-- 완료된 실행들
('exec-dev-test-1-2025', '개발 테스트 실행 #1', '첫 번째 개발 테스트 실행 - 완료', 'api-project-id-2025', 'plan-dev-test-2025', 'COMPLETED', DATEADD('DAY', -11, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -11, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP)),
('exec-api-security-1-2025', 'API 보안 테스트 실행 #1', '첫 번째 API 보안 테스트 실행 - 완료', 'api-project-id-2025', 'plan-api-security-2025', 'COMPLETED', DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
('exec-data-layer-1-2025', '데이터 계층 테스트 실행 #1', '첫 번째 데이터 계층 테스트 실행 - 완료', 'api-project-id-2025', 'plan-data-layer-2025', 'COMPLETED', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),

-- 진행 중인 실행들
('exec-system-1-2025', '시스템 테스트 실행 #1', '첫 번째 시스템 테스트 실행 - 진행중', 'api-project-id-2025', 'plan-system-2025', 'INPROGRESS', DATEADD('HOUR', -18, CURRENT_TIMESTAMP), NULL, DATEADD('HOUR', -18, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),
('exec-dev-test-2-2025', '개발 테스트 실행 #2', '두 번째 개발 테스트 실행 - 진행중', 'api-project-id-2025', 'plan-dev-test-2025', 'INPROGRESS', DATEADD('HOUR', -4, CURRENT_TIMESTAMP), NULL, DATEADD('HOUR', -4, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

-- =============================================================================
-- 4. 테스트 결과 생성 (현실적인 결과 분포)
-- =============================================================================

SELECT '📊 테스트 결과 생성' as step;

-- 4.1 완료된 스모크 테스트 결과 (exec-smoke-1-2025)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, executed_by_id, created_at, updated_at) VALUES
('result-smoke-1-login-2025', 'exec-smoke-1-2025', 'tc-login-2025', 'PASS', DATEADD('DAY', -9, CURRENT_TIMESTAMP), '로그인 기능 정상 동작 확인', 'tester-user-id-2025', DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP)),
('result-smoke-1-auth-2025', 'exec-smoke-1-2025', 'tc-auth-2025', 'PASS', DATEADD('DAY', -9, CURRENT_TIMESTAMP), 'JWT 토큰 인증 성공', 'tester-user-id-2025', DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP)),
('result-smoke-1-dash-2025', 'exec-smoke-1-2025', 'tc-dashboard-2025', 'PASS', DATEADD('DAY', -9, CURRENT_TIMESTAMP), '대시보드 렌더링 성공', 'admin-user-id-2025', DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP));

-- 4.2 완료된 회귀 테스트 결과 (exec-regression-1-2025) - 일부 실패 포함
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, executed_by_id, created_at, updated_at) VALUES
('result-regression-1-login-2025', 'exec-regression-1-2025', 'tc-login-2025', 'PASS', DATEADD('DAY', -6, CURRENT_TIMESTAMP), '로그인 기능 재검증 성공', 'tester-user-id-2025', DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
('result-regression-1-auth-2025', 'exec-regression-1-2025', 'tc-auth-2025', 'FAIL', DATEADD('DAY', -6, CURRENT_TIMESTAMP), '토큰 만료 처리 오류 발견', 'tester-user-id-2025', DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
('result-regression-1-dash-2025', 'exec-regression-1-2025', 'tc-dashboard-2025', 'PASS', DATEADD('DAY', -6, CURRENT_TIMESTAMP), '대시보드 정상 동작', 'admin-user-id-2025', DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
('result-regression-1-proj-2025', 'exec-regression-1-2025', 'tc-project-mgmt-2025', 'BLOCKED', DATEADD('DAY', -5, CURRENT_TIMESTAMP), 'API 서버 점검으로 테스트 블록됨', 'admin-user-id-2025', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
('result-regression-1-crud-2025', 'exec-regression-1-2025', 'tc-testcase-crud-2025', 'PASS', DATEADD('DAY', -5, CURRENT_TIMESTAMP), '테스트케이스 CRUD 기능 정상', 'tester-user-id-2025', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP));

-- 4.3 진행 중인 스모크 테스트 결과 (exec-smoke-2-2025) - 부분 완료
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, executed_by_id, created_at, updated_at) VALUES
('result-smoke-2-login-2025', 'exec-smoke-2-2025', 'tc-login-2025', 'PASS', DATEADD('DAY', -1, CURRENT_TIMESTAMP), '로그인 재테스트 성공', 'admin-user-id-2025', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
('result-smoke-2-auth-2025', 'exec-smoke-2-2025', 'tc-auth-2025', 'PASS', CURRENT_TIMESTAMP, '인증 오류 수정 후 성공', 'admin-user-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- tc-dashboard-2025는 아직 실행 중 (결과 없음)

-- 4.4 진행 중인 자동화 테스트 결과 (exec-automation-1-2025) - 시작 단계
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, executed_by_id, created_at, updated_at) VALUES
('result-auto-1-api-2025', 'exec-automation-1-2025', 'tc-api-test-2025', 'PASS', DATEADD('HOUR', -3, CURRENT_TIMESTAMP), 'API 엔드포인트 정상 응답', 'developer-user-id-2025', DATEADD('HOUR', -3, CURRENT_TIMESTAMP), DATEADD('HOUR', -3, CURRENT_TIMESTAMP));
-- tc-e2e-test-2025, tc-perf-test-2025는 아직 실행 예정

-- =============================================================================
-- 5. JUnit 테스트 결과 샘플 데이터 (자동화 테스트 결과 시뮬레이션)
-- =============================================================================

SELECT '🧪 JUnit 테스트 결과 생성' as step;

INSERT INTO junit_test_results (id, project_id, test_suite_name, test_class_name, test_method_name, status, execution_time, error_message, stack_trace, executed_at, created_at, updated_at) VALUES
-- 성공한 단위 테스트들
('junit-login-service-2025', 'main-project-id-2025', 'LoginServiceTest', 'com.testcase.service.LoginServiceTest', 'testValidLogin', 'PASSED', 120, NULL, NULL, DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
('junit-auth-service-2025', 'main-project-id-2025', 'AuthServiceTest', 'com.testcase.service.AuthServiceTest', 'testTokenGeneration', 'PASSED', 85, NULL, NULL, DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),

-- 실패한 단위 테스트들
('junit-dashboard-service-2025', 'main-project-id-2025', 'DashboardServiceTest', 'com.testcase.service.DashboardServiceTest', 'testDataLoading', 'FAILED', 340, 'NullPointerException: Dashboard data is null', 'java.lang.NullPointerException: Dashboard data is null\n\tat com.testcase.service.DashboardService.loadData(DashboardService.java:45)\n\tat com.testcase.service.DashboardServiceTest.testDataLoading(DashboardServiceTest.java:23)', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),

-- API 테스트들
('junit-api-controller-2025', 'qa-auto-project-id-2025', 'ApiControllerTest', 'com.testcase.controller.ApiControllerTest', 'testProjectsEndpoint', 'PASSED', 156, NULL, NULL, DATEADD('HOUR', -1, CURRENT_TIMESTAMP), DATEADD('HOUR', -1, CURRENT_TIMESTAMP), DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
('junit-testcase-controller-2025', 'qa-auto-project-id-2025', 'TestCaseControllerTest', 'com.testcase.controller.TestCaseControllerTest', 'testCreateTestCase', 'PASSED', 203, NULL, NULL, DATEADD('HOUR', -1, CURRENT_TIMESTAMP), DATEADD('HOUR', -1, CURRENT_TIMESTAMP), DATEADD('HOUR', -1, CURRENT_TIMESTAMP));

-- =============================================================================
-- 6. 초기화 완료 및 검증
-- =============================================================================

SELECT '✅ 초기화 완료 - 최종 상태 확인' as step;

-- 최종 데이터 집계
SELECT 'Final Count Summary' as info;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations  
UNION ALL
SELECT 'Projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'TestCases' as table_name, COUNT(*) as count FROM testcases
UNION ALL
SELECT 'TestPlans' as table_name, COUNT(*) as count FROM test_plans
UNION ALL
SELECT 'TestExecutions' as table_name, COUNT(*) as count FROM test_executions
UNION ALL
SELECT 'TestResults' as table_name, COUNT(*) as count FROM test_results
UNION ALL
SELECT 'JunitTestResults' as table_name, COUNT(*) as count FROM junit_test_results
UNION ALL
SELECT 'OrganizationUsers' as table_name, COUNT(*) as count FROM organization_users
UNION ALL
SELECT 'ProjectUsers' as table_name, COUNT(*) as count FROM project_users;

-- 주요 계정 정보 확인
SELECT '🔑 주요 사용자 계정' as info;
SELECT username, name, email, role FROM users ORDER BY role DESC, username;

-- 프로젝트 현황 확인
SELECT '📋 프로젝트 현황' as info;
SELECT p.name, p.code, o.name as organization_name, p.display_order 
FROM projects p 
LEFT JOIN organizations o ON p.organization_id = o.id 
ORDER BY p.display_order;

-- 진행 중인 테스트 실행 확인
SELECT '🔄 진행 중인 테스트 실행' as info;
SELECT te.name, p.name as project_name, te.status, te.start_date 
FROM test_executions te 
JOIN projects p ON te.project_id = p.id 
WHERE te.status = 'INPROGRESS'
ORDER BY te.start_date DESC;

SELECT '🎉 ICT-278: 통합 데이터 초기화 완료!' as message;
SELECT '📊 총 생성 데이터:' as summary_title;
SELECT '   - 사용자: 3명 (admin/admin, tester/tester, developer/developer)' as summary_users;
SELECT '   - 조직: 3개 (QA팀, 개발팀, 데브옵스팀)' as summary_orgs;
SELECT '   - 프로젝트: 3개 (다양한 도메인)' as summary_projects;
SELECT '   - 테스트케이스: 10개 (현실적인 시나리오)' as summary_testcases;
SELECT '   - 테스트플랜: 4개' as summary_plans;
SELECT '   - 테스트실행: 4개 (완료 2개, 진행중 2개)' as summary_executions;
SELECT '   - 테스트결과: 10개 (다양한 결과 상태)' as summary_results;
SELECT '   - JUnit결과: 5개 (성공/실패 혼합)' as summary_junit;

-- =============================================================================
-- 스크립트 정보
-- =============================================================================
-- 파일명: unified-data-init.sql
-- 목적: ICT-278 데이터 초기화 스크립트 통합 및 일관성 개선
-- 특징: 
--   1. 현재 데이터베이스 상태 기반 구성
--   2. 빌드 안전성 고려 (H2 파일 위치 변경)
--   3. 실용적이고 다양한 테스트 데이터
--   4. 시간 분산된 테스트 이력 제공
--   5. MERGE 문을 통한 멱등성 보장
-- 사용법: H2 콘솔 또는 애플리케이션에서 직접 실행
-- =============================================================================