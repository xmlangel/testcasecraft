-- V9: 프로젝트 사용자 역할 확장
-- 기존 project_users 테이블의 역할 제약조건을 확장하여 새로운 역할들 추가

-- 기존 체크 제약조건 삭제
ALTER TABLE project_users DROP CONSTRAINT IF EXISTS chk_proj_users_role;

-- 새로운 체크 제약조건 추가 (확장된 역할 포함)
ALTER TABLE project_users ADD CONSTRAINT chk_proj_users_role 
CHECK (role_in_project IN (
    'PROJECT_MANAGER',
    'LEAD_DEVELOPER', 
    'DEVELOPER',
    'TESTER',
    'CONTRIBUTOR',
    'VIEWER'
));

-- 기존 데이터 무결성 보장을 위한 UPDATE
-- 'CONTRIBUTOR' 역할은 그대로 유지되고 새로운 역할들이 추가됨
-- 기존 데이터는 변경하지 않음

-- 성능 최적화를 위한 복합 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_proj_users_project_role ON project_users(project_id, role_in_project);
CREATE INDEX IF NOT EXISTS idx_proj_users_user_role ON project_users(user_id, role_in_project);