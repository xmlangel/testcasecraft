package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * LLM 청크 분석 요청 DTO
 *
 * FastAPI LLM 분석 API (/api/v1/documents/{document_id}/analyze-chunks-with-llm) 요청
 * 문서의 모든 청크를 순차적으로 LLM에 질의하여 분석 수행
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagLlmAnalysisRequest {

    /**
     * LLM 설정 ID (선택 사항)
     * Backend에서 LlmConfig를 조회하여 API key 복호화
     * FastAPI로 전달하여 Job에 저장 (resume 시 사용)
     * FastAPI: llm_config_id
     */
    @JsonProperty("llm_config_id")
    @com.fasterxml.jackson.annotation.JsonAlias({"llmConfigId"})
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
    @NotBlank(message = "LLM 모델은 필수입니다")
    @JsonProperty("llm_model")
    private String llmModel;

    /**
     * LLM API 키 (선택, 서버 설정 사용 가능)
     * FastAPI: llm_api_key
     */
    @JsonProperty("llm_api_key")
    private String llmApiKey;

    /**
     * 커스텀 엔드포인트 URL (선택)
     * FastAPI: llm_base_url
     */
    @JsonProperty("llm_base_url")
    private String llmBaseUrl;

    /**
     * 프롬프트 템플릿 ({chunk_text} 플레이스홀더 포함)
     * FastAPI: prompt_template
     */
    @NotBlank(message = "프롬프트 템플릿은 필수입니다")
    @JsonProperty("prompt_template")
    private String promptTemplate;

    /**
     * 한 번에 처리할 청크 수 (배치 크기, 기본값: 10)
     * FastAPI: chunk_batch_size
     */
    @Positive(message = "배치 크기는 양수여야 합니다")
    @JsonProperty("chunk_batch_size")
    @Builder.Default
    private Integer chunkBatchSize = 10;

    /**
     * 배치마다 일시정지 여부 (기본값: true)
     * FastAPI: pause_after_batch
     */
    @JsonProperty("pause_after_batch")
    @Builder.Default
    private Boolean pauseAfterBatch = true;

    /**
     * LLM 응답 최대 토큰 수
     * FastAPI: max_tokens
     */
    @Positive(message = "최대 토큰 수는 양수여야 합니다")
    @JsonProperty("max_tokens")
    private Integer maxTokens;

    /**
     * LLM 온도 (0.0 ~ 2.0, 기본값: 0.7)
     * FastAPI: temperature
     */
    @JsonProperty("temperature")
    @Builder.Default
    private Double temperature = 0.7;
}
