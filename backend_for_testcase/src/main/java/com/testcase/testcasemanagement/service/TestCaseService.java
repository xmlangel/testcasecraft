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
        return testCaseRepository.save(testCase);
    }

    public TestCase findById(String id) { // ✅ String 타입 일관성 유지
        return testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public void deleteTestCase(String id) {
        // 자식 테스트케이스 먼저 삭제
        List<TestCase> children = testCaseRepository.findByParentId(id);
        children.forEach(child -> deleteTestCase(child.getId()));

        // 본인 삭제
        testCaseRepository.deleteById(id);
    }


}
