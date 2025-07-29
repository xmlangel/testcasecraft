// src/main/java/com/testcase/testcasemanagement/repository/TestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
}

