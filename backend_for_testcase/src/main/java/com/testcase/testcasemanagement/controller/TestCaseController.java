package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
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
import java.util.Map;
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
            // displayOrder 자동 할당을 위해 서비스에서 처리
            TestCase savedEntity = testCaseService.saveTestCase(testCaseDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(TestCaseMapper.toDto(savedEntity));
        } catch (ResourceNotValidException e) {
            return ResponseEntity.badRequest().body(e.getErrors());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Server error"));
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

    // 테스트 케이스 ID로 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDto> getTestCaseById(@PathVariable String id) {
        try {
            var entity = testCaseService.findById(id);
            var dto = TestCaseMapper.toDto(entity);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 프로젝트 ID로 테스트 케이스 전체 조회
    @GetMapping("/project/{projectId}")
    public List<TestCaseDto> getTestCasesByProjectId(@PathVariable String projectId) {
        List<TestCase> entities = testCaseService.getTestCasesByProjectId(projectId);
        return TestCaseMapper.toTreeDtoList(entities); // 계층형 DTO로 변환
    }
}
