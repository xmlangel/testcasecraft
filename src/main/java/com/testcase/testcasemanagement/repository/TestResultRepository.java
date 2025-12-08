// src/main/java/com/testcase/testcasemanagement/repository/TestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.JiraSyncStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
        * @param endDate   종료 날짜
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
                     "ORDER BY CAST(tr.executed_at AS DATE)", nativeQuery = true)
       List<Map<String, Object>> findTestResultsTrendByProject(
                     @Param("projectId") String projectId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

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
                     "GROUP BY COALESCE(latest_results.result, 'NOTRUN')", nativeQuery = true)
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
                     "WHERE tc.project_id = :projectId", nativeQuery = true)
       Map<String, Object> findProjectBasicStatistics(@Param("projectId") String projectId);

       /**
        * ICT-130: 프로젝트 실행 통계 조회 (성능 최적화)
        * 실행된 테스트케이스 수와 실행율을 계산
        *
        * @param projectId 프로젝트 ID
        * @return 실행 통계 맵
        */
       @Query(value = "SELECT " +
                     "    COUNT(DISTINCT CASE WHEN tr.executed_at IS NOT NULL THEN tr.test_case_id END) as executed_test_cases "
                     +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "WHERE te.project_id = :projectId", nativeQuery = true)
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
                     "WHERE te.project_id = :projectId", nativeQuery = true)
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
                     "WHERE tc.project_id = :projectId", nativeQuery = true)
       Map<String, Object> findProjectResultStatistics(@Param("projectId") String projectId);

       /**
        * ICT-130: 프로젝트 우선순위별 통계 조회 (성능 최적화)
        *
        * @param projectId 프로젝트 ID
        * @return 우선순위별 통계 맵
        */
       @Query(value = "SELECT " +
                     "    COUNT(CASE WHEN tc.priority = 'HIGH' AND latest_results.result IS NULL THEN 1 END) as active_priority_high_cases, "
                     +
                     "    COUNT(CASE WHEN tc.priority = 'MEDIUM' AND latest_results.result IS NULL THEN 1 END) as active_priority_medium_cases, "
                     +
                     "    COUNT(CASE WHEN tc.priority = 'LOW' AND latest_results.result IS NULL THEN 1 END) as active_priority_low_cases "
                     +
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
                     "WHERE tc.project_id = :projectId", nativeQuery = true)
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
        * @param projectId      프로젝트 ID
        * @param yesterdayStart 어제 시작 시간
        * @param yesterdayEnd   어제 끝 시간
        * @return 어제 실행된 테스트 수
        */
       @Query(value = "SELECT COUNT(DISTINCT tr.id) " +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "WHERE te.project_id = :projectId " +
                     "AND tr.executed_at BETWEEN :yesterdayStart AND :yesterdayEnd", nativeQuery = true)
       Integer countExecutionsByDateRange(@Param("projectId") String projectId,
                     @Param("yesterdayStart") LocalDateTime yesterdayStart,
                     @Param("yesterdayEnd") LocalDateTime yesterdayEnd);

       /**
        * ICT-129: 프로젝트의 최근 7일/30일 평균 통과율 계산
        *
        * @param projectId 프로젝트 ID
        * @param startDate 시작 날짜
        * @param endDate   종료 날짜
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
                     "AND tr.result IS NOT NULL", nativeQuery = true)
       Double calculateAveragePassRateByPeriod(@Param("projectId") String projectId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       /**
        * ICT-129: 프로젝트의 최근 7일 중요 실패 수 조회
        *
        * @param projectId 프로젝트 ID
        * @param startDate 시작 날짜 (7일 전)
        * @param endDate   종료 날짜 (현재)
        * @return 중요 우선순위 테스트케이스의 실패 수
        */
       @Query(value = "SELECT COUNT(tr.id) " +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "JOIN testcases tc ON tr.test_case_id = tc.id " +
                     "WHERE te.project_id = :projectId " +
                     "AND tr.executed_at BETWEEN :startDate AND :endDate " +
                     "AND tr.result = 'FAIL' " +
                     "AND tc.priority = 'HIGH'", nativeQuery = true)
       Integer countCriticalFailuresByPeriod(@Param("projectId") String projectId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       // ICT-162: JIRA 연동 관련 쿼리 메서드들

       /**
        * JIRA 이슈 키로 테스트 결과 조회
        * 
        * @param jiraIssueKey JIRA 이슈 키
        * @return JIRA 이슈와 연결된 테스트 결과 목록
        */
       List<TestResult> findByJiraIssueKey(String jiraIssueKey);

       /**
        * JIRA 동기화가 필요한 테스트 결과 조회
        * 
        * @param syncStatuses 동기화 상태 목록
        * @param limit        최대 조회 개수
        * @return 동기화가 필요한 테스트 결과 목록
        */
       @Query("SELECT tr FROM TestResult tr " +
                     "WHERE tr.jiraIssueKey IS NOT NULL " +
                     "AND tr.jiraSyncStatus IN :syncStatuses " +
                     "ORDER BY tr.lastJiraSyncAt ASC NULLS FIRST")
       List<TestResult> findBySyncStatusIn(@Param("syncStatuses") List<JiraSyncStatus> syncStatuses, Pageable pageable);

       /**
        * 특정 프로젝트의 JIRA 동기화가 필요한 테스트 결과 조회
        * 
        * @param projectId    프로젝트 ID
        * @param syncStatuses 동기화 상태 목록
        * @return 동기화가 필요한 테스트 결과 목록
        */
       @Query("SELECT tr FROM TestResult tr " +
                     "JOIN tr.testExecution te " +
                     "WHERE te.project.id = :projectId " +
                     "AND tr.jiraIssueKey IS NOT NULL " +
                     "AND tr.jiraSyncStatus IN :syncStatuses " +
                     "ORDER BY tr.lastJiraSyncAt ASC NULLS FIRST")
       List<TestResult> findByProjectAndSyncStatusIn(@Param("projectId") String projectId,
                     @Param("syncStatuses") List<JiraSyncStatus> syncStatuses);

       /**
        * JIRA 동기화 실패한 테스트 결과 조회 (재시도 대상)
        * 
        * @param retryAfter 재시도 시간 기준 (이 시간 이전에 실패한 것들만 조회)
        * @return 재시도 대상 테스트 결과 목록
        */
       @Query("SELECT tr FROM TestResult tr " +
                     "WHERE tr.jiraIssueKey IS NOT NULL " +
                     "AND tr.jiraSyncStatus = 'FAILED' " +
                     "AND (tr.lastJiraSyncAt IS NULL OR tr.lastJiraSyncAt < :retryAfter) " +
                     "ORDER BY tr.lastJiraSyncAt ASC NULLS FIRST")
       List<TestResult> findFailedSyncsForRetry(@Param("retryAfter") LocalDateTime retryAfter, Pageable pageable);

       /**
        * JIRA 동기화 상태별 통계 조회
        * 
        * @param projectId 프로젝트 ID (null이면 전체 프로젝트)
        * @return 동기화 상태별 통계
        */
       @Query(value = "SELECT " +
                     "    COALESCE(tr.jira_sync_status, 'NOT_SYNCED') as sync_status, " +
                     "    COUNT(*) as count " +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "WHERE tr.jira_issue_key IS NOT NULL " +
                     "AND (:projectId IS NULL OR te.project_id = :projectId) " +
                     "GROUP BY COALESCE(tr.jira_sync_status, 'NOT_SYNCED')", nativeQuery = true)
       List<Map<String, Object>> findJiraSyncStatusStatistics(@Param("projectId") String projectId);

       /**
        * 오래된 JIRA 동기화 진행 중 상태 조회 (데드락 방지용)
        * 
        * @param timeoutMinutes 타임아웃 시간(분)
        * @return 타임아웃된 진행 중 상태의 테스트 결과 목록
        */
       @Query("SELECT tr FROM TestResult tr " +
                     "WHERE tr.jiraSyncStatus = 'IN_PROGRESS' " +
                     "AND tr.lastJiraSyncAt < :timeoutTime")
       List<TestResult> findTimedOutInProgressSyncs(@Param("timeoutTime") LocalDateTime timeoutTime);

       /**
        * JIRA 동기화 상태 일괄 업데이트
        * 
        * @param ids          테스트 결과 ID 목록
        * @param status       새로운 동기화 상태
        * @param errorMessage 오류 메시지 (실패 시)
        */
       @Modifying
       @Query("UPDATE TestResult tr SET " +
                     "tr.jiraSyncStatus = :status, " +
                     "tr.lastJiraSyncAt = CURRENT_TIMESTAMP, " +
                     "tr.jiraSyncError = :errorMessage " +
                     "WHERE tr.id IN :ids")
       void updateJiraSyncStatus(@Param("ids") List<String> ids,
                     @Param("status") JiraSyncStatus status,
                     @Param("errorMessage") String errorMessage);

       /**
        * JIRA 동기화 성공 일괄 업데이트
        * 
        * @param ids       테스트 결과 ID 목록
        * @param commentId JIRA 코멘트 ID
        */
       @Modifying
       @Query("UPDATE TestResult tr SET " +
                     "tr.jiraSyncStatus = 'SYNCED', " +
                     "tr.lastJiraSyncAt = CURRENT_TIMESTAMP, " +
                     "tr.jiraSyncError = NULL, " +
                     "tr.jiraCommentId = :commentId " +
                     "WHERE tr.id IN :ids")
       void markJiraSyncSuccess(@Param("ids") List<String> ids, @Param("commentId") String commentId);

       /**
        * 특정 JIRA 이슈에 연결된 최근 테스트 결과 조회
        * 
        * @param jiraIssueKey JIRA 이슈 키
        * @param limit        최대 조회 개수
        * @return 최근 테스트 결과 목록
        */
       @Query("SELECT tr FROM TestResult tr " +
                     "WHERE tr.jiraIssueKey = :jiraIssueKey " +
                     "AND tr.executedAt IS NOT NULL " +
                     "ORDER BY tr.executedAt DESC")
       List<TestResult> findRecentResultsByJiraIssue(@Param("jiraIssueKey") String jiraIssueKey, Pageable pageable);

       /**
        * ICT-247: 테스트 플랜-실행별 테스트케이스 통계 조회 (개선된 버전)
        * 각 테스트 플랜과 실행 조합 내에서 테스트케이스별 최신 결과를 기준으로 통계를 계산합니다.
        *
        * @param projectId 프로젝트 ID
        * @return 테스트 플랜-실행별 상태별 통계 맵 (result, count, test_plan_id, test_execution_id)
        */
       @Query(value = "WITH latest_results_by_plan_execution AS ( " +
                     "    SELECT " +
                     "        tc.id as test_case_id, " +
                     "        tp.id as test_plan_id, " +
                     "        te.id as test_execution_id, " +
                     "        tr.result, " +
                     "        ROW_NUMBER() OVER ( " +
                     "            PARTITION BY tc.id, tp.id, te.id " +
                     "            ORDER BY tr.executed_at DESC " +
                     "        ) as rn " +
                     "    FROM testcases tc " +
                     "    LEFT JOIN test_plans tp ON tp.project_id = tc.project_id " +
                     "    LEFT JOIN test_executions te ON te.test_plan_id = tp.id " +
                     "    LEFT JOIN test_results tr ON tr.test_case_id = tc.id AND tr.test_execution_id = te.id " +
                     "    WHERE tc.project_id = :projectId " +
                     "    AND tr.executed_at IS NOT NULL " +
                     ") " +
                     "SELECT " +
                     "    COALESCE(lr.result, 'NOTRUN') as result, " +
                     "    COUNT(*) as count, " +
                     "    lr.test_plan_id, " +
                     "    lr.test_execution_id " +
                     "FROM latest_results_by_plan_execution lr " +
                     "WHERE lr.rn = 1 OR lr.result IS NULL " +
                     "GROUP BY COALESCE(lr.result, 'NOTRUN'), lr.test_plan_id, lr.test_execution_id " +
                     "ORDER BY lr.test_plan_id, lr.test_execution_id, result", nativeQuery = true)
       List<Map<String, Object>> findTestCaseStatisticsByPlanAndExecution(@Param("projectId") String projectId);

       /**
        * ICT-247: 테스트 플랜-실행별 집계된 전체 통계 조회 (기존 API 호환성 유지)
        * 플랜-실행별 통계를 집계하여 전체 프로젝트 통계를 제공합니다.
        *
        * @param projectId 프로젝트 ID
        * @return 집계된 상태별 통계 맵 (result, count)
        */
       @Query(value = "WITH latest_results_by_plan_execution AS ( " +
                     "    SELECT " +
                     "        tc.id as test_case_id, " +
                     "        tp.id as test_plan_id, " +
                     "        te.id as test_execution_id, " +
                     "        tr.result, " +
                     "        ROW_NUMBER() OVER ( " +
                     "            PARTITION BY tc.id, tp.id, te.id " +
                     "            ORDER BY tr.executed_at DESC " +
                     "        ) as rn " +
                     "    FROM testcases tc " +
                     "    LEFT JOIN test_plans tp ON tp.project_id = tc.project_id " +
                     "    LEFT JOIN test_executions te ON te.test_plan_id = tp.id " +
                     "    LEFT JOIN test_results tr ON tr.test_case_id = tc.id AND tr.test_execution_id = te.id " +
                     "    WHERE tc.project_id = :projectId " +
                     "    AND tr.executed_at IS NOT NULL " +
                     "), " +
                     "aggregated_stats AS ( " +
                     "    SELECT " +
                     "        tc.id as test_case_id, " +
                     "        COALESCE(lr.result, 'NOTRUN') as final_result " +
                     "    FROM testcases tc " +
                     "    LEFT JOIN latest_results_by_plan_execution lr ON lr.test_case_id = tc.id AND lr.rn = 1 " +
                     "    WHERE tc.project_id = :projectId " +
                     ") " +
                     "SELECT " +
                     "    final_result as result, " +
                     "    COUNT(*) as count " +
                     "FROM aggregated_stats " +
                     "GROUP BY final_result " +
                     "ORDER BY final_result", nativeQuery = true)
       List<Map<String, Object>> findTestCaseStatisticsByProjectImproved(@Param("projectId") String projectId);

       /**
        * ICT-189: JIRA 이슈 키로 테스트 결과 조회 (실행 시간 기준 내림차순)
        * 
        * @param jiraIssueKey JIRA 이슈 키
        * @return JIRA 이슈와 연결된 테스트 결과 목록 (최신순)
        */
       List<TestResult> findByJiraIssueKeyOrderByExecutedAtDesc(String jiraIssueKey);

       /**
        * ICT-189: 프로젝트의 JIRA 이슈 키가 있는 테스트 결과 조회
        * 
        * @param projectId 프로젝트 ID
        * @return JIRA 이슈 키가 설정된 테스트 결과 목록
        */
       @Query("SELECT tr FROM TestResult tr " +
                     "JOIN tr.testExecution te " +
                     "WHERE te.project.id = :projectId " +
                     "AND tr.jiraIssueKey IS NOT NULL " +
                     "AND tr.jiraIssueKey != ''")
       List<TestResult> findByProjectIdAndJiraIssueKeyIsNotNull(@Param("projectId") String projectId);

       /**
        * 지정된 JIRA 이슈 키 목록과 연결된 테스트 결과 조회
        * 
        * @param jiraIssueKeys JIRA 이슈 키 목록
        * @return 매칭되는 테스트 결과 목록
        */
       List<TestResult> findByJiraIssueKeyIn(List<String> jiraIssueKeys);

       // ICT-208: 테스트 결과 조회 및 통계 API를 위한 추가 쿼리 메서드들

       /**
        * 결과 상태별 테스트 개수 조회
        * 
        * @param result 테스트 결과 상태
        * @return 해당 상태의 테스트 개수
        */
       long countByResult(String result);

       /**
        * 프로젝트 및 결과 상태별 테스트 개수 조회
        * 
        * @param result    테스트 결과 상태
        * @param projectId 프로젝트 ID
        * @return 해당 프로젝트의 특정 상태 테스트 개수
        */
       @Query("SELECT COUNT(tr) FROM TestResult tr " +
                     "JOIN tr.testExecution te " +
                     "WHERE tr.result = :result " +
                     "AND te.project.id = :projectId")
       long countByResultAndProjectId(@Param("result") String result, @Param("projectId") String projectId);

       /**
        * 실행자별 테스트 결과 통계 조회
        * 
        * @param projectId 프로젝트 ID
        * @return 실행자별 통계 맵
        */
       @Query(value = "SELECT " +
                     "    u.id as executor_id, " +
                     "    u.username as executor_name, " +
                     "    COUNT(tr.id) as total_assigned, " +
                     "    COUNT(CASE WHEN tr.executedAt IS NOT NULL THEN 1 END) as completed, " +
                     "    COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) as passed, " +
                     "    COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as failed " +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "JOIN users u ON tr.executed_by = u.id " +
                     "WHERE te.project_id = :projectId " +
                     "GROUP BY u.id, u.username " +
                     "ORDER BY total_assigned DESC", nativeQuery = true)
       List<Map<String, Object>> findExecutorStatisticsByProject(@Param("projectId") String projectId);

       /**
        * 최근 N일간 일별 테스트 실행 통계 조회
        * 
        * @param projectId 프로젝트 ID
        * @param startDate 시작 날짜
        * @param endDate   종료 날짜
        * @return 일별 실행 통계 맵
        */
       @Query(value = "SELECT " +
                     "    CAST(tr.executed_at AS DATE) as execution_date, " +
                     "    COUNT(tr.id) as tests_executed, " +
                     "    COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) as tests_passed, " +
                     "    COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as tests_failed, " +
                     "    AVG(EXTRACT(EPOCH FROM (tr.executed_at - te.started_at))) as avg_execution_time " +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "WHERE te.project_id = :projectId " +
                     "AND tr.executed_at BETWEEN :startDate AND :endDate " +
                     "GROUP BY CAST(tr.executed_at AS DATE) " +
                     "ORDER BY CAST(tr.executed_at AS DATE)", nativeQuery = true)
       List<Map<String, Object>> findDailyExecutionStatistics(
                     @Param("projectId") String projectId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Modifying
       @Query(value = "DELETE FROM test_results WHERE test_execution_id IN " +
                     "(SELECT id FROM test_executions WHERE project_id = :projectId)", nativeQuery = true)
       void deleteByProjectId(@Param("projectId") String projectId);

       /**
        * 플랜별 테스트 결과 통계 조회 (View Type: By Plan)
        * 
        * @param projectId 프로젝트 ID
        * @return 플랜별 통계 맵
        */
       @Query(value = "SELECT " +
                     "    tp.name as test_plan_name, " +
                     "    COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) as pass_count, " +
                     "    COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as fail_count, " +
                     "    COUNT(CASE WHEN tr.result = 'BLOCKED' THEN 1 END) as blocked_count, " +
                     "    COUNT(CASE WHEN tr.result IS NULL OR tr.result = 'NOT_RUN' THEN 1 END) as not_run_count " +
                     "FROM test_plans tp " +
                     "LEFT JOIN test_executions te ON te.test_plan_id = tp.id " +
                     "LEFT JOIN test_results tr ON tr.test_execution_id = te.id " +
                     "WHERE tp.project_id = :projectId " +
                     "GROUP BY tp.id, tp.name " +
                     "HAVING COUNT(tr.id) > 0 " +
                     "ORDER BY tp.name", nativeQuery = true)
       List<Map<String, Object>> findStatisticsByTestPlan(@Param("projectId") String projectId);

       /**
        * 실행자별 테스트 결과 통계 조회 (View Type: By Executor)
        * 
        * @param projectId 프로젝트 ID
        * @return 실행자별 통계 맵
        */
       @Query(value = "SELECT " +
                     "    COALESCE(u.username, 'Unassigned') as executor_name, " +
                     "    COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) as pass_count, " +
                     "    COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as fail_count, " +
                     "    COUNT(CASE WHEN tr.result = 'BLOCKED' THEN 1 END) as blocked_count, " +
                     "    COUNT(CASE WHEN tr.result IS NULL OR tr.result = 'NOT_RUN' THEN 1 END) as not_run_count " +
                     "FROM test_results tr " +
                     "JOIN test_executions te ON tr.test_execution_id = te.id " +
                     "LEFT JOIN users u ON tr.executed_by = u.id " +
                     "WHERE te.project_id = :projectId " +
                     "AND tr.executed_at IS NOT NULL " +
                     "GROUP BY COALESCE(u.username, 'Unassigned') " +
                     "ORDER BY executor_name", nativeQuery = true)
       List<Map<String, Object>> findStatisticsByExecutor(@Param("projectId") String projectId);
}
