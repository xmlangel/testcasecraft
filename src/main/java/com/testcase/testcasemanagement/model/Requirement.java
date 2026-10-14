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
import org.hibernate.annotations.Comment;

/**
 * 요구사항. 요구사항 문서 하나에 속하고 테스트케이스와 다대다로 연결된다({@link RequirementTestCaseLink}).
 *
 * <p>상태·유형 값은 TestLink 1.9.20 사용자 매뉴얼 4.2절을 따른다. NOT_TESTABLE 은 커버리지 분석에서 제외한다.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("요구사항: 요구사항 명세 안의 요구사항 항목 하나")
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

  @Comment("식별자: 이 요구사항을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트 식별자: 이 요구사항이 속한 프로젝트 (값 영역: projects.id 참조)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("요구사항 명세 식별자: 이 요구사항이 포함된 명세 문서 (값 영역: requirement_specs.id 참조)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "spec_id", nullable = false)
  private RequirementSpec spec;

  /** 사람이 붙이는 요구사항 식별자(예: REQ-001). 프로젝트 안에서 유일하다. */
  @Comment("문서 식별자: 사람이 부여하는 요구사항 번호, 프로젝트 안에서 유일 (값 영역: 64자 이하, 예: REQ-001)")
  @Column(name = "doc_id", nullable = false, length = 64)
  private String docId;

  @Comment("제목: 요구사항의 한 줄 제목 (값 영역: 200자 이하)")
  @Column(nullable = false, length = 200)
  private String title;

  @Comment("범위: 요구사항의 영향 범위 또는 상세 설명")
  @Column(columnDefinition = "TEXT")
  private String scope;

  @Comment("상태: 요구사항의 현재 생명주기 단계 (값 영역: DRAFT, REVIEW, REWORK, FINISH, IMPLEMENTED, VALID, NOT_TESTABLE, OBSOLETE)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Status status = Status.VALID;

  @Comment("유형: 요구사항의 분류 (값 영역: INFORMATIONAL, FEATURE, USE_CASE, USER_INTERFACE, NON_FUNCTIONAL, CONSTRAINT, SYSTEM_FUNCTION)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Type type = Type.FEATURE;

  /** 이 요구사항을 충분히 검증하려면 몇 개의 테스트케이스가 필요한지. 커버리지 분석의 분모다. */
  @Comment("예상 커버리지: 이 요구사항을 검증하기 위해 필요한 테스트 케이스 개수 (값 영역: 1 이상의 정수)")
  @Column(name = "expected_coverage", nullable = false)
  private Integer expectedCoverage = 1;

  @Comment("표시 순서: 같은 명세 안에서 이 요구사항의 표시 위치 (값 영역: 정수)")
  @Column(name = "display_order")
  private Integer displayOrder = 1;

  @Comment("생성자 명: 이 요구사항을 처음 작성한 사용자의 사용자명 (값 영역: 100자 이하)")
  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Comment("생성 일시: 이 요구사항이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 요구사항이 마지막으로 변경된 일시")
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
