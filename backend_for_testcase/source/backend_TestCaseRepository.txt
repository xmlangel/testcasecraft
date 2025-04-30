package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByParentId(String parentId); // ✅ String 타입
    List<TestCase> findByType(String type);
}
