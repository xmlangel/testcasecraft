// src/main/java/com/testcase/testcasemanagement/controller/TestExecutionController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.service.TestExecutionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

/**
 * 테스트 실행(Execution) 관리용 컨트롤러
 */
@RestController
@RequestMapping("/api/test-executions")
@CrossOrigin(origins = "*")
public class TestExecutionController {

    private final TestExecutionService testExecutionService;

    @Autowired
    public TestExecutionController(TestExecutionService testExecutionService) {
        this.testExecutionService = testExecutionService;
    }

    // 테스트 실행 생성
    @PostMapping
    public ResponseEntity<TestExecutionDto> createTestExecution(@Valid @RequestBody TestExecutionDto dto) {
        TestExecutionDto created = testExecutionService.createTestExecution(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 테스트 실행 전체 조회 (옵션: testPlanId로 필터)
    @GetMapping
    public ResponseEntity<List<TestExecutionDto>> getTestExecutions(
            @RequestParam(value = "testPlanId", required = false) String testPlanId
    ) {
        List<TestExecutionDto> executions = testExecutionService.getTestExecutions(testPlanId);
        return ResponseEntity.ok(executions);
    }

    // 테스트 실행 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<TestExecutionDto> getTestExecutionById(@PathVariable String id) {
        Optional<TestExecutionDto> dto = testExecutionService.getTestExecutionById(id);
        return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 테스트 실행 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<TestExecutionDto> updateTestExecution(
            @PathVariable String id,
            @Valid @RequestBody TestExecutionDto dto
    ) {
        TestExecutionDto updated = testExecutionService.updateTestExecution(id, dto);
        return ResponseEntity.ok(updated);
    }

    // 테스트 실행 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestExecution(@PathVariable String id) {
        testExecutionService.deleteTestExecution(id);
        return ResponseEntity.noContent().build();
    }

    // 테스트 실행 시작
    @PostMapping("/{id}/start")
    public ResponseEntity<TestExecutionDto> startTestExecution(@PathVariable String id) {
        TestExecutionDto started = testExecutionService.startTestExecution(id);
        return ResponseEntity.ok(started);
    }

    // 테스트 실행 완료
    @PostMapping("/{id}/complete")
    public ResponseEntity<TestExecutionDto> completeTestExecution(@PathVariable String id) {
        TestExecutionDto completed = testExecutionService.completeTestExecution(id);
        return ResponseEntity.ok(completed);
    }

    // 개별 테스트케이스 결과 업데이트
    @PostMapping("/{executionId}/results")
    public ResponseEntity<TestExecutionDto> updateTestResult(
            @PathVariable String executionId,
            @Valid @RequestBody TestResultDto resultDto
    ) {
        try {
            TestExecutionDto updated = testExecutionService.updateTestResult(executionId, resultDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
}
