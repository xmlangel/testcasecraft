package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSession;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestSessionRepository extends JpaRepository<TestSession, String>, JpaSpecificationExecutor<TestSession> {
    List<TestSession> findByProjectIdOrderByCreatedAtDesc(String projectId);

    List<TestSession> findByProjectIdAndStatusOrderByCreatedAtDesc(
            String projectId,
            TestSession.SessionStatus status
    );
}
