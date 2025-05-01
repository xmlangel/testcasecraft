package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.service.TestCaseService;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {
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

    @PatchMapping("/{id}")
    public ResponseEntity<TestCaseDto> updateTestCase(
            @PathVariable Long id, // ID 타입을 Long으로 수정
            @RequestBody TestCaseDto testCaseDto
    ) {
        TestCase entity = testCaseService.findById(id);
        TestCaseMapper.updateEntityFromDto(testCaseDto, entity);
        TestCase updatedEntity = testCaseService.saveTestCase(entity);
        return ResponseEntity.ok(TestCaseMapper.toDto(updatedEntity));
    }
}
