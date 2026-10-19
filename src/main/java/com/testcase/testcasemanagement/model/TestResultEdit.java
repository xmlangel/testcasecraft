// src/main/java/com/testcase/testcasemanagement/model/TestResultEdit.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** ICT-209: 테스트 결과 편집 기능 구현 원본 TestResult 데이터를 보존하면서 편집 내용을 별도로 저장하는 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 결과 편집: 테스트 결과 원본은 그대로 두고 따로 저장한 수정본")
@Table(
    name = "test_result_edits",
    indexes = {
      @Index(name = "idx_test_result_edit_original", columnList = "original_test_result_id"),
      @Index(name = "idx_test_result_edit_created_at", columnList = "createdAt"),
      @Index(name = "idx_test_result_edit_editor", columnList = "edited_by"),
      @Index(name = "idx_test_result_edit_status", columnList = "edit_status"),
      @Index(
          name = "idx_test_result_edit_active",
          columnList = "original_test_result_id, is_active")
    })
public class TestResultEdit {

  @Comment("편집 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  /** 원본 테스트 결과 ID (원본 데이터 참조) */
  @Comment("원본 테스트 결과 식별자: 편집 대상인 원본 테스트 결과 (값 영역: test_results.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "original_test_result_id", nullable = false)
  private TestResult originalTestResult;

  /** 편집된 테스트 케이스명 */
  @Comment("편집된 테스트 케이스명: 편집본에서 변경된 테스트 케이스 이름")
  @Column(name = "edited_test_case_name", length = 500)
  private String editedTestCaseName;

  /** 편집된 결과 상태 (PASS, FAIL, BLOCKED, NOT_RUN) */
  @Comment("편집된 결과: 편집본에서 변경된 테스트 결과 상태 (값 영역: PASS, FAIL, BLOCKED, NOT_RUN)")
  @Column(name = "edited_result", length = 50)
  private String editedResult;

  /** 편집된 비고/메모 */
  @Comment("편집된 메모: 편집본에서 변경된 테스트 결과에 대한 메모")
  @Column(name = "edited_notes", columnDefinition = "TEXT")
  private String editedNotes;

  /** 편집된 JIRA 이슈 키 */
  @Comment("편집된 Jira 이슈 키: 편집본에서 변경된 Jira 이슈 키")
  @Column(name = "edited_jira_issue_key", length = 100)
  private String editedJiraIssueKey;

  /** 편집된 JIRA 이슈 URL */
  @Comment("편집된 Jira 이슈 URL: 편집본에서 변경된 Jira 이슈 URL")
  @Column(name = "edited_jira_issue_url", length = 500)
  private String editedJiraIssueUrl;

  /** 추가된 태그들 (JSON 배열 형태로 저장) */
  @Comment("추가된 태그: JSON 배열 형식으로 저장된 새로 추가된 태그")
  @Column(name = "added_tags", columnDefinition = "TEXT")
  private String addedTags;

  /** 편집 이유/설명 */
  @Comment("편집 사유: 이 편집을 수행한 이유")
  @Column(name = "edit_reason", columnDefinition = "TEXT")
  private String editReason;

  /** 편집 상태 */
  @Comment("편집 상태: 편집본의 현재 상태 (값 영역: DRAFT, PENDING, APPROVED, APPLIED, REJECTED, REVERTED)")
  @Enumerated(EnumType.STRING)
  @Column(name = "edit_status", length = 50, nullable = false)
  private EditStatus editStatus = EditStatus.DRAFT;

  /** 현재 활성 편집본 여부 (한 번에 하나의 편집본만 활성) */
  @Comment("활성 여부: 이 편집본이 현재 적용 중인 편집본인지 여부 (값 영역: true, false)")
  @Column(name = "is_active", nullable = false)
  private Boolean isActive = false;

  /** 편집 생성 시간 */
  @Comment("생성 일시: 이 편집본이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  /** 편집 승인/적용 시간 */
  @Comment("적용 일시: 이 편집본이 실제로 적용된 일시")
  @Column(name = "applied_at")
  private LocalDateTime appliedAt;

  /** 편집자 */
  @Comment("편집자: 이 편집본을 작성한 사용자 (값 영역: users.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "edited_by", nullable = false)
  private User editedBy;

  /** 편집 승인자 (권한 관리용) */
  @Comment("승인자: 이 편집본을 승인한 사용자 (값 영역: users.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "approved_by")
  private User approvedBy;

  /** 편집본 버전 (동일 테스트 결과에 대한 편집 버전 관리) */
  @Comment("편집 버전: 같은 테스트 결과에 대한 편집 버전 번호")
  @Column(name = "edit_version", nullable = false)
  private Integer editVersion = 1;

  /** 편집 전 원본 스냅샷 (JSON 형태로 저장) */
  @Comment("원본 스냅샷: 편집 전 원본 테스트 결과의 JSON 형식 스냅샷")
  @Column(name = "original_snapshot", columnDefinition = "TEXT")
  private String originalSnapshot;

  /** 편집 상태 열거형 */
  public enum EditStatus {
    DRAFT, // 임시저장
    PENDING, // 승인 대기
    APPROVED, // 승인됨
    APPLIED, // 적용됨
    REJECTED, // 거부됨
    REVERTED // 되돌림
  }

  // 편집 관련 헬퍼 메서드

  /** 편집본을 활성화하고 다른 편집본들을 비활성화 */
  public void activate() {
    this.isActive = true;
    this.editStatus = EditStatus.APPLIED;
    this.appliedAt = LocalDateTime.now();
  }

  /** 편집본을 비활성화 */
  public void deactivate() {
    this.isActive = false;
  }

  /** 편집본 승인 */
  public void approve(User approver) {
    this.editStatus = EditStatus.APPROVED;
    this.approvedBy = approver;
  }

  /** 편집본 거부 */
  public void reject() {
    this.editStatus = EditStatus.REJECTED;
    this.isActive = false;
  }

  /** 편집본 되돌리기 */
  public void revert() {
    this.editStatus = EditStatus.REVERTED;
    this.isActive = false;
  }

  /** 편집 가능한 상태인지 확인 */
  public boolean isEditable() {
    return editStatus == EditStatus.DRAFT || editStatus == EditStatus.PENDING;
  }

  /** 적용된 편집본인지 확인 */
  public boolean isApplied() {
    return editStatus == EditStatus.APPLIED && isActive;
  }

  /** 승인 필요한 상태인지 확인 */
  public boolean needsApproval() {
    return editStatus == EditStatus.PENDING;
  }

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
  }
}
