package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.service.TestCaseService;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {
    @Autowired
    private TestCaseRepository testCaseRepository;

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping
    public List<TestCaseDto> getAllTestCases() {
        return TestCaseMapper.toDtoList(testCaseService.getAllTestCases());
    }

    @GetMapping("/tree")
    public List<TestCaseDto> getTestCaseTree() {
        return TestCaseMapper.toTreeDtoList(testCaseService.getAllTestCases());
    }

    @PostMapping
    public ResponseEntity<TestCaseDto> createTestCase(@RequestBody TestCaseDto testCaseDto) {
        TestCase entity = TestCaseMapper.toEntity(testCaseDto);
        TestCase savedEntity = testCaseService.saveTestCase(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(TestCaseMapper.toDto(savedEntity));
    }

    @PutMapping("/{id}")
    public TestCase updateTestCase(@PathVariable String id, @RequestBody TestCase updatedTestCase) {
        Optional<TestCase> optionalTestCase = testCaseRepository.findById(id);
        if (optionalTestCase.isEmpty()) {
            throw new RuntimeException("TestCase not found");
        }
        TestCase testCase = optionalTestCase.get();
        testCase.setName(updatedTestCase.getName());
        testCase.setDescription(updatedTestCase.getDescription());
        testCase.setSteps(updatedTestCase.getSteps());
        testCase.setExpectedResults(updatedTestCase.getExpectedResults());
        testCase.setParentId(updatedTestCase.getParentId());
        testCase.setUpdatedAt(LocalDateTime.now());
        // 필요시 기타 필드도 추가
        return testCaseRepository.save(testCase);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable String id) {
        testCaseService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }
}
