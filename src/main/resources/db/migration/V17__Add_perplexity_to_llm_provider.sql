-- V17: LLM 제공자에 Perplexity 추가
-- 생성일: 2025-11-08
-- 설명: llm_config 테이블의 provider 제약 조건에 'PERPLEXITY' 추가

-- 기존 제약 조건 삭제
ALTER TABLE llm_config DROP CONSTRAINT IF EXISTS llm_config_provider_check;

-- 새로운 제약 조건 추가 (PERPLEXITY 포함)
ALTER TABLE llm_config ADD CONSTRAINT llm_config_provider_check
    CHECK (provider IN ('OPENWEBUI', 'OPENAI', 'OLLAMA', 'PERPLEXITY'));

-- 주석 업데이트
COMMENT ON CONSTRAINT llm_config_provider_check ON llm_config IS
    'Valid LLM providers: OPENWEBUI, OPENAI, OLLAMA, PERPLEXITY';
