package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCaseMoveAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCaseMoveAuditLogRepository
    extends JpaRepository<TestCaseMoveAuditLog, String> {

  List<TestCaseMoveAuditLog> findByTestcaseIdOrderByMovedAtDesc(String testcaseId);

  List<TestCaseMoveAuditLog> findByBatchGroupId(String batchGroupId);
}
