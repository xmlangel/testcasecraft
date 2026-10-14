package com.testcase.testcasemanagement.model.rag;

import com.testcase.testcasemanagement.model.Project;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

/**
 * RAG 채팅 쓰레드 분류 엔티티
 *
 * <p>프로젝트별로 생성되는 카테고리로 대화를 분류한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Comment("RAG 채팅 카테고리: 프로젝트 안에서 RAG 채팅 스레드를 분류하는 이름표")
@Table(
    name = "rag_chat_categories",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_rag_chat_category_project_name",
          columnNames = {"project_id", "name"})
    },
    indexes = {@Index(name = "idx_rag_chat_category_project", columnList = "project_id")})
public class RagChatCategory {

  @Comment("식별자: 카테고리를 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트: 이 카테고리가 속한 프로젝트 (값 영역: projects.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("카테고리 명: 사용자가 붙이는 카테고리의 이름, 프로젝트 내 유일 (값 영역: 100자 이하)")
  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Comment("색상: UI에서 카테고리를 표시할 때 사용하는 색상 코드 (값 영역: 20자 이하, 예: #FF0000)")
  @Column(name = "color", length = 20)
  private String color;

  @Comment("설명: 이 카테고리의 목적과 용도를 설명하는 텍스트")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("생성자: 이 행을 처음 저장한 사용자")
  @Column(name = "created_by", length = 100, nullable = false)
  private String createdBy;

  @PrePersist
  public void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
