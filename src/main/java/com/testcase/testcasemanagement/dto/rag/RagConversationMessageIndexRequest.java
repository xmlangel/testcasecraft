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

    @JsonProperty("message_id")
    private UUID messageId;

    @JsonProperty("thread_id")
    private UUID threadId;

    @JsonProperty("project_id")
    private UUID projectId;

    @JsonProperty("role")
    private String role;

    @JsonProperty("question")
    private String question;

    @JsonProperty("answer")
    private String answer;

    @JsonProperty("combined_text")
    private String combinedText;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;
}
