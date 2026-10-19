package com.testcase.testcasemanagement.model.rag;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

/**
 * RAG 채팅 메시지 엔티티
 *
 * <p>사용자 질문 및 LLM 응답을 저장하고 편집 및 임베딩 상태를 추적한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Comment("RAG 채팅 메시지: RAG 채팅 스레드 안에서 사용자와 AI 가 주고받은 메시지 한 건")
@Table(
    name = "rag_chat_messages",
    indexes = {
      @Index(name = "idx_rag_chat_message_thread", columnList = "thread_id"),
      @Index(name = "idx_rag_chat_message_role", columnList = "role"),
      @Index(name = "idx_rag_chat_message_created_at", columnList = "created_at")
    })
public class RagChatMessage {

  @Comment("메시지 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("채팅 스레드 식별자: 이 메시지가 속한 채팅 스레드 (값 영역: rag_chat_threads.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "thread_id", nullable = false)
  private RagChatThread thread;

  @Comment("메시지 역할: 이 메시지의 발신자 역할 (값 영역: SYSTEM, USER, ASSISTANT)")
  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private RagChatMessageRole role;

  @Comment("메시지 내용: 사용자 질문 또는 LLM 응답")
  @Column(name = "content", columnDefinition = "TEXT", nullable = false)
  private String content;

  @Comment("부모 메시지 식별자: 이 메시지가 응답하는 상위 메시지 (값 영역: rag_chat_messages.id 참조)")
  @Column(name = "parent_message_id", columnDefinition = "VARCHAR(36)")
  private String parentMessageId;

  @Comment("문맥 스냅샷: 이 메시지 생성 시 사용된 RAG 문맥")
  @Column(name = "context_snapshot", columnDefinition = "TEXT")
  private String contextSnapshot;

  @Comment("메타데이터: JSON 형식으로 저장된 추가 메타데이터")
  @Column(name = "metadata_json", columnDefinition = "TEXT")
  private String metadataJson;

  @Comment("LLM 제공자: 이 메시지를 생성한 LLM 제공자 이름")
  @Column(name = "llm_provider", length = 50)
  private String llmProvider;

  @Comment("LLM 모델: 이 메시지를 생성한 LLM 모델명")
  @Column(name = "llm_model", length = 100)
  private String llmModel;

  @Comment("사용 토큰: 이 메시지 생성에 소비된 토큰 수")
  @Column(name = "tokens_used")
  private Integer tokensUsed;

  @Comment("온도 파라미터: LLM 생성 시 사용한 온도 값")
  @Column(name = "temperature")
  private Double temperature;

  @Comment("임베딩 메시지 식별자: 이 메시지를 RAG 서비스에 색인 요청할 때 보낸 메시지 식별자 (값 영역: UUID 문자열)")
  @Column(name = "embedding_message_id", length = 36)
  private String embeddingMessageId;

  @Comment("임베딩 상태 코드: 이 메시지를 RAG 서비스에 색인 요청한 결과 (값 영역: RAG 서비스가 돌려준 상태 값, 응답이 없으면 queued, 요청 실패 시 failed)")
  @Column(name = "embedding_status", length = 30)
  private String embeddingStatus;

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("편집 일시: 이 메시지가 마지막으로 편집된 일시")
  @Column(name = "edited_at")
  private LocalDateTime editedAt;

  @Comment("생성자: 이 메시지를 생성한 사용자명")
  @Column(name = "created_by", length = 100, nullable = false)
  private String createdBy;

  @Comment("수정자: 이 메시지를 마지막으로 수정한 사용자명")
  @Column(name = "updated_by", length = 100)
  private String updatedBy;

  @Comment("편집자: 이 메시지를 마지막으로 편집한 사용자명")
  @Column(name = "edited_by", length = 100)
  private String editedBy;

  @Comment("색인 오류 메시지: 이 메시지를 RAG 서비스에 색인 요청하다 실패했을 때 받은 예외 메시지")
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
