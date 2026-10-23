// src/main/java/com/testcase/testcasemanagement/repository/TestPlanRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestPlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestPlanRepository extends JpaRepository<TestPlan, String> {

  /** 플랜이 속한 프로젝트 ID. 인가 판정에서 투영용으로 쓴다. */
  @Query("SELECT p.project.id FROM TestPlan p WHERE p.id = :testPlanId")
  Optional<String> findProjectIdById(@Param("testPlanId") String testPlanId);

  @Query("SELECT t FROM TestPlan t WHERE t.project.id = :projectId ORDER BY t.createdAt DESC")
  List<TestPlan> findByProjectId(@Param("projectId") String projectId);

  long countByProjectId(String projectId);

  @Query(
      "SELECT t.project.id, COUNT(t) FROM TestPlan t WHERE t.project.id IN :projectIds GROUP BY"
          + " t.project.id")
  List<Object[]> countByProjectIds(@Param("projectIds") List<String> projectIds);

  @Query(
      "SELECT t FROM TestPlan t WHERE t.name LIKE CONCAT('%', :name, '%') ORDER BY t.createdAt"
          + " DESC")
  List<TestPlan> findByNameContaining(@Param("name") String name);

  @Modifying
  @Query("DELETE FROM TestPlan t WHERE t.project.id = :projectId")
  void deleteByProjectId(@Param("projectId") String projectId);
}
