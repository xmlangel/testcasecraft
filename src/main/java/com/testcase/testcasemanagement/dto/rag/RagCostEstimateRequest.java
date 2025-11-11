package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Positive;

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
     * LLM 제공자 ("openai", "anthropic", "ollama")
     * FastAPI: llm_provider
     */
    @NotBlank(message = "LLM 제공자는 필수입니다")
    @JsonProperty("llm_provider")
    private String llmProvider;

    /**
     * LLM 모델 ("gpt-4", "gpt-3.5-turbo", "claude-3-sonnet" 등)
     * FastAPI: llm_model
     */
    @NotBlank(message = "LLM 모델은 필수입니다")
    @JsonProperty("llm_model")
    private String llmModel;

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
