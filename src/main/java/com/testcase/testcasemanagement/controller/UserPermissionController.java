// src/main/java/com/testcase/testcasemanagement/controller/UserPermissionController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.*;
import com.testcase.testcasemanagement.model.AuditLog;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.service.UserPermissionService;
import com.testcase.testcasemanagement.service.CsvPermissionService;
import com.testcase.testcasemanagement.service.PermissionConflictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * 사용자 권한 및 역할 관리 API 컨트롤러
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@RestController
@RequestMapping("/api/user-permissions")
@CrossOrigin(origins = {"${cors.allowed-origins:http://localhost:3000}"})
public class UserPermissionController {

    @Autowired
    private UserPermissionService userPermissionService;
    
    @Autowired
    private CsvPermissionService csvPermissionService;
    
    @Autowired
    private PermissionConflictService permissionConflictService;

    /**
     * 특정 사용자의 권한 정보 조회
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public ResponseEntity<UserPermissionDto> getUserPermissions(@PathVariable String userId) {
        UserPermissionDto permissions = userPermissionService.getUserPermissions(userId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 현재 사용자의 권한 정보 조회
     */
    @GetMapping("/my-permissions")
    public ResponseEntity<UserPermissionDto> getMyPermissions(Authentication authentication) {
        String currentUserId = authentication.getName();
        UserPermissionDto permissions = userPermissionService.getUserPermissions(currentUserId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 조직에 사용자 추가
     */
    @PostMapping("/organizations/{organizationId}/members")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#organizationId)")
    public ResponseEntity<Map<String, String>> addUserToOrganization(
            @PathVariable String organizationId,
            @RequestBody Map<String, String> request) {
        
        String userId = request.get("userId");
        OrganizationRole role = OrganizationRole.valueOf(request.get("role"));
        
        userPermissionService.addUserToOrganization(userId, organizationId, role);
        
        return ResponseEntity.ok(Map.of(
                "message", "사용자가 조직에 성공적으로 추가되었습니다.",
                "userId", userId,
                "organizationId", organizationId,
                "role", role.toString()
        ));
    }

    /**
     * 프로젝트에 사용자 추가
     */
    @PostMapping("/projects/{projectId}/members")
    @PreAuthorize("@projectSecurityService.canManageProject(#projectId)")
    public ResponseEntity<Map<String, String>> addUserToProject(
            @PathVariable String projectId,
            @RequestBody Map<String, String> request) {
        
        String userId = request.get("userId");
        ProjectRole role = ProjectRole.valueOf(request.get("role"));
        
        userPermissionService.addUserToProject(userId, projectId, role);
        
        return ResponseEntity.ok(Map.of(
                "message", "사용자가 프로젝트에 성공적으로 추가되었습니다.",
                "userId", userId,
                "projectId", projectId,
                "role", role.toString()
        ));
    }

    /**
     * 조직 내 사용자 역할 변경
     */
    @PutMapping("/organizations/{organizationId}/members/{userId}/role")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#organizationId)")
    public ResponseEntity<Map<String, String>> changeOrganizationRole(
            @PathVariable String organizationId,
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        
        OrganizationRole newRole = OrganizationRole.valueOf(request.get("newRole"));
        
        userPermissionService.changeOrganizationRole(userId, organizationId, newRole);
        
        return ResponseEntity.ok(Map.of(
                "message", "조직 내 사용자 역할이 성공적으로 변경되었습니다.",
                "userId", userId,
                "organizationId", organizationId,
                "newRole", newRole.toString()
        ));
    }

    /**
     * 프로젝트 내 사용자 역할 변경
     */
    @PutMapping("/projects/{projectId}/members/{userId}/role")
    @PreAuthorize("@projectSecurityService.canManageProject(#projectId)")
    public ResponseEntity<Map<String, String>> changeProjectRole(
            @PathVariable String projectId,
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        
        ProjectRole newRole = ProjectRole.valueOf(request.get("newRole"));
        
        userPermissionService.changeProjectRole(userId, projectId, newRole);
        
        return ResponseEntity.ok(Map.of(
                "message", "프로젝트 내 사용자 역할이 성공적으로 변경되었습니다.",
                "userId", userId,
                "projectId", projectId,
                "newRole", newRole.toString()
        ));
    }

    /**
     * 조직에서 사용자 제거
     */
    @DeleteMapping("/organizations/{organizationId}/members/{userId}")
    @PreAuthorize("@organizationSecurityService.canRemoveMember(#organizationId, #userId)")
    public ResponseEntity<Map<String, String>> removeUserFromOrganization(
            @PathVariable String organizationId,
            @PathVariable String userId) {
        
        userPermissionService.removeUserFromOrganization(userId, organizationId);
        
        return ResponseEntity.ok(Map.of(
                "message", "사용자가 조직에서 성공적으로 제거되었습니다.",
                "userId", userId,
                "organizationId", organizationId
        ));
    }

    /**
     * 프로젝트에서 사용자 제거
     */
    @DeleteMapping("/projects/{projectId}/members/{userId}")
    @PreAuthorize("@projectSecurityService.canRemoveMember(#projectId, #userId)")
    public ResponseEntity<Map<String, String>> removeUserFromProject(
            @PathVariable String projectId,
            @PathVariable String userId) {
        
        userPermissionService.removeUserFromProject(userId, projectId);
        
        return ResponseEntity.ok(Map.of(
                "message", "사용자가 프로젝트에서 성공적으로 제거되었습니다.",
                "userId", userId,
                "projectId", projectId
        ));
    }

    /**
     * 조직의 모든 멤버 조회
     */
    @GetMapping("/organizations/{organizationId}/members")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#organizationId)")
    public ResponseEntity<List<UserPermissionDto>> getOrganizationMembers(@PathVariable String organizationId) {
        List<UserPermissionDto> members = userPermissionService.getOrganizationMembers(organizationId);
        return ResponseEntity.ok(members);
    }

    /**
     * 프로젝트의 모든 멤버 조회
     */
    @GetMapping("/projects/{projectId}/members")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
    public ResponseEntity<List<UserPermissionDto>> getProjectMembers(@PathVariable String projectId) {
        List<UserPermissionDto> members = userPermissionService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }

    /**
     * 사용자의 권한 변경 이력 조회
     */
    @GetMapping("/{userId}/history")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public ResponseEntity<List<AuditLog>> getUserPermissionHistory(@PathVariable String userId) {
        List<AuditLog> history = userPermissionService.getUserPermissionHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * 대량 권한 변경 처리
     */
    @PostMapping("/bulk-changes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> processBulkChanges(
            @RequestBody List<BulkPermissionChangeDto> changes) {
        
        userPermissionService.processBulkPermissionChanges(changes);
        
        return ResponseEntity.ok(Map.of(
                "message", "대량 권한 변경이 성공적으로 처리되었습니다.",
                "processedCount", String.valueOf(changes.size())
        ));
    }

    /**
     * 권한 변경 시 충돌 검증
     */
    @PostMapping("/validate-changes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PermissionConflictDto>> validatePermissionChanges(
            @RequestBody List<BulkPermissionChangeDto> changes) {
        
        List<PermissionConflictDto> conflicts = userPermissionService.validatePermissionChanges(changes);
        return ResponseEntity.ok(conflicts);
    }

    /**
     * 포괄적인 권한 충돌 검증 (고급)
     */
    @PostMapping("/comprehensive-validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> comprehensiveValidateChanges(
            @RequestBody List<BulkPermissionChangeDto> changes) {
        
        List<PermissionConflictDto> conflicts = permissionConflictService.comprehensiveConflictCheck(changes);
        
        // 충돌 유형별 분류
        Map<String, List<PermissionConflictDto>> conflictsByType = conflicts.stream()
                .collect(Collectors.groupingBy(PermissionConflictDto::getConflictType));
        
        long autoResolvableCount = conflicts.stream()
                .filter(PermissionConflictDto::isCanAutoResolve)
                .count();
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalConflicts", conflicts.size());
        result.put("autoResolvableCount", autoResolvableCount);
        result.put("conflictsByType", conflictsByType);
        result.put("allConflicts", conflicts);
        result.put("canProceed", conflicts.isEmpty());
        result.put("canAutoResolve", autoResolvableCount > 0);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 권한 충돌 자동 해결
     */
    @PostMapping("/auto-resolve-conflicts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> autoResolveConflicts(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<BulkPermissionChangeDto> changes = (List<BulkPermissionChangeDto>) request.get("changes");
        @SuppressWarnings("unchecked")
        List<PermissionConflictDto> conflicts = (List<PermissionConflictDto>) request.get("conflicts");
        
        List<BulkPermissionChangeDto> resolvedChanges = permissionConflictService
                .autoResolveConflicts(changes, conflicts);
        
        // 해결 후 재검증
        List<PermissionConflictDto> remainingConflicts = permissionConflictService
                .comprehensiveConflictCheck(resolvedChanges);
        
        Map<String, Object> result = new HashMap<>();
        result.put("originalCount", changes.size());
        result.put("resolvedCount", resolvedChanges.size());
        result.put("remainingConflicts", remainingConflicts.size());
        result.put("resolvedChanges", resolvedChanges);
        result.put("remainingConflictDetails", remainingConflicts);
        result.put("fullyResolved", remainingConflicts.isEmpty());
        
        return ResponseEntity.ok(result);
    }

    /**
     * 사용 가능한 조직 역할 목록 조회
     */
    @GetMapping("/organization-roles")
    public ResponseEntity<List<Map<String, String>>> getOrganizationRoles() {
        List<Map<String, String>> roles = List.of(
                Map.of("value", "OWNER", "label", "소유자", "description", "조직의 모든 권한"),
                Map.of("value", "ADMIN", "label", "관리자", "description", "조직 관리 및 멤버 관리"),
                Map.of("value", "MEMBER", "label", "멤버", "description", "기본 멤버 권한")
        );
        return ResponseEntity.ok(roles);
    }

    /**
     * 사용 가능한 프로젝트 역할 목록 조회
     */
    @GetMapping("/project-roles")
    public ResponseEntity<List<Map<String, String>>> getProjectRoles() {
        List<Map<String, String>> roles = List.of(
                Map.of("value", "PROJECT_MANAGER", "label", "프로젝트 매니저", "description", "프로젝트 전체 관리"),
                Map.of("value", "LEAD_DEVELOPER", "label", "리드 개발자", "description", "기술 리드 및 팀 관리"),
                Map.of("value", "DEVELOPER", "label", "개발자", "description", "개발 권한"),
                Map.of("value", "TESTER", "label", "테스터", "description", "테스트 권한"),
                Map.of("value", "CONTRIBUTOR", "label", "기여자", "description", "기여자 권한"),
                Map.of("value", "VIEWER", "label", "뷰어", "description", "읽기 전용 권한")
        );
        return ResponseEntity.ok(roles);
    }

    /**
     * 권한 통계 조회 (시스템 관리자용)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPermissionStatistics() {
        // TODO: 권한 통계 로직 구현
        Map<String, Object> stats = Map.of(
                "totalUsers", 0,
                "totalOrganizations", 0,
                "totalProjects", 0,
                "recentChanges", List.of()
        );
        return ResponseEntity.ok(stats);
    }

    /**
     * 에러 처리 - 권한 부족
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>> handleSecurityException(SecurityException e) {
        return ResponseEntity.status(403).body(Map.of(
                "error", "권한 부족",
                "message", e.getMessage()
        ));
    }

    /**
     * CSV 파일 업로드 및 권한 변경 미리보기
     */
    @PostMapping("/csv-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadCsvFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "파일이 비어있습니다."));
            }
            
            List<BulkPermissionChangeDto> changes = csvPermissionService.parseCsvFile(file);
            Map<String, Object> result = csvPermissionService.validateAndProcessCsv(changes);
            
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "파일 처리 중 오류가 발생했습니다.",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * CSV 템플릿 다운로드
     */
    @GetMapping("/csv-template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> downloadCsvTemplate() {
        String template = csvPermissionService.generateCsvTemplate();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"permission_changes_template.csv\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(template);
    }

    /**
     * CSV 검증 결과 처리 및 실제 권한 변경 실행
     */
    @PostMapping("/csv-execute")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> executeCsvChanges(
            @RequestBody List<BulkPermissionChangeDto> validatedChanges) {
        
        try {
            userPermissionService.processBulkPermissionChanges(validatedChanges);
            
            return ResponseEntity.ok(Map.of(
                    "message", "CSV 기반 대량 권한 변경이 성공적으로 완료되었습니다.",
                    "processedCount", String.valueOf(validatedChanges.size())
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "권한 변경 처리 중 오류가 발생했습니다.",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 에러 처리 - 일반 런타임 에러
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(400).body(Map.of(
                "error", "요청 처리 실패",
                "message", e.getMessage()
        ));
    }
}