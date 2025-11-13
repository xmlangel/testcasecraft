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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 분석 요약 조회 응답 DTO
 *
 * FastAPI 분석 요약 CRUD API 응답
 * 저장된 요약 정보 반환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagAnalysisSummaryResponse {

    /**
     * 요약 ID
     * FastAPI: id
     */
    private UUID id;

    /**
     * 문서 ID
     * FastAPI: document_id
     */
    @JsonProperty("documentId")
    @com.fasterxml.jackson.annotation.JsonAlias({"document_id"})
    private UUID documentId;

    /**
     * 작업 ID
     * FastAPI: job_id
     */
    @JsonProperty("jobId")
    @com.fasterxml.jackson.annotation.JsonAlias({"job_id"})
    private UUID jobId;

    /**
     * 사용자 ID
     * FastAPI: user_id
     */
    @JsonProperty("userId")
    @com.fasterxml.jackson.annotation.JsonAlias({"user_id"})
    private UUID userId;

    /**
     * 요약 제목
     * FastAPI: title
     */
    private String title;

    /**
     * 요약 내용
     * FastAPI: summary_content
     */
    @JsonProperty("summaryContent")
    @com.fasterxml.jackson.annotation.JsonAlias({"summary_content"})
    private String summaryContent;

    /**
     * 태그 리스트
     * FastAPI: tags
     */
    private List<String> tags;

    /**
     * 공개 여부
     * FastAPI: is_public
     */
    @JsonProperty("isPublic")
    @com.fasterxml.jackson.annotation.JsonAlias({"is_public"})
    private Boolean isPublic;

    /**
     * 생성 시각
     * FastAPI: created_at
     */
    @JsonProperty("createdAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"created_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime createdAt;

    /**
     * 마지막 업데이트 시각
     * FastAPI: updated_at
     */
    @JsonProperty("updatedAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"updated_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime updatedAt;
}
