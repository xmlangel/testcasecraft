// src/main/java/com/testcase/testcasemanagement/repository/JunitTestSuiteRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JunitTestSuite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ICT-203: JUnit 테스트 스위트 Repository
 */
@Repository
public interface JunitTestSuiteRepository extends JpaRepository<JunitTestSuite, String> {
    
    /**
     * 테스트 결과별 스위트 조회
     */
    List<JunitTestSuite> findByJunitTestResult_IdOrderByName(String testResultId);
    
    /**
     * 실패가 있는 스위트 조회
     */
    @Query("SELECT jts FROM JunitTestSuite jts WHERE jts.junitTestResult.id = :testResultId " +
           "AND (jts.failures > 0 OR jts.errors > 0) ORDER BY jts.name")
    List<JunitTestSuite> findFailedSuitesByTestResult(@Param("testResultId") String testResultId);
    
    /**
     * 스위트명으로 검색
     */
    @Query("SELECT jts FROM JunitTestSuite jts WHERE jts.junitTestResult.id = :testResultId " +
           "AND jts.name LIKE %:suiteName% ORDER BY jts.name")
    List<JunitTestSuite> findByTestResultAndNameContaining(@Param("testResultId") String testResultId,
                                                         @Param("suiteName") String suiteName);
}