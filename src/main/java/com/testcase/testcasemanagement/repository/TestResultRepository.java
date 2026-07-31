// src/main/java/com/testcase/testcasemanagement/repository/TestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JiraSyncStatus;
import com.testcase.testcasemanagement.model.TestResult;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestResultRepository extends JpaRepository<TestResult, String> {
  List<TestResult> findByTestCaseId(String testCaseId);

  /**
   * 여러 테스트케이스 ID에 연결된 모든 테스트 결과 조회. 크로스 프로젝트 이동 시 옮길 결과 집합을 한 번에 모으는 용도.
   *
   * @param testCaseIds 테스트케이스 ID 목록
   * @return 해당 케이스들에 연결된 테스트 결과 목록
   */
  List<TestResult> findByTestCaseIdIn(java.util.Collection<String> testCaseIds);

  @Query(
      "SELECT tr FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "JOIN te.project p "
          + "WHERE p.id = :projectId "
          + "AND tr.executedAt IS NOT NULL "
          + "ORDER BY tr.executedAt DESC")
  List<TestResult> findRecentTestResultsByProject(
      @Param("projectId") String projectId, Pageable pageable);

  @Query(
      "SELECT tr FROM TestResult tr "
          + "WHERE tr.executedAt IS NOT NULL "
          + "ORDER BY tr.executedAt DESC")
  List<TestResult> findRecentTestResults(Pageable pageable);

  @Query(
      "SELECT tr FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "WHERE te.testPlanId = :testPlanId "
          + "AND tr.executedAt IS NOT NULL "
          + "ORDER BY tr.executedAt DESC")
  List<TestResult> findRecentTestResultsByTestPlan(
      @Param("testPlanId") String testPlanId, Pageable pageable);

  /**
   * 오픈 테스트런(INPROGRESS 상태)의 모든 테스트 결과 조회
   *
   * @param projectId 프로젝트 ID
   * @return 오픈 테스트런의 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "JOIN te.project p "
          + "WHERE p.id = :projectId "
          + "AND te.status = 'INPROGRESS'")
  List<TestResult> findByOpenTestRunsInProject(@Param("projectId") String projectId);

  /**
   * 전체 오픈 테스트런(INPROGRESS 상태)의 모든 테스트 결과 조회
   *
   * @return 오픈 테스트런의 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "WHERE te.status = 'INPROGRESS'")
  List<TestResult> findByOpenTestRuns();

  /**
   * 프로젝트의 날짜별 테스트 결과 추이 조회 (집계 데이터) 지정된 기간 내의 날짜별 테스트 결과 통계를 조회합니다.
   *
   * @param projectId 프로젝트 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @return 날짜별 결과 상태별 개수 맵 (date, result, count)
   */
  @Query(
      value =
          "SELECT "
              + "    CAST(tr.executed_at AS DATE) as date, "
              + "    tr.result as result, "
              + "    COUNT(*) as count "
              + "FROM test_results tr "
              + "JOIN test_executions te ON tr.test_execution_id = te.id "
              + "WHERE te.project_id = :projectId "
              + "AND tr.executed_at BETWEEN :startDate AND :endDate "
              + "GROUP BY CAST(tr.executed_at AS DATE), tr.result "
              + "ORDER BY CAST(tr.executed_at AS DATE)",
      nativeQuery = true)
  List<Map<String, Object>> findTestResultsTrendByProject(
      @Param("projectId") String projectId,
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  /**
   * 프로젝트의 테스트케이스 상태별 통계 조회 각 테스트케이스의 최신 결과 상태를 기준으로 통계를 계산합니다.
   *
   * @param projectId 프로젝트 ID
   * @return 상태별 통계 맵 (result, count)
   */
  @Query(
      value =
          "SELECT "
              + "    COALESCE(latest_results.result, 'NOTRUN') as result, "
              + "    COUNT(*) as count "
              + "FROM testcases tc "
              + "LEFT JOIN ( "
              + "    SELECT tr1.test_case_id, tr1.result "
              + "    FROM test_results tr1 "
              + "    JOIN test_executions te1 ON tr1.test_execution_id = te1.id "
              + "    WHERE te1.project_id = :projectId "
              + "    AND tr1.executed_at = ( "
              + "        SELECT MAX(tr2.executed_at) "
              + "        FROM test_results tr2 "
              + "        JOIN test_executions te2 ON tr2.test_execution_id = te2.id "
              + "        WHERE tr2.test_case_id = tr1.test_case_id "
              + "        AND te2.project_id = :projectId "
              + "        AND tr2.executed_at IS NOT NULL "
              + "    ) "
              + ") latest_results ON tc.id = latest_results.test_case_id "
              + "WHERE tc.project_id = :projectId "
              + "GROUP BY COALESCE(latest_results.result, 'NOTRUN')",
      nativeQuery = true)
  List<Map<String, Object>> findTestCaseStatisticsByProject(@Param("projectId") String projectId);

  /**
   * ICT-129/ICT-130: 프로젝트 기본 통계 조회 (성능 최적화) 테스트케이스, 테스트플랜, 테스트실행 수를 효율적으로 조회
   *
   * @param projectId 프로젝트 ID
   * @return 기본 통계 맵
   */
  @Query(
      value =
          "SELECT "
              + "    COUNT(DISTINCT tc.id) as total_test_cases, "
              + "    COUNT(DISTINCT tp.id) as total_test_plans, "
              + "    COUNT(DISTINCT te.id) as total_test_executions, "
              + "    MAX(tr.executed_at) as last_execution_date "
              + "FROM testcases tc "
              + "LEFT JOIN test_plans tp ON tc.project_id = tp.project_id "
              + "LEFT JOIN test_executions te ON tc.project_id = te.project_id "
              + "LEFT JOIN test_results tr ON tc.id = tr.test_case_id "
              + "WHERE tc.project_id = :projectId",
      nativeQuery = true)
  Map<String, Object> findProjectBasicStatistics(@Param("projectId") String projectId);

  /**
   * ICT-130: 프로젝트 실행 통계 조회 (성능 최적화) 실행된 테스트케이스 수와 실행율을 계산
   *
   * @param projectId 프로젝트 ID
   * @return 실행 통계 맵
   */
  @Query(
      value =
          "SELECT     COUNT(DISTINCT CASE WHEN tr.executed_at IS NOT NULL THEN tr.test_case_id END)"
              + " as executed_test_cases FROM test_results tr JOIN test_executions te ON"
              + " tr.test_execution_id = te.id WHERE te.project_id = :projectId",
      nativeQuery = true)
  Map<String, Object> findProjectExecutionStatistics(@Param("projectId") String projectId);

  /**
   * ICT-130: 프로젝트 테스트 실행 상태 통계 조회 (성능 최적화)
   *
   * @param projectId 프로젝트 ID
   * @return 테스트 실행 상태별 통계 맵
   */
  @Query(
      value =
          "SELECT     COUNT(CASE WHEN te.status = 'INPROGRESS' THEN 1 END) as"
              + " active_test_executions,     COUNT(CASE WHEN te.status = 'COMPLETED' THEN 1 END)"
              + " as completed_test_executions,     COUNT(CASE WHEN te.status = 'PAUSED' THEN 1"
              + " END) as paused_test_executions FROM test_executions te WHERE te.project_id ="
              + " :projectId",
      nativeQuery = true)
  Map<String, Object> findProjectExecutionStatusStatistics(@Param("projectId") String projectId);

  /**
   * ICT-130: 프로젝트 테스트 결과 통계 조회 (성능 최적화) 최신 테스트 결과 기준으로 상태별 통계 계산
   *
   * @param projectId 프로젝트 ID
   * @return 테스트 결과 통계 맵
   */
  @Query(
      value =
          "SELECT     COUNT(CASE WHEN latest_results.result = 'PASS' THEN 1 END) as"
              + " passed_test_cases,     COUNT(CASE WHEN latest_results.result = 'FAIL' THEN 1 END)"
              + " as failed_test_cases,     COUNT(CASE WHEN latest_results.result = 'BLOCKED' THEN"
              + " 1 END) as blocked_test_cases,     COUNT(CASE WHEN latest_results.result ="
              + " 'SKIPPED' THEN 1 END) as skipped_test_cases,     COUNT(CASE WHEN"
              + " latest_results.result IS NULL THEN 1 END) as not_run_test_cases FROM testcases tc"
              + " LEFT JOIN (     SELECT tr1.test_case_id, tr1.result     FROM test_results tr1    "
              + " JOIN test_executions te1 ON tr1.test_execution_id = te1.id     WHERE"
              + " te1.project_id = :projectId     AND tr1.executed_at = (         SELECT"
              + " MAX(tr2.executed_at)         FROM test_results tr2         JOIN test_executions"
              + " te2 ON tr2.test_execution_id = te2.id         WHERE tr2.test_case_id ="
              + " tr1.test_case_id         AND te2.project_id = :projectId         AND"
              + " tr2.executed_at IS NOT NULL     ) ) latest_results ON tc.id ="
              + " latest_results.test_case_id WHERE tc.project_id = :projectId",
      nativeQuery = true)
  Map<String, Object> findProjectResultStatistics(@Param("projectId") String projectId);

  /**
   * ICT-130: 프로젝트 우선순위별 통계 조회 (성능 최적화)
   *
   * @param projectId 프로젝트 ID
   * @return 우선순위별 통계 맵
   */
  @Query(
      value =
          "SELECT     COUNT(CASE WHEN tc.priority = 'HIGH' AND latest_results.result IS NULL THEN 1"
              + " END) as active_priority_high_cases,     COUNT(CASE WHEN tc.priority = 'MEDIUM'"
              + " AND latest_results.result IS NULL THEN 1 END) as active_priority_medium_cases,   "
              + "  COUNT(CASE WHEN tc.priority = 'LOW' AND latest_results.result IS NULL THEN 1"
              + " END) as active_priority_low_cases FROM testcases tc LEFT JOIN (     SELECT"
              + " tr1.test_case_id, tr1.result     FROM test_results tr1     JOIN test_executions"
              + " te1 ON tr1.test_execution_id = te1.id     WHERE te1.project_id = :projectId    "
              + " AND tr1.executed_at IS NOT NULL     AND tr1.executed_at = (         SELECT"
              + " MAX(tr2.executed_at)         FROM test_results tr2         JOIN test_executions"
              + " te2 ON tr2.test_execution_id = te2.id         WHERE tr2.test_case_id ="
              + " tr1.test_case_id         AND te2.project_id = :projectId         AND"
              + " tr2.executed_at IS NOT NULL     ) ) latest_results ON tc.id ="
              + " latest_results.test_case_id WHERE tc.project_id = :projectId",
      nativeQuery = true)
  Map<String, Object> findProjectPriorityStatistics(@Param("projectId") String projectId);

  /**
   * ICT-130: 레거시 메서드 (호환성 유지) 새로운 분할된 메서드들을 사용하도록 서비스에서 변경 필요
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
  @Query(
      value =
          "SELECT COUNT(DISTINCT tr.id) "
              + "FROM test_results tr "
              + "JOIN test_executions te ON tr.test_execution_id = te.id "
              + "WHERE te.project_id = :projectId "
              + "AND tr.executed_at BETWEEN :yesterdayStart AND :yesterdayEnd",
      nativeQuery = true)
  Integer countExecutionsByDateRange(
      @Param("projectId") String projectId,
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
  @Query(
      value =
          "SELECT     CASE WHEN COUNT(tr.id) = 0 THEN 0          ELSE ROUND(COUNT(CASE WHEN"
              + " tr.result = 'PASS' THEN 1 END) * 100.0 / COUNT(tr.id), 2)     END as"
              + " average_pass_rate FROM test_results tr JOIN test_executions te ON"
              + " tr.test_execution_id = te.id WHERE te.project_id = :projectId AND tr.executed_at"
              + " BETWEEN :startDate AND :endDate AND tr.result IS NOT NULL",
      nativeQuery = true)
  Double calculateAveragePassRateByPeriod(
      @Param("projectId") String projectId,
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
  @Query(
      value =
          "SELECT COUNT(tr.id) "
              + "FROM test_results tr "
              + "JOIN test_executions te ON tr.test_execution_id = te.id "
              + "JOIN testcases tc ON tr.test_case_id = tc.id "
              + "WHERE te.project_id = :projectId "
              + "AND tr.executed_at BETWEEN :startDate AND :endDate "
              + "AND tr.result = 'FAIL' "
              + "AND tc.priority = 'HIGH'",
      nativeQuery = true)
  Integer countCriticalFailuresByPeriod(
      @Param("projectId") String projectId,
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
   * @param limit 최대 조회 개수
   * @return 동기화가 필요한 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "WHERE tr.jiraIssueKey IS NOT NULL "
          + "AND tr.jiraSyncStatus IN :syncStatuses "
          + "ORDER BY tr.lastJiraSyncAt ASC NULLS FIRST")
  List<TestResult> findBySyncStatusIn(
      @Param("syncStatuses") List<JiraSyncStatus> syncStatuses, Pageable pageable);

  /**
   * 특정 프로젝트의 JIRA 동기화가 필요한 테스트 결과 조회
   *
   * @param projectId 프로젝트 ID
   * @param syncStatuses 동기화 상태 목록
   * @return 동기화가 필요한 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "WHERE te.project.id = :projectId "
          + "AND tr.jiraIssueKey IS NOT NULL "
          + "AND tr.jiraSyncStatus IN :syncStatuses "
          + "ORDER BY tr.lastJiraSyncAt ASC NULLS FIRST")
  List<TestResult> findByProjectAndSyncStatusIn(
      @Param("projectId") String projectId,
      @Param("syncStatuses") List<JiraSyncStatus> syncStatuses);

  /**
   * JIRA 동기화 실패한 테스트 결과 조회 (재시도 대상)
   *
   * @param retryAfter 재시도 시간 기준 (이 시간 이전에 실패한 것들만 조회)
   * @return 재시도 대상 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "WHERE tr.jiraIssueKey IS NOT NULL "
          + "AND tr.jiraSyncStatus = 'FAILED' "
          + "AND (tr.lastJiraSyncAt IS NULL OR tr.lastJiraSyncAt < :retryAfter) "
          + "ORDER BY tr.lastJiraSyncAt ASC NULLS FIRST")
  List<TestResult> findFailedSyncsForRetry(
      @Param("retryAfter") LocalDateTime retryAfter, Pageable pageable);

  /**
   * JIRA 동기화 상태별 통계 조회
   *
   * @param projectId 프로젝트 ID (null이면 전체 프로젝트)
   * @return 동기화 상태별 통계
   */
  @Query(
      value =
          "SELECT "
              + "    COALESCE(tr.jira_sync_status, 'NOT_SYNCED') as sync_status, "
              + "    COUNT(*) as count "
              + "FROM test_results tr "
              + "JOIN test_executions te ON tr.test_execution_id = te.id "
              + "WHERE tr.jira_issue_key IS NOT NULL "
              + "AND (:projectId IS NULL OR te.project_id = :projectId) "
              + "GROUP BY COALESCE(tr.jira_sync_status, 'NOT_SYNCED')",
      nativeQuery = true)
  List<Map<String, Object>> findJiraSyncStatusStatistics(@Param("projectId") String projectId);

  /**
   * 오래된 JIRA 동기화 진행 중 상태 조회 (데드락 방지용)
   *
   * @param timeoutMinutes 타임아웃 시간(분)
   * @return 타임아웃된 진행 중 상태의 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "WHERE tr.jiraSyncStatus = 'IN_PROGRESS' "
          + "AND tr.lastJiraSyncAt < :timeoutTime")
  List<TestResult> findTimedOutInProgressSyncs(@Param("timeoutTime") LocalDateTime timeoutTime);

  /**
   * JIRA 동기화 상태 일괄 업데이트
   *
   * @param ids 테스트 결과 ID 목록
   * @param status 새로운 동기화 상태
   * @param errorMessage 오류 메시지 (실패 시)
   */
  @Modifying
  @Query(
      "UPDATE TestResult tr SET "
          + "tr.jiraSyncStatus = :status, "
          + "tr.lastJiraSyncAt = CURRENT_TIMESTAMP, "
          + "tr.jiraSyncError = :errorMessage "
          + "WHERE tr.id IN :ids")
  void updateJiraSyncStatus(
      @Param("ids") List<String> ids,
      @Param("status") JiraSyncStatus status,
      @Param("errorMessage") String errorMessage);

  /**
   * JIRA 동기화 성공 일괄 업데이트
   *
   * @param ids 테스트 결과 ID 목록
   * @param commentId JIRA 코멘트 ID
   */
  @Modifying
  @Query(
      "UPDATE TestResult tr SET "
          + "tr.jiraSyncStatus = 'SYNCED', "
          + "tr.lastJiraSyncAt = CURRENT_TIMESTAMP, "
          + "tr.jiraSyncError = NULL, "
          + "tr.jiraCommentId = :commentId "
          + "WHERE tr.id IN :ids")
  void markJiraSyncSuccess(@Param("ids") List<String> ids, @Param("commentId") String commentId);

  /**
   * 특정 JIRA 이슈에 연결된 최근 테스트 결과 조회
   *
   * @param jiraIssueKey JIRA 이슈 키
   * @param limit 최대 조회 개수
   * @return 최근 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "WHERE tr.jiraIssueKey = :jiraIssueKey "
          + "AND tr.executedAt IS NOT NULL "
          + "ORDER BY tr.executedAt DESC")
  List<TestResult> findRecentResultsByJiraIssue(
      @Param("jiraIssueKey") String jiraIssueKey, Pageable pageable);

  /**
   * ICT-247: 테스트 플랜-실행별 테스트케이스 통계 조회 (개선된 버전) 각 테스트 플랜과 실행 조합 내에서 테스트케이스별 최신 결과를 기준으로 통계를 계산합니다.
   *
   * @param projectId 프로젝트 ID
   * @return 테스트 플랜-실행별 상태별 통계 맵 (result, count, test_plan_id, test_execution_id)
   */
  @Query(
      value =
          "WITH latest_results_by_plan_execution AS (     SELECT         tc.id as test_case_id,    "
              + "     tp.id as test_plan_id,         te.id as test_execution_id,         tr.result,"
              + "         ROW_NUMBER() OVER (             PARTITION BY tc.id, tp.id, te.id         "
              + "    ORDER BY tr.executed_at DESC         ) as rn     FROM testcases tc     LEFT"
              + " JOIN test_plans tp ON tp.project_id = tc.project_id     LEFT JOIN test_executions"
              + " te ON te.test_plan_id = tp.id     LEFT JOIN test_results tr ON tr.test_case_id ="
              + " tc.id AND tr.test_execution_id = te.id     WHERE tc.project_id = :projectId    "
              + " AND tr.executed_at IS NOT NULL ) SELECT     COALESCE(lr.result, 'NOTRUN') as"
              + " result,     COUNT(*) as count,     lr.test_plan_id,     lr.test_execution_id FROM"
              + " latest_results_by_plan_execution lr WHERE lr.rn = 1 OR lr.result IS NULL GROUP BY"
              + " COALESCE(lr.result, 'NOTRUN'), lr.test_plan_id, lr.test_execution_id ORDER BY"
              + " lr.test_plan_id, lr.test_execution_id, result",
      nativeQuery = true)
  List<Map<String, Object>> findTestCaseStatisticsByPlanAndExecution(
      @Param("projectId") String projectId);

  /**
   * ICT-247: 테스트 플랜-실행별 집계된 전체 통계 조회 (기존 API 호환성 유지) 플랜-실행별 통계를 집계하여 전체 프로젝트 통계를 제공합니다.
   *
   * @param projectId 프로젝트 ID
   * @return 집계된 상태별 통계 맵 (result, count)
   */
  @Query(
      value =
          "WITH latest_results_by_plan_execution AS (     SELECT         tc.id as test_case_id,    "
              + "     tp.id as test_plan_id,         te.id as test_execution_id,         tr.result,"
              + "         ROW_NUMBER() OVER (             PARTITION BY tc.id, tp.id, te.id         "
              + "    ORDER BY tr.executed_at DESC         ) as rn     FROM testcases tc     LEFT"
              + " JOIN test_plans tp ON tp.project_id = tc.project_id     LEFT JOIN test_executions"
              + " te ON te.test_plan_id = tp.id     LEFT JOIN test_results tr ON tr.test_case_id ="
              + " tc.id AND tr.test_execution_id = te.id     WHERE tc.project_id = :projectId    "
              + " AND tr.executed_at IS NOT NULL ), aggregated_stats AS (     SELECT         tc.id"
              + " as test_case_id,         COALESCE(lr.result, 'NOTRUN') as final_result     FROM"
              + " testcases tc     LEFT JOIN latest_results_by_plan_execution lr ON lr.test_case_id"
              + " = tc.id AND lr.rn = 1     WHERE tc.project_id = :projectId ) SELECT    "
              + " final_result as result,     COUNT(*) as count FROM aggregated_stats GROUP BY"
              + " final_result ORDER BY final_result",
      nativeQuery = true)
  List<Map<String, Object>> findTestCaseStatisticsByProjectImproved(
      @Param("projectId") String projectId);

  /**
   * ICT-189: JIRA 이슈 키로 테스트 결과 조회 (실행 시간 기준 내림차순)
   *
   * <p>jiraIssueKey 컬럼은 여러 키를 쉼표로 연결해 저장하므로(예: "ONT-1086,ONT-904"), 정확 일치(=)가 아니라 콤마 멤버 매칭으로 조회한다.
   * 양끝에 콤마를 덧붙여 부분 키(ONT-10 vs ONT-1086) 오매칭을 방지한다.
   *
   * @param jiraIssueKey 단일 JIRA 이슈 키 (예: "ONT-1086")
   * @return JIRA 이슈와 연결된 테스트 결과 목록 (최신순)
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "WHERE CONCAT(',', tr.jiraIssueKey, ',') LIKE CONCAT('%,', :jiraIssueKey, ',%') "
          + "ORDER BY tr.executedAt DESC")
  List<TestResult> findByJiraIssueKeyOrderByExecutedAtDesc(
      @Param("jiraIssueKey") String jiraIssueKey);

  /**
   * ICT-189: 프로젝트의 JIRA 이슈 키가 있는 테스트 결과 조회
   *
   * @param projectId 프로젝트 ID
   * @return JIRA 이슈 키가 설정된 테스트 결과 목록
   */
  @Query(
      "SELECT tr FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "WHERE te.project.id = :projectId "
          + "AND tr.jiraIssueKey IS NOT NULL "
          + "AND tr.jiraIssueKey != ''")
  List<TestResult> findByProjectIdAndJiraIssueKeyIsNotNull(@Param("projectId") String projectId);

  /**
   * 지정된 JIRA 이슈 키 목록 중 하나라도 연결된 테스트 결과 조회.
   *
   * <p>jira_issue_key 컬럼은 여러 키를 쉼표로 연결해 저장하므로(예: "ONT-1086,ONT-904") 단순 IN 비교로는 멀티키 행을 찾지 못한다.
   * PostgreSQL의 string_to_array + 배열 overlap(&&) 연산자로 콤마 멤버 단위 교집합을 판정한다. 콤마로 분리한 요소 단위 비교라 부분 키
   * 오매칭(ONT-1086 vs ONT-10861)도 발생하지 않는다.
   *
   * @param jiraIssueKeysCsv 쉼표로 연결된 JIRA 이슈 키 목록 (대문자 정규화, 예: "ONT-1086,ONT-904")
   * @return 키 중 하나라도 멤버로 가진 테스트 결과 목록
   */
  @Query(
      value =
          "SELECT * FROM test_results tr "
              + "WHERE tr.jira_issue_key IS NOT NULL "
              + "AND string_to_array(tr.jira_issue_key, ',') "
              + "    && string_to_array(:jiraIssueKeysCsv, ',')",
      nativeQuery = true)
  List<TestResult> findByAnyJiraIssueKey(@Param("jiraIssueKeysCsv") String jiraIssueKeysCsv);

  // ========== 성능 최적화: DB 레벨 중복 제거 + 페이징 (ID 기반 2단계 방식) ==========

  /** 프로젝트별 중복 제거된 테스트 결과 ID 조회 (최신 결과 기준) */
  @Query(
      value =
          "SELECT deduped.id FROM ("
              + "  SELECT DISTINCT ON (sub.test_execution_id, sub.test_case_id)"
              + "    sub.id, sub.executed_at"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId"
              + "  ORDER BY sub.test_execution_id, sub.test_case_id,"
              + "    COALESCE(sub.executed_at, '1970-01-01'::timestamp) DESC"
              + ") deduped"
              + " ORDER BY deduped.executed_at DESC NULLS LAST",
      nativeQuery = true)
  List<String> findDedupedIdsByProject(@Param("projectId") String projectId, Pageable pageable);

  @Query(
      value =
          "SELECT COUNT(*) FROM ("
              + "  SELECT DISTINCT sub.test_execution_id, sub.test_case_id"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId"
              + ") cnt",
      nativeQuery = true)
  long countDedupedByProject(@Param("projectId") String projectId);

  /** 프로젝트 + 테스트플랜 필터 중복 제거된 테스트 결과 ID 조회 */
  @Query(
      value =
          "SELECT deduped.id FROM ("
              + "  SELECT DISTINCT ON (sub.test_execution_id, sub.test_case_id)"
              + "    sub.id, sub.executed_at"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId AND te.test_plan_id IN (:testPlanIds)"
              + "  ORDER BY sub.test_execution_id, sub.test_case_id,"
              + "    COALESCE(sub.executed_at, '1970-01-01'::timestamp) DESC"
              + ") deduped"
              + " ORDER BY deduped.executed_at DESC NULLS LAST",
      nativeQuery = true)
  List<String> findDedupedIdsByProjectAndPlans(
      @Param("projectId") String projectId,
      @Param("testPlanIds") List<String> testPlanIds,
      Pageable pageable);

  @Query(
      value =
          "SELECT COUNT(*) FROM ("
              + "  SELECT DISTINCT sub.test_execution_id, sub.test_case_id"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId AND te.test_plan_id IN (:testPlanIds)"
              + ") cnt",
      nativeQuery = true)
  long countDedupedByProjectAndPlans(
      @Param("projectId") String projectId, @Param("testPlanIds") List<String> testPlanIds);

  /** 테스트 실행 ID 필터 중복 제거된 테스트 결과 ID 조회 */
  @Query(
      value =
          "SELECT deduped.id FROM ("
              + "  SELECT DISTINCT ON (sub.test_execution_id, sub.test_case_id)"
              + "    sub.id, sub.executed_at"
              + "  FROM test_results sub"
              + "  WHERE sub.test_execution_id IN (:executionIds)"
              + "  ORDER BY sub.test_execution_id, sub.test_case_id,"
              + "    COALESCE(sub.executed_at, '1970-01-01'::timestamp) DESC"
              + ") deduped"
              + " ORDER BY deduped.executed_at DESC NULLS LAST",
      nativeQuery = true)
  List<String> findDedupedIdsByExecutions(
      @Param("executionIds") List<String> executionIds, Pageable pageable);

  @Query(
      value =
          "SELECT COUNT(*) FROM ("
              + "  SELECT DISTINCT sub.test_execution_id, sub.test_case_id"
              + "  FROM test_results sub"
              + "  WHERE sub.test_execution_id IN (:executionIds)"
              + ") cnt",
      nativeQuery = true)
  long countDedupedByExecutions(@Param("executionIds") List<String> executionIds);

  // ========== ICT-427: 결과 태그 필터 (test_result_tags EXISTS) ==========
  // 태그 조건은 중복 제거 이전(sub)에 걸린다. 즉 "태그가 붙은 결과들 중 실행+케이스별 최신"을
  // 돌려준다. 최신 결과에 태그가 없고 과거 결과에만 있으면 과거 결과가 나오는데, 표시해 둔 것을
  // 모아 보는 용도라 이 편이 맞다. 호출부는 tags 가 비어 있지 않을 때만 이 메서드를 쓴다
  // (빈 목록을 IN 에 넣으면 SQL 이 깨진다).

  /** 프로젝트 + 태그 필터 중복 제거된 테스트 결과 ID 조회 */
  @Query(
      value =
          "SELECT deduped.id FROM ("
              + "  SELECT DISTINCT ON (sub.test_execution_id, sub.test_case_id)"
              + "    sub.id, sub.executed_at"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId"
              + "    AND EXISTS (SELECT 1 FROM test_result_tags trt"
              + "                WHERE trt.test_result_id = sub.id AND LOWER(trt.tag) IN (:tags))"
              + "  ORDER BY sub.test_execution_id, sub.test_case_id,"
              + "    COALESCE(sub.executed_at, '1970-01-01'::timestamp) DESC"
              + ") deduped"
              + " ORDER BY deduped.executed_at DESC NULLS LAST",
      nativeQuery = true)
  List<String> findDedupedIdsByProjectAndTags(
      @Param("projectId") String projectId, @Param("tags") List<String> tags, Pageable pageable);

  @Query(
      value =
          "SELECT COUNT(*) FROM ("
              + "  SELECT DISTINCT sub.test_execution_id, sub.test_case_id"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId"
              + "    AND EXISTS (SELECT 1 FROM test_result_tags trt"
              + "                WHERE trt.test_result_id = sub.id AND LOWER(trt.tag) IN (:tags))"
              + ") cnt",
      nativeQuery = true)
  long countDedupedByProjectAndTags(
      @Param("projectId") String projectId, @Param("tags") List<String> tags);

  /** 프로젝트 + 테스트플랜 + 태그 필터 중복 제거된 테스트 결과 ID 조회 */
  @Query(
      value =
          "SELECT deduped.id FROM ("
              + "  SELECT DISTINCT ON (sub.test_execution_id, sub.test_case_id)"
              + "    sub.id, sub.executed_at"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId AND te.test_plan_id IN (:testPlanIds)"
              + "    AND EXISTS (SELECT 1 FROM test_result_tags trt"
              + "                WHERE trt.test_result_id = sub.id AND LOWER(trt.tag) IN (:tags))"
              + "  ORDER BY sub.test_execution_id, sub.test_case_id,"
              + "    COALESCE(sub.executed_at, '1970-01-01'::timestamp) DESC"
              + ") deduped"
              + " ORDER BY deduped.executed_at DESC NULLS LAST",
      nativeQuery = true)
  List<String> findDedupedIdsByProjectAndPlansAndTags(
      @Param("projectId") String projectId,
      @Param("testPlanIds") List<String> testPlanIds,
      @Param("tags") List<String> tags,
      Pageable pageable);

  @Query(
      value =
          "SELECT COUNT(*) FROM ("
              + "  SELECT DISTINCT sub.test_execution_id, sub.test_case_id"
              + "  FROM test_results sub"
              + "  JOIN test_executions te ON sub.test_execution_id = te.id"
              + "  WHERE te.project_id = :projectId AND te.test_plan_id IN (:testPlanIds)"
              + "    AND EXISTS (SELECT 1 FROM test_result_tags trt"
              + "                WHERE trt.test_result_id = sub.id AND LOWER(trt.tag) IN (:tags))"
              + ") cnt",
      nativeQuery = true)
  long countDedupedByProjectAndPlansAndTags(
      @Param("projectId") String projectId,
      @Param("testPlanIds") List<String> testPlanIds,
      @Param("tags") List<String> tags);

  /** 테스트 실행 + 태그 필터 중복 제거된 테스트 결과 ID 조회 */
  @Query(
      value =
          "SELECT deduped.id FROM ("
              + "  SELECT DISTINCT ON (sub.test_execution_id, sub.test_case_id)"
              + "    sub.id, sub.executed_at"
              + "  FROM test_results sub"
              + "  WHERE sub.test_execution_id IN (:executionIds)"
              + "    AND EXISTS (SELECT 1 FROM test_result_tags trt"
              + "                WHERE trt.test_result_id = sub.id AND LOWER(trt.tag) IN (:tags))"
              + "  ORDER BY sub.test_execution_id, sub.test_case_id,"
              + "    COALESCE(sub.executed_at, '1970-01-01'::timestamp) DESC"
              + ") deduped"
              + " ORDER BY deduped.executed_at DESC NULLS LAST",
      nativeQuery = true)
  List<String> findDedupedIdsByExecutionsAndTags(
      @Param("executionIds") List<String> executionIds,
      @Param("tags") List<String> tags,
      Pageable pageable);

  @Query(
      value =
          "SELECT COUNT(*) FROM ("
              + "  SELECT DISTINCT sub.test_execution_id, sub.test_case_id"
              + "  FROM test_results sub"
              + "  WHERE sub.test_execution_id IN (:executionIds)"
              + "    AND EXISTS (SELECT 1 FROM test_result_tags trt"
              + "                WHERE trt.test_result_id = sub.id AND LOWER(trt.tag) IN (:tags))"
              + ") cnt",
      nativeQuery = true)
  long countDedupedByExecutionsAndTags(
      @Param("executionIds") List<String> executionIds, @Param("tags") List<String> tags);

  /*
   * 통계 집계용 경량 행. 행 구성:
   *   [0] 케이스 ID · [1] 수행시각 · [2] 판정 · [3] 플랜 ID · [4] JIRA 키 · [5] JIRA 동기화 상태 · [6] 실행자 이름
   * 엔티티로 받으면 결과 한 건마다 태그(EAGER)가 딸려와 결과 수만 명이면 통계 한 번에 1초가 넘었다.
   * 수행시각 조건을 걸지 않는 것은 기존 동작(실행에 달린 결과를 전부 센다)을 지키기 위해서다.
   */
  String STATS_ROW_SELECT =
      "SELECT tr.testCaseId, tr.executedAt, tr.result, te.testPlanId, tr.jiraIssueKey,"
          + " tr.jiraSyncStatus, u.username FROM TestResult tr JOIN tr.testExecution te LEFT JOIN"
          + " tr.executedBy u ";

  @Query(STATS_ROW_SELECT + "JOIN te.project p WHERE p.id = :projectId")
  List<Object[]> findStatsRowsByProjectId(@Param("projectId") String projectId);

  @Query(STATS_ROW_SELECT + "WHERE te.testPlanId IN :testPlanIds")
  List<Object[]> findStatsRowsByTestPlanIds(@Param("testPlanIds") List<String> testPlanIds);

  @Query(STATS_ROW_SELECT + "WHERE te.id = :executionId")
  List<Object[]> findStatsRowsByExecutionId(@Param("executionId") String executionId);

  /** 필터가 없는 전체 통계용. 실행에 연결되지 않은 결과도 세던 기존 동작을 지키려 LEFT JOIN 을 쓴다. */
  @Query(
      "SELECT tr.testCaseId, tr.executedAt, tr.result, te.testPlanId, tr.jiraIssueKey,"
          + " tr.jiraSyncStatus, u.username FROM TestResult tr LEFT JOIN tr.testExecution te LEFT"
          + " JOIN tr.executedBy u")
  List<Object[]> findStatsRowsAll();

  /**
   * 인구(Population) 집계용 경량 행 조회.
   *
   * <p>최신 결과·수행 횟수·JIRA 이력을 가리는 데는 여섯 컬럼이면 된다. 엔티티로 받으면 결과 한 건마다 태그(EAGER)·첨부·실행자까지 딸려와,
   * 결과 수만 명인 프로젝트에서 리포트 한 장을 여는 데 수 초가 걸렸다. 승자를 가린 뒤 그 행만 엔티티로 다시 읽는다.
   *
   * <p>행 구성: [0] 결과 ID · [1] 케이스 ID · [2] 수행시각 · [3] 플랜 ID · [4] 실행 ID · [5] JIRA 키
   */
  @Query(
      "SELECT tr.id, tr.testCaseId, tr.executedAt, te.testPlanId, te.id, tr.jiraIssueKey "
          + "FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "JOIN te.project p "
          + "WHERE p.id = :projectId "
          + "AND tr.executedAt IS NOT NULL "
          + "ORDER BY tr.executedAt DESC")
  List<Object[]> findPopulationRowsByProject(@Param("projectId") String projectId);

  /** ID 목록으로 TestResult 엔티티 페치 (testExecution, executedBy JOIN FETCH) */
  @Query(
      "SELECT tr FROM TestResult tr"
          + " LEFT JOIN FETCH tr.testExecution"
          + " LEFT JOIN FETCH tr.executedBy"
          + " WHERE tr.id IN :ids")
  List<TestResult> findByIdsWithFetch(@Param("ids") List<String> ids);

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
   * @param result 테스트 결과 상태
   * @param projectId 프로젝트 ID
   * @return 해당 프로젝트의 특정 상태 테스트 개수
   */
  @Query(
      "SELECT COUNT(tr) FROM TestResult tr "
          + "JOIN tr.testExecution te "
          + "WHERE tr.result = :result "
          + "AND te.project.id = :projectId")
  long countByResultAndProjectId(
      @Param("result") String result, @Param("projectId") String projectId);

  /**
   * 실행자별 테스트 결과 통계 조회
   *
   * @param projectId 프로젝트 ID
   * @return 실행자별 통계 맵
   */
  @Query(
      value =
          "SELECT "
              + "    u.id as executor_id, "
              + "    u.username as executor_name, "
              + "    COUNT(tr.id) as total_assigned, "
              + "    COUNT(CASE WHEN tr.executedAt IS NOT NULL THEN 1 END) as completed, "
              + "    COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) as passed, "
              + "    COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as failed "
              + "FROM test_results tr "
              + "JOIN test_executions te ON tr.test_execution_id = te.id "
              + "JOIN users u ON tr.executed_by = u.id "
              + "WHERE te.project_id = :projectId "
              + "GROUP BY u.id, u.username "
              + "ORDER BY total_assigned DESC",
      nativeQuery = true)
  List<Map<String, Object>> findExecutorStatisticsByProject(@Param("projectId") String projectId);

  /**
   * 최근 N일간 일별 테스트 실행 통계 조회
   *
   * @param projectId 프로젝트 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @return 일별 실행 통계 맵
   */
  @Query(
      value =
          "SELECT     CAST(tr.executed_at AS DATE) as execution_date,     COUNT(tr.id) as"
              + " tests_executed,     COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END) as"
              + " tests_passed,     COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as tests_failed,"
              + "     AVG(EXTRACT(EPOCH FROM (tr.executed_at - te.started_at))) as"
              + " avg_execution_time FROM test_results tr JOIN test_executions te ON"
              + " tr.test_execution_id = te.id WHERE te.project_id = :projectId AND tr.executed_at"
              + " BETWEEN :startDate AND :endDate GROUP BY CAST(tr.executed_at AS DATE) ORDER BY"
              + " CAST(tr.executed_at AS DATE)",
      nativeQuery = true)
  List<Map<String, Object>> findDailyExecutionStatistics(
      @Param("projectId") String projectId,
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);

  @Modifying
  @Query(
      value =
          "DELETE FROM test_results WHERE test_execution_id IN "
              + "(SELECT id FROM test_executions WHERE project_id = :projectId)",
      nativeQuery = true)
  void deleteByProjectId(@Param("projectId") String projectId);

  /**
   * 플랜별 테스트 결과 통계 조회 (View Type: By Plan)
   *
   * @param projectId 프로젝트 ID
   * @return 플랜별 통계 맵
   */
  @Query(
      value =
          "SELECT     tp.name as test_plan_name,     COUNT(CASE WHEN tr.result = 'PASS' THEN 1 END)"
              + " as pass_count,     COUNT(CASE WHEN tr.result = 'FAIL' THEN 1 END) as fail_count, "
              + "    COUNT(CASE WHEN tr.result = 'BLOCKED' THEN 1 END) as blocked_count,    "
              + " COUNT(CASE WHEN tr.result IS NULL OR tr.result = 'NOT_RUN' THEN 1 END) as"
              + " not_run_count FROM test_plans tp LEFT JOIN test_executions te ON te.test_plan_id"
              + " = tp.id LEFT JOIN test_results tr ON tr.test_execution_id = te.id WHERE"
              + " tp.project_id = :projectId GROUP BY tp.id, tp.name HAVING COUNT(tr.id) > 0 ORDER"
              + " BY tp.name",
      nativeQuery = true)
  List<Map<String, Object>> findStatisticsByTestPlan(@Param("projectId") String projectId);

  /**
   * 실행자별 테스트 결과 통계 조회 (View Type: By Executor)
   *
   * @param projectId 프로젝트 ID
   * @return 실행자별 통계 맵
   */
  @Query(
      value =
          "SELECT     COALESCE(u.username, 'Unassigned') as executor_name,     COUNT(CASE WHEN"
              + " tr.result = 'PASS' THEN 1 END) as pass_count,     COUNT(CASE WHEN tr.result ="
              + " 'FAIL' THEN 1 END) as fail_count,     COUNT(CASE WHEN tr.result = 'BLOCKED' THEN"
              + " 1 END) as blocked_count,     COUNT(CASE WHEN tr.result IS NULL OR tr.result ="
              + " 'NOT_RUN' THEN 1 END) as not_run_count FROM test_results tr JOIN test_executions"
              + " te ON tr.test_execution_id = te.id LEFT JOIN users u ON tr.executed_by = u.id"
              + " WHERE te.project_id = :projectId AND tr.executed_at IS NOT NULL GROUP BY"
              + " COALESCE(u.username, 'Unassigned') ORDER BY executor_name",
      nativeQuery = true)
  List<Map<String, Object>> findStatisticsByExecutor(@Param("projectId") String projectId);

  /**
   * ICT-Performance: 실행 ID 목록에 대한 결과 상태별 집계 조회 각 실행 내에서 테스트케이스별 최신 결과를 기준으로 집계합니다.
   *
   * @param executionIds 테스트 실행 ID 목록
   * @return 실행 ID별 상태별 개수 목록 (test_execution_id, result, count)
   */
  @Query(
      value =
          "WITH latest_results AS (     SELECT         test_execution_id,         test_case_id,    "
              + "     result,         ROW_NUMBER() OVER (PARTITION BY test_execution_id,"
              + " test_case_id ORDER BY executed_at DESC) as rn     FROM test_results     WHERE"
              + " test_execution_id IN :executionIds ) SELECT     test_execution_id,     result,   "
              + "  COUNT(*) as count FROM latest_results WHERE rn = 1 GROUP BY test_execution_id,"
              + " result",
      nativeQuery = true)
  List<Map<String, Object>> findSummaryByExecutionIds(
      @Param("executionIds") List<String> executionIds);

  /**
   * 실행별 테스트 결과 통계 조회 (View Type: By Execution) 테스트 플랜에 할당된 모든 테스트케이스를 기준으로, 각 실행의 최신 결과(1건)를 집계합니다.
   * 결과가 없는 케이스는 'NOT_RUN'으로 처리되어 전체 합계가 할당된 테스트케이스 수와 일치하게 됩니다.
   *
   * @param projectId 프로젝트 ID
   * @return 실행별 통계 맵 (execution_name, test_execution_id, test_plan_name, pass_count, fail_count,
   *     blocked_count, not_run_count)
   */
  @Query(
      value =
          "WITH latest_results AS (   SELECT test_execution_id, test_case_id, result,    "
              + " ROW_NUMBER() OVER (PARTITION BY test_execution_id, test_case_id ORDER BY"
              + " executed_at DESC) as rn   FROM test_results ), target_cases AS (   SELECT te.id"
              + " as test_execution_id, te.name as execution_name,          tp.id as test_plan_id,"
              + " tp.name as test_plan_name,          tpc.test_case_id   FROM test_executions te  "
              + " JOIN test_plans tp ON te.test_plan_id = tp.id   JOIN test_plan_cases tpc ON tp.id"
              + " = tpc.test_plan_id   WHERE tp.project_id = :projectId ) SELECT tc.execution_name,"
              + " tc.test_execution_id, tc.test_plan_name, COUNT(CASE WHEN lr.result = 'PASS' THEN"
              + " 1 END) as pass_count, COUNT(CASE WHEN lr.result = 'FAIL' THEN 1 END) as"
              + " fail_count, COUNT(CASE WHEN lr.result = 'BLOCKED' THEN 1 END) as blocked_count,"
              + " COUNT(CASE WHEN lr.result IS NULL OR lr.result = 'NOT_RUN' OR lr.result ="
              + " 'NOTRUN' THEN 1 END) as not_run_count FROM target_cases tc LEFT JOIN"
              + " latest_results lr ON lr.test_execution_id = tc.test_execution_id   AND"
              + " lr.test_case_id = tc.test_case_id AND lr.rn = 1 GROUP BY tc.test_execution_id,"
              + " tc.execution_name, tc.test_plan_id, tc.test_plan_name ORDER BY tc.test_plan_name,"
              + " tc.execution_name",
      nativeQuery = true)
  List<Map<String, Object>> findStatisticsByExecution(@Param("projectId") String projectId);

  /**
   * 특정 테스트 플랜 필터링된 실행별 통계 조회 할당된 테스트케이스 목록을 기준으로 최신 결과를 집계하여 전체 건수를 보장합니다.
   *
   * @param projectId 프로젝트 ID
   * @param testPlanIds 테스트 플랜 ID 목록
   * @return 실행별 통계 맵
   */
  @Query(
      value =
          "WITH latest_results AS (   SELECT test_execution_id, test_case_id, result,    "
              + " ROW_NUMBER() OVER (PARTITION BY test_execution_id, test_case_id ORDER BY"
              + " executed_at DESC) as rn   FROM test_results ), target_cases AS (   SELECT te.id"
              + " as test_execution_id, te.name as execution_name,          tp.id as test_plan_id,"
              + " tp.name as test_plan_name,          tpc.test_case_id   FROM test_executions te  "
              + " JOIN test_plans tp ON te.test_plan_id = tp.id   JOIN test_plan_cases tpc ON tp.id"
              + " = tpc.test_plan_id   WHERE tp.project_id = :projectId   AND tp.id IN :testPlanIds"
              + " ) SELECT tc.execution_name, tc.test_execution_id, tc.test_plan_name, COUNT(CASE"
              + " WHEN lr.result = 'PASS' THEN 1 END) as pass_count, COUNT(CASE WHEN lr.result ="
              + " 'FAIL' THEN 1 END) as fail_count, COUNT(CASE WHEN lr.result = 'BLOCKED' THEN 1"
              + " END) as blocked_count, COUNT(CASE WHEN lr.result IS NULL OR lr.result = 'NOT_RUN'"
              + " OR lr.result = 'NOTRUN' THEN 1 END) as not_run_count FROM target_cases tc LEFT"
              + " JOIN latest_results lr ON lr.test_execution_id = tc.test_execution_id   AND"
              + " lr.test_case_id = tc.test_case_id AND lr.rn = 1 GROUP BY tc.test_execution_id,"
              + " tc.execution_name, tc.test_plan_id, tc.test_plan_name ORDER BY tc.test_plan_name,"
              + " tc.execution_name",
      nativeQuery = true)
  List<Map<String, Object>> findStatisticsByExecutionAndTestPlan(
      @Param("projectId") String projectId, @Param("testPlanIds") List<String> testPlanIds);
}
