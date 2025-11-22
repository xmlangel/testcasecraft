// src/main/java/com/testcase/testcasemanagement/controller/TestPlanController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestPlanDto;
import com.testcase.testcasemanagement.mapper.TestPlanMapper;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.service.TestPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Test Plan - Management", description = "테스트 계획 관리 API")
@RestController
@RequestMapping("/api/test-plans")
@CrossOrigin(origins = "*")
public class TestPlanController {

    private final TestPlanService testPlanService;
    private final TestPlanMapper testPlanMapper;

    @Autowired
    public TestPlanController(TestPlanService testPlanService, TestPlanMapper testPlanMapper) {
        this.testPlanService = testPlanService;
        this.testPlanMapper = testPlanMapper;
    }

    @PostMapping
    public ResponseEntity<TestPlanDto> createTestPlan(
            @RequestBody @Valid TestPlanDto dto) {
        TestPlan createdPlan = testPlanService.createTestPlan(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(testPlanMapper.toDto(createdPlan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestPlanDto> updateTestPlan(
            @PathVariable String id,
            @RequestBody @Valid TestPlanDto dto) {
        TestPlan updatedPlan = testPlanService.updateTestPlan(id, dto);
        return ResponseEntity.ok(testPlanMapper.toDto(updatedPlan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestPlan(@PathVariable String id) {
        testPlanService.deleteTestPlan(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestPlanById(@PathVariable String id) {
        try {
            return testPlanService.getTestPlanById(id)
                    .map(testPlanMapper::toDto)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching test plan: " + e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TestPlanDto>> getTestPlansByProject(
            @PathVariable String projectId) {
        List<TestPlan> plans = testPlanService.getTestPlansByProject(projectId);
        List<TestPlanDto> dtos = plans.stream()
                .map(testPlanMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
