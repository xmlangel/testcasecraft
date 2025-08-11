-- V14__Add_jira_fields_to_test_result.sql
-- ICT-162: JIRA API 클라이언트 및 연동 서비스 구현 - TestResult에 JIRA 필드 추가

-- TestResult 테이블에 JIRA 연동 필드 추가
ALTER TABLE test_results ADD COLUMN jira_issue_key VARCHAR(100) NULL;
ALTER TABLE test_results ADD COLUMN jira_issue_url VARCHAR(500) NULL;
ALTER TABLE test_results ADD COLUMN jira_comment_id VARCHAR(100) NULL;
ALTER TABLE test_results ADD COLUMN jira_sync_status VARCHAR(50) NOT NULL DEFAULT 'NOT_SYNCED';
ALTER TABLE test_results ADD COLUMN last_jira_sync_at TIMESTAMP NULL;
ALTER TABLE test_results ADD COLUMN jira_sync_error TEXT NULL;

-- JIRA 연동을 위한 인덱스 생성
CREATE INDEX idx_test_result_jira_issue_key ON test_results(jira_issue_key);
CREATE INDEX idx_test_result_jira_sync_status ON test_results(jira_sync_status);
CREATE INDEX idx_test_result_jira_sync_needed ON test_results(jira_issue_key, jira_sync_status) 
    WHERE jira_issue_key IS NOT NULL AND jira_sync_status IN ('NOT_SYNCED', 'FAILED', 'RETRY_REQUIRED');
CREATE INDEX idx_test_result_jira_last_sync ON test_results(last_jira_sync_at);

-- 코멘트 추가
COMMENT ON COLUMN test_results.jira_issue_key IS 'JIRA 이슈 키 (예: PRJ-123)';
COMMENT ON COLUMN test_results.jira_issue_url IS 'JIRA 이슈 URL';
COMMENT ON COLUMN test_results.jira_comment_id IS 'JIRA 코멘트 ID (추가된 코멘트의 고유 ID)';
COMMENT ON COLUMN test_results.jira_sync_status IS 'JIRA 동기화 상태 (NOT_SYNCED, PENDING, IN_PROGRESS, SYNCED, FAILED, RETRY_REQUIRED)';
COMMENT ON COLUMN test_results.last_jira_sync_at IS '마지막 JIRA 동기화 시도 시간';
COMMENT ON COLUMN test_results.jira_sync_error IS 'JIRA 동기화 오류 메시지';

-- 데이터 일관성을 위한 체크 제약 조건
ALTER TABLE test_results ADD CONSTRAINT chk_jira_sync_status 
    CHECK (jira_sync_status IN ('NOT_SYNCED', 'PENDING', 'IN_PROGRESS', 'SYNCED', 'FAILED', 'RETRY_REQUIRED'));

-- JIRA 이슈 키가 있으면 URL도 있어야 함
ALTER TABLE test_results ADD CONSTRAINT chk_jira_issue_consistency
    CHECK ((jira_issue_key IS NULL AND jira_issue_url IS NULL) 
           OR (jira_issue_key IS NOT NULL AND jira_issue_url IS NOT NULL));