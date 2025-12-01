package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * LLM 분석 작업 목록 응답 DTO
 *
 * 프로젝트별 또는 전체 LLM 분석 작업 목록 조회
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagLlmAnalysisJobListResponse {

    /**
     * 분석 작업 목록
     */
    private List<JobSummary> jobs;

    /**
     * 전체 작업 수
     */
    @JsonProperty("totalCount")
    @com.fasterxml.jackson.annotation.JsonAlias({ "total_count" })
    private Integer totalCount;

    /**
     * 페이지 번호
     */
    private Integer page;

    /**
     * 페이지 크기
     */
    @JsonProperty("pageSize")
    @com.fasterxml.jackson.annotation.JsonAlias({ "page_size" })
    private Integer pageSize;

    /**
     * LLM 분석 작업 요약 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobSummary {

        /**
         * 작업 ID
         */
        @JsonProperty("jobId")
        @com.fasterxml.jackson.annotation.JsonAlias({ "job_id" })
        private UUID jobId;

        /**
         * 문서 ID
         */
        @JsonProperty("documentId")
        @com.fasterxml.jackson.annotation.JsonAlias({ "document_id" })
        private UUID documentId;

        /**
         * 문서명
         */
        @JsonProperty("fileName")
        @com.fasterxml.jackson.annotation.JsonAlias({ "file_name" })
        private String fileName;

        /**
         * 프로젝트 ID
         */
        @JsonProperty("projectId")
        @com.fasterxml.jackson.annotation.JsonAlias({ "project_id" })
        private UUID projectId;

        /**
         * LLM 제공자
         */
        @JsonProperty("llmProvider")
        @com.fasterxml.jackson.annotation.JsonAlias({ "llm_provider" })
        private String llmProvider;

        /**
         * LLM 모델
         */
        @JsonProperty("llmModel")
        @com.fasterxml.jackson.annotation.JsonAlias({ "llm_model" })
        private String llmModel;

        /**
         * 분석 상태
         */
        private String status;

        /**
         * 전체 청크 수
         */
        @JsonProperty("totalChunks")
        @com.fasterxml.jackson.annotation.JsonAlias({ "total_chunks" })
        private Integer totalChunks;

        /**
         * 처리된 청크 수
         */
        @JsonProperty("processedChunks")
        @com.fasterxml.jackson.annotation.JsonAlias({ "processed_chunks" })
        private Integer processedChunks;

        /**
         * 진행률 (0-100)
         */
        private Double percentage;

        /**
         * 총 비용 (USD)
         */
        @JsonProperty("totalCostUsd")
        @com.fasterxml.jackson.annotation.JsonAlias({ "total_cost_usd" })
        private BigDecimal totalCostUsd;

        /**
         * 총 토큰 수
         */
        @JsonProperty("totalTokens")
        @com.fasterxml.jackson.annotation.JsonAlias({ "total_tokens" })
        private Integer totalTokens;

        /**
         * 분석 시작 시각
         */
        @JsonProperty("startedAt")
        @com.fasterxml.jackson.annotation.JsonAlias({ "started_at" })
        private LocalDateTime startedAt;

        /**
         * 분석 완료 시각
         */
        @JsonProperty("completedAt")
        @com.fasterxml.jackson.annotation.JsonAlias({ "completed_at" })
        private LocalDateTime completedAt;

        /**
         * 일시정지 시각
         */
        @JsonProperty("pausedAt")
        @com.fasterxml.jackson.annotation.JsonAlias({ "paused_at" })
        private LocalDateTime pausedAt;

        /**
         * 에러 메시지
         */
        @JsonProperty("errorMessage")
        @com.fasterxml.jackson.annotation.JsonAlias({ "error_message" })
        private String errorMessage;
    }
}
