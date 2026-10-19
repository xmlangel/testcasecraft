package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * 요구사항 ↔ 테스트케이스 연결(TestLink 의 req_coverage). 연결한 사람과 시각을 남긴다.
 *
 * <p>테스트케이스 쪽 테이블은 건드리지 않으려고 문자열 ID 로만 참조한다. 테스트케이스가 지워지면 연결이 남을 수 있으므로 조회 쪽에서 존재하는 테스트케이스만 센다.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("요구사항 테스트 케이스 연결: 요구사항을 확인하는 테스트 케이스의 연결")
@Table(
    name = "requirement_test_case_links",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_requirement_test_case_link",
            columnNames = {"requirement_id", "test_case_id"}),
    indexes = {
      @Index(name = "idx_req_tc_link_requirement", columnList = "requirement_id"),
      @Index(name = "idx_req_tc_link_test_case", columnList = "test_case_id")
    })
public class RequirementTestCaseLink {

  @Comment("요구사항 테스트 케이스 연결 식별자: 이 연결 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment(value = "요구사항 식별자: 이 연결의 요구사항 쪽을 가리키는 값 (값 영역: UUID 36자)", on = "requirement_id")
  @Column(name = "requirement_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String requirementId;

  @Comment(value = "테스트 케이스 식별자: 이 연결의 테스트 케이스 쪽을 가리키는 값 (값 영역: UUID 36자)", on = "test_case_id")
  @Column(name = "test_case_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String testCaseId;

  @Comment("생성자: 이 연결을 생성한 사용자를 나타내는 값")
  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시", on = "created_at")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public RequirementTestCaseLink(String requirementId, String testCaseId, String createdBy) {
    this.requirementId = requirementId;
    this.testCaseId = testCaseId;
    this.createdBy = createdBy;
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
