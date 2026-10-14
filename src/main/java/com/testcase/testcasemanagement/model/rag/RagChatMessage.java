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
@Comment("RAG 채팅 메시지: RAG 채팅 스레드 안에서 사용자와 AI 가 주고받은 메시지 한 건 | RAG Chat Message: single message exchanged between the user and the AI within a RAG chat thread")
@Table(
    name = "rag_chat_messages",
    indexes = {
      @Index(name = "idx_rag_chat_message_thread", columnList = "thread_id"),
      @Index(name = "idx_rag_chat_message_role", columnList = "role"),
      @Index(name = "idx_rag_chat_message_created_at", columnList = "created_at")
    })
public class RagChatMessage {

  @Comment("메시지 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Message Identifier: value that uniquely identifies this row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("채팅 스레드 식별자: 이 메시지가 속한 채팅 스레드 (값 영역: rag_chat_threads.id 참조) | Chat Thread Identifier: chat thread this message belongs to (Value domain: references rag_chat_threads.id)")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "thread_id", nullable = false)
  private RagChatThread thread;

  @Comment("메시지 역할: 이 메시지의 발신자 역할 | Message Role: role of the sender of this message")
  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private RagChatMessageRole role;

  @Comment("메시지 내용: 사용자 질문 또는 LLM 응답 | Message Text: user question or LLM response")
  @Column(name = "content", columnDefinition = "TEXT", nullable = false)
  private String content;

  @Comment("부모 메시지 식별자: 이 메시지가 응답하는 상위 메시지 (값 영역: rag_chat_messages.id 참조) | Parent Message Identifier: parent message to which this message responds (Value domain: references rag_chat_messages.id)")
  @Column(name = "parent_message_id", columnDefinition = "VARCHAR(36)")
  private String parentMessageId;

  @Comment("문맥 스냅샷: 이 메시지 생성 시 사용된 RAG 문맥 | Context Snapshot: RAG context used when this message was generated")
  @Column(name = "context_snapshot", columnDefinition = "TEXT")
  private String contextSnapshot;

  @Comment("메타데이터: JSON 형식으로 저장된 추가 메타데이터 | Metadata: additional metadata stored in JSON format")
  @Column(name = "metadata_json", columnDefinition = "TEXT")
  private String metadataJson;

  @Comment("LLM 제공자: 이 메시지를 생성한 LLM 제공자 이름 | LLM Provider: name of the LLM provider that generated this message")
  @Column(name = "llm_provider", length = 50)
  private String llmProvider;

  @Comment("LLM 모델: 이 메시지를 생성한 LLM 모델명 | LLM Model: name of the LLM model that generated this message")
  @Column(name = "llm_model", length = 100)
  private String llmModel;

  @Comment("사용 토큰: 이 메시지 생성에 소비된 토큰 수 | Used Token Count: number of tokens consumed to generate this message")
  @Column(name = "tokens_used")
  private Integer tokensUsed;

  @Comment("온도 파라미터: LLM 생성 시 사용한 온도 값 | Temperature Parameter: temperature value used for LLM generation")
  @Column(name = "temperature")
  private Double temperature;

  @Comment("임베딩 메시지 식별자: 이 메시지를 RAG 서비스에 색인 요청할 때 보낸 메시지 식별자 (값 영역: UUID 문자열) | Embedding Message Identifier: message identifier sent when requesting the RAG service to index this message (Value domain: UUID string)")
  @Column(name = "embedding_message_id", length = 36)
  private String embeddingMessageId;

  @Comment("임베딩 상태 코드: 이 메시지를 RAG 서비스에 색인 요청한 결과 (값 영역: RAG 서비스가 돌려준 상태 값, 응답이 없으면 queued, 요청 실패 시 failed) | Embedding Status Code: result of requesting the RAG service to index this message (Value domain: status value returned by the RAG service, queued if there is no response, failed if the request failed)")
  @Column(name = "embedding_status", length = 30)
  private String embeddingStatus;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("편집 일시: 이 메시지가 마지막으로 편집된 일시 | Edited Date Time: date and time this message was last edited")
  @Column(name = "edited_at")
  private LocalDateTime editedAt;

  @Comment("생성자: 이 메시지를 생성한 사용자명 | Creator: username of the user who created this message")
  @Column(name = "created_by", length = 100, nullable = false)
  private String createdBy;

  @Comment("수정자: 이 메시지를 마지막으로 수정한 사용자명 | Updater: username of the user who last modified this message")
  @Column(name = "updated_by", length = 100)
  private String updatedBy;

  @Comment("편집자: 이 메시지를 마지막으로 편집한 사용자명 | Editor Name: username of the user who last edited this message")
  @Column(name = "edited_by", length = 100)
  private String editedBy;

  @Comment("색인 오류 메시지: 이 메시지를 RAG 서비스에 색인 요청하다 실패했을 때 받은 예외 메시지 | Indexing Error Message Text: exception message received when a request to index this message in the RAG service failed")
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
