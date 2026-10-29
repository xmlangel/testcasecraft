// src/main/java/com/testcase/testcasemanagement/model/TestExecution.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 실행: 테스트 플랜을 기준으로 테스트 케이스를 수행하는 한 회차")
@Table(
    name = "test_executions",
    indexes = {
      // ICT-130: 대시보드 API 성능 최적화를 위한 인덱스
      @Index(name = "idx_test_execution_status", columnList = "status"),
      @Index(name = "idx_test_execution_project_status", columnList = "project_id, status"),
      @Index(name = "idx_test_execution_start_date", columnList = "startDate"),
      @Index(name = "idx_test_execution_test_plan", columnList = "test_plan_id"),

      // ICT-133: 대시보드 쿼리 성능을 위한 DB 인덱스 최적화
      @Index(
          name = "idx_test_execution_project_status_updated",
          columnList = "project_id, status, updatedAt"),
      @Index(name = "idx_test_execution_status_updated_at", columnList = "status, updatedAt"),
      @Index(
          name = "idx_test_execution_project_testplan_status",
          columnList = "project_id, test_plan_id, status"),

      // 실행 목록은 프로젝트로 걸러 생성 최신순으로 페이지를 넘긴다
      @Index(name = "idx_test_execution_project_created", columnList = "project_id, created_at")
    })
public class TestExecution {
  @Comment("실행 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("실행명: 이 테스트 실행을 구분하는 이름")
  private String name;

  @Comment("테스트 플랜 식별자: 이 실행이 기반한 테스트 플랜 (값 영역: test_plans.id 참조)")
  @Column(name = "test_plan_id")
  private String testPlanId;

  @Comment("프로젝트 식별자: 이 테스트 실행이 속한 프로젝트 (값 영역: projects.id 참조)")
  @ManyToOne(optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("설명: 이 테스트 실행의 목적과 범위에 대한 설명")
  private String description;

  @Comment("상태: 테스트 실행의 진행 상태 (값 영역: NOTSTARTED, INPROGRESS, COMPLETED)")
  private String status; // NOTSTARTED, INPROGRESS, COMPLETED

  @Comment("시작 일시: 이 테스트 실행을 시작한 일시")
  private LocalDateTime startDate;

  @Comment("종료 일시: 이 테스트 실행을 완료한 일시")
  private LocalDateTime endDate;

  @OneToMany(
      mappedBy = "testExecution",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private List<TestResult> results = new ArrayList<>();

  // 태그 목록
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "test_execution_tags",
      joinColumns = @JoinColumn(name = "test_execution_id"))
  @Comment("테스트 실행 태그: 테스트 실행에 붙인 분류 태그")
  @Comment(
      value = "테스트 실행 식별자: 태그가 붙은 테스트 실행 (값 영역: test_executions.id 참조)",
      on = "test_execution_id")
  @Comment(value = "태그: 사용자가 붙인 태그 문자열", on = "tag")
  @Column(name = "tag", length = 100)
  private java.util.Set<String> tags;

  // QA 총평 — 실행 단위 마크다운 코멘트 (내보내기 상단에 표시)
  @Comment("QA 총평: 이 테스트 실행에 대한 QA의 마크다운 코멘트")
  @Column(columnDefinition = "TEXT")
  private String qaSummary;

  @Comment("QA 총평 수정자: QA 총평을 마지막으로 수정한 사용자명")
  private String qaSummaryUpdatedBy;

  @Comment("QA 총평 수정 일시: QA 총평이 마지막으로 변경된 일시")
  private LocalDateTime qaSummaryUpdatedAt;

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시")
  private LocalDateTime updatedAt;
}
