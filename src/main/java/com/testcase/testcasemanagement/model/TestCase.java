// src/main/java/com/testcase/testcasemanagement/model/TestCase.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "testcases",
    // uniqueConstraints 제거 - 스프레드시트 일괄 수정 시 순서 문제로 충돌 발생
    // 같은 폴더에 같은 이름 허용, displayOrder 중복 허용
    indexes = {
      // ICT-130: 대시보드 API 성능 최적화를 위한 인덱스
      @Index(name = "idx_testcase_project_id", columnList = "project_id"),
      @Index(name = "idx_testcase_parent_id", columnList = "parent_id"),
      @Index(name = "idx_testcase_type", columnList = "type"),
      @Index(name = "idx_testcase_priority", columnList = "priority"),
      @Index(name = "idx_testcase_project_priority", columnList = "project_id, priority"),
      // ICT-339: 순차 ID 성능 최적화를 위한 인덱스
      @Index(name = "idx_testcase_sequential_id", columnList = "sequential_id"),
      @Index(name = "idx_testcase_project_sequential", columnList = "project_id, sequential_id")
    })
public class TestCase {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "project_id")
  @JsonBackReference("project-testcases")
  private Project project;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String name;

  /** "testcase", "folder", "systemFolder" 중 하나 */
  @Column(columnDefinition = "TEXT")
  private String type;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(columnDefinition = "TEXT")
  private String preCondition;

  @Column(columnDefinition = "TEXT", name = "post_condition")
  private String postCondition;

  @Column(name = "is_automated")
  private Boolean isAutomated = Boolean.FALSE;

  @Column(name = "execution_type", length = 50)
  private String executionType = "Manual";

  @Column(columnDefinition = "TEXT", name = "test_technique")
  private String testTechnique;

  @Column(name = "parent_id")
  private String parentId;

  @ElementCollection
  @CollectionTable(name = "testcasesteps", joinColumns = @JoinColumn(name = "testcase_id"))
  @OrderColumn(name = "step_order")
  private List<TestStep> steps;

  @Column(columnDefinition = "TEXT", name = "expected_results")
  private String expectedResults;

  @Column(name = "display_order", nullable = false)
  private Integer displayOrder = 1;

  // ICT-130: 대시보드 통계를 위한 우선순위 필드 추가
  @Column(name = "priority")
  private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW

  // ICT-339: 사용자 식별 가능한 순차 ID 추가
  @Column(name = "sequential_id")
  private Integer sequentialId;

  // ICT-341: 프로젝트코드-넘버 형식의 표시 ID 추가
  @Column(name = "display_id", length = 50)
  private String displayId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // 작성자 정보
  @Column(name = "created_by", length = 100)
  private String createdBy;

  // 수정자 정보
  @Column(name = "updated_by", length = 100)
  private String updatedBy;

  @Version private Long version;

  @org.hibernate.annotations.BatchSize(size = 100)
  @ElementCollection
  @CollectionTable(name = "testcase_tags", joinColumns = @JoinColumn(name = "testcase_id"))
  @Column(name = "tag", length = 100)
  private List<String> tags;

  // 연결된 RAG 문서 ID 목록
  @org.hibernate.annotations.BatchSize(size = 100)
  @ElementCollection
  @CollectionTable(
      name = "testcase_linked_documents",
      joinColumns = @JoinColumn(name = "testcase_id"))
  @Column(name = "document_id", length = 36)
  private List<String> linkedDocumentIds;

  // 연결된 (수동) 테스트케이스 ID 목록 — 자동화 케이스와 원본 수동 TC 간 상호 링크
  @org.hibernate.annotations.BatchSize(size = 100)
  @ElementCollection
  @CollectionTable(
      name = "testcase_linked_test_cases",
      joinColumns = @JoinColumn(name = "testcase_id"))
  @Column(name = "linked_test_case_id", length = 36)
  private List<String> linkedTestCaseIds;

  // 연결된 JUnit 자동화 케이스 ID 목록 — 이 TC를 자동화한 실제 JUnit 테스트 케이스.
  // 주의: 저장하는 값은 JunitTestCase.id(업로드마다 새로 발급되는 UUID PK)다.
  // 동일 XML을 재업로드하면 새 JunitTestCase row(새 UUID)가 생성되어 여기 저장된 링크는
  // 조회 실패(dangling)가 된다 → 재업로드 후에는 자동화 케이스를 다시 연결해야 한다.
  // (논리키 className.name 저장으로 내구성을 높이는 방안은 후속 과제로 보류됨)
  @org.hibernate.annotations.BatchSize(size = 100)
  @ElementCollection
  @CollectionTable(
      name = "testcase_linked_junit_cases",
      joinColumns = @JoinColumn(name = "testcase_id"))
  @Column(name = "junit_test_case_id", length = 36)
  private List<String> linkedJunitTestCaseIds;

  @PrePersist
  protected void onCreate() {
    if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
    // displayOrder가 null이면 0이 아니라 1로 초기화
    if (this.displayOrder == null) this.displayOrder = 1;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  @Override
  public String toString() {
    return "TestCase{"
        + "id='"
        + id
        + '\''
        + ", name='"
        + name
        + '\''
        + ", project="
        + (project != null ? project.getId() : null)
        + '}';
  }
}
