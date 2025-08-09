// src/main/java/com/testcase/testcasemanagement/repository/TestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface TestResultRepository extends JpaRepository<TestResult, String> {
    List<TestResult> findByTestCaseId(String testCaseId);
    
    @Query("SELECT tr FROM TestResult tr " +
           "JOIN tr.testExecution te " +
           "JOIN te.project p " +
           "WHERE p.id = :projectId " +
           "AND tr.executedAt IS NOT NULL " +
           "ORDER BY tr.executedAt DESC")
    List<TestResult> findRecentTestResultsByProject(@Param("projectId") String projectId, Pageable pageable);
    
    @Query("SELECT tr FROM TestResult tr " +
           "WHERE tr.executedAt IS NOT NULL " +
           "ORDER BY tr.executedAt DESC")
    List<TestResult> findRecentTestResults(Pageable pageable);
    
    @Query("SELECT tr FROM TestResult tr " +
           "JOIN tr.testExecution te " +
           "WHERE te.testPlanId = :testPlanId " +
           "AND tr.executedAt IS NOT NULL " +
           "ORDER BY tr.executedAt DESC")
    List<TestResult> findRecentTestResultsByTestPlan(@Param("testPlanId") String testPlanId, Pageable pageable);
    
    /**
     * 오픈 테스트런(INPROGRESS 상태)의 모든 테스트 결과 조회
     *
     * @param projectId 프로젝트 ID
     * @return 오픈 테스트런의 테스트 결과 목록
     */
    @Query("SELECT tr FROM TestResult tr " +
           "JOIN tr.testExecution te " +
           "JOIN te.project p " +
           "WHERE p.id = :projectId " +
           "AND te.status = 'INPROGRESS'")
    List<TestResult> findByOpenTestRunsInProject(@Param("projectId") String projectId);
    
    /**
     * 전체 오픈 테스트런(INPROGRESS 상태)의 모든 테스트 결과 조회
     *
     * @return 오픈 테스트런의 테스트 결과 목록
     */
    @Query("SELECT tr FROM TestResult tr " +
           "JOIN tr.testExecution te " +
           "WHERE te.status = 'INPROGRESS'")
    List<TestResult> findByOpenTestRuns();
    
    /**
     * 프로젝트의 날짜별 테스트 결과 추이 조회 (집계 데이터)
     * 지정된 기간 내의 날짜별 테스트 결과 통계를 조회합니다.
     *
     * @param projectId 프로젝트 ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 날짜별 결과 상태별 개수 맵 (date, result, count)
     */
    @Query(value = "SELECT " +
           "    CAST(tr.executed_at AS DATE) as date, " +
           "    tr.result as result, " +
           "    COUNT(*) as count " +
           "FROM test_results tr " +
           "JOIN test_executions te ON tr.test_execution_id = te.id " +
           "WHERE te.project_id = :projectId " +
           "AND tr.executed_at BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(tr.executed_at AS DATE), tr.result " +
           "ORDER BY CAST(tr.executed_at AS DATE)", 
           nativeQuery = true)
    List<Map<String, Object>> findTestResultsTrendByProject(
        @Param("projectId") String projectId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * 프로젝트의 테스트케이스 상태별 통계 조회
     * 각 테스트케이스의 최신 결과 상태를 기준으로 통계를 계산합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 상태별 통계 맵 (result, count)
     */
    @Query(value = "SELECT " +
           "    COALESCE(latest_results.result, 'NOTRUN') as result, " +
           "    COUNT(*) as count " +
           "FROM testcases tc " +
           "LEFT JOIN ( " +
           "    SELECT tr1.test_case_id, tr1.result " +
           "    FROM test_results tr1 " +
           "    JOIN test_executions te1 ON tr1.test_execution_id = te1.id " +
           "    WHERE te1.project_id = :projectId " +
           "    AND tr1.executed_at = ( " +
           "        SELECT MAX(tr2.executed_at) " +
           "        FROM test_results tr2 " +
           "        JOIN test_executions te2 ON tr2.test_execution_id = te2.id " +
           "        WHERE tr2.test_case_id = tr1.test_case_id " +
           "        AND te2.project_id = :projectId " +
           "        AND tr2.executed_at IS NOT NULL " +
           "    ) " +
           ") latest_results ON tc.id = latest_results.test_case_id " +
           "WHERE tc.project_id = :projectId " +
           "GROUP BY COALESCE(latest_results.result, 'NOTRUN')", 
           nativeQuery = true)
    List<Map<String, Object>> findTestCaseStatisticsByProject(@Param("projectId") String projectId);

    /**
     * ICT-129/ICT-130: 프로젝트 기본 통계 조회 (성능 최적화)
     * 테스트케이스, 테스트플랜, 테스트실행 수를 효율적으로 조회
     *
     * @param projectId 프로젝트 ID
     * @return 기본 통계 맵
     */
    @Query(value = "SELECT " +
           "    COUNT(DISTINCT tc.id) as total_test_cases, " +
           "    COUNT(DISTINCT tp.id) as total_test_plans, " +
           "    COUNT(DISTINCT te.id) as total_test_executions, " +
           "    MAX(tr.executed_at) as last_execution_date " +
           "FROM testcases tc " +
           "LEFT JOIN test_plans tp ON tc.project_id = tp.project_id " +
           "LEFT JOIN test_executions te ON tc.project_id = te.project_id " +
           "LEFT JOIN test_results tr ON tc.id = tr.test_case_id " +
           "WHERE tc.project_id = :projectId", 
           nativeQuery = true)
    Map<String, Object> findProjectBasicStatistics(@Param("projectId") String projectId);

    /**
     * ICT-130: 프로젝트 실행 통계 조회 (성능 최적화)
     * 실행된 테스트케이스 수와 실행율을 계산
     *
     * @param projectId 프로젝트 ID
     * @return 실행 통계 맵
     */
    @Query(value = "SELECT " +
           "    COUNT(DISTINCT CASE WHEN tr.executed_at IS NOT NULL THEN tr.test_case_id END) as executed_test_cases " +
           "FROM test_results tr " +
           "JOIN test_executions te ON tr.test_execution_id = te.id " +
           "WHERE te.project_id = :projectId", 
           nativeQuery = true)
    Map<String, Object> findProjectExecutionStatistics(@Param("projectId") String projectId);

    /**
     * ICT-130: 프로젝트 테스트 실행 상태 통계 조회 (성능 최적화)
     *
     * @param projectId 프로젝트 ID
     * @return 테스트 실행 상태별 통계 맵
     */
    @Query(value = "SELECT " +
           "    COUNT(CASE WHEN te.status = 'INPROGRESS' THEN 1 END) as active_test_executions, " +
           "    COUNT(CASE WHEN te.status = 'COMPLETED' THEN 1 END) as completed_test_executions, " +
           "    COUNT(CASE WHEN te.status = 'PAUSED' THEN 1 END) as paused_test_executions " +
           "FROM test_executions te " +
           "WHERE te.project_id = :projectId", 
           nativeQuery = true)
    Map<String, Object> findProjectExecutionStatusStatistics(@Param("projectId") String projectId);

    /**
     * ICT-130: 프로젝트 테스트 결과 통계 조회 (성능 최적화)
     * 최신 테스트 결과 기준으로 상태별 통계 계산
     *
     * @param projectId 프로젝트 ID
     * @return 테스트 결과 통계 맵
     */
    @Query(value = "SELECT " +
           "    COUNT(CASE WHEN latest_results.result = 'PASS' THEN 1 END) as passed_test_cases, " +
           "    COUNT(CASE WHEN latest_results.result = 'FAIL' THEN 1 END) as failed_test_cases, " +
           "    COUNT(CASE WHEN latest_results.result = 'BLOCKED' THEN 1 END) as blocked_test_cases, " +
           "    COUNT(CASE WHEN latest_results.result = 'SKIPPED' THEN 1 END) as skipped_test_cases, " +
           "    COUNT(CASE WHEN latest_results.result IS NULL THEN 1 END) as not_run_test_cases " +
           "FROM testcases tc " +
           "LEFT JOIN ( " +
           "    SELECT tr1.test_case_id, tr1.result " +
           "    FROM test_results tr1 " +
           "    JOIN test_executions te1 ON tr1.test_execution_id = te1.id " +
           "    WHERE te1.project_id = :projectId " +
           "    AND tr1.executed_at = ( " +
           "        SELECT MAX(tr2.executed_at) " +
           "        FROM test_results tr2 " +
           "        JOIN test_executions te2 ON tr2.test_execution_id = te2.id " +
           "        WHERE tr2.test_case_id = tr1.test_case_id " +
           "        AND te2.project_id = :projectId " +
           "        AND tr2.executed_at IS NOT NULL " +
           "    ) " +
           ") latest_results ON tc.id = latest_results.test_case_id " +
           "WHERE tc.project_id = :projectId", 
           nativeQuery = true)
    Map<String, Object> findProjectResultStatistics(@Param("projectId") String projectId);

    /**
     * ICT-130: 프로젝트 우선순위별 통계 조회 (성능 최적화)
     *
     * @param projectId 프로젝트 ID
     * @return 우선순위별 통계 맵
     */
    @Query(value = "SELECT " +
           "    COUNT(CASE WHEN tc.priority = 'HIGH' AND latest_results.result IS NULL THEN 1 END) as active_priority_high_cases, " +
           "    COUNT(CASE WHEN tc.priority = 'MEDIUM' AND latest_results.result IS NULL THEN 1 END) as active_priority_medium_cases, " +
           "    COUNT(CASE WHEN tc.priority = 'LOW' AND latest_results.result IS NULL THEN 1 END) as active_priority_low_cases " +
           "FROM testcases tc " +
           "LEFT JOIN ( " +
           "    SELECT tr1.test_case_id, tr1.result " +
           "    FROM test_results tr1 " +
           "    JOIN test_executions te1 ON tr1.test_execution_id = te1.id " +
           "    WHERE te1.project_id = :projectId " +
           "    AND tr1.executed_at IS NOT NULL " +
           "    AND tr1.executed_at = ( " +
           "        SELECT MAX(tr2.executed_at) " +
           "        FROM test_results tr2 " +
           "        JOIN test_executions te2 ON tr2.test_execution_id = te2.id " +
           "        WHERE tr2.test_case_id = tr1.test_case_id " +
           "        AND te2.project_id = :projectId " +
           "        AND tr2.executed_at IS NOT NULL " +
           "    ) " +
           ") latest_results ON tc.id = latest_results.test_case_id " +
           "WHERE tc.project_id = :projectId", 
           nativeQuery = true)
    Map<String, Object> findProjectPriorityStatistics(@Param("projectId") String projectId);

    /**
     * ICT-130: 레거시 메서드 (호환성 유지)
     * 새로운 분할된 메서드들을 사용하도록 서비스에서 변경 필요
     * 
     * @deprecated 성능 최적화를 위해 분할된 메서드들 사용 권장
     */
    @Deprecated
    default Map<String, Object> findProjectStatistics(String projectId) {
        // 기본 구현은 빈 맵 반환, 서비스에서 새로운 메서드들을 조합해서 사용
        return new java.util.HashMap<>();
    }

    /**
     * ICT-129: 프로젝트의 일일 변화 추이 계산을 위한 어제 실행 수 조회
     *
     * @param projectId 프로젝트 ID
     * @param yesterdayStart 어제 시작 시간
     * @param yesterdayEnd 어제 끝 시간
     * @return 어제 실행된 테스트 수
     */
    @Query(value = "SELECT COUNT(DISTINCT tr.id) " +
           "FROM test_results tr " +
           "JOIN test_executions te ON tr.test_execution_id = te.id " +
           "WHERE te.project_id = :projectId " +
           "AND tr.executed_at BETWEEN :yesterdayStart AND :yesterdayEnd", 
           nativeQuery = true)
    Integer countExecutionsByDateRange(@Param("projectId") String projectId,
                                     @Param("yesterdayStart") LocalDateTime yesterdayStart,
                                     @Param("yesterdayEnd") LocalDateTime yesterdayEnd);

    /**
     * ICT-129: 프로젝트의 최근 7일/30일 평균 통과율 계산
     *
     * @param projectId 프로젝트 ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 기간 내 평균 통과율
     */
    @Query(value = "SELECT " +
           "    CASE WHEN COUNT(tr.id) = 0 THEN 0 " +
           "         ELSE ROUND(COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) * 100.0 / COUNT(tr.id), 2) " +
           "    END as average_pass_rate " +
           "FROM test_results tr " +
           "JOIN test_executions te ON tr.test_execution_id = te.id " +
           "WHERE te.project_id = :projectId " +
           "AND tr.executed_at BETWEEN :startDate AND :endDate " +
           "AND tr.result IS NOT NULL", 
           nativeQuery = true)
    Double calculateAveragePassRateByPeriod(@Param("projectId") String projectId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    /**
     * ICT-129: 프로젝트의 최근 7일 중요 실패 수 조회
     *
     * @param projectId 프로젝트 ID
     * @param startDate 시작 날짜 (7일 전)
     * @param endDate 종료 날짜 (현재)
     * @return 중요 우선순위 테스트케이스의 실패 수
     */
    @Query(value = "SELECT COUNT(tr.id) " +
           "FROM test_results tr " +
           "JOIN test_executions te ON tr.test_execution_id = te.id " +
           "JOIN testcases tc ON tr.test_case_id = tc.id " +
           "WHERE te.project_id = :projectId " +
           "AND tr.executed_at BETWEEN :startDate AND :endDate " +
           "AND tr.result = 'FAIL' " +
           "AND tc.priority = 'HIGH'", 
           nativeQuery = true)
    Integer countCriticalFailuresByPeriod(@Param("projectId") String projectId,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);
}

