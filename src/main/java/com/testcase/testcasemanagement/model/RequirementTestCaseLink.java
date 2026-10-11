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

/**
 * 요구사항 ↔ 테스트케이스 연결(TestLink 의 req_coverage). 연결한 사람과 시각을 남긴다.
 *
 * <p>테스트케이스 쪽 테이블은 건드리지 않으려고 문자열 ID 로만 참조한다. 테스트케이스가 지워지면 연결이 남을 수 있으므로 조회 쪽에서 존재하는 테스트케이스만 센다.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
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

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Column(name = "requirement_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String requirementId;

  @Column(name = "test_case_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String testCaseId;

  @Column(name = "created_by", length = 100)
  private String createdBy;

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
