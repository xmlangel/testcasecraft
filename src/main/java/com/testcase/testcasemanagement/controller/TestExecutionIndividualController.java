// src/main/java/com/testcase/testcasemanagement/controller/TestExecutionIndividualController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.service.TestCaseService;
import com.testcase.testcasemanagement.service.TestExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@Tag(name = "Test Execution - Individual", description = "개별 테스트 실행 API")
@RestController
@RequestMapping("/executions")
@CrossOrigin(origins = "*")
public class TestExecutionIndividualController {

    private final TestExecutionService testExecutionService;
    private final TestCaseService testCaseService;

    @Autowired
    public TestExecutionIndividualController(TestExecutionService testExecutionService,
            TestCaseService testCaseService) {
        this.testExecutionService = testExecutionService;
        this.testCaseService = testCaseService;
    }

    // 실행ID로 해당 실행에 포함된 테스트케이스 목록 조회
    @Operation(summary = "실행에 포함된 테스트케이스 조회", description = "특정 테스트 실행에 포함된 테스트케이스 목록을 조회합니다.")
    @GetMapping("/{executionId}")
    public ResponseEntity<List<TestCaseDto>> getTestCasesByExecutionId(@PathVariable String executionId) {
        Optional<TestExecutionDto> executionOpt = testExecutionService.getTestExecutionById(executionId);
        if (executionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TestExecutionDto execution = executionOpt.get();

        String testPlanId = execution.getTestPlanId();
        if (testPlanId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<TestCaseDto> testCases = testCaseService.getTestCasesByParentId(testPlanId).stream()
                .map(tc -> testCaseService.getTestCaseDtoById(tc.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(testCases);
    }
}
