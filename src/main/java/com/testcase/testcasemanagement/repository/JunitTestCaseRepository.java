// src/main/java/com/testcase/testcasemanagement/repository/JunitTestCaseRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JunitTestCase;
import com.testcase.testcasemanagement.model.JunitTestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** ICT-203: JUnit 테스트 케이스 Repository */
@Repository
public interface JunitTestCaseRepository extends JpaRepository<JunitTestCase, String> {

  /** 테스트 스위트별 케이스 조회 */
  Page<JunitTestCase> findByJunitTestSuite_IdOrderByName(String testSuiteId, Pageable pageable);

  /** 테스트 스위트별 특정 상태의 케이스 페이징 조회 */
  Page<JunitTestCase> findByJunitTestSuite_IdAndStatusOrderByName(
      String testSuiteId, JunitTestStatus status, Pageable pageable);

  /** 테스트 스위트별 특정 상태의 케이스 조회 */
  List<JunitTestCase> findByJunitTestSuite_IdAndStatus(String testSuiteId, JunitTestStatus status);

  /** 테스트 결과 전체에서 실패한 케이스 조회 */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId "
          + "AND (jtc.status = 'FAILED' OR jtc.status = 'ERROR') "
          + "ORDER BY jtc.junitTestSuite.name, jtc.name")
  List<JunitTestCase> findFailedCasesByTestResult(@Param("testResultId") String testResultId);

  /** 실행 시간이 오래 걸린 케이스 조회 (Top N) */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId "
          + "ORDER BY jtc.time DESC")
  List<JunitTestCase> findSlowestCasesByTestResult(
      @Param("testResultId") String testResultId, Pageable pageable);

  /** 케이스명으로 검색 */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.id = :testSuiteId "
          + "AND (jtc.name LIKE %:searchTerm% OR jtc.className LIKE %:searchTerm%) "
          + "ORDER BY jtc.name")
  Page<JunitTestCase> searchByTestSuiteAndName(
      @Param("testSuiteId") String testSuiteId,
      @Param("searchTerm") String searchTerm,
      Pageable pageable);

  /** 사용자가 편집한 케이스 조회 */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId "
          + "AND (jtc.userTitle IS NOT NULL OR jtc.userDescription IS NOT NULL "
          + "OR jtc.userNotes IS NOT NULL OR jtc.userStatus IS NOT NULL) "
          + "ORDER BY jtc.lastModifiedAt DESC")
  List<JunitTestCase> findEditedCasesByTestResult(@Param("testResultId") String testResultId);

  /** 이전 실행에서 작성한 노트가 있는 동일 케이스 내역 조회 */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.junitTestResult.projectId = :projectId "
          + "AND jtc.className = :className "
          + "AND jtc.name = :name "
          + "AND jtc.id != :currentTestCaseId "
          + "AND jtc.userNotes IS NOT NULL "
          + "AND TRIM(jtc.userNotes) != '' "
          + "ORDER BY jtc.junitTestSuite.junitTestResult.uploadedAt DESC")
  List<JunitTestCase> findPreviousTestCasesWithNotes(
      @Param("projectId") String projectId,
      @Param("className") String className,
      @Param("name") String name,
      @Param("currentTestCaseId") String currentTestCaseId,
      Pageable pageable);

  /** 테스트 결과별 상태 통계 */
  @Query(
      "SELECT jtc.status, COUNT(jtc) FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId "
          + "GROUP BY jtc.status")
  List<Object[]> getStatusStatisticsByTestResult(@Param("testResultId") String testResultId);

  /** 테스트 스위트 레벨의 테스트 케이스 개수 조회 */
  int countByJunitTestSuite_Id(String testSuiteId);

  /** 특정 JUnit 결과에서 노트가 있는 테스트 케이스 수 조회 */
  @Query(
      "SELECT COUNT(jtc) FROM JunitTestCase jtc "
          + "WHERE jtc.junitTestSuite.junitTestResult.id = :testResultId "
          + "AND jtc.userNotes IS NOT NULL AND TRIM(jtc.userNotes) <> ''")
  int countNotesInTestResult(@Param("testResultId") String testResultId);

  /** 케이스가 속한 프로젝트 ID 조회 (인가 검사용) */
  @Query(
      "SELECT c.junitTestSuite.junitTestResult.projectId FROM JunitTestCase c WHERE c.id = :caseId")
  Optional<String> findProjectIdByCaseId(@Param("caseId") String caseId);

  /** 프로젝트 전체 JUnit 케이스 검색 (자동화 연결 선택기용). 바로가기 링크용으로 상위 result까지 fetch */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "JOIN FETCH jtc.junitTestSuite s "
          + "JOIN FETCH s.junitTestResult r "
          + "WHERE r.projectId = :projectId "
          + "AND (:searchTerm IS NULL OR :searchTerm = '' "
          + "     OR LOWER(jtc.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
          + "     OR LOWER(jtc.className) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) "
          + "ORDER BY jtc.className, jtc.name")
  Page<JunitTestCase> searchByProject(
      @Param("projectId") String projectId,
      @Param("searchTerm") String searchTerm,
      Pageable pageable);

  /** 프로젝트 스코프로 ID 목록의 JUnit 케이스 조회 (연결된 케이스 표시용, cross-project 노출 방지) */
  @Query(
      "SELECT jtc FROM JunitTestCase jtc "
          + "JOIN FETCH jtc.junitTestSuite s "
          + "JOIN FETCH s.junitTestResult r "
          + "WHERE r.projectId = :projectId "
          + "AND jtc.id IN :ids "
          + "ORDER BY jtc.className, jtc.name")
  List<JunitTestCase> findByProjectIdAndIdIn(
      @Param("projectId") String projectId, @Param("ids") List<String> ids);

  /**
   * 특정 테스트 결과(result)에 속한 JUnit 케이스를 참조하는 테스트케이스 링크(역방향)를 모두 삭제한다. JUnit 결과 삭제 시 TC 쪽에 남는 dangling
   * 링크를 방지하기 위한 정리 쿼리.
   */
  @org.springframework.data.jpa.repository.Modifying
  @Query(
      value =
          "DELETE FROM testcase_linked_junit_cases WHERE junit_test_case_id IN "
              + "(SELECT c.id FROM junit_test_cases c "
              + "JOIN junit_test_suites s ON c.junit_test_suite_id = s.id "
              + "WHERE s.junit_test_result_id = :resultId)",
      nativeQuery = true)
  void deleteTestCaseLinksByResultId(@Param("resultId") String resultId);
}
