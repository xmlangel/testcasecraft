package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;

    public TestCaseService(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    public List<TestCase> getAllTestCases() {
        return testCaseRepository.findAll();
    }

    public List<TestCase> getTestCasesByParentId(String parentId) { // ✅ String 타입
        return testCaseRepository.findByParentId(parentId);
    }
}
