// src/main/java/com/testcase/testcasemanagement/controller/TestExecutionController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.BulkTestResultDto;
import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.service.TestExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** 테스트 실행(Execution) 관리용 컨트롤러 */
@Tag(name = "Test Execution - Management", description = "테스트 실행 관리 API")
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
  public ResponseEntity<TestExecutionDto> createTestExecution(
      @Valid @RequestBody TestExecutionDto dto) {
    TestExecutionDto created = testExecutionService.createTestExecution(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // 테스트 실행 전체 조회 (옵션: testPlanId 필터)
  @GetMapping
  public ResponseEntity<List<TestExecutionDto>> getTestExecutions(
      @RequestParam(value = "testPlanId", required = false) String testPlanId) {
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
      @PathVariable String id, @Valid @RequestBody TestExecutionDto dto) {
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

  // 테스트 실행 재시작 (완료된 실행을 다시 진행중으로 변경)
  @PostMapping("/{id}/restart")
  public ResponseEntity<TestExecutionDto> restartTestExecution(@PathVariable String id) {
    try {
      TestExecutionDto restarted = testExecutionService.restartTestExecution(id);
      return ResponseEntity.ok(restarted);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  // 개별 테스트케이스 결과 업데이트
  @PostMapping("/{executionId}/results")
  public ResponseEntity<TestExecutionDto> updateTestResult(
      @PathVariable String executionId, @Valid @RequestBody TestResultDto resultDto) {
    System.out.println("받은 요청: " + resultDto);
    try {
      TestExecutionDto updated = testExecutionService.updateTestResult(executionId, resultDto);
      return ResponseEntity.ok(updated);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    }
  }

  // 일괄 테스트케이스 결과 업데이트
  @PostMapping("/{executionId}/results/bulk")
  public ResponseEntity<TestExecutionDto> updateTestResultsBulk(
      @PathVariable String executionId, @Valid @RequestBody BulkTestResultDto bulkResultDto) {
    System.out.println("일괄 결과 업데이트 요청: " + bulkResultDto);
    try {
      TestExecutionDto updated =
          testExecutionService.updateTestResultsBulk(executionId, bulkResultDto);
      return ResponseEntity.ok(updated);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    }
  }

  @GetMapping("/by-project/{projectId}")
  public ResponseEntity<?> getTestExecutionsByProject(
      @PathVariable String projectId,
      @RequestParam(required = false) String name,
      @org.springframework.data.web.PageableDefault(
              size = 20,
              sort = "createdAt",
              direction = org.springframework.data.domain.Sort.Direction.DESC)
          org.springframework.data.domain.Pageable pageable) {

    org.springframework.data.domain.Page<TestExecutionDto> executionPage =
        testExecutionService.getTestExecutionsByProject(projectId, name, pageable);

    // 프론트엔드의 호환성을 위해 리스트(Page.getContent())를 반환하거나
    // 페이징 정보를 포함한 래퍼 객체를 반환할 수 있습니다.
    // 여기서는 페이징 정보를 헤더나 별도 필드로 전달하는 것이 좋으나,
    // 일단 ApiResponse 형식을 따르거나 Page 자체를 반환합니다.
    return ResponseEntity.ok(executionPage);
  }

  @GetMapping("/by-testcase/{testCaseId}")
  public ResponseEntity<List<TestResultDto>> getTestResultsByTestCaseId(
      @PathVariable String testCaseId) {
    List<TestResultDto> results = testExecutionService.getTestResultsByTestCaseId(testCaseId);
    return ResponseEntity.ok(results);
  }

  /** 이전 테스트 결과 수정 (PreviousResultsDialog용) 권한: 실행한 본인 OR Admin OR Manager */
  @PutMapping("/results/{resultId}")
  @Operation(
      summary = "이전 테스트 결과 수정",
      description = "과거 테스트 결과를 수정합니다. 실행한 본인, Admin, Manager만 수정 가능합니다.")
  public ResponseEntity<TestResultDto> updatePreviousTestResult(
      @Parameter(description = "테스트 결과 ID") @PathVariable String resultId,
      @Valid @RequestBody TestResultDto resultDto,
      Authentication authentication) {

    System.out.println("이전 결과 수정 요청: resultId=" + resultId + ", user=" + authentication.getName());

    try {
      String currentUsername = authentication.getName();
      TestResultDto updated =
          testExecutionService.updatePreviousTestResult(resultId, resultDto, currentUsername);
      return ResponseEntity.ok(updated);
    } catch (SecurityException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    }
  }

  /** 이전 테스트 결과 삭제 (PreviousResultsDialog용) 권한: Admin OR Manager만 */
  @DeleteMapping("/results/{resultId}")
  @Operation(summary = "이전 테스트 결과 삭제", description = "과거 테스트 결과를 삭제합니다. Admin, Manager만 삭제 가능합니다.")
  public ResponseEntity<Void> deletePreviousTestResult(
      @Parameter(description = "테스트 결과 ID") @PathVariable String resultId,
      Authentication authentication) {

    System.out.println("이전 결과 삭제 요청: resultId=" + resultId + ", user=" + authentication.getName());

    try {
      String currentUsername = authentication.getName();
      testExecutionService.deletePreviousTestResult(resultId, currentUsername);
      return ResponseEntity.noContent().build();
    } catch (SecurityException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    }
  }
}
