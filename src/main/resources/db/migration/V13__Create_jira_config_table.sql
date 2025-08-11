-- V13__Create_jira_config_table.sql
-- ICT-161: 사용자별 JIRA 설정 관리 시스템 구현

-- JIRA 설정 테이블 생성
CREATE TABLE jira_config (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    server_url VARCHAR(500) NOT NULL,
    username VARCHAR(100) NOT NULL,
    encrypted_api_token TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    connection_verified BOOLEAN DEFAULT false,
    last_connection_test TIMESTAMP NULL,
    last_connection_error TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 제약 조건
    CONSTRAINT fk_jira_config_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_server_url_format CHECK (server_url LIKE 'http%')
);

-- 인덱스 생성
CREATE INDEX idx_jira_config_user_id ON jira_config(user_id);
CREATE INDEX idx_jira_config_user_active ON jira_config(user_id, is_active);
CREATE INDEX idx_jira_config_connection_status ON jira_config(connection_verified, is_active);
CREATE INDEX idx_jira_config_server_url ON jira_config(server_url);
CREATE INDEX idx_jira_config_last_test ON jira_config(last_connection_test);

-- 사용자당 하나의 활성 설정만 허용하는 제약조건
CREATE UNIQUE INDEX idx_jira_config_user_active_unique 
ON jira_config(user_id) 
WHERE is_active = true;

-- 코멘트 추가
COMMENT ON TABLE jira_config IS '사용자별 JIRA 설정 정보';
COMMENT ON COLUMN jira_config.id IS '설정 고유 식별자 (UUID)';
COMMENT ON COLUMN jira_config.user_id IS '사용자 ID (users 테이블 참조)';
COMMENT ON COLUMN jira_config.server_url IS 'JIRA 서버 URL';
COMMENT ON COLUMN jira_config.username IS 'JIRA 로그인 사용자명 (이메일)';
COMMENT ON COLUMN jira_config.encrypted_api_token IS 'AES-256으로 암호화된 JIRA API 토큰';
COMMENT ON COLUMN jira_config.is_active IS '설정 활성화 여부 (사용자당 하나만 활성화 가능)';
COMMENT ON COLUMN jira_config.connection_verified IS '연결 검증 상태';
COMMENT ON COLUMN jira_config.last_connection_test IS '마지막 연결 테스트 시각';
COMMENT ON COLUMN jira_config.last_connection_error IS '마지막 연결 오류 메시지';
COMMENT ON COLUMN jira_config.created_at IS '설정 생성 시각';
COMMENT ON COLUMN jira_config.updated_at IS '설정 수정 시각';