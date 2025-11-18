package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * RAG 문서 이동 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagDocumentMoveRequest {

    @JsonProperty("target_project_id")
    private UUID targetProjectId;

    @JsonProperty("requested_by")
    private String requestedBy;

    private String reason;
}
