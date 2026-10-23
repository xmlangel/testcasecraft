package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCharter;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestCharterRepository extends JpaRepository<TestCharter, String> {
  List<TestCharter> findByProjectIdOrderByCreatedAtDesc(String projectId);

  /** 차터가 속한 프로젝트 ID (객체수준 인가용). */
  @Query("SELECT c.project.id FROM TestCharter c WHERE c.id = :charterId")
  Optional<String> findProjectIdById(@Param("charterId") String charterId);
}
