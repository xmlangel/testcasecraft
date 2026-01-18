package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 프로젝트 전체 통계 데이터 DTO
 * 대시보드의 전체 통계 섹션용 종합 통계 정보
 * 
 * ICT-129: 프로젝트 전체 통계 대시보드 API 구현
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatisticsDto {
    
    // === 기본 통계 ===
    private String projectId;                   // 프로젝트 ID
    private String projectName;                 // 프로젝트 이름
    private Integer totalTestCases;             // 총 테스트케이스 수
    private Integer totalTestPlans;             // 총 테스트 플랜 수
    private Integer totalTestExecutions;        // 총 테스트 실행 수
    
    // === 실행 통계 ===
    private Integer executedTestCases;          // 실행된 테스트케이스 수
    private Double executionRate;               // 실행률 (%)
    private Integer passedTestCases;            // 통과한 테스트케이스 수
    private Double passRate;                    // 통과율 (%)
    private Integer failedTestCases;            // 실패한 테스트케이스 수
    private Integer blockedTestCases;           // 차단된 테스트케이스 수
    private Integer skippedTestCases;           // 건너뛴 테스트케이스 수
    private Integer notRunTestCases;            // 미실행 테스트케이스 수
    
    // === 테스트 커버리지 관련 통계 ===
    private Double testCoverage;                // 테스트 커버리지 (%)
    private Integer activePriorityHighCases;    // 활성 높은 우선순위 케이스 수
    private Integer activePriorityMediumCases;  // 활성 중간 우선순위 케이스 수
    private Integer activePriorityLowCases;     // 활성 낮은 우선순위 케이스 수
    
    // === 최근 변화 추이 (전일/전주 대비) ===
    private Integer yesterdayExecutions;        // 전일 실행 수
    private Integer lastWeekExecutions;         // 전주 실행 수
    private Double dailyChangeRate;             // 일일 변화율 (%)
    private Double weeklyChangeRate;            // 주간 변화율 (%)
    
    // === 품질 지표 ===
    private Double averagePassRateLast7Days;    // 최근 7일 평균 통과율
    private Double averagePassRateLast30Days;   // 최근 30일 평균 통과율
    private Integer criticalFailuresLast7Days;  // 최근 7일 중요 실패 수
    
    // === 진행 상황 ===
    private Integer activeTestExecutions;       // 진행 중인 테스트 실행 수
    private Integer completedTestExecutions;    // 완료된 테스트 실행 수
    private Integer pausedTestExecutions;       // 일시정지된 테스트 실행 수
    
    // === 시간 정보 ===
    private LocalDateTime lastExecutionDate;    // 마지막 실행 일시
    private LocalDateTime calculatedAt;         // 통계 계산 일시
    private Integer dataFreshnessMinutes;       // 데이터 신선도 (분)
}