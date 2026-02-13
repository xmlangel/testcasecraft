package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCharter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCharterRepository extends JpaRepository<TestCharter, String> {
    List<TestCharter> findByProjectIdOrderByCreatedAtDesc(String projectId);
}
