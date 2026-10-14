package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * 요구사항 문서(TestLink 의 Requirement Specification). 프로젝트 안에서 n단 트리를 이루며 요구사항을 묶는다.
 *
 * <p>트리는 테스트케이스와 같은 방식(parentId 문자열)으로 표현한다. 최상위 문서는 parentId 가 null 이다.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("요구사항 명세: 프로젝트 안에서 요구사항을 계층 구조로 묶는 문서 | Requirement Specification: document that groups requirements into a hierarchy within a project")
@Table(
    name = "requirement_specs",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_requirement_spec_project_doc_id",
            columnNames = {"project_id", "doc_id"}),
    indexes = {
      @Index(name = "idx_requirement_spec_project", columnList = "project_id"),
      @Index(name = "idx_requirement_spec_parent", columnList = "parent_id")
    })
public class RequirementSpec {

  @Comment("식별자: 요구사항 명세를 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a requirement specification (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트: 이 명세가 속한 프로젝트 (값 영역: projects.id 참조) | Project: project to which this specification belongs (Value domain: references projects.id)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("상위 명세 식별자: 트리 구조에서 상위 노드를 가리키는 값, 최상위는 null (값 영역: requirement_specs.id 참조) | Parent Specification Identifier: value that points to the parent node in the tree structure, null at the top level (Value domain: references requirement_specs.id)")
  @Column(name = "parent_id", columnDefinition = "VARCHAR(36)")
  private String parentId;

  /** 사람이 붙이는 문서 식별자(예: SRS-01). 프로젝트 안에서 유일하다. */
  @Comment("문서 식별자: 사용자가 부여한 명세 코드, 프로젝트 내 유일 (값 영역: 64자 이하) | Document Identifier: specification code assigned by the user, unique within the project (Value domain: up to 64 characters)")
  @Column(name = "doc_id", nullable = false, length = 64)
  private String docId;

  @Comment("제목: 명세의 이름 (값 영역: 200자 이하) | Title: name of the specification (Value domain: up to 200 characters)")
  @Column(nullable = false, length = 200)
  private String title;

  @Comment("범위: 이 명세가 다루는 범위와 제약조건 | Scope: scope and constraints covered by this specification")
  @Column(columnDefinition = "TEXT")
  private String scope;

  @Comment("표시 순서: 같은 레벨 명세들의 정렬 순서 (값 영역: 1 이상) | Display Order: sort order among specifications at the same level (Value domain: 1 or greater)")
  @Column(name = "display_order")
  private Integer displayOrder = 1;

  @Comment("생성자: 이 행을 처음 저장한 사용자 | Creator: user who first saved this row")
  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
