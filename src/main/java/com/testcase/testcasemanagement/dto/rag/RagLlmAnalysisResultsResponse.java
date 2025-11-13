package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * LLM 청크 분석 결과 조회 응답 DTO
 *
 * FastAPI LLM 분석 결과 조회 API 응답
 * 청크별 분석 결과, 토큰 사용량, 처리 시간 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagLlmAnalysisResultsResponse {

    /**
     * 작업 정보
     * FastAPI: job
     */
    private JobInfo job;

    /**
     * 분석 결과 리스트
     * FastAPI: results
     */
    private List<ChunkAnalysisResult> results;

    /**
     * 총 결과 수
     * FastAPI: total_results
     */
    @JsonProperty("totalResults")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_results"})
    private Integer totalResults;

    /**
     * 페이지네이션 offset
     * FastAPI: skip
     */
    private Integer skip;

    /**
     * 페이지네이션 limit
     * FastAPI: limit
     */
    private Integer limit;

    /**
     * 작업 정보 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobInfo {
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
         * 분석 상태
         * FastAPI: status
         */
        private String status;

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
     * 청크 분석 결과 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChunkAnalysisResult {
        /**
         * 결과 ID
         * FastAPI: id
         */
        private UUID id;

        /**
         * 청크 인덱스 (순서)
         * FastAPI: chunk_index
         */
        @JsonProperty("chunkIndex")
        @com.fasterxml.jackson.annotation.JsonAlias({"chunk_index"})
        private Integer chunkIndex;

        /**
         * 청크 원본 텍스트
         * FastAPI: chunk_text
         */
        @JsonProperty("chunkText")
        @com.fasterxml.jackson.annotation.JsonAlias({"chunk_text"})
        private String chunkText;

        /**
         * LLM 응답 텍스트
         * FastAPI: llm_response
         */
        @JsonProperty("llmResponse")
        @com.fasterxml.jackson.annotation.JsonAlias({"llm_response"})
        private String llmResponse;

        /**
         * 사용된 토큰 수
         * FastAPI: tokens_used
         */
        @JsonProperty("tokensUsed")
        @com.fasterxml.jackson.annotation.JsonAlias({"tokens_used"})
        private Integer tokensUsed;

        /**
         * 처리 시간 (밀리초)
         * FastAPI: processing_time_ms
         */
        @JsonProperty("processingTimeMs")
        @com.fasterxml.jackson.annotation.JsonAlias({"processing_time_ms"})
        private Long processingTimeMs;

        /**
         * 비용 (USD)
         * FastAPI: cost_usd
         */
        @JsonProperty("costUsd")
        @com.fasterxml.jackson.annotation.JsonAlias({"cost_usd"})
        private BigDecimal costUsd;
    }
}
