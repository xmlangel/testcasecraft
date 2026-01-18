// src/main/java/com/testcase/testcasemanagement/repository/JunitTestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JunitTestResult;
import com.testcase.testcasemanagement.model.JunitProcessStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ICT-203: JUnit 테스트 결과 Repository
 */
@Repository
public interface JunitTestResultRepository extends JpaRepository<JunitTestResult, String> {

       /**
        * 프로젝트별 테스트 결과 조회 (페이징)
        */
       Page<JunitTestResult> findByProjectIdOrderByUploadedAtDesc(String projectId, Pageable pageable);

       /**
        * 프로젝트별 완료된 테스트 결과 조회
        */
       List<JunitTestResult> findByProjectIdAndStatusOrderByUploadedAtDesc(String projectId, JunitProcessStatus status);

       /**
        * 사용자별 업로드한 테스트 결과 조회
        */
       List<JunitTestResult> findByUploadedBy_IdOrderByUploadedAtDesc(String userId);

       /**
        * 특정 기간 내 업로드된 테스트 결과 조회
        */
       @Query("SELECT jtr FROM JunitTestResult jtr WHERE jtr.uploadedAt BETWEEN :startDate AND :endDate ORDER BY jtr.uploadedAt DESC")
       List<JunitTestResult> findByUploadedAtBetween(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       /**
        * 프로젝트별 테스트 결과 통계
        */
       @Query("SELECT COUNT(jtr), SUM(jtr.totalTests), SUM(jtr.failures), SUM(jtr.errors) " +
                     "FROM JunitTestResult jtr WHERE jtr.projectId = :projectId AND jtr.status = :status")
       Object[] getProjectStatistics(@Param("projectId") String projectId, @Param("status") JunitProcessStatus status);

       /**
        * 체크섬으로 중복 파일 확인
        */
       Optional<JunitTestResult> findByProjectIdAndFileChecksum(String projectId, String checksum);

       /**
        * 실패한 처리 상태의 테스트 결과 조회 (재처리 대상)
        */
       List<JunitTestResult> findByStatusAndUploadedAtBefore(JunitProcessStatus status, LocalDateTime before);

       /**
        * 프로젝트별 최근 테스트 결과 조회 (제한된 개수)
        */
       @Query("SELECT jtr FROM JunitTestResult jtr WHERE jtr.projectId = :projectId AND jtr.status = :status " +
                     "ORDER BY jtr.uploadedAt DESC")
       List<JunitTestResult> findRecentByProject(@Param("projectId") String projectId,
                     @Param("status") JunitProcessStatus status,
                     Pageable pageable);

       /**
        * 파일명으로 검색
        */
       @Query("SELECT jtr FROM JunitTestResult jtr WHERE jtr.projectId = :projectId " +
                     "AND (jtr.fileName LIKE %:searchTerm% OR jtr.testExecutionName LIKE %:searchTerm%) " +
                     "ORDER BY jtr.uploadedAt DESC")
       Page<JunitTestResult> searchByProjectAndFileName(@Param("projectId") String projectId,
                     @Param("searchTerm") String searchTerm,
                     Pageable pageable);

       /**
        * 프로젝트별 모든 테스트 결과 조회 (ICT-211)
        */
       List<JunitTestResult> findByProjectIdOrderByUploadedAtDesc(String projectId);

       /**
        * 테스트 플랜별 테스트 결과 조회
        */
       List<JunitTestResult> findByTestPlanIdOrderByUploadedAtDesc(String testPlanId);

       /**
        * 플랜별 JUnit 테스트 결과 통계 조회 (View Type: By Plan)
        * 
        * @param projectId 프로젝트 ID
        * @return 플랜별 통계 맵
        */
       @Query(value = "SELECT " +
                     "    COALESCE(tp.name, 'Unassigned') as test_plan_name, " +
                     "    SUM(jtr.total_tests - jtr.failures - jtr.errors - jtr.skipped) as pass_count, " +
                     "    SUM(jtr.failures + jtr.errors) as fail_count, " +
                     "    0 as blocked_count, " +
                     "    SUM(jtr.skipped) as not_run_count " +
                     "FROM junit_test_results jtr " +
                     "LEFT JOIN test_plans tp ON jtr.test_plan_id = tp.id " +
                     "WHERE jtr.project_id = :projectId " +
                     "AND jtr.status = 'COMPLETED' " +
                     "GROUP BY COALESCE(tp.name, 'Unassigned') " +
                     "HAVING SUM(jtr.total_tests) > 0 " +
                     "ORDER BY test_plan_name", nativeQuery = true)
       List<Map<String, Object>> findStatisticsByTestPlan(@Param("projectId") String projectId);

       /**
        * 실행자별 JUnit 테스트 결과 통계 조회 (View Type: By Executor)
        * 
        * @param projectId 프로젝트 ID
        * @return 실행자별 통계 맵
        */
       @Query(value = "SELECT " +
                     "    COALESCE(u.username, 'Unknown') as executor_name, " +
                     "    SUM(jtr.total_tests - jtr.failures - jtr.errors - jtr.skipped) as pass_count, " +
                     "    SUM(jtr.failures + jtr.errors) as fail_count, " +
                     "    0 as blocked_count, " +
                     "    SUM(jtr.skipped) as not_run_count " +
                     "FROM junit_test_results jtr " +
                     "LEFT JOIN users u ON jtr.uploaded_by = u.id " +
                     "WHERE jtr.project_id = :projectId " +
                     "AND jtr.status = 'COMPLETED' " +
                     "GROUP BY COALESCE(u.username, 'Unknown') " +
                     "HAVING SUM(jtr.total_tests) > 0 " +
                     "ORDER BY executor_name", nativeQuery = true)
       List<Map<String, Object>> findStatisticsByUploader(@Param("projectId") String projectId);
}