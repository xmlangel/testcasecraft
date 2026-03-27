package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestSessionInterruption;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestSessionInterruptionRepository
    extends JpaRepository<TestSessionInterruption, String> {
  List<TestSessionInterruption> findBySessionIdOrderByStartedAtAsc(String sessionId);

  Optional<TestSessionInterruption> findFirstBySessionIdAndEndedAtIsNullOrderByStartedAtDesc(
      String sessionId);
}
