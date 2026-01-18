-- ICT-191: 테스트 데이터 초기화 스크립트 (H2 Database 호환)
-- ICT-191: 테스트 데이터 초기화 스크립트 (PostgreSQL 호환)
-- 테스트 결과 리포트 기능 테스트용 샘플 데이터

-- 사용자 데이터 (BCrypt 해시: admin123, tester123)
INSERT INTO users (id, username, password, name, email, role, email_verified, is_active, created_at, updated_at) VALUES 
('user-1', 'testuser1', '$2a$10$dXJ9c/lH3xH7xO9xrxvqXuEKhLZ6QZ9MxZQ7xZ8xZ9xZ0xZ1xZ2xZ', 'Test User 1', 'testuser1@test.com', 'TESTER', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-2', 'testuser2', '$2a$10$dXJ9c/lH3xH7xO9xrxvqXuEKhLZ6QZ9MxZQ7xZ8xZ9xZ0xZ1xZ2xZ', 'Test User 2', 'testuser2@test.com', 'TESTER', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin-test-id', 'test_admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2/gnCuDnpbOmAGIIW9a2E1L', 'Administrator', 'admin@test.com', 'ADMIN', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tester-test-id', 'tester', '$2a$10$q2g0Z7b9Z9Z9Z9Z9Z9Z9ZeZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Tester User', 'tester@test.com', 'TESTER', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 프로젝트 데이터  
INSERT INTO projects (id, name, code, description, display_order, createdat, updatedat) VALUES
('project-1', '테스트 프로젝트 1', 'TEST-001', '첫 번째 테스트 프로젝트', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project-2', '테스트 프로젝트 2', 'TEST-002', '두 번째 테스트 프로젝트', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 프로젝트 멤버 데이터
INSERT INTO project_users (id, project_id, user_id, role_in_project, created_at, updated_at) VALUES
('pu-1', 'project-1', 'user-1', 'CONTRIBUTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pu-2', 'project-1', 'admin-test-id', 'PROJECT_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pu-3', 'project-2', 'user-2', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 케이스 데이터
INSERT INTO testcases (id, project_id, name, type, description, display_order, priority, created_at, updated_at) VALUES
('tc-1', 'project-1', '로그인 테스트', 'testcase', '로그인 기능 테스트', 1, 'HIGH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tc-2', 'project-1', '회원가입 테스트', 'testcase', '회원가입 기능 테스트', 2, 'MEDIUM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tc-3', 'project-2', '상품 목록 조회', 'testcase', '상품 목록 조회 테스트', 1, 'HIGH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트플랜 데이터
INSERT INTO test_plans (id, name, description, project_id, created_at, updated_at) VALUES
('testplan-1', '기본 기능 테스트 플랜', '기본적인 기능들에 대한 테스트 플랜', 'project-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testplan-2', '인증 기능 테스트 플랜', '인증 관련 기능 테스트 플랜', 'project-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 실행 데이터
INSERT INTO test_executions (id, name, description, test_plan_id, project_id, status, created_at, updated_at) VALUES
('execution-1', '기본 기능 테스트 실행 1', '첫 번째 기본 기능 테스트 실행', 'testplan-1', 'project-1', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('execution-2', '인증 기능 테스트 실행 1', '첫 번째 인증 기능 테스트 실행', 'testplan-2', 'project-1', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

('result-4', 'testcase-4', 'BLOCKED', '테스트 환경 설정 문제로 차단됨', DATEADD('MINUTE', -30, CURRENT_TIMESTAMP), 'user-2', 'execution-2', 'ICT-103', 'https://test.atlassian.net/browse/ICT-103', 'FAILED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-5', 'testcase-1', 'NOT_RUN', '아직 실행되지 않음', CURRENT_TIMESTAMP, 'user-1', 'execution-2', NULL, NULL, 'NOT_LINKED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);