-- V18: LLM 제공자에 OpenRouter 추가
-- 생성일: 2025-11-10
-- 설명: llm_config 테이블의 provider 제약 조건에 'OPENROUTER' 추가

-- 기존 제약 조건 삭제
ALTER TABLE llm_config DROP CONSTRAINT IF EXISTS llm_config_provider_check;

-- 새로운 제약 조건 추가 (OPENROUTER 포함)
ALTER TABLE llm_config ADD CONSTRAINT llm_config_provider_check
    CHECK (provider IN ('OPENWEBUI', 'OPENAI', 'OLLAMA', 'PERPLEXITY', 'OPENROUTER'));

-- 주석 업데이트
COMMENT ON CONSTRAINT llm_config_provider_check ON llm_config IS
    'Valid LLM providers: OPENWEBUI, OPENAI, OLLAMA, PERPLEXITY, OPENROUTER';
