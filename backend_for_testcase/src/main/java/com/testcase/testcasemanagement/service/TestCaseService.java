package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    public TestCase saveTestCase(TestCase testCase) {
        testCase.setCreatedAt(LocalDateTime.now());
        testCase.setUpdatedAt(LocalDateTime.now());
        return testCaseRepository.save(testCase);
    }

    public TestCase findById(Long id) {
        Optional<TestCase> optionalTestCase = testCaseRepository.findById(id);
        return optionalTestCase.orElseThrow(() -> new RuntimeException("TestCase not found with id: " + id));
    }


}
