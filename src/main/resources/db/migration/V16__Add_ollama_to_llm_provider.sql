-- V16: Add OLLAMA to LLM provider enum
-- 2025-11-08
-- Adds OLLAMA as a valid provider option for llm_config table

-- Drop the existing check constraint
ALTER TABLE llm_config DROP CONSTRAINT IF EXISTS llm_config_provider_check;

-- Add new check constraint with OLLAMA included
ALTER TABLE llm_config ADD CONSTRAINT llm_config_provider_check
    CHECK (provider IN ('OPENWEBUI', 'OPENAI', 'OLLAMA'));

-- Add comment
COMMENT ON CONSTRAINT llm_config_provider_check ON llm_config IS
    'Valid LLM providers: OPENWEBUI, OPENAI, OLLAMA';
