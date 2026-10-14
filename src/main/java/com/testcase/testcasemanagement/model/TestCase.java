// src/main/java/com/testcase/testcasemanagement/model/TestCase.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 케이스: 프로젝트 안에서 관리하는 테스트 절차 하나, 또는 테스트 케이스를 묶는 폴더")
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

  @Comment("식별자: 이 테스트 케이스를 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트 식별자: 이 테스트 케이스가 속한 프로젝트 (값 영역: projects.id 참조)")
  @ManyToOne(optional = false)
  @JoinColumn(name = "project_id")
  @JsonBackReference("project-testcases")
  private Project project;

  @Comment("테스트 케이스 명: 사용자가 볼 수 있는 케이스 또는 폴더 이름")
  @Column(columnDefinition = "TEXT", nullable = false)
  private String name;

  /** "testcase", "folder", "systemFolder" 중 하나 */
  @Comment("유형 코드: 트리 상에서 이 행의 역할 (값 영역: testcase, folder, systemFolder)")
  @Column(columnDefinition = "TEXT")
  private String type;

  @Comment("설명: 이 테스트 케이스 또는 폴더에 대한 상세 설명")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment("사전 조건: 이 테스트를 시작하기 전 필요한 상태")
  @Column(columnDefinition = "TEXT")
  private String preCondition;

  @Comment("사후 조건: 이 테스트 완료 후 정리할 상태 또는 복구 작업")
  @Column(columnDefinition = "TEXT", name = "post_condition")
  private String postCondition;

  @Comment("자동화 여부: 이 테스트 케이스가 자동화되었는지 (값 영역: true, false)")
  @Column(name = "is_automated")
  private Boolean isAutomated = Boolean.FALSE;

  @Comment("실행 유형: 테스트 실행 방식 (값 영역: Manual, Automated)")
  @Column(name = "execution_type", length = 50)
  private String executionType = "Manual";

  @Comment("테스트 기법: 이 케이스가 사용하는 테스트 설계 기법")
  @Column(columnDefinition = "TEXT", name = "test_technique")
  private String testTechnique;

  @Comment("상위 폴더 식별자: 이 케이스의 부모 폴더 (값 영역: testcases.id 참조, 비면 루트)")
  @Column(name = "parent_id")
  private String parentId;

  @Comment("테스트 스텝: 테스트 케이스를 수행하는 순서별 단계와 그 단계의 기대 결과")
  @Comment(value = "테스트 케이스 식별자: 각 스텝이 속한 테스트 케이스 (값 영역: testcases.id 참조)", on = "testcase_id")
  @Comment(value = "스텝 설명: 이 스텝에서 수행할 작업 설명", on = "description")
  @Comment(value = "기대 결과: 이 스텝 실행 후 기대하는 결과", on = "expected_result")
  @Comment(value = "스텝 번호: 이 스텝의 순서 (값 영역: 1 이상의 정수)", on = "step_number")
  @Comment(value = "스텝 순서: 테이블 내 스텝의 정렬 위치", on = "step_order")
  @ElementCollection
  @CollectionTable(name = "testcasesteps", joinColumns = @JoinColumn(name = "testcase_id"))
  @OrderColumn(name = "step_order")
  private List<TestStep> steps;

  @Comment("기대 결과: 이 테스트 전체의 최종 기대 결과 (스텝별과 다를 수 있음)")
  @Column(columnDefinition = "TEXT", name = "expected_results")
  private String expectedResults;

  @Comment("표시 순서: 같은 폴더에서 이 케이스의 표시 위치 (값 영역: 정수)")
  @Column(name = "display_order", nullable = false)
  private Integer displayOrder = 1;

  // ICT-130: 대시보드 통계를 위한 우선순위 필드 추가
  @Comment("우선순위 코드: 실행 계획 수립 시 중요도 구분 (값 영역: HIGH, MEDIUM, LOW)")
  @Column(name = "priority")
  private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW

  // ICT-339: 사용자 식별 가능한 순차 ID 추가
  @Comment("순차 식별자: 사용자가 읽을 수 있는 일련번호 (값 영역: 1 이상의 정수)")
  @Column(name = "sequential_id")
  private Integer sequentialId;

  // ICT-341: 프로젝트코드-넘버 형식의 표시 ID 추가
  @Comment("표시 식별자: 프로젝트코드와 순차번호 조합 (값 영역: 50자 이하)")
  @Column(name = "display_id", length = 50)
  private String displayId;

  @Comment("생성 일시: 이 케이스가 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 케이스가 마지막으로 변경된 일시")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // 작성자 정보
  @Comment("생성자 명: 이 케이스를 처음 작성한 사용자의 사용자명 (값 영역: 100자 이하)")
  @Column(name = "created_by", length = 100)
  private String createdBy;

  // 수정자 정보
  @Comment("수정자 명: 이 케이스를 마지막으로 변경한 사용자의 사용자명 (값 영역: 100자 이하)")
  @Column(name = "updated_by", length = 100)
  private String updatedBy;

  @Comment("낙관적 잠금 버전: 동시에 수정한 내용이 서로 덮어쓰지 않도록 저장할 때마다 1씩 늘어나는 번호")
  @Version private Long version;

  @Comment("테스트 케이스 태그: 테스트 케이스에 붙인 분류 태그")
  @Comment(value = "테스트 케이스 식별자: 태그가 붙은 테스트 케이스 (값 영역: testcases.id 참조)", on = "testcase_id")
  @Comment(value = "태그 명: 사용자가 붙인 태그 문자열 (값 영역: 100자 이하)", on = "tag")
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
  @Comment("테스트 케이스 연결 문서: 테스트 케이스에 연결한 RAG 문서")
  @Comment(value = "테스트 케이스 식별자: 문서가 연결된 테스트 케이스 (값 영역: testcases.id 참조)", on = "testcase_id")
  @Comment(value = "문서 식별자: 연결된 RAG 문서의 ID (값 영역: UUID 36자)", on = "document_id")
  @Column(name = "document_id", length = 36)
  private List<String> linkedDocumentIds;

  // 연결된 (수동) 테스트케이스 ID 목록 — 자동화 케이스와 원본 수동 TC 간 상호 링크
  @org.hibernate.annotations.BatchSize(size = 100)
  @ElementCollection
  @CollectionTable(
      name = "testcase_linked_test_cases",
      joinColumns = @JoinColumn(name = "testcase_id"))
  @Comment("테스트 케이스 상호 연결: 자동화 테스트 케이스와 원본 수동 테스트 케이스의 연결")
  @Comment(value = "테스트 케이스 식별자: 이 링크가 있는 테스트 케이스 (값 영역: testcases.id 참조)", on = "testcase_id")
  @Comment(value = "연결된 테스트 케이스 식별자: 링크 대상 테스트 케이스 (값 영역: testcases.id 참조)", on = "linked_test_case_id")
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
  @Comment("테스트 케이스 연결 JUnit 케이스: 수동 테스트 케이스를 자동화한 JUnit 테스트 케이스의 연결")
  @Comment(value = "테스트 케이스 식별자: 이 링크가 있는 테스트 케이스 (값 영역: testcases.id 참조)", on = "testcase_id")
  @Comment(value = "JUnit 자동화 케이스 식별자: 연결된 자동화 테스트 (값 영역: junit_test_cases.id 참조)", on = "junit_test_case_id")
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
