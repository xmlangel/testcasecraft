package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * RAG 채팅 메시지 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatMessageDTO {

    @JsonProperty("id")
    private String id;

    @JsonProperty("threadId")
    private String threadId;

    @JsonProperty("role")
    private String role;

    @JsonProperty("content")
    private String content;

    @JsonProperty("parentMessageId")
    private String parentMessageId;

    @JsonProperty("documents")
    private List<Map<String, Object>> documents;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    @JsonProperty("llmProvider")
    private String llmProvider;

    @JsonProperty("llmModel")
    private String llmModel;

    @JsonProperty("tokensUsed")
    private Integer tokensUsed;

    @JsonProperty("temperature")
    private Double temperature;

    @JsonProperty("embeddingMessageId")
    private String embeddingMessageId;

    @JsonProperty("embeddingStatus")
    private String embeddingStatus;

    @JsonProperty("createdBy")
    private String createdBy;

    @JsonProperty("updatedBy")
    private String updatedBy;

    @JsonProperty("editedBy")
    private String editedBy;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("editedAt")
    private LocalDateTime editedAt;

    @JsonProperty("errorMessage")
    private String errorMessage;
}
