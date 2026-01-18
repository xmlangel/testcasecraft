// src/main/java/com/testcase/testcasemanagement/controller/JunitResultController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.JunitTestResultDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.service.JunitResultService;
import com.testcase.testcasemanagement.service.JunitAsyncProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * ICT-203: JUnit XML 테스트 결과 업로드 및 관리 API
 */
@RestController
@RequestMapping("/api/junit-results")
@CrossOrigin(origins = "*")
@Tag(name = "Test Automation - JUnit Results", description = "자동화 테스트 결과 관리 API")
public class JunitResultController {

    private static final Logger logger = LoggerFactory.getLogger(JunitResultController.class);

    @Autowired
    private JunitResultService junitResultService;

    @Autowired
    private JunitAsyncProcessingService asyncProcessingService;

    @Value("${junit.file.large-size-threshold:52428800}") // 50MB
    private long largeFileSizeThreshold;

    /**
     * JUnit XML 파일 업로드 및 파싱
     */
    @PostMapping("/upload")
    @Operation(summary = "테스트 결과 XML 파일 업로드", description = "자동화 테스트 결과 XML 파일을 업로드하고 파싱하여 저장합니다.")
    @PreAuthorize("@projectSecurityService.canUploadToProject(#projectId, authentication.name)")
    public ResponseEntity<Map<String, Object>> uploadJunitXml(
            @Parameter(description = "업로드할 XML 파일") @RequestParam("file") MultipartFile file,
            @Parameter(description = "프로젝트 ID") @RequestParam("projectId") String projectId,
            @Parameter(description = "테스트 실행 이름") @RequestParam(value = "executionName", required = false) String executionName,
            @Parameter(description = "설명") @RequestParam(value = "description", required = false) String description,
            Authentication authentication,
            HttpServletRequest request) {

        logger.info("JUnit XML 파일 업로드 요청 - 파일: {}, 프로젝트: {}, 사용자: {}",
                file.getOriginalFilename(), projectId, authentication.getName());

        Map<String, Object> response = new HashMap<>();

        try {
            // 파일 유효성 기본 검증
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("error", "업로드된 파일이 비어있습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            if (!isValidXmlFile(file)) {
                response.put("success", false);
                response.put("error", "XML 파일만 업로드 가능합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 크기에 따른 처리 방식 결정
            boolean isLargeFile = file.getSize() > largeFileSizeThreshold;

            if (isLargeFile) {
                logger.info("대용량 파일 감지 - 비동기 처리 시작: {}MB", file.getSize() / 1024 / 1024);

                // 비동기 처리를 위한 기본 엔티티 생성
                JunitTestResult testResult = junitResultService.createInitialTestResult(
                        file, projectId, authentication.getName(), executionName, description);

                // 비동기 처리 시작
                CompletableFuture<JunitTestResult> futureResult = asyncProcessingService
                        .processLargeJunitFileAsync(testResult.getId(), testResult.getOriginalFilePath(),
                                testResult.getUploadedBy());

                // 즉시 응답 (처리 중 상태)
                response.put("success", true);
                response.put("message", "대용량 파일 업로드 완료. 백그라운드에서 처리 중입니다.");
                response.put("testResultId", testResult.getId());
                response.put("fileName", testResult.getFileName());
                response.put("status", "PROCESSING");
                response.put("isAsync", true);
                response.put("estimatedProcessingTime", estimateProcessingTime(file.getSize()));
                response.put("uploadedAt", testResult.getUploadedAt());

            } else {
                // 일반 동기 처리
                JunitTestResult testResult = junitResultService.uploadAndProcessJunitXml(
                        file, projectId, authentication.getName(), executionName, description);

                // 성공 응답
                response.put("success", true);
                response.put("message", "JUnit XML 파일이 성공적으로 업로드되고 처리되었습니다.");
                response.put("testResultId", testResult.getId());
                response.put("fileName", testResult.getFileName());
                response.put("totalTests", testResult.getTotalTests());
                response.put("failures", testResult.getFailures());
                response.put("errors", testResult.getErrors());
                response.put("skipped", testResult.getSkipped());
                response.put("successRate", testResult.getSuccessRate());
                response.put("status", testResult.getStatus().name());
                response.put("isAsync", false);
                response.put("uploadedAt", testResult.getUploadedAt());
            }

            logger.info("JUnit XML 파일 업로드 성공 - ID: {}",
                    response.get("testResultId"));

            return ResponseEntity.ok(response);

        } catch (JunitResultService.JunitProcessingException e) {
            logger.error("JUnit XML 파일 처리 실패: {}", e.getMessage(), e);

            response.put("success", false);
            response.put("error", "파일 처리 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(500).body(response);

        } catch (Exception e) {
            logger.error("예상치 못한 오류 발생: {}", e.getMessage(), e);

            response.put("success", false);
            response.put("error", "서버 내부 오류가 발생했습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 프로젝트별 테스트 결과 목록 조회
     */
    @GetMapping("/projects/{projectId}")
    @Operation(summary = "프로젝트 테스트 결과 목록", description = "특정 프로젝트의 JUnit 테스트 결과 목록을 조회합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getTestResultsByProject(
            @PathVariable String projectId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            Authentication authentication) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<JunitTestResult> testResults = junitResultService.getTestResultsByProject(projectId, pageable);

            // Entity to DTO 변환
            List<JunitTestResultDto> dtoList = testResults.getContent().stream()
                    .map(entity -> {
                        JunitTestResultDto dto = JunitTestResultDto.fromEntity(entity);
                        if (entity.getTestPlanId() != null) {
                            dto.setTestPlanName(junitResultService.getTestPlanName(entity.getTestPlanId()));
                        }
                        return dto;
                    })
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", dtoList);
            response.put("totalElements", testResults.getTotalElements());
            response.put("totalPages", testResults.getTotalPages());
            response.put("currentPage", page);
            response.put("size", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 결과 목록 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 결과 목록을 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 결과 상세 조회
     */
    @GetMapping("/{testResultId}")
    @Operation(summary = "테스트 결과 상세 조회", description = "특정 테스트 결과의 상세 정보를 조회합니다.")
    public ResponseEntity<Map<String, Object>> getTestResultDetail(@PathVariable String testResultId) {

        try {
            Optional<JunitTestResult> testResult = junitResultService.getTestResultById(testResultId);

            if (testResult.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "테스트 결과를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }

            // Entity to DTO 변환
            JunitTestResultDto dto = JunitTestResultDto.fromEntity(testResult.get());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("testResult", dto);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 결과 상세 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 결과를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 스위트 목록 조회
     */
    @GetMapping("/{testResultId}/suites")
    @Operation(summary = "테스트 스위트 목록", description = "테스트 결과에 포함된 스위트 목록을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getTestSuites(@PathVariable String testResultId) {

        try {
            List<JunitTestSuite> testSuites = junitResultService.getTestSuitesByResult(testResultId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("testSuites", testSuites);
            response.put("count", testSuites.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 스위트 목록 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 스위트 목록을 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 케이스 목록 조회
     */
    @GetMapping("/suites/{testSuiteId}/cases")
    @Operation(summary = "테스트 케이스 목록", description = "테스트 스위트에 포함된 케이스 목록을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getTestCases(
            @PathVariable String testSuiteId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<JunitTestCase> testCases = junitResultService.getTestCasesBySuite(testSuiteId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", testCases.getContent());
            response.put("totalElements", testCases.getTotalElements());
            response.put("totalPages", testCases.getTotalPages());
            response.put("currentPage", page);
            response.put("size", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 케이스 목록 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 케이스 목록을 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 실패한 테스트 케이스만 조회
     */
    @GetMapping("/{testResultId}/failed-cases")
    @Operation(summary = "실패한 테스트 케이스", description = "실패한 테스트 케이스만 조회합니다.")
    public ResponseEntity<Map<String, Object>> getFailedTestCases(@PathVariable String testResultId) {

        try {
            List<JunitTestCase> failedCases = junitResultService.getFailedTestCases(testResultId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("failedCases", failedCases);
            response.put("count", failedCases.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("실패한 테스트 케이스 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "실패한 테스트 케이스를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 가장 느린 테스트 케이스 조회
     */
    @GetMapping("/{testResultId}/slowest-cases")
    @Operation(summary = "가장 느린 테스트 케이스", description = "실행 시간이 가장 긴 테스트 케이스들을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getSlowestTestCases(
            @PathVariable String testResultId,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        try {
            List<JunitTestCase> slowestCases = junitResultService.getSlowestTestCases(testResultId, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("slowestCases", slowestCases);
            response.put("count", slowestCases.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("가장 느린 테스트 케이스 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "가장 느린 테스트 케이스를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 케이스 편집
     */
    @PutMapping("/cases/{testCaseId}")
    @Operation(summary = "테스트 케이스 편집", description = "테스트 케이스의 사용자 편집 정보를 업데이트합니다.")
    public ResponseEntity<Map<String, Object>> updateTestCase(
            @PathVariable String testCaseId,
            @RequestBody Map<String, Object> updateData,
            Authentication authentication) {

        try {
            String userTitle = (String) updateData.get("userTitle");
            String userDescription = (String) updateData.get("userDescription");
            String userNotes = (String) updateData.get("userNotes");
            String tags = (String) updateData.get("tags");
            String priority = (String) updateData.get("priority");

            JunitTestStatus userStatus = null;
            if (updateData.get("userStatus") != null) {
                userStatus = JunitTestStatus.valueOf((String) updateData.get("userStatus"));
            }

            JunitTestCase updatedTestCase = junitResultService.updateTestCase(
                    testCaseId, userTitle, userDescription, userNotes, userStatus,
                    tags, priority, authentication.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "테스트 케이스가 성공적으로 업데이트되었습니다.");
            response.put("testCase", updatedTestCase);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 케이스 업데이트 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 케이스를 업데이트할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 결과 삭제
     */
    @DeleteMapping("/{testResultId}")
    @Operation(summary = "테스트 결과 삭제", description = "테스트 결과와 관련된 모든 데이터를 삭제합니다.")
    public ResponseEntity<Map<String, Object>> deleteTestResult(
            @PathVariable String testResultId,
            Authentication authentication) {

        try {
            boolean deleted = junitResultService.deleteTestResult(testResultId);

            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("success", true);
                response.put("message", "테스트 결과가 성공적으로 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "테스트 결과를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            logger.error("테스트 결과 삭제 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 결과를 삭제할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 파일 처리 진행률 조회 (대용량 파일용)
     */
    @GetMapping("/{testResultId}/processing-progress")
    @Operation(summary = "파일 처리 진행률 조회", description = "대용량 파일의 비동기 처리 진행률을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getProcessingProgress(@PathVariable String testResultId) {

        try {
            JunitAsyncProcessingService.ProcessingProgress progress = asyncProcessingService
                    .getProcessingProgress(testResultId);

            Map<String, Object> response = new HashMap<>();

            if (progress != null) {
                response.put("success", true);
                response.put("testResultId", testResultId);
                response.put("progressPercentage", progress.getProgressPercentage());
                response.put("currentStep", progress.getCurrentStep());
                response.put("totalSteps", progress.getTotalSteps());
                response.put("statusMessage", progress.getStatusMessage());
                response.put("isCompleted", progress.isCompleted());
                response.put("isFailed", progress.isFailed());
                response.put("lastUpdated", progress.getLastUpdated());

                // 파싱 세부 진행률 (파싱 단계에서만)
                if (progress.getCurrentStep() == 2 && progress.getParsingTotal() > 0) {
                    response.put("parsingProgress", Map.of(
                            "current", progress.getParsingCurrent(),
                            "total", progress.getParsingTotal()));
                }
            } else {
                // 진행률 정보가 없으면 완료된 것으로 간주
                response.put("success", true);
                response.put("testResultId", testResultId);
                response.put("progressPercentage", 100.0);
                response.put("isCompleted", true);
                response.put("statusMessage", "처리 완료");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("진행률 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "진행률을 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 모든 활성 처리 작업 조회
     */
    @GetMapping("/active-processing")
    @Operation(summary = "활성 처리 작업 조회", description = "현재 처리 중인 모든 JUnit 파일의 진행률을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getActiveProcessing(Authentication authentication) {

        try {
            Map<String, JunitAsyncProcessingService.ProcessingProgress> allProgress = asyncProcessingService
                    .getAllProcessingProgress();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("activeCount", allProgress.size());
            response.put("processingTasks", allProgress);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("활성 처리 작업 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "활성 처리 작업을 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 파일 크기 기반 예상 처리 시간 계산
     */
    private String estimateProcessingTime(long fileSizeBytes) {
        // 대략적인 처리 속도: 1MB당 2-5초
        long fileSizeMB = fileSizeBytes / (1024 * 1024);
        long estimatedSeconds = fileSizeMB * 3; // 평균 3초로 계산

        if (estimatedSeconds < 60) {
            return estimatedSeconds + "초";
        } else if (estimatedSeconds < 3600) {
            return (estimatedSeconds / 60) + "분 " + (estimatedSeconds % 60) + "초";
        } else {
            long hours = estimatedSeconds / 3600;
            long minutes = (estimatedSeconds % 3600) / 60;
            return hours + "시간 " + minutes + "분";
        }
    }

    /**
     * 프로젝트별 JUnit 요약 통계 조회 (ICT-211)
     */
    @GetMapping("/projects/{projectId}/summary")
    @Operation(summary = "프로젝트 JUnit 요약 통계", description = "프로젝트의 JUnit 테스트 결과 요약 통계를 조회합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getProjectJunitSummary(
            @PathVariable String projectId,
            Authentication authentication) {

        try {
            // 프로젝트별 JUnit 결과 요약 통계 조회
            Map<String, Object> summary = junitResultService.getProjectSummaryStatistics(projectId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("projectId", projectId);
            response.put("summary", summary);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("프로젝트 JUnit 요약 통계 조회 실패 - 프로젝트: {}, 오류: {}", projectId, e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "JUnit 요약 통계를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 여러 프로젝트의 JUnit 요약 통계 배치 조회 (ICT-211)
     */
    @PostMapping("/projects/batch-summary")
    @Operation(summary = "여러 프로젝트 JUnit 요약 통계", description = "여러 프로젝트의 JUnit 테스트 결과 요약 통계를 배치로 조회합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getBatchProjectJunitSummary(
            @RequestBody List<String> projectIds,
            Authentication authentication) {

        try {
            // 배치로 여러 프로젝트의 JUnit 요약 통계 조회
            Map<String, Map<String, Object>> batchSummary = junitResultService
                    .getBatchProjectSummaryStatistics(projectIds);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("summaries", batchSummary);
            response.put("count", batchSummary.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("배치 프로젝트 JUnit 요약 통계 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "배치 JUnit 요약 통계를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * JUnit 통계 조회 (대시보드용)
     */
    @GetMapping("/statistics")
    @Operation(summary = "JUnit 통계 조회", description = "프로젝트별 JUnit 테스트 결과 통계를 조회합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getJunitStatistics(
            @RequestParam(value = "projectId", required = false) String projectId,
            @RequestParam(value = "timeRange", defaultValue = "7d") String timeRange,
            Authentication authentication) {

        logger.info("JUnit 통계 조회 요청 - 프로젝트: {}, 기간: {}, 사용자: {}",
                projectId, timeRange, authentication.getName());

        try {
            Map<String, Object> response = new HashMap<>();

            if (projectId != null && !projectId.trim().isEmpty()) {
                // 특정 프로젝트의 통계 조회
                Map<String, Object> projectSummary = junitResultService.getProjectSummaryStatistics(projectId);

                // 프론트엔드가 기대하는 형식으로 변환
                response.put("success", true);
                response.put("projectId", projectId);
                response.put("timeRange", timeRange);

                // 기존 summary 데이터에서 필요한 필드 추출 및 변환
                if (projectSummary.containsKey("hasResults") && (Boolean) projectSummary.get("hasResults")) {
                    // 실제 결과가 있는 경우
                    Integer totalPassed = calculateTotalPassed(projectId);
                    Integer totalFailed = calculateTotalFailed(projectId);
                    Integer totalErrors = calculateTotalErrors(projectId);
                    Integer totalSkipped = calculateTotalSkipped(projectId);
                    Integer totalTests = totalPassed + totalFailed + totalErrors + totalSkipped;

                    // 프론트엔드가 기대하는 형식으로 데이터 제공
                    response.put("totalTests", totalTests);
                    response.put("failures", totalFailed);
                    response.put("errors", totalErrors);
                    response.put("skipped", totalSkipped);

                    // 성공률 계산
                    Double successRate = 0.0;
                    if (totalTests > 0) {
                        successRate = (double) totalPassed / totalTests * 100;
                    }
                    response.put("successRate", successRate);

                    // 추가 통계 (호환성을 위해 유지)
                    response.put("totalPassed", totalPassed);
                    response.put("totalFailed", totalFailed);
                    response.put("totalErrors", totalErrors);
                    response.put("totalSkipped", totalSkipped);
                    response.put("averageSuccessRate", projectSummary.get("averageSuccessRate"));
                } else {
                    // 결과가 없는 경우 기본값
                    response.put("totalTests", 0);
                    response.put("failures", 0);
                    response.put("errors", 0);
                    response.put("skipped", 0);
                    response.put("successRate", 0.0);
                    response.put("totalPassed", 0);
                    response.put("totalFailed", 0);
                    response.put("totalErrors", 0);
                    response.put("totalSkipped", 0);
                    response.put("averageSuccessRate", 0.0);
                }

            } else {
                // 전체 통계 조회 (프로젝트 ID가 없는 경우)
                response.put("success", true);
                response.put("timeRange", timeRange);
                response.put("totalTests", 0);
                response.put("failures", 0);
                response.put("errors", 0);
                response.put("skipped", 0);
                response.put("successRate", 0.0);
                response.put("totalPassed", 0);
                response.put("totalFailed", 0);
                response.put("totalErrors", 0);
                response.put("totalSkipped", 0);
                response.put("averageSuccessRate", 0.0);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("JUnit 통계 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "통계 데이터를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 프로젝트별 총 통과 테스트 수 계산
     */
    private Integer calculateTotalPassed(String projectId) {
        try {
            List<JunitTestResult> results = junitResultService
                    .getTestResultsByProject(projectId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
            return results.stream()
                    .mapToInt(result -> result.getTotalTests() - result.getFailures() - result.getErrors()
                            - result.getSkipped())
                    .sum();
        } catch (Exception e) {
            logger.error("총 통과 테스트 수 계산 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 프로젝트별 총 실패 테스트 수 계산
     */
    private Integer calculateTotalFailed(String projectId) {
        try {
            List<JunitTestResult> results = junitResultService
                    .getTestResultsByProject(projectId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
            return results.stream()
                    .mapToInt(JunitTestResult::getFailures)
                    .sum();
        } catch (Exception e) {
            logger.error("총 실패 테스트 수 계산 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 프로젝트별 총 에러 테스트 수 계산
     */
    private Integer calculateTotalErrors(String projectId) {
        try {
            List<JunitTestResult> results = junitResultService
                    .getTestResultsByProject(projectId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
            return results.stream()
                    .mapToInt(JunitTestResult::getErrors)
                    .sum();
        } catch (Exception e) {
            logger.error("총 에러 테스트 수 계산 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 프로젝트별 총 스킵 테스트 수 계산
     */
    private Integer calculateTotalSkipped(String projectId) {
        try {
            List<JunitTestResult> results = junitResultService
                    .getTestResultsByProject(projectId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
            return results.stream()
                    .mapToInt(JunitTestResult::getSkipped)
                    .sum();
        } catch (Exception e) {
            logger.error("총 스킵 테스트 수 계산 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * ICT-337: 테스트 케이스 상세 정보 조회 (tracelog, testbody 포함)
     */
    @GetMapping("/testcases/{testCaseId}/details")
    @Operation(summary = "테스트 케이스 상세 정보 조회", description = "테스트 케이스의 tracelog, testbody 등 상세 정보를 조회합니다.")
    public ResponseEntity<Map<String, Object>> getTestCaseDetails(@PathVariable String testCaseId) {

        logger.info("테스트 케이스 상세 정보 조회 - ID: {}", testCaseId);

        try {
            Optional<JunitTestCase> testCase = junitResultService.getTestCaseById(testCaseId);

            if (testCase.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "테스트 케이스를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }

            JunitTestCase tc = testCase.get();

            // 상세 정보 구성
            Map<String, Object> details = new HashMap<>();
            details.put("id", tc.getId());
            details.put("name", tc.getName());
            details.put("className", tc.getClassName());
            details.put("status", tc.getStatus().name());
            details.put("time", tc.getTime());

            // tracelog 정보 (스택 트레이스 + 실패 메시지)
            Map<String, Object> tracelog = new HashMap<>();
            tracelog.put("stackTrace", tc.getStackTrace());
            tracelog.put("failureMessage", tc.getFailureMessage());
            tracelog.put("failureType", tc.getFailureType());
            tracelog.put("skipMessage", tc.getSkipMessage());
            details.put("tracelog", tracelog);

            // testbody 정보 (시스템 출력)
            Map<String, Object> testbody = new HashMap<>();
            testbody.put("systemOut", tc.getSystemOut());
            testbody.put("systemErr", tc.getSystemErr());
            details.put("testbody", testbody);

            // 사용자 편집 정보
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userTitle", tc.getUserTitle());
            userInfo.put("userDescription", tc.getUserDescription());
            userInfo.put("userNotes", tc.getUserNotes());
            userInfo.put("tags", tc.getTags());
            userInfo.put("priority", tc.getPriority());
            userInfo.put("userStatus", tc.getUserStatus() != null ? tc.getUserStatus().name() : null);
            details.put("userInfo", userInfo);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("testCase", details);

            logger.info("테스트 케이스 상세 정보 조회 성공 - ID: {}, 이름: {}", testCaseId, tc.getName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 케이스 상세 정보 조회 실패 - ID: {}, 오류: {}", testCaseId, e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 케이스 상세 정보를 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 결과를 테스트 플랜에 연결
     */
    @PutMapping("/{testResultId}/link-plan")
    @Operation(summary = "테스트 플랜 연결", description = "테스트 결과를 테스트 플랜에 연결합니다.")
    public ResponseEntity<Map<String, Object>> linkTestPlan(
            @PathVariable String testResultId,
            @RequestBody Map<String, String> body) {

        try {
            String testPlanId = body.get("testPlanId");
            JunitTestResult linkedResult = junitResultService.linkTestPlan(testResultId, testPlanId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "테스트 플랜이 성공적으로 연결되었습니다.");
            response.put("testResult", JunitTestResultDto.fromEntity(linkedResult));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 플랜 연결 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 플랜을 연결할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 플랜에 연결된 테스트 결과 목록 조회
     */
    @GetMapping("/by-plan/{testPlanId}")
    @Operation(summary = "테스트 플랜별 결과 목록", description = "테스트 플랜에 연결된 테스트 결과 목록을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getTestResultsByTestPlan(@PathVariable String testPlanId) {

        try {
            List<JunitTestResult> results = junitResultService.getTestResultsByTestPlan(testPlanId);
            List<JunitTestResultDto> dtoList = results.stream()
                    .map(JunitTestResultDto::fromEntity)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", dtoList);
            response.put("count", dtoList.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("테스트 플랜별 결과 목록 조회 실패: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "테스트 결과 목록을 조회할 수 없습니다.");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 플랜별 JUnit 비교 통계 조회 (View Type: By Plan)
     */
    @GetMapping("/comparison/by-plan")
    @Operation(summary = "플랜별 JUnit 비교 통계", description = "프로젝트의 테스트 플랜별 JUnit 테스트 결과 통계를 비교합니다.")
    public ResponseEntity<List<Map<String, Object>>> getComparisonStatisticsByPlan(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId) {

        logger.info("플랜별 JUnit 비교 통계 조회 요청 - 프로젝트: {}", projectId);

        try {
            List<Map<String, Object>> statistics = junitResultService.getComparisonStatisticsByPlan(projectId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("플랜별 JUnit 비교 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 실행자별 JUnit 비교 통계 조회 (View Type: By Executor)
     */
    @GetMapping("/comparison/by-executor")
    @Operation(summary = "실행자별 JUnit 비교 통계", description = "프로젝트의 실행자별 JUnit 테스트 결과 통계를 비교합니다.")
    public ResponseEntity<List<Map<String, Object>>> getComparisonStatisticsByExecutor(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId) {

        logger.info("실행자별 JUnit 비교 통계 조회 요청 - 프로젝트: {}", projectId);

        try {
            List<Map<String, Object>> statistics = junitResultService.getComparisonStatisticsByExecutor(projectId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("실행자별 JUnit 비교 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * XML 파일 유효성 검증
     */
    private boolean isValidXmlFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null)
            return false;

        String contentType = file.getContentType();
        return fileName.toLowerCase().endsWith(".xml") ||
                (contentType != null && (contentType.equals("text/xml") || contentType.equals("application/xml")));
    }
}