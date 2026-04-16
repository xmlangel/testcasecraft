// src/main/java/com/testcase/testcasemanagement/repository/GoogleConfigRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.GoogleConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoogleConfigRepository extends JpaRepository<GoogleConfig, String> {
  Optional<GoogleConfig> findByUserId(String userId);

  void deleteByUserId(String userId);
}
