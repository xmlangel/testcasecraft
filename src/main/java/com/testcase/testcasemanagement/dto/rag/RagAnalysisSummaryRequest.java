package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

/**
 * 분석 요약 생성/수정 요청 DTO
 *
 * FastAPI 분석 요약 CRUD API 요청
 * 사용자가 분석 결과를 정리하여 저장
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagAnalysisSummaryRequest {

    /**
     * 문서 ID
     * FastAPI: document_id
     */
    @JsonProperty("document_id")
    private UUID documentId;

    /**
     * 작업 ID (선택)
     * FastAPI: job_id
     */
    @JsonProperty("job_id")
    private UUID jobId;

    /**
     * 요약 제목
     * FastAPI: title
     */
    @NotBlank(message = "요약 제목은 필수입니다")
    private String title;

    /**
     * 요약 내용
     * FastAPI: summary_content
     */
    @NotBlank(message = "요약 내용은 필수입니다")
    @JsonProperty("summary_content")
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
    @JsonProperty("is_public")
    @Builder.Default
    private Boolean isPublic = false;
}
