// src/main/java/com/testcase/testcasemanagement/model/TestResult.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "test_results", indexes = {
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
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_execution_id")
    private TestExecution testExecution;

    private String testCaseId;
    private String result; // NOT_RUN, PASS, FAIL, BLOCKED

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime executedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "executed_by")
    private User executedBy;
    
    // ICT-162: JIRA 연동 필드 추가
    
    /**
     * 연결된 JIRA 이슈 키 (예: PRJ-123)
     */
    @Column(name = "jira_issue_key", length = 100)
    private String jiraIssueKey;
    
    /**
     * JIRA 이슈 URL
     */
    @Column(name = "jira_issue_url", length = 500)
    private String jiraIssueUrl;
    
    /**
     * JIRA 코멘트 ID (추가된 코멘트의 고유 ID)
     */
    @Column(name = "jira_comment_id", length = 100)
    private String jiraCommentId;
    
    /**
     * JIRA 동기화 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "jira_sync_status", length = 50)
    private JiraSyncStatus jiraSyncStatus = JiraSyncStatus.NOT_SYNCED;
    
    /**
     * 마지막 JIRA 동기화 시도 시간
     */
    @Column(name = "last_jira_sync_at")
    private LocalDateTime lastJiraSyncAt;
    
    /**
     * JIRA 동기화 오류 메시지
     */
    @Column(name = "jira_sync_error", columnDefinition = "TEXT")
    private String jiraSyncError;
    
    // JIRA 연동 관련 헬퍼 메서드
    
    /**
     * JIRA 이슈와 연결되어 있는지 확인
     * @return JIRA 이슈 키가 설정되어 있는지 여부
     */
    public boolean hasJiraIssue() {
        return jiraIssueKey != null && !jiraIssueKey.trim().isEmpty();
    }
    
    /**
     * JIRA 동기화가 필요한지 확인
     * @return 동기화가 필요한 상태인지 여부
     */
    public boolean needsJiraSync() {
        return hasJiraIssue() && (jiraSyncStatus == null || jiraSyncStatus.canSync());
    }
    
    /**
     * JIRA 동기화 성공 처리
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
     * @param errorMessage 오류 메시지
     */
    public void markJiraSyncFailure(String errorMessage) {
        this.jiraSyncStatus = JiraSyncStatus.FAILED;
        this.lastJiraSyncAt = LocalDateTime.now();
        this.jiraSyncError = errorMessage;
    }
    
    /**
     * JIRA 동기화 진행 중 상태로 변경
     */
    public void markJiraSyncInProgress() {
        this.jiraSyncStatus = JiraSyncStatus.IN_PROGRESS;
        this.lastJiraSyncAt = LocalDateTime.now();
        this.jiraSyncError = null;
    }
}
