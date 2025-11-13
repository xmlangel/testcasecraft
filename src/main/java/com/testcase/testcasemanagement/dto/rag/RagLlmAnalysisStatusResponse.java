package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.testcase.testcasemanagement.config.LocalDateTimeArrayDeserializer;
import com.testcase.testcasemanagement.config.LocalDateTimeArraySerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 진행 상황 정보 (FastAPI ProgressInfo 매핑)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ProgressInfo {
    /**
     * 전체 청크 수
     * FastAPI: total_chunks
     */
    @JsonProperty("totalChunks")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_chunks"})
    private Integer totalChunks;

    /**
     * 처리된 청크 수
     * FastAPI: processed_chunks
     */
    @JsonProperty("processedChunks")
    @com.fasterxml.jackson.annotation.JsonAlias({"processed_chunks"})
    private Integer processedChunks;

    /**
     * 진행률 (0-100)
     * FastAPI: percentage
     */
    private Double percentage;
}

/**
 * 비용 정보 (FastAPI CostInfo 매핑)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CostInfo {
    /**
     * 사용된 총 토큰 수
     * FastAPI: total_tokens_used
     */
    @JsonProperty("totalTokensUsed")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_tokens_used"})
    private Integer totalTokensUsed;

    /**
     * 총 비용 (USD)
     * FastAPI: total_cost_usd
     */
    @JsonProperty("totalCostUsd")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_cost_usd"})
    private BigDecimal totalCostUsd;
}

/**
 * LLM 청크 분석 진행 상황 응답 DTO
 *
 * FastAPI LLM 분석 상태 조회 API 응답
 * 분석 진행률, 처리된 청크 수, 비용 정보 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagLlmAnalysisStatusResponse {

    /**
     * 작업 ID
     * FastAPI: job_id
     */
    @JsonProperty("jobId")
    @com.fasterxml.jackson.annotation.JsonAlias({"job_id"})
    private UUID jobId;

    /**
     * 문서 ID
     * FastAPI: document_id
     */
    @JsonProperty("documentId")
    @com.fasterxml.jackson.annotation.JsonAlias({"document_id"})
    private UUID documentId;

    /**
     * LLM Config ID (Backend에서 API key 조회용)
     * FastAPI: llm_config_id
     */
    @JsonProperty("llmConfigId")
    @com.fasterxml.jackson.annotation.JsonAlias({"llm_config_id"})
    private String llmConfigId;

    /**
     * 분석 상태 ("pending", "processing", "paused", "completed", "failed", "cancelled")
     * FastAPI: status
     */
    private String status;

    /**
     * 진행 상황 정보 (nested object)
     * FastAPI: progress
     */
    private ProgressInfo progress;

    /**
     * 실제 비용 정보 (nested object)
     * FastAPI: actual_cost_so_far
     */
    @JsonProperty("actualCostSoFar")
    @com.fasterxml.jackson.annotation.JsonAlias({"actual_cost_so_far"})
    private CostInfo actualCostSoFar;

    /**
     * 분석 시작 시각
     * FastAPI: started_at
     */
    @JsonProperty("startedAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"started_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime startedAt;

    /**
     * 분석 완료 시각
     * FastAPI: completed_at
     */
    @JsonProperty("completedAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"completed_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime completedAt;

    /**
     * 일시정지 시각
     * FastAPI: paused_at
     */
    @JsonProperty("pausedAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"paused_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime pausedAt;

    /**
     * 에러 메시지 (실패 시)
     * FastAPI: error_message
     */
    @JsonProperty("errorMessage")
    @com.fasterxml.jackson.annotation.JsonAlias({"error_message"})
    private String errorMessage;

    /**
     * 응답 메시지
     * FastAPI: message
     */
    private String message;
}
