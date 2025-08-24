// src/main/java/com/testcase/testcasemanagement/repository/TestPlanRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestPlanRepository extends JpaRepository<TestPlan, String> {
    List<TestPlan> findByProjectId(String projectId);
    long countByProjectId(String projectId);
    List<TestPlan> findByNameContaining(String name);
    
    @Modifying
    @Query("DELETE FROM TestPlan t WHERE t.project.id = :projectId")
    void deleteByProjectId(@Param("projectId") String projectId);
}
