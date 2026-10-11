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

/**
 * 요구사항 문서(TestLink 의 Requirement Specification). 프로젝트 안에서 n단 트리를 이루며 요구사항을 묶는다.
 *
 * <p>트리는 테스트케이스와 같은 방식(parentId 문자열)으로 표현한다. 최상위 문서는 parentId 가 null 이다.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
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

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Column(name = "parent_id", columnDefinition = "VARCHAR(36)")
  private String parentId;

  /** 사람이 붙이는 문서 식별자(예: SRS-01). 프로젝트 안에서 유일하다. */
  @Column(name = "doc_id", nullable = false, length = 64)
  private String docId;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String scope;

  @Column(name = "display_order")
  private Integer displayOrder = 1;

  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

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
