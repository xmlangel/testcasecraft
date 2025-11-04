package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * RAG 서비스에 대화 메시지를 임베딩하기 위한 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagConversationMessageIndexRequest {

    @JsonProperty("messageId")
    private UUID messageId;

    @JsonProperty("threadId")
    private UUID threadId;

    @JsonProperty("projectId")
    private UUID projectId;

    @JsonProperty("role")
    private String role;

    @JsonProperty("question")
    private String question;

    @JsonProperty("answer")
    private String answer;

    @JsonProperty("combinedText")
    private String combinedText;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;
}
