package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSessionApproval;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestSessionApprovalRepository extends JpaRepository<TestSessionApproval, String> {
  List<TestSessionApproval> findBySessionIdOrderByDecidedAtDesc(String sessionId);
}
