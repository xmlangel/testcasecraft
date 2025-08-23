-- Step 3: 프로젝트 데이터 초기화
SELECT '🔧 Step 3: 프로젝트 데이터 초기화' as step;

-- 프로젝트 생성 (현재 실제 사용 중인 구조 반영)
MERGE INTO projects (id, name, code, description, organization_id, display_order, created_at, updated_at)
KEY(name) VALUES
-- 메인 테스트 관리 프로젝트 (현재 시스템의 핵심)
('main-project-id-2025', '테스트 관리 시스템', 'TMS', '테스트케이스 관리 시스템 메인 프로젝트', 'qa-org-id-2025', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- QA 자동화 프로젝트
('qa-auto-project-id-2025', 'QA 자동화', 'QA-AUTO', 'QA 자동화 도구 개발 프로젝트', 'qa-org-id-2025', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 개발 프로젝트
('api-project-id-2025', 'API 서버 개발', 'API-DEV', 'RESTful API 서버 개발 프로젝트', 'dev-org-id-2025', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 프로젝트-사용자 권한 설정
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

SELECT '✅ 프로젝트 데이터 초기화 완료' as result;
SELECT p.name as project_name, o.name as organization_name FROM projects p LEFT JOIN organizations o ON p.organization_id = o.id ORDER BY p.display_order;