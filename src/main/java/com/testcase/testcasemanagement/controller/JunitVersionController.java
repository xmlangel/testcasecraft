// src/main/java/com/testcase/testcasemanagement/controller/JunitVersionController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.service.JunitVersionControlService;
import com.testcase.testcasemanagement.service.JunitVersionControlService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ICT-204: 원본 파일 관리 및 버전 제어 REST API
 */
@RestController
@RequestMapping("/api/junit-versions")
@CrossOrigin(origins = "*")
@Tag(name = "Test Automation - JUnit Versioning", description = "JUnit XML 파일 버전 관리 API")
public class JunitVersionController {
    
    private static final Logger logger = LoggerFactory.getLogger(JunitVersionController.class);
    
    @Autowired
    private JunitVersionControlService versionControlService;
    
    /**
     * 파일 버전 생성
     */
    @PostMapping("/{testResultId}/versions")
    @Operation(summary = "파일 버전 생성", description = "원본 파일의 새 버전을 생성합니다.")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> createVersion(
            @Parameter(description = "테스트 결과 ID") @PathVariable String testResultId,
            @Parameter(description = "버전 생성 요청") @RequestBody CreateVersionRequest request,
            Authentication authentication) {
        
        logger.info("파일 버전 생성 요청 - 테스트 ID: {}, 사용자: {}", testResultId, authentication.getName());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            FileVersion version = versionControlService.createVersion(
                testResultId, 
                request.getOriginalFilePath(), 
                request.getDescription(), 
                authentication.getName()
            );
            
            response.put("success", true);
            response.put("message", "버전이 성공적으로 생성되었습니다.");
            response.put("version", version);
            
            return ResponseEntity.ok(response);
            
        } catch (VersionControlException e) {
            logger.error("파일 버전 생성 실패: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "버전 생성 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 버전 히스토리 조회
     */
    @GetMapping("/{testResultId}/history")
    @Operation(summary = "버전 히스토리 조회", description = "테스트 결과의 모든 버전 히스토리를 조회합니다.")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getVersionHistory(@PathVariable String testResultId) {
        
        logger.info("버전 히스토리 조회 요청 - 테스트 ID: {}", testResultId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            FileVersionHistory history = versionControlService.getVersionHistory(testResultId);
            
            response.put("success", true);
            response.put("history", history);
            response.put("versionCount", history.getVersions().size());
            
            return ResponseEntity.ok(response);
            
        } catch (VersionControlException e) {
            logger.error("버전 히스토리 조회 실패: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "히스토리 조회 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 특정 버전으로 복원
     */
    @PostMapping("/{testResultId}/restore/{versionNumber}")
    @Operation(summary = "버전 복원", description = "지정된 버전으로 파일을 복원합니다.")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> restoreVersion(
            @Parameter(description = "테스트 결과 ID") @PathVariable String testResultId,
            @Parameter(description = "복원할 버전 번호") @PathVariable int versionNumber,
            @Parameter(description = "복원 요청") @RequestBody RestoreVersionRequest request,
            Authentication authentication) {
        
        logger.info("버전 복원 요청 - 테스트 ID: {}, 버전: {}, 사용자: {}", 
                   testResultId, versionNumber, authentication.getName());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            FileRestoreResult result = versionControlService.restoreVersion(
                testResultId, 
                versionNumber, 
                request.getTargetPath()
            );
            
            response.put("success", true);
            response.put("message", "버전이 성공적으로 복원되었습니다.");
            response.put("restoreResult", result);
            
            return ResponseEntity.ok(response);
            
        } catch (VersionControlException e) {
            logger.error("버전 복원 실패: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "버전 복원 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 버전 간 차이점 비교
     */
    @GetMapping("/{testResultId}/compare")
    @Operation(summary = "버전 비교", description = "두 버전 간의 차이점을 분석합니다.")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> compareVersions(
            @Parameter(description = "테스트 결과 ID") @PathVariable String testResultId,
            @Parameter(description = "첫 번째 버전") @RequestParam int version1,
            @Parameter(description = "두 번째 버전") @RequestParam int version2) {
        
        logger.info("버전 비교 요청 - 테스트 ID: {}, 버전: {} vs {}", testResultId, version1, version2);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            VersionDiff diff = versionControlService.compareVersions(testResultId, version1, version2);
            
            response.put("success", true);
            response.put("comparison", diff);
            
            return ResponseEntity.ok(response);
            
        } catch (VersionControlException e) {
            logger.error("버전 비교 실패: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "버전 비교 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 백업 생성
     */
    @PostMapping("/{testResultId}/backup")
    @Operation(summary = "백업 생성", description = "현재 버전의 백업을 생성합니다.")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> createBackup(
            @Parameter(description = "테스트 결과 ID") @PathVariable String testResultId,
            @Parameter(description = "백업할 버전 번호") @RequestParam(defaultValue = "-1") int versionNumber,
            Authentication authentication) {
        
        logger.info("백업 생성 요청 - 테스트 ID: {}, 버전: {}, 사용자: {}", 
                   testResultId, versionNumber, authentication.getName());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 최신 버전 또는 지정된 버전 백업
            FileVersionHistory history = versionControlService.getVersionHistory(testResultId);
            FileVersion targetVersion;
            
            if (versionNumber == -1 && !history.getVersions().isEmpty()) {
                targetVersion = history.getVersions().get(history.getVersions().size() - 1);
            } else {
                targetVersion = history.getVersions().stream()
                    .filter(v -> v.getVersionNumber() == versionNumber)
                    .findFirst()
                    .orElseThrow(() -> new VersionControlException("Version not found: " + versionNumber));
            }
            
            BackupResult result = versionControlService.createBackup(testResultId, targetVersion);
            
            response.put("success", true);
            response.put("message", "백업이 성공적으로 생성되었습니다.");
            response.put("backup", result);
            
            return ResponseEntity.ok(response);
            
        } catch (VersionControlException e) {
            logger.error("백업 생성 실패: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "백업 생성 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 스토리지 통계 조회
     */
    @GetMapping("/storage/statistics")
    @Operation(summary = "스토리지 통계", description = "버전 관리 스토리지 통계 정보를 조회합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStorageStatistics() {
        
        logger.info("스토리지 통계 조회 요청");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            StorageStatistics stats = versionControlService.getStorageStatistics();
            
            response.put("success", true);
            response.put("statistics", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("스토리지 통계 조회 실패: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "통계 조회 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 요청 DTO 클래스들
    
    public static class CreateVersionRequest {
        private String originalFilePath;
        private String description;
        
        public String getOriginalFilePath() { return originalFilePath; }
        public void setOriginalFilePath(String originalFilePath) { this.originalFilePath = originalFilePath; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class RestoreVersionRequest {
        private String targetPath;
        
        public String getTargetPath() { return targetPath; }
        public void setTargetPath(String targetPath) { this.targetPath = targetPath; }
    }
}