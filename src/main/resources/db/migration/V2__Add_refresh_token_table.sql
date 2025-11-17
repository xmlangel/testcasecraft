-- Refresh Token 테이블 생성
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    
    -- 외래키 제약조건 (users 테이블이 있다고 가정)
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expiry_date ON refresh_tokens(expiry_date);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id_revoked_expiry ON refresh_tokens(user_id, is_revoked, expiry_date);

-- 만료된 토큰 정리를 위한 복합 인덱스 (PostgreSQL 18 호환)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_cleanup ON refresh_tokens(expiry_date, is_revoked);