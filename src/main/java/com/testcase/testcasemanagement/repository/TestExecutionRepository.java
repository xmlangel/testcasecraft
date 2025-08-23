// src/main/java/com/testcase/testcasemanagement/repository/TestExecutionRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestExecutionRepository extends JpaRepository<TestExecution, String> {
    List<TestExecution> findByTestPlanId(String testPlanId);

    long countByProjectId(String projectId);

    // 프로젝트 ID로 직접 조회 추가
    @Query("SELECT t FROM TestExecution t WHERE t.project.id = :projectId")
    List<TestExecution> findByProjectId(@Param("projectId") String projectId);
    
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
}
