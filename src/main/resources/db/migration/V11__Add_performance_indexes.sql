-- V11: 성능 최적화 인덱스 추가
-- 조직-프로젝트 관리 시스템의 성능 향상을 위한 추가 인덱스 생성

-- 1. Organizations 테이블 최적화
-- 조직명 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
-- 생성일 기준 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);

-- 2. Projects 테이블 최적화
-- 프로젝트명 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
-- 조직별 프로젝트 조회 및 생성일 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_projects_org_created_at ON projects(organization_id, created_at DESC);
-- 조직별 프로젝트명 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_projects_org_name ON projects(organization_id, name);

-- 3. Groups 테이블 최적화
-- 그룹명 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
-- 조직별 그룹 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_groups_org_created_at ON groups(organization_id, created_at DESC);
-- 프로젝트별 그룹 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_groups_proj_created_at ON groups(project_id, created_at DESC);

-- 4. Users 테이블 최적화
-- 사용자명, 이메일 검색 성능 향상 (이미 존재할 수 있지만 확실히 하기 위해)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- 역할별 사용자 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- 생성일 기준 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 5. Organization Users 관계 테이블 최적화
-- 역할별 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_org_users_role ON organization_users(role_in_organization);
-- 가입일 기준 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_org_users_created_at ON organization_users(created_at DESC);

-- 6. Project Users 관계 테이블 최적화
-- 가입일 기준 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_proj_users_created_at ON project_users(created_at DESC);

-- 7. Group Members 관계 테이블 최적화
-- 가입일 기준 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_group_members_created_at ON group_members(created_at DESC);

-- 8. Audit Logs 테이블 최적화
-- 복합 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_action ON audit_logs(entity_type, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_timestamp ON audit_logs(entity_type, entity_id, timestamp DESC);
-- 사용자별 활동 로그 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(performed_by, timestamp DESC);
-- 액션별 시간 범위 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);

-- 9. 복합 쿼리 최적화 인덱스
-- 조직의 활성 프로젝트 수 조회 최적화
CREATE INDEX IF NOT EXISTS idx_projects_org_active ON projects(organization_id) 
WHERE organization_id IS NOT NULL;

-- 사용자의 조직별 역할 조회 최적화
CREATE INDEX IF NOT EXISTS idx_org_users_user_org ON organization_users(user_id, organization_id, role_in_organization);

-- 사용자의 프로젝트별 역할 조회 최적화  
CREATE INDEX IF NOT EXISTS idx_proj_users_user_proj ON project_users(user_id, project_id, role_in_project);

-- 사용자의 그룹별 역할 조회 최적화
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON group_members(user_id, group_id, role_in_group);

-- 10. 통계 쿼리 최적화 인덱스
-- 조직별 멤버 수 조회 최적화
CREATE INDEX IF NOT EXISTS idx_org_users_org_count ON organization_users(organization_id);

-- 프로젝트별 멤버 수 조회 최적화
CREATE INDEX IF NOT EXISTS idx_proj_users_proj_count ON project_users(project_id);

-- 그룹별 멤버 수 조회 최적화
CREATE INDEX IF NOT EXISTS idx_group_members_group_count ON group_members(group_id);