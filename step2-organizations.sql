-- Step 2: 조직 데이터 초기화
SELECT '🔧 Step 2: 조직 데이터 초기화' as step;

-- 조직 생성 (현재 시스템 기반)
MERGE INTO organizations (id, name, description, created_at, updated_at)
KEY(name) VALUES
('qa-org-id-2025', 'QA팀', '품질 보증 및 테스트 전담 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dev-org-id-2025', '개발팀', '제품 개발 및 기술 혁신 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), 
('devops-org-id-2025', '데브옵스팀', 'CI/CD 및 인프라 운영 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 조직-사용자 연결
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

SELECT '✅ 조직 데이터 초기화 완료' as result;
SELECT name, description FROM organizations ORDER BY name;