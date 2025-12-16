// src/main/java/com/testcase/testcasemanagement/repository/TestExecutionRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TestExecutionRepository extends JpaRepository<TestExecution, String> {
       @Query("SELECT te FROM TestExecution te WHERE te.testPlanId = :testPlanId ORDER BY te.startDate DESC")
       List<TestExecution> findByTestPlanId(@Param("testPlanId") String testPlanId);

       // ID로 조회하면서 results를 함께 fetch
       @Query("SELECT DISTINCT te FROM TestExecution te " +
                     "LEFT JOIN FETCH te.results " +
                     "WHERE te.id = :id")
       Optional<TestExecution> findByIdWithResults(@Param("id") String id);

       long countByProjectId(String projectId);

       // 프로젝트 ID로 직접 조회 추가 (Project와 Results, executedBy를 함께 fetch) - 시작일 역순 정렬
       @Query("SELECT DISTINCT te FROM TestExecution te " +
                     "LEFT JOIN FETCH te.project " +
                     "LEFT JOIN FETCH te.results r " +
                     "LEFT JOIN FETCH r.executedBy " +
                     "WHERE te.project.id = :projectId " +
                     "ORDER BY te.startDate DESC")
       List<TestExecution> findByProjectId(@Param("projectId") String projectId);

       // 프로젝트 ID와 이름으로 검색 (대소문자 구분 없음)
       @Query("SELECT DISTINCT te FROM TestExecution te " +
                     "LEFT JOIN FETCH te.project " +
                     "LEFT JOIN FETCH te.results r " +
                     "LEFT JOIN FETCH r.executedBy " +
                     "WHERE te.project.id = :projectId " +
                     "AND LOWER(te.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
                     "ORDER BY te.startDate DESC")
       List<TestExecution> findByProjectIdAndNameContainingIgnoreCase(@Param("projectId") String projectId,
                     @Param("name") String name);

       /**
        * 진행 중인 테스트 실행 목록 조회 (전체)
        *
        * @return 진행 중인 테스트 실행 목록
        */
       @Query("SELECT te FROM TestExecution te WHERE te.status = 'INPROGRESS' ORDER BY te.startDate DESC")
       List<TestExecution> findInProgressExecutions();

       /**
        * 특정 프로젝트의 진행 중인 테스트 실행 목록 조회
        *
        * @param projectId 프로젝트 ID
        * @return 진행 중인 테스트 실행 목록
        */
       @Query("SELECT te FROM TestExecution te WHERE te.project.id = :projectId AND te.status = 'INPROGRESS' ORDER BY te.startDate DESC")
       List<TestExecution> findInProgressExecutionsByProject(@Param("projectId") String projectId);

       @Modifying
       @Query("DELETE FROM TestExecution t WHERE t.project.id = :projectId")
       void deleteByProjectId(@Param("projectId") String projectId);
}
