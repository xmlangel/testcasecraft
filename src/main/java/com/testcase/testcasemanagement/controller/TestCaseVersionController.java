// src/main/java/com/testcase/testcasemanagement/controller/TestCaseVersionController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ApiResponse;
import com.testcase.testcasemanagement.dto.TestCaseVersionDto;
import com.testcase.testcasemanagement.service.TestCaseVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ICT-349: 테스트케이스 버전 관리 시스템 - Controller
 * 
 * 테스트케이스 버전 관리를 위한 REST API 엔드포인트 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/testcase-versions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "TestCase Version Management", description = "테스트케이스 버전 관리 API")
public class TestCaseVersionController {

    private final TestCaseVersionService versionService;

    // ============ 버전 조회 API ============

    @GetMapping("/testcase/{testCaseId}/history")
    @Operation(summary = "테스트케이스 버전 히스토리 조회", description = "특정 테스트케이스의 모든 버전 히스토리를 조회합니다.")
    public ResponseEntity<ApiResponse<List<TestCaseVersionDto>>> getVersionHistory(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId) {
        
        try {
            List<TestCaseVersionDto> versions = versionService.getVersionHistory(testCaseId);
            return ResponseEntity.ok(new ApiResponse<>(true, "버전 히스토리 조회 성공", versions));
        } catch (Exception e) {
            log.error("버전 히스토리 조회 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "버전 히스토리 조회 실패: " + e.getMessage(), null));
        }
    }

    @GetMapping("/testcase/{testCaseId}/current")
    @Operation(summary = "현재 활성 버전 조회", description = "특정 테스트케이스의 현재 활성 버전을 조회합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> getCurrentVersion(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId) {
        
        try {
            return versionService.getCurrentVersion(testCaseId)
                    .map(version -> ResponseEntity.ok(new ApiResponse<>(true, "현재 버전 조회 성공", version)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("현재 버전 조회 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "현재 버전 조회 실패: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{versionId}")
    @Operation(summary = "특정 버전 상세 조회", description = "특정 버전의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> getVersionDetail(
            @Parameter(description = "버전 ID") @PathVariable String versionId) {
        
        try {
            return versionService.getVersionDetail(versionId)
                    .map(version -> ResponseEntity.ok(new ApiResponse<>(true, "버전 상세 조회 성공", version)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("버전 상세 조회 실패: versionId={}, error={}", versionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "버전 상세 조회 실패: " + e.getMessage(), null));
        }
    }

    @GetMapping("/project/{projectId}/current-versions")
    @Operation(summary = "프로젝트 현재 버전들 조회", description = "특정 프로젝트의 모든 테스트케이스의 현재 버전들을 조회합니다.")
    public ResponseEntity<ApiResponse<List<TestCaseVersionDto>>> getCurrentVersionsByProject(
            @Parameter(description = "프로젝트 ID") @PathVariable String projectId) {
        
        try {
            List<TestCaseVersionDto> versions = versionService.getCurrentVersionsByProject(projectId);
            return ResponseEntity.ok(new ApiResponse<>(true, "프로젝트 현재 버전들 조회 성공", versions));
        } catch (Exception e) {
            log.error("프로젝트 현재 버전들 조회 실패: projectId={}, error={}", projectId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "프로젝트 현재 버전들 조회 실패: " + e.getMessage(), null));
        }
    }

    // ============ 버전 생성 API ============

    @PostMapping("/testcase/{testCaseId}/create-version")
    @Operation(summary = "수동 버전 생성", description = "테스트케이스의 새로운 버전을 수동으로 생성합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> createManualVersion(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId,
            @RequestBody CreateVersionRequest request) {
        
        try {
            TestCaseVersionDto version = versionService.createManualVersion(
                    testCaseId, request.getVersionLabel(), request.getVersionDescription());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "수동 버전 생성 성공", version));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("수동 버전 생성 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "수동 버전 생성 실패: " + e.getMessage(), null));
        }
    }

    // ============ 버전 복원 API ============

    @PostMapping("/{versionId}/restore")
    @Operation(summary = "버전 복원", description = "특정 버전을 현재 버전으로 복원합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> restoreVersion(
            @Parameter(description = "복원할 버전 ID") @PathVariable String versionId) {
        
        try {
            TestCaseVersionDto restoredVersion = versionService.restoreVersion(versionId);
            return ResponseEntity.ok(new ApiResponse<>(true, "버전 복원 성공", restoredVersion));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("버전 복원 실패: versionId={}, error={}", versionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "버전 복원 실패: " + e.getMessage(), null));
        }
    }

    // ============ 버전 비교 API ============

    @GetMapping("/compare/{versionId1}/{versionId2}")
    @Operation(summary = "버전 비교", description = "두 버전 간의 차이점을 비교합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> compareVersions(
            @Parameter(description = "비교할 첫 번째 버전 ID") @PathVariable String versionId1,
            @Parameter(description = "비교할 두 번째 버전 ID") @PathVariable String versionId2) {
        
        try {
            Map<String, Object> comparison = versionService.compareVersions(versionId1, versionId2);
            return ResponseEntity.ok(new ApiResponse<>(true, "버전 비교 성공", comparison));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("버전 비교 실패: versionId1={}, versionId2={}, error={}", versionId1, versionId2, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "버전 비교 실패: " + e.getMessage(), null));
        }
    }

    // ============ 버전 관리 API ============

    @DeleteMapping("/testcase/{testCaseId}/cleanup")
    @Operation(summary = "오래된 버전 정리", description = "테스트케이스의 오래된 버전들을 정리합니다 (최신 N개만 유지).")
    public ResponseEntity<ApiResponse<Integer>> cleanupOldVersions(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId,
            @Parameter(description = "유지할 버전 개수") @RequestParam(defaultValue = "10") int keepCount) {
        
        try {
            int deletedCount = versionService.cleanupOldVersions(testCaseId, keepCount);
            return ResponseEntity.ok(new ApiResponse<>(true, 
                    String.format("오래된 버전 정리 완료 (%d개 삭제)", deletedCount), deletedCount));
        } catch (Exception e) {
            log.error("오래된 버전 정리 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "오래된 버전 정리 실패: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/cleanup/drafts")
    @Operation(summary = "임시 버전 정리", description = "지정된 날짜 이전의 임시(DRAFT) 버전들을 정리합니다.")
    public ResponseEntity<ApiResponse<Integer>> cleanupDraftVersions(
            @Parameter(description = "정리 기준 날짜 (이 날짜 이전의 DRAFT 버전들 삭제)") 
            @RequestParam String cutoffDate) {
        
        try {
            LocalDateTime cutoff = LocalDateTime.parse(cutoffDate);
            int deletedCount = versionService.cleanupDraftVersions(cutoff);
            return ResponseEntity.ok(new ApiResponse<>(true, 
                    String.format("임시 버전 정리 완료 (%d개 삭제)", deletedCount), deletedCount));
        } catch (Exception e) {
            log.error("임시 버전 정리 실패: cutoffDate={}, error={}", cutoffDate, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "임시 버전 정리 실패: " + e.getMessage(), null));
        }
    }

    // ============ 내부 클래스: 요청 DTO ============

    public static class CreateVersionRequest {
        private String versionLabel;
        private String versionDescription;

        // Getters and Setters
        public String getVersionLabel() { return versionLabel; }
        public void setVersionLabel(String versionLabel) { this.versionLabel = versionLabel; }
        public String getVersionDescription() { return versionDescription; }
        public void setVersionDescription(String versionDescription) { this.versionDescription = versionDescription; }
    }

    // ============ 헬스 체크 ============

    @GetMapping("/health")
    @Operation(summary = "버전 관리 시스템 상태 확인", description = "버전 관리 시스템의 동작 상태를 확인합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        try {
            Map<String, Object> health = Map.of(
                    "status", "UP",
                    "timestamp", LocalDateTime.now(),
                    "service", "TestCaseVersionService"
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "버전 관리 시스템 정상 동작", health));
        } catch (Exception e) {
            log.error("헬스 체크 실패: error={}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiResponse<>(false, "버전 관리 시스템 오류", null));
        }
    }
}