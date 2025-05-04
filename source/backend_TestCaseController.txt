package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

//    테스트케이스 생성
    @PostMapping
    public ResponseEntity<?> createTestCase(@Valid @RequestBody TestCaseDto testCaseDto) {
        try {
            TestCase savedEntity = testCaseService.saveTestCase(testCaseDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(TestCaseMapper.toDto(savedEntity));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "데이터 충돌 발생: " + e.getMessage());
        }
    }

    //테스트 케이스 수정
    @PutMapping("/{id}")
    public ResponseEntity<TestCaseDto> updateTestCase(
            @PathVariable String id,
            @RequestBody TestCase updatedTestCase
    ) {
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

        TestCase saved = testCaseRepository.save(testCase);
        return ResponseEntity.ok(TestCaseMapper.toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestCase(@PathVariable String id) {
        Optional<TestCase> optionalTestCase = testCaseRepository.findById(id);
        if (optionalTestCase.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"message\": \"TestCase not found\", \"id\": \"" + id + "\"}");
        }

        TestCase deleted = optionalTestCase.get();
        TestCaseDto dto = TestCaseMapper.toDto(deleted); // 세션 내에서 DTO 변환
        testCaseService.deleteTestCase(id);

        return ResponseEntity.ok(dto); // 미리 변환된 DTO 반환
    }
}
