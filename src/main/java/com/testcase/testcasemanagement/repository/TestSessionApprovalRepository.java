package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSessionApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestSessionApprovalRepository extends JpaRepository<TestSessionApproval, String> {
    List<TestSessionApproval> findBySessionIdOrderByDecidedAtDesc(String sessionId);
}
