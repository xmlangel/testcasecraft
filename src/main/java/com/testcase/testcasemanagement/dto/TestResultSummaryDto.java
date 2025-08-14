// src/main/java/com/testcase/testcasemanagement/dto/TestResultSummaryDto.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ICT-208: 테스트 결과 요약 정보 DTO
 * 통합된 테스트 결과 요약 데이터를 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultSummaryDto {
    
    /**
     * 전체 테스트 수
     */
    private Long totalTests;
    
    /**
     * 성공한 테스트 수
     */
    private Long passedTests;
    
    /**
     * 실패한 테스트 수
     */
    private Long failedTests;
    
    /**
     * 차단된 테스트 수
     */
    private Long blockedTests;
    
    /**
     * 미실행 테스트 수
     */
    private Long notRunTests;
    
    /**
     * 성공률 (%)
     */
    private Double successRate;
    
    /**
     * 실행률 (%)
     */
    private Double executionRate;
    
    /**
     * 결과별 분포 (파이차트용)
     */
    private Map<String, Long> resultDistribution;
    
    /**
     * 우선순위별 통계
     */
    private Map<String, ResultByPriority> statisticsByPriority;
    
    /**
     * 담당자별 통계
     */
    private List<ResultByAssignee> statisticsByAssignee;
    
    /**
     * 일별 통계 (최근 N일)
     */
    private List<DailyTestResult> dailyStatistics;
    
    /**
     * 가장 많이 실패한 테스트 케이스들
     */
    private List<FrequentFailure> frequentFailures;
    
    /**
     * 실행 시간이 긴 테스트들
     */
    private List<SlowTestCase> slowTests;
    
    /**
     * 통계 생성 시간
     */
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();
    
    /**
     * 통계 기간
     */
    private StatisticsPeriod period;
    
    /**
     * 우선순위별 결과 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultByPriority {
        private String priority;
        private Long totalCount;
        private Long passedCount;
        private Long failedCount;
        private Long blockedCount;
        private Long notRunCount;
        private Double successRate;
    }
    
    /**
     * 담당자별 결과 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultByAssignee {
        private String assigneeId;
        private String assigneeName;
        private Long totalAssigned;
        private Long completed;
        private Long passed;
        private Long failed;
        private Double completionRate;
        private Double successRate;
    }
    
    /**
     * 일별 테스트 결과 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTestResult {
        private LocalDateTime date;
        private Long testsExecuted;
        private Long testsPassed;
        private Long testsFailed;
        private Double successRate;
        private Double averageExecutionTime;
    }
    
    /**
     * 자주 실패하는 테스트 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrequentFailure {
        private String testCaseId;
        private String testCaseName;
        private String folderPath;
        private Long failureCount;
        private Long totalExecutions;
        private Double failureRate;
        private LocalDateTime lastFailure;
        private String commonErrorPattern;
    }
    
    /**
     * 느린 테스트 케이스 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlowTestCase {
        private String testCaseId;
        private String testCaseName;
        private String testSuiteName;
        private Double averageExecutionTime;
        private Double maxExecutionTime;
        private LocalDateTime lastExecution;
    }
    
    /**
     * 통계 기간 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticsPeriod {
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String description;
        private String periodType; // DAILY, WEEKLY, MONTHLY, CUSTOM
    }
}