package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.AgentConnection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentConnectionRepository extends JpaRepository<AgentConnection, String> {

  Optional<AgentConnection> findByProjectId(String projectId);

  void deleteByProjectId(String projectId);

  boolean existsByProjectId(String projectId);
}
