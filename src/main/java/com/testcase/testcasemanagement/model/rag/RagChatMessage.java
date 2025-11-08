package com.testcase.testcasemanagement.model.rag;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * RAG 채팅 메시지 엔티티
 *
 * 사용자 질문 및 LLM 응답을 저장하고 편집 및 임베딩 상태를 추적한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "rag_chat_messages",
        indexes = {
                @Index(name = "idx_rag_chat_message_thread", columnList = "thread_id"),
                @Index(name = "idx_rag_chat_message_role", columnList = "role"),
                @Index(name = "idx_rag_chat_message_created_at", columnList = "created_at")
        }
)
public class RagChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thread_id", nullable = false)
    private RagChatThread thread;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private RagChatMessageRole role;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "parent_message_id", columnDefinition = "VARCHAR(36)")
    private String parentMessageId;

    @Column(name = "context_snapshot", columnDefinition = "TEXT")
    private String contextSnapshot;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "llm_provider", length = 50)
    private String llmProvider;

    @Column(name = "llm_model", length = 100)
    private String llmModel;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "embedding_message_id", length = 36)
    private String embeddingMessageId;

    @Column(name = "embedding_status", length = 30)
    private String embeddingStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "edited_by", length = 100)
    private String editedBy;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void markEdited(String username) {
        this.editedBy = username;
        this.editedAt = LocalDateTime.now();
    }
}
