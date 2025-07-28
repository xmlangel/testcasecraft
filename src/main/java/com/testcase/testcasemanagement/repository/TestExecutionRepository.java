// src/main/java/com/testcase/testcasemanagement/repository/TestExecutionRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestExecutionRepository extends JpaRepository<TestExecution, String> {
    List<TestExecution> findByTestPlanId(String testPlanId);

    // 프로젝트 ID로 직접 조회 추가
    @Query("SELECT t FROM TestExecution t WHERE t.project.id = :projectId")
    List<TestExecution> findByProjectId(@Param("projectId") String projectId);
}
