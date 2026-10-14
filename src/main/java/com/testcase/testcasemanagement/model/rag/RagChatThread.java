package com.testcase.testcasemanagement.model.rag;

import com.testcase.testcasemanagement.model.Project;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.*;
import org.hibernate.annotations.Comment;

/**
 * RAG 기반 LLM 채팅 쓰레드 엔티티
 *
 * <p>프로젝트 단위로 AI 질의응답 대화를 저장하고 관리한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Comment("RAG 채팅 스레드: 프로젝트 문서를 근거로 AI 와 나눈 대화 하나 | RAG Chat Thread: single conversation with the AI grounded in project documents")
@Table(
    name = "rag_chat_threads",
    indexes = {
      @Index(name = "idx_rag_chat_thread_project", columnList = "project_id"),
      @Index(name = "idx_rag_chat_thread_created_at", columnList = "created_at")
    })
public class RagChatThread {

  @Comment("스레드 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Thread Identifier: value that uniquely identifies this row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트 식별자: 이 채팅 스레드가 속한 프로젝트 (값 영역: projects.id 참조) | Project Identifier: project to which this chat thread belongs (Value domain: references projects.id)")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("제목: 이 채팅 스레드의 제목 | Title: title of this chat thread")
  @Column(name = "title", length = 255)
  private String title;

  @Comment("설명: 이 채팅 스레드의 목적에 대한 설명 | Description: description of the purpose of this chat thread")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Comment("보관됨 여부: 이 채팅 스레드를 보관 상태로 표시했는지 여부 (값 영역: true, false) | Archived Indicator: whether this chat thread is marked as archived (Value domain: true, false)")
  @Column(name = "archived", nullable = false)
  @Builder.Default
  private boolean archived = false;

  @Comment("생성자: 이 채팅 스레드를 생성한 사용자명 | Creator: username of the user who created this chat thread")
  @Column(name = "created_by", length = 100, nullable = false)
  private String createdBy;

  @Comment("수정자: 이 채팅 스레드를 마지막으로 수정한 사용자명 | Updater: username of the user who last modified this chat thread")
  @Column(name = "updated_by", length = 100)
  private String updatedBy;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "rag_chat_thread_categories",
      joinColumns = @JoinColumn(name = "thread_id"),
      inverseJoinColumns = @JoinColumn(name = "category_id"),
      indexes = {
        @Index(name = "idx_rag_chat_thr_cat_thread", columnList = "thread_id"),
        @Index(name = "idx_rag_chat_thr_cat_category", columnList = "category_id")
      })
  @Comment("RAG 채팅 스레드 카테고리 연결: RAG 채팅 스레드와 그 스레드에 붙인 카테고리의 연결 | RAG Chat Thread Category Link: link between a RAG chat thread and a category attached to that thread")
  @Comment(value = "RAG 채팅 스레드 식별자: 카테고리를 붙인 RAG 채팅 스레드 (값 영역: rag_chat_threads.id 참조) | RAG Chat Thread Identifier: RAG chat thread to which the category is attached (Value domain: references rag_chat_threads.id)", on = "thread_id")
  @Comment(value = "RAG 채팅 카테고리 식별자: 스레드에 붙인 카테고리 (값 영역: rag_chat_categories.id 참조) | RAG Chat Category Identifier: category attached to the thread (Value domain: references rag_chat_categories.id)", on = "category_id")
  @Builder.Default
  private Set<RagChatCategory> categories = new HashSet<>();

  @OneToMany(
      mappedBy = "thread",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @OrderBy("createdAt ASC")
  @Builder.Default
  private Set<RagChatMessage> messages = new LinkedHashSet<>();

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
}
