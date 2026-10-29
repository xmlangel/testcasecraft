// src/main/java/com/testcase/testcasemanagement/model/TestPlan.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@Entity
@Comment("테스트 플랜: 함께 실행할 테스트 케이스를 골라 묶은 계획")
@Table(
    name = "test_plans",
    indexes = {
      // 플랜 목록은 늘 프로젝트로 걸러 최신순으로 본다. 인덱스가 없어 전수 스캔이었다.
      @Index(name = "idx_test_plan_project", columnList = "project_id"),
      @Index(name = "idx_test_plan_project_created", columnList = "project_id, created_at")
    })
public class TestPlan {
  @Comment("테스트 플랜 식별자: 이 테스트 플랜을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("테스트 플랜 명: 테스트 플랜의 이름")
  @Column(nullable = false, length = 100)
  private String name;

  @Comment("플랜 설명: 테스트 플랜의 목적과 범위를 설명하는 내용")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment("테스트 플랜 케이스: 테스트 플랜에 포함된 테스트 케이스")
  @Comment(value = "테스트 케이스 식별자: 테스트 플랜에 포함된 테스트 케이스의 ID (값 영역: UUID 36자)", on = "test_case_id")
  @Comment(value = "테스트 플랜 식별자: 테스트 케이스를 포함한 테스트 플랜 (값 영역: test_plans.id 참조)", on = "test_plan_id")
  @ElementCollection
  @CollectionTable(name = "test_plan_cases", joinColumns = @JoinColumn(name = "test_plan_id"))
  @Column(name = "test_case_id")
  private List<String> testCaseIds;

  @Comment(
      value = "프로젝트 식별자: 이 테스트 플랜이 속한 프로젝트를 가리키는 값 (값 영역: projects.id 참조, UUID 36자)",
      on = "project_id")
  @ManyToOne(optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시", on = "created_at")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시", on = "updated_at")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
