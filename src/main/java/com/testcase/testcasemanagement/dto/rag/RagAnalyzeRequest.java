package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * RAG API 문서 분석 요청 DTO
 *
 * POST /api/v1/documents/{documentId}/analyze 엔드포인트 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagAnalyzeRequest {

    /**
     * 분석할 문서 ID
     */
    @NotNull(message = "문서 ID는 필수입니다")
    @JsonProperty("document_id")
    private UUID documentId;
}
