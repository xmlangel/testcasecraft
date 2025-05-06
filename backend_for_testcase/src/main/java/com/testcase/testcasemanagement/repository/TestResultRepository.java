// src/main/java/com/testcase/testcasemanagement/repository/TestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestResultRepository extends JpaRepository<TestResult, String> {
}
