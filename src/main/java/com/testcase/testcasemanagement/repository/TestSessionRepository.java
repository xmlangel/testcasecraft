package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSession;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestSessionRepository
    extends JpaRepository<TestSession, String>, JpaSpecificationExecutor<TestSession> {
  List<TestSession> findByProjectIdOrderByCreatedAtDesc(String projectId);

  List<TestSession> findByProjectIdAndStatusOrderByCreatedAtDesc(
      String projectId, TestSession.SessionStatus status);

  /** 세션이 속한 프로젝트 ID (객체수준 인가용). */
  @Query("SELECT s.project.id FROM TestSession s WHERE s.id = :sessionId")
  Optional<String> findProjectIdById(@Param("sessionId") String sessionId);
}
