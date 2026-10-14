// src/main/java/com/testcase/testcasemanagement/model/JunitTestSuite.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** ICT-203: JUnit XML 테스트 스위트 엔티티 JUnit XML의 <testsuite> 요소에 해당 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("JUnit 테스트 스위트: JUnit XML 에서 읽은 테스트 스위트 하나와 그 실행 통계")
@Table(
    name = "junit_test_suites",
    indexes = {
      @Index(name = "idx_junit_suite_result", columnList = "junitTestResultId"),
      @Index(name = "idx_junit_suite_name", columnList = "name"),
      @Index(name = "idx_junit_suite_status", columnList = "junitTestResultId, failures, errors")
    })
public class JunitTestSuite {

  @Comment("JUnit 테스트 스위트 식별자: 이 테스트 스위트를 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  /** 상위 JUnit 테스트 결과 */
  @Comment(value = "JUnit 테스트 결과 식별자: 이 스위트가 포함된 JUnit 테스트 결과를 가리키는 값 (값 영역: junit_test_results.id 참조, UUID 36자)", on = "junit_test_result_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "junit_test_result_id", nullable = false)
  @JsonBackReference
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private JunitTestResult junitTestResult;

  /** 테스트 스위트 이름 */
  @Comment("테스트 스위트 명: JUnit XML에서 정의된 테스트 스위트의 이름")
  @Column(nullable = false, length = 255)
  private String name;

  /** 패키지 이름 */
  @Comment("패키지 명: 테스트 스위트가 속한 패키지의 이름")
  @Column(length = 255)
  private String packageName;

  /** 전체 테스트 수 */
  @Comment("전체 테스트 수: 이 스위트에 포함된 테스트 케이스의 총 개수")
  @Column(nullable = false)
  private Integer tests = 0;

  /** 실패한 테스트 수 */
  @Comment("실패 테스트 수: assertion 실패로 인한 테스트 케이스의 개수")
  @Column(nullable = false)
  private Integer failures = 0;

  /** 에러가 발생한 테스트 수 */
  @Comment("에러 테스트 수: 예외 발생으로 인한 테스트 케이스의 개수")
  @Column(nullable = false)
  private Integer errors = 0;

  /** 스킵된 테스트 수 */
  @Comment("스킵 테스트 수: 실행되지 않은 테스트 케이스의 개수")
  @Column(nullable = false)
  private Integer skipped = 0;

  /** 실행 시간 (초) */
  @Comment("테스트 스위트 실행 시간: 이 스위트의 모든 테스트 케이스가 실행되는 데 걸린 총 시간 (값 영역: 초, 소수점 2자리)")
  @Column(nullable = false)
  private Double time = 0.0;

  /** 타임스탬프 */
  @Comment("테스트 스위트 실행 일시: JUnit XML에서 기록된 테스트 스위트 실행 시각")
  private LocalDateTime timestamp;

  /** 호스트명 */
  @Comment("호스트명: 테스트가 실행된 컴퓨터 또는 빌드 에이전트의 호스트명")
  @Column(length = 100)
  private String hostname;

  /** 시스템 아웃 로그 */
  @Comment("표준 출력 로그: 테스트 스위트 실행 중 표준 출력 스트림에 기록된 내용")
  @Column(columnDefinition = "TEXT")
  private String systemOut;

  /** 시스템 에러 로그 */
  @Comment("표준 에러 로그: 테스트 스위트 실행 중 표준 에러 스트림에 기록된 내용")
  @Column(columnDefinition = "TEXT")
  private String systemErr;

  /** 연관된 테스트 케이스 목록 */
  @OneToMany(mappedBy = "junitTestSuite", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @JsonManagedReference
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private List<JunitTestCase> testCases;

  /** 사용자 편집 가능 메모 */
  @Comment("사용자 정의 메모: 사용자가 작성한 테스트 스위트의 추가 노트 또는 의견")
  @Column(columnDefinition = "TEXT")
  private String userNotes;

  /** 태그 (콤마로 구분) */
  @Comment("태그 목록: 테스트 스위트를 분류하는 태그들을 쉼표로 구분하여 저장한 값")
  @Column(length = 500)
  private String tags;

  /** 최종 수정 시간 */
  @Comment("최종 수정 일시: 이 테스트 스위트 정보가 마지막으로 변경된 일시")
  private LocalDateTime lastModifiedAt;

  @PreUpdate
  protected void onUpdate() {
    lastModifiedAt = LocalDateTime.now();
  }

  /** 성공률 계산 (스킵된 테스트 제외) */
  public Double getSuccessRate() {
    if (tests == 0) return 0.0;
    int successCount = tests - failures - errors - skipped;
    return (double) successCount / tests * 100;
  }

  /** 전체 실패 수 (failures + errors) */
  public Integer getTotalFailures() {
    return failures + errors;
  }

  /** 성공한 테스트 수 */
  public Integer getSuccessCount() {
    return tests - failures - errors;
  }

  /** 스위트 상태 확인 */
  public String getStatus() {
    if (getTotalFailures() > 0) return "FAILED";
    if (skipped > 0 && skipped == tests) return "SKIPPED";
    if (tests > 0) return "PASSED";
    return "UNKNOWN";
  }
}
