package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * LLM 분석 비용 추정 요청 DTO
 *
 * FastAPI 비용 추정 API (/api/v1/documents/{document_id}/estimate-analysis-cost) 요청
 * 분석 시작 전 예상 토큰 사용량 및 비용을 계산하기 위한 요청
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagCostEstimateRequest {

    /**
     * LLM 설정 ID (선택 사항)
     * 이 값이 있으면 Backend에서 LlmConfig를 조회하여 실제 설정 사용
     * Frontend에서만 사용, FastAPI로는 전송하지 않음
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String llmConfigId;

    /**
     * LLM 제공자 ("openai", "anthropic", "ollama", "openwebui" 등)
     * FastAPI: llm_provider
     */
    @JsonProperty("llm_provider")
    private String llmProvider;

    /**
     * LLM 모델 ("gpt-4", "gpt-3.5-turbo", "claude-3-sonnet" 등)
     * FastAPI: llm_model
     */
    @JsonProperty("llm_model")
    private String llmModel;

    /**
     * LLM API 키 (선택 사항, llmConfigId가 있으면 무시됨)
     * FastAPI: llm_api_key
     * WRITE_ONLY: 프론트엔드에서 받을 수는 있지만, FastAPI로 전송할 때는 제외됨
     */
    @JsonProperty(value = "llm_api_key", access = JsonProperty.Access.WRITE_ONLY)
    private String llmApiKey;

    /**
     * 커스텀 엔드포인트 URL (선택 사항)
     * FastAPI: llm_base_url
     * WRITE_ONLY: 프론트엔드에서 받을 수는 있지만, FastAPI로 전송할 때는 제외됨
     */
    @JsonProperty(value = "llm_base_url", access = JsonProperty.Access.WRITE_ONLY)
    private String llmBaseUrl;

    /**
     * 프롬프트 템플릿 ({chunk_text} 플레이스홀더 포함)
     * FastAPI: prompt_template
     */
    @NotBlank(message = "프롬프트 템플릿은 필수입니다")
    @JsonProperty("prompt_template")
    private String promptTemplate;

    /**
     * LLM 응답 최대 토큰 수
     * FastAPI: max_tokens
     */
    @Positive(message = "최대 토큰 수는 양수여야 합니다")
    @JsonProperty("max_tokens")
    private Integer maxTokens;
}
