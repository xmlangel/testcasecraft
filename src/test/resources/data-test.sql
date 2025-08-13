-- ICT-191: 테스트 데이터 초기화 스크립트
-- 테스트 결과 리포트 기능 테스트용 샘플 데이터

-- 사용자 데이터
INSERT INTO users (id, username, password, email, created_at, updated_at) VALUES 
('user-1', 'testuser1', '$2a$10$dummyhashedpassword1', 'testuser1@test.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-2', 'testuser2', '$2a$10$dummyhashedpassword2', 'testuser2@test.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin', 'admin', '$2a$10$dummyhashedpasswordadmin', 'admin@test.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 프로젝트 데이터  
INSERT INTO projects (id, name, description, created_by, created_at, updated_at) VALUES
('project-1', '테스트 프로젝트 1', '첫 번째 테스트 프로젝트', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project-2', '테스트 프로젝트 2', '두 번째 테스트 프로젝트', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트케이스 데이터
INSERT INTO test_cases (id, name, description, project_id, parent_id, created_by, created_at, updated_at) VALUES
('testcase-1', '로그인 기능 테스트', '사용자 로그인 기능을 테스트', 'project-1', NULL, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testcase-2', '회원가입 기능 테스트', '사용자 회원가입 기능을 테스트', 'project-1', NULL, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testcase-3', '데이터 조회 테스트', '데이터 조회 기능을 테스트', 'project-1', NULL, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('folder-1', '인증 폴더', '인증 관련 테스트 폴더', 'project-1', NULL, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testcase-4', '토큰 검증 테스트', 'JWT 토큰 검증 테스트', 'project-1', 'folder-1', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트플랜 데이터
INSERT INTO test_plans (id, name, description, project_id, created_by, created_at, updated_at) VALUES
('testplan-1', '기본 기능 테스트 플랜', '기본적인 기능들에 대한 테스트 플랜', 'project-1', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testplan-2', '인증 기능 테스트 플랜', '인증 관련 기능 테스트 플랜', 'project-1', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 실행 데이터
INSERT INTO test_executions (id, name, description, test_plan_id, project_id, created_by, created_at, updated_at) VALUES
('execution-1', '기본 기능 테스트 실행 1', '첫 번째 기본 기능 테스트 실행', 'testplan-1', 'project-1', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('execution-2', '인증 기능 테스트 실행 1', '첫 번째 인증 기능 테스트 실행', 'testplan-2', 'project-1', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 결과 데이터
INSERT INTO test_results (id, test_case_id, result, notes, executed_at, executed_by, test_execution_id, jira_issue_key, jira_issue_url, jira_sync_status, created_at, updated_at) VALUES
('result-1', 'testcase-1', 'PASS', '로그인 기능이 정상적으로 동작함', CURRENT_TIMESTAMP - INTERVAL '1' DAY, 'user-1', 'execution-1', 'ICT-100', 'https://test.atlassian.net/browse/ICT-100', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-2', 'testcase-2', 'FAIL', '회원가입 시 이메일 검증 오류 발생', CURRENT_TIMESTAMP - INTERVAL '2' HOUR, 'user-2', 'execution-1', 'ICT-101', 'https://test.atlassian.net/browse/ICT-101', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-3', 'testcase-3', 'PASS', '데이터 조회가 정상적으로 동작함', CURRENT_TIMESTAMP - INTERVAL '1' HOUR, 'user-1', 'execution-1', 'ICT-102', 'https://test.atlassian.net/browse/ICT-102', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-4', 'testcase-4', 'BLOCKED', '테스트 환경 설정 문제로 차단됨', CURRENT_TIMESTAMP - INTERVAL '30' MINUTE, 'user-2', 'execution-2', 'ICT-103', 'https://test.atlassian.net/browse/ICT-103', 'FAILED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('result-5', 'testcase-1', 'NOT_RUN', '아직 실행되지 않음', CURRENT_TIMESTAMP, 'user-1', 'execution-2', NULL, NULL, 'NOT_LINKED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);