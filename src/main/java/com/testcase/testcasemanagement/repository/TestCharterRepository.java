package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCharter;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCharterRepository extends JpaRepository<TestCharter, String> {
  List<TestCharter> findByProjectIdOrderByCreatedAtDesc(String projectId);
}
