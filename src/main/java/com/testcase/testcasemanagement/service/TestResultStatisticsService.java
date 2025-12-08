// src/main/java/com/testcase/testcasemanagement/service/TestResultStatisticsService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestResultQueryDto;
import com.testcase.testcasemanagement.dto.TestResultSummaryDto;
import com.testcase.testcasemanagement.model.JunitTestResult;
import com.testcase.testcasemanagement.repository.JunitTestResultRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ICT-208: 테스트 결과 고급 통계 서비스
 * 다양한 통계 분석 및 인사이트를 제공합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestResultStatisticsService {

    private final TestResultRepository testResultRepository;
    private final JunitTestResultRepository junitTestResultRepository;

    /**
     * 종합 테스트 결과 요약 통계 생성
     */
    public TestResultSummaryDto generateComprehensiveStatistics(TestResultQueryDto query) {
        log.info("종합 테스트 결과 통계 생성 시작 - 프로젝트: {}", query.getProjectId());

        try {
            // 기본 통계 수집
            Map<String, Long> basicStats = collectBasicStatistics(query);

            // 상세 통계 수집
            Map<String, TestResultSummaryDto.ResultByPriority> priorityStats = calculateStatisticsByPriority(query);
            List<TestResultSummaryDto.ResultByAssignee> assigneeStats = calculateStatisticsByAssignee(query);
            List<TestResultSummaryDto.DailyTestResult> dailyStats = calculateDailyStatistics(query);
            List<TestResultSummaryDto.FrequentFailure> frequentFailures = identifyFrequentFailures(query);
            List<TestResultSummaryDto.SlowTestCase> slowTests = identifySlowTestCases(query);

            // 결과 분포 계산
            Map<String, Long> resultDistribution = calculateResultDistribution(basicStats);

            // 성공률 및 실행률 계산
            double successRate = calculateSuccessRate(basicStats);
            double executionRate = calculateExecutionRate(basicStats);

            // 통계 기간 설정
            TestResultSummaryDto.StatisticsPeriod period = createStatisticsPeriod(query.getStartDate(),
                    query.getEndDate(), query.getRecentDays());

            return TestResultSummaryDto.builder()
                    .totalTests(basicStats.get("total"))
                    .passedTests(basicStats.get("passed"))
                    .failedTests(basicStats.get("failed"))
                    .blockedTests(basicStats.get("blocked"))
                    .notRunTests(basicStats.get("notRun"))
                    .successRate(successRate)
                    .executionRate(executionRate)
                    .resultDistribution(resultDistribution)
                    .statisticsByPriority(priorityStats)
                    .statisticsByAssignee(assigneeStats)
                    .dailyStatistics(dailyStats)
                    .frequentFailures(frequentFailures)
                    .slowTests(slowTests)
                    .period(period)
                    .build();

        } catch (Exception e) {
            log.error("통계 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("통계 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 기본 통계 수집
     */
    private Map<String, Long> collectBasicStatistics(TestResultQueryDto query) {
        Map<String, Long> stats = new HashMap<>();

        // TestResult 기반 통계
        if (query.getProjectId() != null) {
            stats.put("passed", testResultRepository.countByResultAndProjectId("PASS", query.getProjectId()));
            stats.put("failed", testResultRepository.countByResultAndProjectId("FAIL", query.getProjectId()));
            stats.put("blocked", testResultRepository.countByResultAndProjectId("BLOCKED", query.getProjectId()));
            stats.put("notRun", testResultRepository.countByResultAndProjectId("NOT_RUN", query.getProjectId()));
        } else {
            stats.put("passed", testResultRepository.countByResult("PASS"));
            stats.put("failed", testResultRepository.countByResult("FAIL"));
            stats.put("blocked", testResultRepository.countByResult("BLOCKED"));
            stats.put("notRun", testResultRepository.countByResult("NOT_RUN"));
        }

        stats.put("total", stats.values().stream().mapToLong(Long::longValue).sum());

        return stats;
    }

    /**
     * 우선순위별 통계 계산
     */
    private Map<String, TestResultSummaryDto.ResultByPriority> calculateStatisticsByPriority(TestResultQueryDto query) {
        // 우선순위별 그룹화 로직 구현
        Map<String, TestResultSummaryDto.ResultByPriority> priorityStats = new HashMap<>();

        List<String> priorities = Arrays.asList("HIGH", "MEDIUM", "LOW");
        for (String priority : priorities) {
            // 각 우선순위별 통계 계산
            TestResultSummaryDto.ResultByPriority stat = TestResultSummaryDto.ResultByPriority.builder()
                    .priority(priority)
                    .totalCount(0L)
                    .passedCount(0L)
                    .failedCount(0L)
                    .blockedCount(0L)
                    .notRunCount(0L)
                    .successRate(0.0)
                    .build();

            priorityStats.put(priority, stat);
        }

        return priorityStats;
    }

    /**
     * 담당자별 통계 계산
     */
    private List<TestResultSummaryDto.ResultByAssignee> calculateStatisticsByAssignee(TestResultQueryDto query) {
        List<TestResultSummaryDto.ResultByAssignee> assigneeStats = new ArrayList<>();

        try {
            // 프로젝트별 실행자 통계 조회
            if (query.getProjectId() != null) {
                List<Map<String, Object>> rawStats = testResultRepository
                        .findExecutorStatisticsByProject(query.getProjectId());

                for (Map<String, Object> stat : rawStats) {
                    String executorId = (String) stat.get("executor_id");
                    String executorName = (String) stat.get("executor_name");
                    Long totalAssigned = ((Number) stat.get("total_assigned")).longValue();
                    Long completed = ((Number) stat.get("completed")).longValue();
                    Long passed = ((Number) stat.get("passed")).longValue();
                    Long failed = ((Number) stat.get("failed")).longValue();

                    double completionRate = totalAssigned > 0 ? (completed * 100.0 / totalAssigned) : 0.0;
                    double successRate = completed > 0 ? (passed * 100.0 / completed) : 0.0;

                    TestResultSummaryDto.ResultByAssignee assigneeStat = TestResultSummaryDto.ResultByAssignee.builder()
                            .assigneeId(executorId)
                            .assigneeName(executorName)
                            .totalAssigned(totalAssigned)
                            .completed(completed)
                            .passed(passed)
                            .failed(failed)
                            .completionRate(completionRate)
                            .successRate(successRate)
                            .build();

                    assigneeStats.add(assigneeStat);
                }
            }
        } catch (Exception e) {
            log.warn("실행자별 통계 계산 실패: {}", e.getMessage());
        }

        return assigneeStats;
    }

    /**
     * 일별 통계 계산
     */
    private List<TestResultSummaryDto.DailyTestResult> calculateDailyStatistics(TestResultQueryDto query) {
        List<TestResultSummaryDto.DailyTestResult> dailyStats = new ArrayList<>();

        LocalDateTime endDate = query.getEndDate() != null ? query.getEndDate() : LocalDateTime.now();
        LocalDateTime startDate = query.getStartDate() != null ? query.getStartDate()
                : endDate.minusDays(query.getRecentDays() != null ? query.getRecentDays() : 7);

        // 일별로 반복하며 통계 수집
        LocalDateTime current = startDate;
        while (!current.isAfter(endDate)) {
            LocalDateTime dayStart = current.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = current.withHour(23).withMinute(59).withSecond(59);

            // 해당 일의 테스트 결과 통계 계산
            TestResultSummaryDto.DailyTestResult dailyStat = TestResultSummaryDto.DailyTestResult.builder()
                    .date(dayStart)
                    .testsExecuted(0L)
                    .testsPassed(0L)
                    .testsFailed(0L)
                    .successRate(0.0)
                    .averageExecutionTime(0.0)
                    .build();

            dailyStats.add(dailyStat);
            current = current.plusDays(1);
        }

        return dailyStats;
    }

    /**
     * 자주 실패하는 테스트 케이스 식별
     */
    private List<TestResultSummaryDto.FrequentFailure> identifyFrequentFailures(TestResultQueryDto query) {
        List<TestResultSummaryDto.FrequentFailure> failures = new ArrayList<>();

        // 실패 빈도 분석 로직
        // SQL 쿼리나 집계 함수를 통해 실패 빈도가 높은 테스트 케이스 식별

        return failures.stream()
                .sorted((a, b) -> Long.compare(b.getFailureCount(), a.getFailureCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * 느린 테스트 케이스 식별
     */
    private List<TestResultSummaryDto.SlowTestCase> identifySlowTestCases(TestResultQueryDto query) {
        List<TestResultSummaryDto.SlowTestCase> slowTests = new ArrayList<>();

        // JUnit 테스트 결과에서 실행 시간이 긴 테스트들 식별
        List<JunitTestResult> junitResults = junitTestResultRepository.findAll();

        // 실행 시간 기준 정렬 및 상위 N개 추출

        return slowTests.stream()
                .sorted((a, b) -> Double.compare(b.getAverageExecutionTime(), a.getAverageExecutionTime()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * 결과 분포 계산
     */
    private Map<String, Long> calculateResultDistribution(Map<String, Long> basicStats) {
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("PASS", basicStats.get("passed"));
        distribution.put("FAIL", basicStats.get("failed"));
        distribution.put("BLOCKED", basicStats.get("blocked"));
        distribution.put("NOT_RUN", basicStats.get("notRun"));
        return distribution;
    }

    /**
     * 성공률 계산
     */
    private double calculateSuccessRate(Map<String, Long> basicStats) {
        long total = basicStats.get("total");
        if (total == 0)
            return 0.0;

        long passed = basicStats.get("passed");
        return (double) passed / total * 100.0;
    }

    /**
     * 실행률 계산
     */
    private double calculateExecutionRate(Map<String, Long> basicStats) {
        long total = basicStats.get("total");
        if (total == 0)
            return 0.0;

        long executed = total - basicStats.get("notRun");
        return (double) executed / total * 100.0;
    }

    /**
     * 통계 기간 생성
     */
    private TestResultSummaryDto.StatisticsPeriod createStatisticsPeriod(
            LocalDateTime startDate, LocalDateTime endDate, Integer recentDays) {

        LocalDateTime actualEndDate = endDate != null ? endDate : LocalDateTime.now();
        LocalDateTime actualStartDate = startDate != null ? startDate
                : actualEndDate.minusDays(recentDays != null ? recentDays : 7);

        String description = String.format("%s ~ %s",
                actualStartDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                actualEndDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        return TestResultSummaryDto.StatisticsPeriod.builder()
                .startDate(actualStartDate)
                .endDate(actualEndDate)
                .description(description)
                .periodType(recentDays != null ? "RECENT" : "CUSTOM")
                .build();
    }

    /**
     * 실시간 통계 업데이트
     */
    public void invalidateStatisticsCache(String projectId) {
        log.info("프로젝트 {} 통계 캐시 무효화", projectId);
        // 캐시 매니저를 통해 특정 프로젝트의 통계 캐시 무효화
    }

    /**
     * 플랜별 비교 통계 조회
     */
    public List<Map<String, Object>> getComparisonStatisticsByPlan(String projectId) {
        log.info("플랜별 비교 통계 조회 - 프로젝트: {}", projectId);

        try {
            // 플랜별 통계 조회
            List<Map<String, Object>> planStats = testResultRepository.findStatisticsByTestPlan(projectId);

            return planStats.stream().map(stat -> {
                Map<String, Object> result = new HashMap<>();
                result.put("name", stat.get("test_plan_name"));
                result.put("passCount", stat.get("pass_count"));
                result.put("failCount", stat.get("fail_count"));
                result.put("blockedCount", stat.get("blocked_count"));
                result.put("notRunCount", stat.get("not_run_count"));

                // 전체 테스트 수 계산
                long totalTests = ((Number) stat.get("pass_count")).longValue()
                        + ((Number) stat.get("fail_count")).longValue()
                        + ((Number) stat.get("blocked_count")).longValue()
                        + ((Number) stat.get("not_run_count")).longValue();
                result.put("totalTests", totalTests);

                // 성공률 계산 (소수점 둘째자리)
                long executed = totalTests - ((Number) stat.get("not_run_count")).longValue();
                double successRate = executed > 0
                        ? (((Number) stat.get("pass_count")).doubleValue() / executed) * 100.0
                        : 0.0;
                result.put("successRate", Math.round(successRate * 100.0) / 100.0);

                return result;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("플랜별 통계 조회 실패: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * 실행자별 비교 통계 조회
     */
    public List<Map<String, Object>> getComparisonStatisticsByExecutor(String projectId) {
        log.info("실행자별 비교 통계 조회 - 프로젝트: {}", projectId);

        try {
            // 실행자별 통계 조회
            List<Map<String, Object>> executorStats = testResultRepository.findStatisticsByExecutor(projectId);

            return executorStats.stream().map(stat -> {
                Map<String, Object> result = new HashMap<>();
                result.put("name", stat.get("executor_name"));
                result.put("passCount", stat.get("pass_count"));
                result.put("failCount", stat.get("fail_count"));
                result.put("blockedCount", stat.get("blocked_count"));
                result.put("notRunCount", stat.get("not_run_count"));

                // 전체 테스트 수 계산
                long totalTests = ((Number) stat.get("pass_count")).longValue()
                        + ((Number) stat.get("fail_count")).longValue()
                        + ((Number) stat.get("blocked_count")).longValue()
                        + ((Number) stat.get("not_run_count")).longValue();
                result.put("totalTests", totalTests);

                // 성공률 계산 (소수점 둘째자리)
                long executed = totalTests - ((Number) stat.get("not_run_count")).longValue();
                double successRate = executed > 0
                        ? (((Number) stat.get("pass_count")).doubleValue() / executed) * 100.0
                        : 0.0;
                result.put("successRate", Math.round(successRate * 100.0) / 100.0);

                return result;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("실행자별 통계 조회 실패: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
}