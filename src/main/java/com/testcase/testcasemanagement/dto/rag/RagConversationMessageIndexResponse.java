package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * RAG 대화 메시지 임베딩 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagConversationMessageIndexResponse {

    @JsonProperty("message_id")
    private UUID messageId;

    @JsonProperty("status")
    private String status;
}
