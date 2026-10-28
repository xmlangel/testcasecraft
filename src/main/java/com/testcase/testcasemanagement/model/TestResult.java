// src/main/java/com/testcase/testcasemanagement/model/TestResult.java

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
@Comment("테스트 결과: 테스트 실행에서 테스트 케이스 하나를 수행한 결과")
@Table(
    name = "test_results",
    indexes = {
      // ICT-130: 대시보드 API 성능 최적화를 위한 인덱스
      @Index(name = "idx_test_result_executed_at", columnList = "executedAt"),
      @Index(name = "idx_test_result_case_executed", columnList = "testCaseId, executedAt"),
      @Index(name = "idx_test_result_execution_time", columnList = "test_execution_id, executedAt"),
      @Index(name = "idx_test_result_result_time", columnList = "result, executedAt"),
      @Index(name = "idx_test_result_executed_by", columnList = "executed_by"),

      // ICT-133: 대시보드 쿼리 성능을 위한 DB 인덱스 최적화
      @Index(name = "idx_test_result_execution_result", columnList = "test_execution_id, result")
    })
public class TestResult {
  @Comment("테스트 결과 식별자: 이 테스트 결과 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment(
      value = "테스트 실행 식별자: 이 결과가 속한 테스트 실행을 가리키는 값 (값 영역: test_executions.id 참조, UUID 36자)",
      on = "test_execution_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "test_execution_id")
  private TestExecution testExecution;

  @Comment("테스트 케이스 식별자: 실행한 테스트 케이스의 ID (값 영역: UUID 36자)")
  private String testCaseId;

  @Comment("테스트 결과 상태: 테스트의 실행 결과 (값 영역: NOT_RUN, PASS, FAIL, BLOCKED)")
  private String result; // NOT_RUN, PASS, FAIL, BLOCKED

  @Comment("테스트 결과 메모: 테스트 실행에 대한 추가 의견이나 설명")
  @Column(columnDefinition = "TEXT")
  private String notes;

  @Comment("테스트 실행 일시: 이 테스트 케이스가 실제로 실행된 일시")
  private LocalDateTime executedAt;

  @Comment(
      value = "실행자 식별자: 이 테스트를 실행한 사용자를 가리키는 값 (값 영역: users.id 참조, UUID 36자)",
      on = "executed_by")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "executed_by")
  private User executedBy;

  // ICT-162: JIRA 연동 필드 추가

  /** 연결된 JIRA 이슈 키 (예: PRJ-123) */
  @Comment("Jira 이슈 키: 테스트 결과와 연결된 Jira 이슈의 키 (예: PRJ-123)")
  @Column(name = "jira_issue_key", length = 500)
  private String jiraIssueKey;

  /** JIRA 이슈 URL */
  @Comment("Jira 이슈 URL: 테스트 결과와 연결된 Jira 이슈의 웹 URL")
  @Column(name = "jira_issue_url", length = 500)
  private String jiraIssueUrl;

  /** JIRA 코멘트 ID (추가된 코멘트의 고유 ID) */
  @Comment("Jira 코멘트 식별자: 테스트 결과가 추가한 Jira 이슈의 코멘트 ID")
  @Column(name = "jira_comment_id", length = 100)
  private String jiraCommentId;

  /** JIRA 동기화 상태 */
  @Comment(
      "Jira 동기화 상태: 테스트 결과의 Jira 동기화 진행 상태 (값 영역: NOT_SYNCED, PENDING, IN_PROGRESS, SYNCED, FAILED,"
          + " RETRY_REQUIRED)")
  @Enumerated(EnumType.STRING)
  @Column(name = "jira_sync_status", length = 50)
  private JiraSyncStatus jiraSyncStatus = JiraSyncStatus.NOT_SYNCED;

  /** 마지막 JIRA 동기화 시도 시간 */
  @Comment("최종 Jira 동기화 시도 일시: Jira 동기화를 마지막으로 시도한 일시")
  @Column(name = "last_jira_sync_at")
  private LocalDateTime lastJiraSyncAt;

  /** JIRA 동기화 오류 메시지 */
  @Comment("Jira 동기화 오류: Jira 동기화 실패 시의 오류 메시지")
  @Column(name = "jira_sync_error", columnDefinition = "TEXT")
  private String jiraSyncError;

  /** JIRA 이슈 현재 상태 (예: "In Progress", "Done", "To Do") 데이터베이스에 캐시하여 매번 API 호출을 방지 */
  @Comment("Jira 이슈 상태: 연결된 Jira 이슈의 현재 상태(캐시값, 예: To Do, In Progress, Done)")
  @Column(name = "jira_status", length = 100)
  private String jiraStatus;

  /** JIRA 상태 마지막 업데이트 시간 */
  @Comment("Jira 상태 최종 갱신 일시: Jira 이슈 상태를 마지막으로 갱신한 일시")
  @Column(name = "jira_status_updated_at")
  private LocalDateTime jiraStatusUpdatedAt;

  // JIRA 연동 관련 헬퍼 메서드

  /**
   * JIRA 이슈와 연결되어 있는지 확인
   *
   * @return JIRA 이슈 키가 설정되어 있는지 여부
   */
  public boolean hasJiraIssue() {
    return jiraIssueKey != null && !jiraIssueKey.trim().isEmpty();
  }

  /**
   * JIRA 동기화가 필요한지 확인
   *
   * @return 동기화가 필요한 상태인지 여부
   */
  public boolean needsJiraSync() {
    return hasJiraIssue() && (jiraSyncStatus == null || jiraSyncStatus.canSync());
  }

  /**
   * JIRA 동기화 성공 처리
   *
   * @param commentId 추가된 코멘트 ID
   */
  public void markJiraSyncSuccess(String commentId) {
    this.jiraCommentId = commentId;
    this.jiraSyncStatus = JiraSyncStatus.SYNCED;
    this.lastJiraSyncAt = LocalDateTime.now();
    this.jiraSyncError = null;
  }

  /**
   * JIRA 동기화 실패 처리
   *
   * @param errorMessage 오류 메시지
   */
  public void markJiraSyncFailure(String errorMessage) {
    this.jiraSyncStatus = JiraSyncStatus.FAILED;
    this.lastJiraSyncAt = LocalDateTime.now();
    this.jiraSyncError = errorMessage;
  }

  /** JIRA 동기화 진행 중 상태로 변경 */
  public void markJiraSyncInProgress() {
    this.jiraSyncStatus = JiraSyncStatus.IN_PROGRESS;
    this.lastJiraSyncAt = LocalDateTime.now();
    this.jiraSyncError = null;
  }

  // 태그 목록
  @Comment("테스트 결과 태그: 테스트 결과를 분류하는 태그 목록")
  @Comment(value = "태그 값: 테스트 결과에 붙인 태그 문자열 (값 영역: 100자 이하)", on = "tag")
  @Comment(value = "테스트 결과 식별자: 태그가 붙은 테스트 결과 (값 영역: test_results.id 참조)", on = "test_result_id")
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "test_result_tags", joinColumns = @JoinColumn(name = "test_result_id"))
  @Column(name = "tag", length = 100)
  @org.hibernate.annotations.BatchSize(size = 50)
  private java.util.Set<String> tags;

  // ICT-469: 스텝별 결과 (스텝 번호 순서). 비어 있으면 케이스 결과 하나로만 기록된 결과다.
  @Comment("스텝별 결과: 테스트 결과 안에서 스텝마다 기록한 결과와 실제 결과")
  @Comment(value = "테스트 결과 식별자: 스텝 결과가 속한 테스트 결과 (값 영역: test_results.id 참조)", on = "test_result_id")
  @ElementCollection(fetch = FetchType.LAZY)
  @CollectionTable(name = "test_result_steps", joinColumns = @JoinColumn(name = "test_result_id"))
  @OrderBy("stepNumber ASC")
  @org.hibernate.annotations.BatchSize(size = 100)
  private List<TestResultStep> steps = new ArrayList<>();

  // ICT-361: 테스트 결과 첨부파일 관계

  /** 첨부파일 목록 */
  @org.hibernate.annotations.BatchSize(size = 100)
  @OneToMany(mappedBy = "testResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<TestResultAttachment> attachments = new ArrayList<>();

  /**
   * 첨부파일 추가
   *
   * @param attachment 첨부파일
   */
  public void addAttachment(TestResultAttachment attachment) {
    attachments.add(attachment);
    attachment.setTestResult(this);
  }

  /**
   * 첨부파일 제거
   *
   * @param attachment 첨부파일
   */
  public void removeAttachment(TestResultAttachment attachment) {
    attachments.remove(attachment);
    attachment.setTestResult(null);
  }

  /**
   * 활성 상태의 첨부파일 개수
   *
   * @return 첨부파일 개수
   */
  public int getActiveAttachmentCount() {
    return (int)
        attachments.stream()
            .filter(att -> att.getStatus() == TestResultAttachment.AttachmentStatus.ACTIVE)
            .count();
  }

  /**
   * 첨부파일이 있는지 확인
   *
   * @return 첨부파일 존재 여부
   */
  public boolean hasAttachments() {
    return getActiveAttachmentCount() > 0;
  }
}
