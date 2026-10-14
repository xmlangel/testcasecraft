// src/main/java/com/testcase/testcasemanagement/model/JunitTestResult.java

package com.testcase.testcasemanagement.model;

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

/** ICT-203: JUnit XML 테스트 결과 파일의 최상위 엔티티 JUnit XML에서 파싱된 전체 테스트 실행 결과를 저장 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("JUnit 테스트 결과: 업로드한 JUnit XML 파일 하나에서 읽은 전체 테스트 실행 결과 | JUnit Test Result: entire test execution result read from one uploaded JUnit XML file")
@Table(
    name = "junit_test_results",
    indexes = {
      @Index(name = "idx_junit_result_uploaded_at", columnList = "uploadedAt"),
      @Index(name = "idx_junit_result_project", columnList = "projectId"),
      @Index(name = "idx_junit_result_status", columnList = "status"),
      @Index(name = "idx_junit_result_project_status", columnList = "projectId, status"),
      @Index(name = "idx_junit_result_test_plan", columnList = "test_plan_id")
    })
public class JunitTestResult {

  @Comment("식별자: JUnit 테스트 결과를 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a JUnit test result (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  /** 연관된 테스트 플랜 ID */
  @Comment("테스트 플랜 식별자: 이 결과가 속한 테스트 플랜 (값 영역: test_plans.id 참조) | Test Plan Identifier: test plan to which this result belongs (Value domain: references test_plans.id)")
  @Column(name = "test_plan_id")
  private String testPlanId;

  /** 업로드된 파일명 */
  @Comment("파일 명: 업로드된 JUnit XML 파일명 (값 영역: 255자 이하) | File Name: file name of the uploaded JUnit XML (Value domain: up to 255 characters)")
  @Column(nullable = false, length = 255)
  private String fileName;

  /** 원본 파일 크기 (bytes) */
  @Comment("파일 크기: 원본 JUnit XML 파일 크기 (값 영역: 바이트) | File Size: size of the original JUnit XML file (Value domain: bytes)")
  @Column(nullable = false)
  private Long fileSize;

  /** 파일 체크섬 (SHA-256) */
  @Comment("파일 체크섬: SHA-256 해시로 파일 무결성을 검증하는 값 (값 영역: 16진 64자) | File Checksum: value that verifies file integrity with a SHA-256 hash (Value domain: hexadecimal, 64 characters)")
  @Column(length = 64)
  private String fileChecksum;

  /** 연관된 프로젝트 ID */
  @Comment("프로젝트 식별자: 이 결과가 속한 프로젝트 (값 영역: projects.id 참조) | Project Identifier: project to which this result belongs (Value domain: references projects.id)")
  @Column(name = "project_id", nullable = false)
  private String projectId;

  /** 테스트 실행 이름/제목 */
  @Comment("테스트 실행 명: 사용자에게 표시되는 테스트 실행의 이름 (값 영역: 200자 이하) | Test Execution Name: name of the test execution shown to users (Value domain: up to 200 characters)")
  @Column(nullable = false, length = 200)
  private String testExecutionName;

  /** 테스트 실행 설명 */
  @Comment("설명: 이 테스트 결과에 대한 상세 설명 | Description: detailed description of this test result")
  @Column(columnDefinition = "TEXT")
  private String description;

  /** 전체 테스트 수 */
  @Comment("전체 테스트 수: JUnit XML에서 파싱된 총 테스트 케이스 개수 (값 영역: 0 이상) | Total Test Count: total number of test cases parsed from the JUnit XML (Value domain: 0 or greater)")
  @Column(nullable = false)
  private Integer totalTests = 0;

  /** 실패한 테스트 수 */
  @Comment("실패 테스트 수: FAILURE 상태로 표시된 테스트 개수 (값 영역: 0 이상) | Failed Test Count: number of tests marked with the FAILURE status (Value domain: 0 or greater)")
  @Column(nullable = false)
  private Integer failures = 0;

  /** 에러가 발생한 테스트 수 */
  @Comment("오류 테스트 수: ERROR 상태로 표시된 테스트 개수 (값 영역: 0 이상) | Error Test Count: number of tests marked with ERROR status (Value domain: 0 or greater)")
  @Column(nullable = false)
  private Integer errors = 0;

  /** 스킵된 테스트 수 */
  @Comment("스킵 테스트 수: SKIPPED 상태로 표시된 테스트 개수 (값 영역: 0 이상) | Skipped Test Count: number of tests marked with the SKIPPED status (Value domain: 0 or greater)")
  @Column(nullable = false)
  private Integer skipped = 0;

  /** 전체 실행 시간 (초) */
  @Comment("전체 실행 시간: 모든 테스트의 총 실행 시간 (값 영역: 초, 소수점 포함) | Total Execution Duration: total execution time of all tests (Value domain: seconds, including decimals)")
  @Column(nullable = false)
  private Double totalTime = 0.0;

  /** 처리 상태 (UPLOADING, PARSING, COMPLETED, FAILED) */
  @Comment("처리 상태: 파일 업로드부터 파싱까지의 진행 상태 (값 영역: UPLOADING, PARSING, COMPLETED, FAILED) | Processing Status: progress status from file upload through parsing (Value domain: UPLOADING, PARSING, COMPLETED, FAILED)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private JunitProcessStatus status = JunitProcessStatus.UPLOADING;

  /** 업로드한 사용자 */
  @Comment("업로드자: 이 파일을 업로드한 사용자 (값 영역: users.id 참조) | Uploader: user who uploaded this file (Value domain: references users.id)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by", nullable = false)
  private User uploadedBy;

  /** 업로드 시간 */
  @Comment("업로드 일시: 파일이 업로드된 일시 | Uploaded Date Time: date and time the file was uploaded")
  @Column(nullable = false)
  private LocalDateTime uploadedAt;

  /** 파싱 완료 시간 */
  @Comment("파싱 일시: JUnit XML 파일 파싱을 마친 일시 | Parsed Date Time: date and time parsing of the JUnit XML file was completed")
  private LocalDateTime parsedAt;

  /** 원본 XML 파일 저장 경로 */
  @Comment("원본 파일 경로: 서버에 저장된 JUnit XML 파일의 절대 경로 | Original File Path: absolute path of the JUnit XML file stored on the server")
  @Column(length = 500)
  private String originalFilePath;

  /** 에러 메시지 (파싱 실패 시) */
  @Comment("오류 메시지: 파싱 실패 시 발생한 예외 또는 오류 메시지 | Error Message: exception or error message raised when parsing failed")
  @Column(columnDefinition = "TEXT")
  private String errorMessage;

  /** 연관된 테스트 스위트 목록 */
  @OneToMany(mappedBy = "junitTestResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @JsonManagedReference
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private List<JunitTestSuite> testSuites;

  /** 편집 가능 여부 */
  @Comment("편집 가능 여부: 이 결과를 재편집할 수 있는지의 여부 (값 영역: true, false) | Editable Indicator: indicator of whether this result can be edited again (Value domain: true, false)")
  @Column(nullable = false)
  private Boolean isEditable = true;

  /** 최종 수정 시간 */
  @Comment("최종 수정 일시: 이 행이 마지막으로 변경된 일시 | Last Modified Date Time: date and time this row was last changed")
  private LocalDateTime lastModifiedAt;

  /** 최종 수정자 */
  @Comment("최종 수정자: 이 행을 마지막으로 변경한 사용자 (값 영역: users.id 참조) | Last Modifier: user who last changed this row (Value domain: references users.id)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "last_modified_by")
  private User lastModifiedBy;

  @PrePersist
  protected void onCreate() {
    uploadedAt = LocalDateTime.now();
    lastModifiedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    lastModifiedAt = LocalDateTime.now();
  }

  /** 성공률 계산 (스킵된 테스트 제외) */
  public Double getSuccessRate() {
    if (totalTests == 0) return 0.0;
    int successCount = totalTests - failures - errors - skipped;
    return (double) successCount / totalTests * 100;
  }

  /** 완료 여부 확인 */
  public boolean isCompleted() {
    return status == JunitProcessStatus.COMPLETED;
  }

  /** 실패 여부 확인 */
  public boolean isFailed() {
    return status == JunitProcessStatus.FAILED;
  }

  /** 편집 가능 여부 확인 */
  public boolean canEdit() {
    return isEditable != null && isEditable && isCompleted();
  }
}
