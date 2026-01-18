package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * RAG 채팅 요청 DTO
 *
 * LLM과의 질의응답을 위한 요청 데이터
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatRequest {

    /**
     * 프로젝트 ID (UUID)
     */
    @NotNull(message = "프로젝트 ID는 필수입니다.")
    @JsonProperty("projectId")
    private UUID projectId;

    /**
     * 사용자 메시지
     */
    @NotBlank(message = "메시지는 필수입니다.")
    @JsonProperty("message")
    private String message;

    /**
     * LLM 제공자 (선택사항, 기본값 사용)
     */
    @JsonProperty("provider")
    private String provider;

    /**
     * LLM 모델 (선택사항, 기본값 사용)
     */
    @JsonProperty("model")
    private String model;

    /**
     * Temperature 설정 (선택사항, 0.0 ~ 1.0)
     */
    @JsonProperty("temperature")
    private Double temperature;

    /**
     * 최대 토큰 수 (선택사항)
     */
    @JsonProperty("maxTokens")
    @JsonAlias("max_tokens")
    private Integer maxTokens;

    /**
     * 검색할 문서 개수 (선택사항, 기본값: 5)
     */
    @JsonProperty("topK")
    @JsonAlias("top_k")
    private Integer topK;

    /**
     * 유사도 임계값 (선택사항, 0.0 ~ 1.0)
     */
    @JsonProperty("similarityThreshold")
    @JsonAlias("similarity_threshold")
    private Double similarityThreshold;

    /**
     * 대화 히스토리 (선택사항)
     */
    @JsonProperty("conversationHistory")
    @JsonAlias("conversation_history")
    private java.util.List<RagChatMessage> conversationHistory;

    /**
     * RAG 검색 설정 - 최대 검색 결과 수 (기본값: 5)
     */
    @JsonProperty("maxContextResults")
    @JsonAlias({"max_context_results", "maxContextResults"})
    @Builder.Default
    private Integer maxContextResults = 5;

    /**
     * LLM Config ID (선택사항, null이면 기본 설정 사용)
     */
    @JsonProperty("llmConfigId")
    @JsonAlias({"llm_config_id", "llmConfigId"})
    private String llmConfigId;

    /**
     * 저장할 채팅 스레드 ID (선택사항)
     */
    @JsonProperty("threadId")
    @JsonAlias({"thread_id", "threadId"})
    private String threadId;

    /**
     * 새 스레드 생성 시 사용할 제목 (선택사항)
     */
    @JsonProperty("threadTitle")
    @JsonAlias({"thread_title", "threadTitle"})
    private String threadTitle;

    /**
     * 스레드에 연결할 카테고리 ID 목록 (선택사항)
     */
    @JsonProperty("categoryIds")
    @JsonAlias({"category_ids", "categoryIds"})
    private List<String> categoryIds;

    /**
     * 대화 내역을 영속화할지 여부 (기본값: true)
     */
    @JsonProperty("persistConversation")
    @JsonAlias({"persist_conversation", "persistConversation"})
    @Builder.Default
    private Boolean persistConversation = Boolean.TRUE;

    /**
     * RAG 문서 검색을 사용할지 여부 (기본값: true)
     * true: RAG 문서 검색 후 LLM 질의
     * false: RAG 검색 없이 순수 LLM 대화
     */
    @JsonProperty("useRagSearch")
    @JsonAlias({"use_rag_search", "useRagSearch"})
    @Builder.Default
    private Boolean useRagSearch = Boolean.TRUE;
}
