package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSession;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TestSessionRepository
    extends JpaRepository<TestSession, String>, JpaSpecificationExecutor<TestSession> {
  List<TestSession> findByProjectIdOrderByCreatedAtDesc(String projectId);

  List<TestSession> findByProjectIdAndStatusOrderByCreatedAtDesc(
      String projectId, TestSession.SessionStatus status);
}
