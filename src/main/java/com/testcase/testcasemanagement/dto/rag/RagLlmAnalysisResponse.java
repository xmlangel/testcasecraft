package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * LLM 청크 분석 시작 응답 DTO
 *
 * FastAPI LLM 분석 시작 API 응답
 * 분석 작업이 백그라운드에서 시작되었음을 알림
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagLlmAnalysisResponse {

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
     * 분석 상태 ("pending", "processing", "paused", "completed", "failed", "cancelled")
     * FastAPI: status
     */
    private String status;

    /**
     * 전체 청크 수
     * FastAPI: total_chunks
     */
    @JsonProperty("totalChunks")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_chunks"})
    private Integer totalChunks;

    /**
     * 응답 메시지
     * FastAPI: message
     */
    private String message;
}
