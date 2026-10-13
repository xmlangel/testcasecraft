package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.requirement.RequirementCoverageResponse;
import com.testcase.testcasemanagement.dto.requirement.RequirementIdsRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementReportResponse;
import com.testcase.testcasemanagement.dto.requirement.RequirementRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementResponse;
import com.testcase.testcasemanagement.dto.requirement.RequirementSpecRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementSpecResponse;
import com.testcase.testcasemanagement.service.RequirementReportService;
import com.testcase.testcasemanagement.service.RequirementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 요구사항 관리 API. 인가는 서비스에서 프로젝트 단위로 판정한다(조회 = 접근 권한, 변경 = 편집 권한). */
@Tag(name = "Requirement", description = "요구사항 문서·요구사항·TC 연결·커버리지·리포트")
@RestController
@RequestMapping("/api")
public class RequirementController {

  private final RequirementService requirementService;
  private final RequirementReportService reportService;

  public RequirementController(
      RequirementService requirementService, RequirementReportService reportService) {
    this.requirementService = requirementService;
    this.reportService = reportService;
  }

  // 요구사항 문서

  @Operation(summary = "프로젝트의 요구사항 문서 목록")
  @GetMapping("/projects/{projectId}/requirement-specs")
  public List<RequirementSpecResponse> getSpecs(@PathVariable String projectId) {
    return requirementService.getSpecs(projectId);
  }

  @Operation(summary = "요구사항 문서 생성")
  @GetMapping("/projects/{projectId}/requirement-specs/next-doc-id")
  public Map<String, String> nextSpecDocId(@PathVariable String projectId) {
    return Map.of("docId", requirementService.suggestSpecDocId(projectId));
  }

  @PostMapping("/requirement-specs")
  public ResponseEntity<RequirementSpecResponse> createSpec(
      @Valid @RequestBody RequirementSpecRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(requirementService.createSpec(request));
  }

  @Operation(summary = "요구사항 문서 수정")
  @PutMapping("/requirement-specs/{id}")
  public RequirementSpecResponse updateSpec(
      @PathVariable String id, @Valid @RequestBody RequirementSpecRequest request) {
    return requirementService.updateSpec(id, request);
  }

  @Operation(summary = "요구사항 문서 삭제", description = "하위 문서와 그 안의 요구사항·TC 연결을 함께 지운다.")
  @DeleteMapping("/requirement-specs/{id}")
  public ResponseEntity<Void> deleteSpec(@PathVariable String id) {
    requirementService.deleteSpec(id);
    return ResponseEntity.noContent().build();
  }

  // 요구사항

  @Operation(summary = "프로젝트의 요구사항 목록")
  @GetMapping("/projects/{projectId}/requirements")
  public List<RequirementResponse> getRequirements(@PathVariable String projectId) {
    return requirementService.getRequirements(projectId);
  }

  @Operation(summary = "요구사항 단건 조회")
  @GetMapping("/requirement-specs/{specId}/next-requirement-doc-id")
  public Map<String, String> nextRequirementDocId(@PathVariable String specId) {
    return Map.of("docId", requirementService.suggestRequirementDocId(specId));
  }

  @GetMapping("/requirements/{id}")
  public RequirementResponse getRequirement(@PathVariable String id) {
    return requirementService.getRequirement(id);
  }

  @Operation(summary = "요구사항 생성")
  @PostMapping("/requirements")
  public ResponseEntity<RequirementResponse> createRequirement(
      @Valid @RequestBody RequirementRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(requirementService.createRequirement(request));
  }

  @Operation(summary = "요구사항 수정")
  @PutMapping("/requirements/{id}")
  public RequirementResponse updateRequirement(
      @PathVariable String id, @Valid @RequestBody RequirementRequest request) {
    return requirementService.updateRequirement(id, request);
  }

  @Operation(summary = "요구사항 삭제")
  @DeleteMapping("/requirements/{id}")
  public ResponseEntity<Void> deleteRequirement(@PathVariable String id) {
    requirementService.deleteRequirement(id);
    return ResponseEntity.noContent().build();
  }

  // TC 연결

  @Operation(summary = "요구사항에 TC 연결 추가")
  @PostMapping("/requirements/{id}/test-cases")
  public RequirementResponse addTestCases(
      @PathVariable String id, @Valid @RequestBody RequirementIdsRequest request) {
    return requirementService.addTestCases(id, request.ids());
  }

  @Operation(summary = "요구사항에서 TC 연결 해제")
  @DeleteMapping("/requirements/{id}/test-cases/{testCaseId}")
  public RequirementResponse removeTestCase(
      @PathVariable String id, @PathVariable String testCaseId) {
    return requirementService.removeTestCase(id, testCaseId);
  }

  @Operation(summary = "TC 에 연결된 요구사항 목록")
  @GetMapping("/requirements/by-test-case/{testCaseId}")
  public List<RequirementResponse> getRequirementsForTestCase(@PathVariable String testCaseId) {
    return requirementService.getRequirementsForTestCase(testCaseId);
  }

  @Operation(summary = "TC 의 요구사항 연결을 주어진 목록으로 교체")
  @PutMapping("/requirements/by-test-case/{testCaseId}")
  public List<RequirementResponse> replaceRequirementsForTestCase(
      @PathVariable String testCaseId, @Valid @RequestBody RequirementIdsRequest request) {
    return requirementService.replaceRequirementsForTestCase(testCaseId, request.ids());
  }

  // 분석

  @Operation(summary = "요구사항 커버리지 분석")
  @GetMapping("/projects/{projectId}/requirements/coverage")
  public RequirementCoverageResponse coverage(@PathVariable String projectId) {
    return reportService.coverage(projectId);
  }

  @Operation(summary = "요구사항 기반 리포트", description = "testPlanId 또는 executionId 중 하나가 필요하다.")
  @GetMapping("/projects/{projectId}/requirements/report")
  public RequirementReportResponse report(
      @PathVariable String projectId,
      @RequestParam(required = false) String testPlanId,
      @RequestParam(required = false) String executionId) {
    return reportService.report(projectId, testPlanId, executionId);
  }
}
