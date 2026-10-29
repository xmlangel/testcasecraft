// src/main/java/com/testcase/testcasemanagement/model/JunitTestCase.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** ICT-203: JUnit XML 개별 테스트 케이스 엔티티 JUnit XML의 <testcase> 요소에 해당 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("JUnit 테스트 케이스: JUnit XML 에서 읽은 테스트 메서드 하나의 실행 결과")
@Table(
    name = "junit_test_cases",
    indexes = {
      @Index(name = "idx_junit_case_suite", columnList = "junitTestSuiteId"),
      @Index(name = "idx_junit_case_name", columnList = "name"),
      @Index(name = "idx_junit_case_status", columnList = "junitTestSuiteId, status"),
      @Index(name = "idx_junit_case_classname", columnList = "className")
    })
public class JunitTestCase {

  @Comment("JUnit 테스트 케이스 식별자: 이 테스트 케이스를 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  /** 상위 테스트 스위트 */
  @Comment(
      value =
          "JUnit 테스트 스위트 식별자: 이 테스트 케이스가 속한 스위트를 가리키는 값 (값 영역: junit_test_suites.id 참조, UUID 36자)",
      on = "junit_test_suite_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "junit_test_suite_id", nullable = false)
  @JsonBackReference
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private JunitTestSuite junitTestSuite;

  /** 테스트 메소드 이름 */
  @Comment("테스트 메서드 명: JUnit XML에서 정의된 테스트 메서드의 이름")
  @Column(nullable = false, length = 255)
  private String name;

  /** 클래스명 (풀패키지명 포함) */
  @Comment("클래스 명: 테스트 메서드가 속한 클래스의 정규화된 이름(패키지 포함)")
  @Column(nullable = false, length = 500)
  private String className;

  /** 실행 시간 (초) */
  @Comment("테스트 실행 시간: 이 테스트 케이스가 실행되는 데 걸린 시간 (값 영역: 초, 소수점 2자리)")
  @Column(nullable = false)
  private Double time = 0.0;

  /** 테스트 상태 (PASSED, FAILED, ERROR, SKIPPED) */
  @Comment("테스트 상태 코드: JUnit XML에서 파싱한 테스트 실행 결과 (값 영역: PASSED, FAILED, ERROR, SKIPPED)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private JunitTestStatus status = JunitTestStatus.PASSED;

  /** 실패/에러 메시지 */
  @Comment("실패/에러 메시지: 테스트가 실패하거나 에러가 발생했을 때의 메시지 내용")
  @Column(columnDefinition = "TEXT")
  private String failureMessage;

  /** 실패/에러 타입 */
  @Comment("실패/에러 유형: 예외의 클래스명 또는 실패 유형")
  @Column(length = 255)
  private String failureType;

  /** 스택 트레이스 */
  @Comment("스택 트레이스: 실패/에러 발생 시의 스택 추적 정보")
  @Column(columnDefinition = "TEXT")
  private String stackTrace;

  /** 스킵 메시지 */
  @Comment("스킵 메시지: 테스트가 스킵되었을 때의 사유 메시지")
  @Column(columnDefinition = "TEXT")
  private String skipMessage;

  /** 시스템 아웃 로그 */
  @Comment("표준 출력 로그: 테스트 실행 중 표준 출력 스트림에 기록된 내용")
  @Column(columnDefinition = "TEXT")
  private String systemOut;

  /** 시스템 에러 로그 */
  @Comment("표준 에러 로그: 테스트 실행 중 표준 에러 스트림에 기록된 내용")
  @Column(columnDefinition = "TEXT")
  private String systemErr;

  /** 기대 결과 (상위 수준) */
  @Comment("기대 결과: 테스트에서 예상되는 결과를 사용자가 정의한 내용")
  @Column(columnDefinition = "TEXT")
  private String expectedResult;

  /** 실제 결과 (상위 수준) */
  @Comment("실제 결과: 테스트 실행 후 실제로 나타난 결과를 사용자가 기록한 내용")
  @Column(columnDefinition = "TEXT")
  private String actualResult;

  /** 단계별 테스트 결과 (JSON 형식) */
  @Comment("테스트 단계: 테스트의 각 단계별 수행 결과를 JSON 형식으로 저장한 내용")
  @Column(columnDefinition = "TEXT")
  private String testSteps;

  /** 사용자가 편집한 제목 */
  @Comment("사용자 정의 제목: 사용자가 입력하거나 수정한 테스트 케이스의 제목")
  @Column(length = 500)
  private String userTitle;

  /** 사용자가 편집한 설명 */
  @Comment("사용자 정의 설명: 사용자가 입력하거나 수정한 테스트 케이스의 상세 설명")
  @Column(columnDefinition = "TEXT")
  private String userDescription;

  /** 사용자가 편집한 메모 */
  @Comment("사용자 정의 메모: 사용자가 작성한 추가 노트 또는 의견")
  @Column(columnDefinition = "TEXT")
  private String userNotes;

  /** 태그 (콤마로 구분) */
  @Comment("태그 목록: 테스트 케이스를 분류하는 태그들을 쉼표로 구분하여 저장한 값")
  @Column(length = 500)
  private String tags;

  /** 우선순위 (사용자 설정) */
  @Comment("우선순위 코드: 사용자가 지정한 테스트 케이스의 우선순위")
  @Column(length = 20)
  private String priority;

  /** 사용자가 변경한 상태 */
  @Comment("사용자 정의 상태: 사용자가 원본 상태를 덮어쓰기 위해 입력한 상태 (값 영역: PASSED, FAILED, ERROR, SKIPPED)")
  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private JunitTestStatus userStatus;

  /** 첨부파일 경로들 (JSON 배열 형태로 저장) */
  @Comment("첨부 파일 목록: 테스트 케이스와 함께 첨부된 파일 경로를 JSON 배열로 저장한 값")
  @Column(columnDefinition = "TEXT")
  private String attachments;

  /** 추가 속성 정보 (JSON 형식) */
  @Comment("추가 속성: JUnit XML에서 정의된 기타 속성 정보를 JSON 형식으로 저장한 값")
  @Column(columnDefinition = "TEXT")
  private String properties;

  /** 최종 수정 시간 */
  @Comment("최종 수정 일시: 이 테스트 케이스 정보가 마지막으로 변경된 일시")
  private LocalDateTime lastModifiedAt;

  /** 최종 수정자 */
  @Comment(
      value = "최종 수정자 식별자: 이 테스트 케이스를 마지막으로 수정한 사용자를 가리키는 값 (값 영역: users.id 참조, UUID 36자)",
      on = "last_modified_by")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "last_modified_by")
  private User lastModifiedBy;

  @PreUpdate
  protected void onUpdate() {
    lastModifiedAt = LocalDateTime.now();
  }

  /** 실제 표시할 제목 반환 (사용자 편집 제목이 있으면 그것을, 없으면 원본 이름) */
  public String getDisplayTitle() {
    return userTitle != null && !userTitle.trim().isEmpty() ? userTitle : name;
  }

  /** 실제 표시할 상태 반환 (사용자가 변경한 상태가 있으면 그것을, 없으면 원본 상태) */
  public JunitTestStatus getDisplayStatus() {
    return userStatus != null ? userStatus : status;
  }

  /** 사용자가 편집한 내용이 있는지 확인 */
  public boolean hasUserEdits() {
    return (userTitle != null && !userTitle.trim().isEmpty())
        || (userDescription != null && !userDescription.trim().isEmpty())
        || (userNotes != null && !userNotes.trim().isEmpty())
        || (userStatus != null)
        || (tags != null && !tags.trim().isEmpty())
        || (priority != null && !priority.trim().isEmpty());
  }

  /** 테스트가 성공했는지 확인 */
  public boolean isSuccess() {
    return getDisplayStatus() == JunitTestStatus.PASSED;
  }

  /** 테스트가 실패했는지 확인 */
  public boolean isFailure() {
    JunitTestStatus displayStatus = getDisplayStatus();
    return displayStatus == JunitTestStatus.FAILED || displayStatus == JunitTestStatus.ERROR;
  }

  /** 테스트가 스킵되었는지 확인 */
  public boolean isSkipped() {
    return getDisplayStatus() == JunitTestStatus.SKIPPED;
  }
}
