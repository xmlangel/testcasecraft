// src/main/java/com/testcase/testcasemanagement/repository/JunitTestCaseRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JunitTestCase;
import com.testcase.testcasemanagement.model.JunitTestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ICT-203: JUnit 테스트 케이스 Repository
 */
@Repository
public interface JunitTestCaseRepository extends JpaRepository<JunitTestCase, String> {

       /**
        * 테스트 스위트별 케이스 조회
        */
       Page<JunitTestCase> findByJunitTestSuite_IdOrderByName(String testSuiteId, Pageable pageable);

       /**
        * 테스트 스위트별 특정 상태의 케이스 조회
        */
       List<JunitTestCase> findByJunitTestSuite_IdAndStatus(String testSuiteId, JunitTestStatus status);

       /**
        * 테스트 결과 전체에서 실패한 케이스 조회
        */
       @Query("SELECT jtc FROM JunitTestCase jtc " +
                     "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId " +
                     "AND (jtc.status = 'FAILED' OR jtc.status = 'ERROR') " +
                     "ORDER BY jtc.junitTestSuite.name, jtc.name")
       List<JunitTestCase> findFailedCasesByTestResult(@Param("testResultId") String testResultId);

       /**
        * 실행 시간이 오래 걸린 케이스 조회 (Top N)
        */
       @Query("SELECT jtc FROM JunitTestCase jtc " +
                     "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId " +
                     "ORDER BY jtc.time DESC")
       List<JunitTestCase> findSlowestCasesByTestResult(@Param("testResultId") String testResultId, Pageable pageable);

       /**
        * 케이스명으로 검색
        */
       @Query("SELECT jtc FROM JunitTestCase jtc " +
                     "WHERE jtc.junitTestSuite.id = :testSuiteId " +
                     "AND (jtc.name LIKE %:searchTerm% OR jtc.className LIKE %:searchTerm%) " +
                     "ORDER BY jtc.name")
       Page<JunitTestCase> searchByTestSuiteAndName(@Param("testSuiteId") String testSuiteId,
                     @Param("searchTerm") String searchTerm,
                     Pageable pageable);

       /**
        * 사용자가 편집한 케이스 조회
        */
       @Query("SELECT jtc FROM JunitTestCase jtc " +
                     "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId " +
                     "AND (jtc.userTitle IS NOT NULL OR jtc.userDescription IS NOT NULL " +
                     "OR jtc.userNotes IS NOT NULL OR jtc.userStatus IS NOT NULL) " +
                     "ORDER BY jtc.lastModifiedAt DESC")
       List<JunitTestCase> findEditedCasesByTestResult(@Param("testResultId") String testResultId);

       /**
        * 테스트 결과별 상태 통계
        */
       @Query("SELECT jtc.status, COUNT(jtc) FROM JunitTestCase jtc " +
                     "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId " +
                     "GROUP BY jtc.status")
       List<Object[]> getStatusStatisticsByTestResult(@Param("testResultId") String testResultId);

       /**
        * 테스트 스위트 레벨의 테스트 케이스 개수 조회
        */
       int countByJunitTestSuite_Id(String testSuiteId);
}