-- Organization Users 관계 테이블 생성
CREATE TABLE IF NOT EXISTS organization_users (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role_in_organization VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_org_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_org_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- 유니크 제약조건
    CONSTRAINT uk_organization_users UNIQUE (organization_id, user_id),
    
    -- 체크 제약조건
    CONSTRAINT chk_org_users_role CHECK (role_in_organization IN ('OWNER', 'ADMIN', 'MEMBER'))
);

-- Project Users 관계 테이블 생성
CREATE TABLE IF NOT EXISTS project_users (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role_in_project VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_proj_users_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_proj_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- 유니크 제약조건
    CONSTRAINT uk_project_users UNIQUE (project_id, user_id),
    
    -- 체크 제약조건
    CONSTRAINT chk_proj_users_role CHECK (role_in_project IN ('PROJECT_MANAGER', 'CONTRIBUTOR', 'VIEWER'))
);

-- Group Members 관계 테이블 생성
CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role_in_group VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- 유니크 제약조건
    CONSTRAINT uk_group_members UNIQUE (group_id, user_id),
    
    -- 체크 제약조건
    CONSTRAINT chk_group_members_role CHECK (role_in_group IN ('LEADER', 'MEMBER'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_org_users_organization_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_proj_users_project_id ON project_users(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_users_user_id ON project_users(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);