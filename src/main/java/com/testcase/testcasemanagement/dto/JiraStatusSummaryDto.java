package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ICT-185: JIRA 상태 통합 및 요약 DTO
 * 중복 제거된 JIRA 상태 리스트와 통계를 위한 데이터 구조
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JiraStatusSummaryDto {
    
    // JIRA 이슈 정보
    private String jiraIssueKey;
    private String jiraIssueUrl;
    private String currentStatus; // JIRA에서 조회한 현재 상태
    private String issueType; // Bug, Task, Story 등
    private String priority; // High, Medium, Low
    private String summary; // 이슈 제목
    
    // 연결된 테스트 결과 정보
    private Long linkedTestCount; // 이 JIRA 이슈와 연결된 테스트 수
    private Map<String, Long> testResultDistribution; // 테스트 결과별 분포
    
    // 최신 테스트 정보
    private String latestTestResult; // 가장 최근 테스트 결과
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime latestTestDate; // 가장 최근 테스트 일시
    private String latestExecutor; // 가장 최근 실행자
    
    // JIRA 동기화 정보
    private String syncStatus; // SYNCED, FAILED, NOT_SYNCED, IN_PROGRESS
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastSyncAt; // 마지막 동기화 시간
    private String syncError; // 동기화 오류 메시지 (있는 경우)
    
    // 프로젝트 정보
    private String projectId;
    private String projectName;
    
    // 생성/업데이트 시간
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // 헬퍼 메서드들
    
    /**
     * 동기화가 필요한 상태인지 확인
     */
    public boolean needsSync() {
        return syncStatus == null || 
               "FAILED".equals(syncStatus) || 
               "NOT_SYNCED".equals(syncStatus);
    }
    
    /**
     * 동기화가 진행 중인지 확인
     */
    public boolean isSyncInProgress() {
        return "IN_PROGRESS".equals(syncStatus);
    }
    
    /**
     * 동기화가 완료되었는지 확인
     */
    public boolean isSynced() {
        return "SYNCED".equals(syncStatus);
    }
    
    /**
     * JIRA 이슈가 활성 상태인지 확인
     */
    public boolean isActiveIssue() {
        return currentStatus != null && 
               !"Closed".equalsIgnoreCase(currentStatus) &&
               !"Done".equalsIgnoreCase(currentStatus) &&
               !"Resolved".equalsIgnoreCase(currentStatus);
    }
    
    /**
     * 테스트 실패가 있는지 확인
     */
    public boolean hasFailedTests() {
        return testResultDistribution != null &&
               testResultDistribution.getOrDefault("FAIL", 0L) > 0;
    }
    
    /**
     * 모든 테스트가 통과했는지 확인
     */
    public boolean allTestsPassed() {
        if (testResultDistribution == null || linkedTestCount == 0) {
            return false;
        }
        
        Long passCount = testResultDistribution.getOrDefault("PASS", 0L);
        Long notRunCount = testResultDistribution.getOrDefault("NOT_RUN", 0L);
        
        // PASS + NOT_RUN = 전체 테스트 수인 경우 (실행된 모든 테스트가 통과)
        return passCount > 0 && 
               testResultDistribution.getOrDefault("FAIL", 0L) == 0 &&
               testResultDistribution.getOrDefault("BLOCKED", 0L) == 0;
    }
    
    /**
     * 성공률 계산
     */
    public double getSuccessRate() {
        if (linkedTestCount == 0) {
            return 0.0;
        }
        
        Long passCount = testResultDistribution != null ? 
            testResultDistribution.getOrDefault("PASS", 0L) : 0L;
        
        return (passCount.doubleValue() / linkedTestCount.doubleValue()) * 100.0;
    }
}