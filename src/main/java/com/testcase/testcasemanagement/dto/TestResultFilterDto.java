package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ICT-185: 테스트 결과 필터링 조건 DTO
 * 사용자 커스터마이징 및 필터링 옵션을 위한 데이터 구조
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResultFilterDto {
    
    // 기본 필터 조건
    private String projectId;
    private List<String> testPlanIds;
    private List<String> testExecutionIds;
    private List<String> testCaseIds;
    
    // 결과 필터
    private List<String> results; // PASS, FAIL, NOT_RUN, BLOCKED
    
    // 날짜 범위 필터
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateFrom;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateTo;
    
    // 실행자 필터
    private List<String> executedByIds;
    private List<String> executorNames;
    
    // JIRA 관련 필터
    private Boolean hasJiraIssue; // JIRA 이슈가 있는 것만
    private List<String> jiraIssueKeys;
    private List<String> jiraStatuses;
    private List<String> jiraSyncStatuses; // SYNCED, FAILED, NOT_SYNCED, IN_PROGRESS
    
    // 표시할 컬럼 선택 (사용자 커스터마이징)
    private List<String> displayColumns;
    
    // 정렬 옵션
    private String sortBy; // 정렬 기준 필드
    private String sortDirection; // ASC, DESC
    
    // 페이징
    private Integer page;
    private Integer size;
    private Integer limit; // 최대 결과 수 제한
    
    // 그룹핑 옵션
    private String groupBy; // TEST_PLAN, EXECUTOR, DATE, JIRA_STATUS 등
    
    // 통계 포함 여부
    private Boolean includeStatistics;
    private Boolean includeJiraInfo;
    private Boolean includeFolderPath;
    
    // 내보내기 옵션
    private String exportFormat; // EXCEL, PDF, CSV
    private Boolean includeCharts; // 차트 포함 여부 (PDF용)
    
    // 캐시 관련
    private Boolean useCache;
    private Integer cacheMinutes; // 캐시 유효 시간 (분)
    
    // ICT-283: 계층적 리포트 관련 필드
    private Boolean includeNotExecuted; // 미실행 테스트케이스 포함 여부
    private Boolean hierarchicalStructure; // 계층적 구조로 반환 여부
    private Boolean includeTestPlanInfo; // 테스트 플랜 정보 포함
    private Boolean includeTestExecutionInfo; // 테스트 실행 정보 포함
    
    // 헬퍼 메서드들
    
    /**
     * 기본 표시 컬럼 설정
     */
    public void setDefaultDisplayColumns() {
        this.displayColumns = List.of(
            "folderPath",
            "testCaseName", 
            "result",
            "executedAt",
            "executorName",
            "notes",
            "jiraIssueKey"
        );
    }
    
    /**
     * 모든 컬럼 표시 설정
     */
    public void setAllDisplayColumns() {
        this.displayColumns = List.of(
            "testPlanName",
            "testExecutionName",
            "folderPath",
            "testCaseName",
            "result",
            "executedAt",
            "executorName", 
            "notes",
            "jiraIssueKey",
            "jiraStatus",
            "jiraSyncStatus",
            "priority",
            "category"
        );
    }
    
    /**
     * 기본 페이징 설정
     */
    public void setDefaultPaging() {
        this.page = 0;
        this.size = 50;
        this.limit = 1000;
    }
    
    /**
     * 기본 정렬 설정 (최신 실행 순)
     */
    public void setDefaultSort() {
        this.sortBy = "executedAt";
        this.sortDirection = "DESC";
    }
    
    /**
     * 날짜 필터가 설정되어 있는지 확인
     */
    public boolean hasDateFilter() {
        return dateFrom != null || dateTo != null;
    }
    
    /**
     * JIRA 필터가 설정되어 있는지 확인
     */
    public boolean hasJiraFilter() {
        return hasJiraIssue != null || 
               (jiraIssueKeys != null && !jiraIssueKeys.isEmpty()) ||
               (jiraStatuses != null && !jiraStatuses.isEmpty()) ||
               (jiraSyncStatuses != null && !jiraSyncStatuses.isEmpty());
    }
    
    /**
     * 결과 필터가 설정되어 있는지 확인
     */
    public boolean hasResultFilter() {
        return results != null && !results.isEmpty();
    }
    
    /**
     * 실행자 필터가 설정되어 있는지 확인
     */
    public boolean hasExecutorFilter() {
        return (executedByIds != null && !executedByIds.isEmpty()) ||
               (executorNames != null && !executorNames.isEmpty());
    }
    
    /**
     * ICT-283: 계층적 리포트용 기본 설정
     */
    public void setHierarchicalReportDefaults() {
        this.hierarchicalStructure = true;
        this.includeNotExecuted = true;
        this.includeTestPlanInfo = true;
        this.includeTestExecutionInfo = true;
        setAllDisplayColumns();
        setDefaultPaging();
        this.sortBy = "testPlanName,testExecutionName,testCaseName";
        this.sortDirection = "ASC";
    }
    
    /**
     * ICT-283: 계층적 리포트 전용 컬럼 설정
     */
    public void setHierarchicalDisplayColumns() {
        this.displayColumns = List.of(
            "testPlanName",
            "testPlanDescription", 
            "testExecutionName",
            "executedAt",
            "folderPath",
            "testCaseName",
            "testCaseDescription",
            "result",
            "executorName",
            "notes",
            "jiraIssueKey",
            "jiraStatus",
            "priority",
            "actualResult",
            "expectedResult",
            "preconditions"
        );
    }
}