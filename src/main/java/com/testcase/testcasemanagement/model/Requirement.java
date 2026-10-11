package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * 요구사항. 요구사항 문서 하나에 속하고 테스트케이스와 다대다로 연결된다({@link RequirementTestCaseLink}).
 *
 * <p>상태·유형 값은 TestLink 1.9.20 사용자 매뉴얼 4.2절을 따른다. NOT_TESTABLE 은 커버리지 분석에서 제외한다.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "requirements",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_requirement_project_doc_id",
            columnNames = {"project_id", "doc_id"}),
    indexes = {
      @Index(name = "idx_requirement_project", columnList = "project_id"),
      @Index(name = "idx_requirement_spec", columnList = "spec_id")
    })
public class Requirement {

  public enum Status {
    DRAFT,
    REVIEW,
    REWORK,
    FINISH,
    IMPLEMENTED,
    VALID,
    NOT_TESTABLE,
    OBSOLETE
  }

  public enum Type {
    INFORMATIONAL,
    FEATURE,
    USE_CASE,
    USER_INTERFACE,
    NON_FUNCTIONAL,
    CONSTRAINT,
    SYSTEM_FUNCTION
  }

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "spec_id", nullable = false)
  private RequirementSpec spec;

  /** 사람이 붙이는 요구사항 식별자(예: REQ-001). 프로젝트 안에서 유일하다. */
  @Column(name = "doc_id", nullable = false, length = 64)
  private String docId;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String scope;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Status status = Status.VALID;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Type type = Type.FEATURE;

  /** 이 요구사항을 충분히 검증하려면 몇 개의 테스트케이스가 필요한지. 커버리지 분석의 분모다. */
  @Column(name = "expected_coverage", nullable = false)
  private Integer expectedCoverage = 1;

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
