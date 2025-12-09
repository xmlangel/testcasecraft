// src/main/java/com/testcase/testcasemanagement/repository/TestPlanRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestPlanRepository extends JpaRepository<TestPlan, String> {
    @Query("SELECT t FROM TestPlan t WHERE t.project.id = :projectId ORDER BY t.createdAt DESC")
    List<TestPlan> findByProjectId(@Param("projectId") String projectId);

    long countByProjectId(String projectId);

    @Query("SELECT t FROM TestPlan t WHERE t.name LIKE CONCAT('%', :name, '%') ORDER BY t.createdAt DESC")
    List<TestPlan> findByNameContaining(@Param("name") String name);

    @Modifying
    @Query("DELETE FROM TestPlan t WHERE t.project.id = :projectId")
    void deleteByProjectId(@Param("projectId") String projectId);
}
