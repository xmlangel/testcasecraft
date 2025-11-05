package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * RAG 채팅 응답 DTO
 *
 * LLM의 응답과 관련 문서 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatResponse {

    /**
     * LLM 응답 내용 (프론트엔드: answer, 백엔드: message)
     */
    @JsonProperty("answer")
    @JsonAlias({"message", "answer"})
    private String answer;

    /**
     * 참조한 문서 정보 리스트 (프론트엔드: documents, 백엔드: contextSources)
     */
    @JsonProperty("documents")
    @JsonAlias({"contextSources", "documents"})
    private List<Map<String, Object>> documents;

    /**
     * 평균 유사도 점수 (선택사항)
     */
    @JsonProperty("similarity")
    private Double similarity;

    /**
     * 응답 생성에 사용된 토큰 수 (선택사항)
     */
    @JsonProperty("tokensUsed")
    @JsonAlias({"tokens_used", "tokensUsed"})
    private Integer tokensUsed;

    /**
     * 응답 생성 시간 (ms, 선택사항)
     */
    @JsonProperty("responseTime")
    @JsonAlias({"response_time_ms", "responseTimeMs", "responseTime"})
    private Long responseTime;

    /**
     * 사용된 LLM 제공자 (선택사항)
     */
    @JsonProperty("llmProvider")
    @JsonAlias({"llm_provider", "llmProvider"})
    private String llmProvider;

    /**
     * 사용된 모델 이름 (선택사항)
     */
    @JsonProperty("modelName")
    @JsonAlias({"model_name", "modelName"})
    private String modelName;

    /**
     * 컨텍스트 개수 (선택사항)
     */
    @JsonProperty("contextCount")
    @JsonAlias({"context_count", "contextCount"})
    private Integer contextCount;

    /**
     * 응답 생성 시간 (선택사항)
     */
    @JsonProperty("generatedAt")
    @JsonAlias({"generated_at", "generatedAt"})
    private LocalDateTime generatedAt;

    /**
     * 에러 여부 (선택사항)
     */
    @JsonProperty("error")
    private Boolean error;

    /**
     * 에러 메시지 (선택사항)
     */
    @JsonProperty("errorMessage")
    @JsonAlias({"error_message", "errorMessage"})
    private String errorMessage;

    /**
     * 저장된 채팅 스레드 ID (선택사항)
     */
    @JsonProperty("threadId")
    @JsonAlias({"thread_id", "threadId"})
    private String threadId;

    /**
     * 방금 저장된 사용자 메시지 ID (선택사항)
     */
    @JsonProperty("userMessageId")
    @JsonAlias({"user_message_id", "userMessageId"})
    private String userMessageId;

    /**
     * 방금 저장된 어시스턴트 메시지 ID (선택사항)
     */
    @JsonProperty("assistantMessageId")
    @JsonAlias({"assistant_message_id", "assistantMessageId"})
    private String assistantMessageId;

    /**
     * 스레드에 연결된 카테고리 ID 목록 (선택사항)
     */
    @JsonProperty("categoryIds")
    @JsonAlias({"category_ids", "categoryIds"})
    private List<String> categoryIds;

    /**
     * RagChatContext 리스트를 Map 리스트로 변환하는 헬퍼 메서드
     */
    public static List<Map<String, Object>> contextsToDocuments(List<RagChatContext> contexts) {
        if (contexts == null) {
            return null;
        }

        return contexts.stream()
                .map(context -> {
                    Map<String, Object> document = new HashMap<>();
                    document.put("id", context.getId());
                    document.put("fileName", context.getFileName());
                    document.put("title", context.getTitle() != null ? context.getTitle() : context.getFileName());
                    document.put("chunkText", context.getChunkText());
                    document.put("similarity", context.getSimilarity());
                    document.put("chunkIndex", context.getChunkIndex());
                    if (context.getMetadata() != null && !context.getMetadata().isEmpty()) {
                        document.put("metadata", context.getMetadata());
                    }
                    return document;
                })
                .collect(Collectors.toList());
    }
}
