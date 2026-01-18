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
@Tag(name = "Test Case - Versioning", description = "테스트케이스 버전 관리 API")
public class TestCaseVersionController {

    private final TestCaseVersionService versionService;

    // ============ 버전 조회 API ============

    @GetMapping("/testcase/{testCaseId}/history")
    @Operation(summary = "테스트케이스 버전 히스토리 조회", description = "특정 테스트케이스의 모든 버전 히스토리를 조회합니다.")
    public ResponseEntity<ApiResponse<List<TestCaseVersionDto>>> getVersionHistory(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId) {
        
        try {
            List<TestCaseVersionDto> versions = versionService.getVersionHistory(testCaseId);
            return ResponseEntity.ok(ApiResponse.success(versions));
        } catch (Exception e) {
            log.error("버전 히스토리 조회 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<TestCaseVersionDto>>error("버전 히스토리 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/testcase/{testCaseId}/current")
    @Operation(summary = "테스트케이스 현재 버전 조회", description = "특정 테스트케이스의 현재 활성 버전을 조회합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> getCurrentVersion(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId) {
        
        try {
            return versionService.getCurrentVersion(testCaseId)
                    .map(version -> ResponseEntity.ok(ApiResponse.success(version)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<TestCaseVersionDto>error("현재 버전을 찾을 수 없습니다")));
        } catch (Exception e) {
            log.error("현재 버전 조회 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<TestCaseVersionDto>error("현재 버전 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/{versionId}")
    @Operation(summary = "버전 상세 조회", description = "특정 버전의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> getVersionDetail(
            @Parameter(description = "버전 ID") @PathVariable String versionId) {
        
        try {
            return versionService.getVersionDetail(versionId)
                    .map(version -> ResponseEntity.ok(ApiResponse.success(version)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<TestCaseVersionDto>error("버전을 찾을 수 없습니다")));
        } catch (Exception e) {
            log.error("버전 상세 조회 실패: versionId={}, error={}", versionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<TestCaseVersionDto>error("버전 상세 조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}/current")
    @Operation(summary = "프로젝트 현재 버전들 조회", description = "특정 프로젝트의 모든 현재 버전들을 조회합니다.")
    public ResponseEntity<ApiResponse<List<TestCaseVersionDto>>> getCurrentVersionsByProject(
            @Parameter(description = "프로젝트 ID") @PathVariable String projectId) {
        
        try {
            List<TestCaseVersionDto> versions = versionService.getCurrentVersionsByProject(projectId);
            return ResponseEntity.ok(ApiResponse.success(versions));
        } catch (Exception e) {
            log.error("프로젝트 현재 버전들 조회 실패: projectId={}, error={}", projectId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<TestCaseVersionDto>>error("프로젝트 현재 버전들 조회 실패: " + e.getMessage()));
        }
    }

    // ============ 버전 생성 API ============

    @PostMapping("/{testCaseId}/manual")
    @Operation(summary = "수동 버전 생성", description = "사용자가 직접 새 버전을 생성합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> createManualVersion(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId,
            @RequestBody Map<String, String> request) {
        
        try {
            String versionLabel = request.get("versionLabel");
            String versionDescription = request.get("versionDescription");
            
            if (versionLabel == null || versionLabel.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<TestCaseVersionDto>error("버전 라벨이 필요합니다"));
            }
            
            TestCaseVersionDto version = versionService.createManualVersion(testCaseId, versionLabel, versionDescription);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(version));
        } catch (IllegalArgumentException e) {
            log.warn("수동 버전 생성 요청 오류: testCaseId={}, error={}", testCaseId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<TestCaseVersionDto>error(e.getMessage()));
        } catch (Exception e) {
            log.error("수동 버전 생성 실패: testCaseId={}, error={}", testCaseId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<TestCaseVersionDto>error("수동 버전 생성 실패: " + e.getMessage()));
        }
    }

    // ============ 버전 복원 API ============

    @PostMapping("/{versionId}/restore")
    @Operation(summary = "버전 복원", description = "특정 버전을 현재 버전으로 복원합니다.")
    public ResponseEntity<ApiResponse<TestCaseVersionDto>> restoreVersion(
            @Parameter(description = "버전 ID") @PathVariable String versionId) {
        
        try {
            TestCaseVersionDto restoredVersion = versionService.restoreVersion(versionId);
            return ResponseEntity.ok(ApiResponse.success(restoredVersion));
        } catch (IllegalArgumentException e) {
            log.warn("버전 복원 요청 오류: versionId={}, error={}", versionId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<TestCaseVersionDto>error(e.getMessage()));
        } catch (Exception e) {
            log.error("버전 복원 실패: versionId={}, error={}", versionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<TestCaseVersionDto>error("버전 복원 실패: " + e.getMessage()));
        }
    }

    // ============ 버전 비교 API ============

    @GetMapping("/{versionId1}/compare/{versionId2}")
    @Operation(summary = "버전 비교", description = "두 버전 간의 차이점을 비교합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> compareVersions(
            @Parameter(description = "첫 번째 버전 ID") @PathVariable String versionId1,
            @Parameter(description = "두 번째 버전 ID") @PathVariable String versionId2) {
        
        try {
            Map<String, Object> comparison = versionService.compareVersions(versionId1, versionId2);
            return ResponseEntity.ok(ApiResponse.success(comparison));
        } catch (IllegalArgumentException e) {
            log.warn("버전 비교 요청 오류: versionId1={}, versionId2={}, error={}", versionId1, versionId2, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<Map<String, Object>>error(e.getMessage()));
        } catch (Exception e) {
            log.error("버전 비교 실패: versionId1={}, versionId2={}, error={}", versionId1, versionId2, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, Object>>error("버전 비교 실패: " + e.getMessage()));
        }
    }

    // ============ 버전 관리 유틸리티 API ============

    @DeleteMapping("/testcase/{testCaseId}/cleanup")
    @Operation(summary = "오래된 버전 정리", description = "지정된 개수만 남기고 오래된 버전들을 삭제합니다.")
    public ResponseEntity<ApiResponse<Integer>> cleanupOldVersions(
            @Parameter(description = "테스트케이스 ID") @PathVariable String testCaseId,
            @Parameter(description = "유지할 버전 개수") @RequestParam(defaultValue = "10") int keepCount) {
        
        try {
            int deletedCount = versionService.cleanupOldVersions(testCaseId, keepCount);
            return ResponseEntity.ok(ApiResponse.success(deletedCount, 
                "오래된 버전 정리 완료: " + deletedCount + "개 버전 삭제"));
        } catch (Exception e) {
            log.error("오래된 버전 정리 실패: testCaseId={}, keepCount={}, error={}", testCaseId, keepCount, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Integer>error("오래된 버전 정리 실패: " + e.getMessage()));
        }
    }

    @DeleteMapping("/draft/cleanup")
    @Operation(summary = "임시 버전 정리", description = "지정된 날짜 이전의 임시 버전들을 삭제합니다.")
    public ResponseEntity<ApiResponse<Integer>> cleanupDraftVersions(
            @Parameter(description = "기준 날짜 (YYYY-MM-DDTHH:MM:SS)") @RequestParam String cutoffDate) {
        
        try {
            LocalDateTime cutoff = LocalDateTime.parse(cutoffDate);
            int deletedCount = versionService.cleanupDraftVersions(cutoff);
            return ResponseEntity.ok(ApiResponse.success(deletedCount, 
                "임시 버전 정리 완료: " + deletedCount + "개 버전 삭제"));
        } catch (Exception e) {
            log.error("임시 버전 정리 실패: cutoffDate={}, error={}", cutoffDate, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Integer>error("임시 버전 정리 실패: " + e.getMessage()));
        }
    }

    // ============ 헬스체크 API ============

    @GetMapping("/health")
    @Operation(summary = "버전 관리 시스템 헬스체크", description = "버전 관리 시스템의 상태를 확인합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        try {
            Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "description", "테스트케이스 버전 관리 시스템"
            );
            
            return ResponseEntity.ok(ApiResponse.success(health));
        } catch (Exception e) {
            log.error("헬스체크 실패: error={}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, Object>>error("버전 관리 시스템 오류"));
        }
    }
}