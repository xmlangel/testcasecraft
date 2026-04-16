// src/main/java/com/testcase/testcasemanagement/repository/GoogleConfigRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.GoogleConfig;
import com.testcase.testcasemanagement.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoogleConfigRepository extends JpaRepository<GoogleConfig, String> {
  Optional<GoogleConfig> findByUser(User user);

  void deleteByUser(User user);
}
