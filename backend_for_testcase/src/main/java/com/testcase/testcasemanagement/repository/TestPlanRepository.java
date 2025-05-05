// src/main/java/com/testcase/testcasemanagement/repository/TestPlanRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestPlanRepository extends JpaRepository<TestPlan, String> {
    List<TestPlan> findByProjectId(String projectId);
    List<TestPlan> findByNameContaining(String name);
}
