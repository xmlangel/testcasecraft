-- ICT-191: 테스트 데이터 초기화 스크립트 (H2 Database 호환)
-- 테스트 결과 리포트 기능 테스트용 샘플 데이터

-- 사용자 데이터 (BCrypt 해시: admin123, tester123)
INSERT INTO users (id, username, password, name, email, role, created_at, updated_at) VALUES 
('user-1', 'testuser1', '$2a$10$dXJ9c/lH3xH7xO9xrxvqXuEKhLZ6QZ9MxZQ7xZ8xZ9xZ0xZ1xZ2xZ', 'Test User 1', 'testuser1@test.com', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-2', 'testuser2', '$2a$10$dXJ9c/lH3xH7xO9xrxvqXuEKhLZ6QZ9MxZQ7xZ8xZ9xZ0xZ1xZ2xZ', 'Test User 2', 'testuser2@test.com', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin-test-id', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2/gnCuDnpbOmAGIIW9a2E1L', 'Administrator', 'admin@test.com', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tester-test-id', 'tester', '$2a$10$q2g0Z7b9Z9Z9Z9Z9Z9Z9ZeZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Tester User', 'tester@test.com', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 프로젝트 데이터  
INSERT INTO projects (id, name, code, description, display_order, created_at, updated_at) VALUES
('project-1', '테스트 프로젝트 1', 'TEST-001', '첫 번째 테스트 프로젝트', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project-2', '테스트 프로젝트 2', 'TEST-002', '두 번째 테스트 프로젝트', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트케이스 데이터
INSERT INTO test_cases (id, name, type, description, priority, project_id, parent_id, display_order, created_by, created_at, updated_at) VALUES
('testcase-1', '로그인 기능 테스트', 'testcase', '사용자 로그인 기능을 테스트', 'HIGH', 'project-1', NULL, 1, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testcase-2', '회원가입 기능 테스트', 'testcase', '사용자 회원가입 기능을 테스트', 'MEDIUM', 'project-1', NULL, 2, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testcase-3', '데이터 조회 테스트', 'testcase', '데이터 조회 기능을 테스트', 'LOW', 'project-1', NULL, 3, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('folder-1', '인증 폴더', 'folder', '인증 관련 테스트 폴더', 'HIGH', 'project-1', NULL, 4, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testcase-4', '토큰 검증 테스트', 'testcase', 'JWT 토큰 검증 테스트', 'HIGH', 'project-1', 'folder-1', 1, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트플랜 데이터
INSERT INTO test_plans (id, name, description, project_id, created_at, updated_at) VALUES
('testplan-1', '기본 기능 테스트 플랜', '기본적인 기능들에 대한 테스트 플랜', 'project-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testplan-2', '인증 기능 테스트 플랜', '인증 관련 기능 테스트 플랜', 'project-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 실행 데이터
INSERT INTO test_executions (id, name, description, test_plan_id, project_id, status, created_at, updated_at) VALUES
('execution-1', '기본 기능 테스트 실행 1', '첫 번째 기본 기능 테스트 실행', 'testplan-1', 'project-1', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('execution-2', '인증 기능 테스트 실행 1', '첫 번째 인증 기능 테스트 실행', 'testplan-2', 'project-1', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 결과 데이터 (H2 DATEADD 함수 사용)
INSERT INTO test_results (id, test_case_id, result, notes, executed_at, executed_by, test_execution_id, jira_issue_key, jira_issue_url, jira_sync_status, created_at, updated_at) VALUES
('result-1', 'testcase-1', 'PASS', '로그인 기능이 정상적으로 동작함', DATEADD('DAY', -1, CURRENT_TIMESTAMP), 'user-1', 'execution-1', 'ICT-100', 'https://test.atlassian.net/browse/ICT-100', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-2', 'testcase-2', 'FAIL', '회원가입 시 이메일 검증 오류 발생', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'user-2', 'execution-1', 'ICT-101', 'https://test.atlassian.net/browse/ICT-101', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-3', 'testcase-3', 'PASS', '데이터 조회가 정상적으로 동작함', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'user-1', 'execution-1', 'ICT-102', 'https://test.atlassian.net/browse/ICT-102', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-4', 'testcase-4', 'BLOCKED', '테스트 환경 설정 문제로 차단됨', DATEADD('MINUTE', -30, CURRENT_TIMESTAMP), 'user-2', 'execution-2', 'ICT-103', 'https://test.atlassian.net/browse/ICT-103', 'FAILED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-5', 'testcase-1', 'NOT_RUN', '아직 실행되지 않음', CURRENT_TIMESTAMP, 'user-1', 'execution-2', NULL, NULL, 'NOT_LINKED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);