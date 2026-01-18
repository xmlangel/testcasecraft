// src/main/java/com/testcase/testcasemanagement/controller/AuditLogController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.AuditLog;
import com.testcase.testcasemanagement.repository.AuditLogRepository;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.security.GroupSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 감사 로그 조회 컨트롤러
 * Spring Security @PreAuthorize를 통한 메서드 레벨 보안 적용
 */
@Tag(name = "Admin - Audit Log", description = "감사 로그 API")
@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private OrganizationSecurityService organizationSecurityService;

    @Autowired
    private ProjectSecurityService projectSecurityService;

    @Autowired
    private GroupSecurityService groupSecurityService;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    /**
     * 최근 감사 로그 조회 (전체 - 시스템 관리자만)
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "최근 감사 로그 조회", description = "전체 감사 로그를 최신순으로 조회합니다. (시스템 관리자 전용)")
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getRecentLogs(
            @RequestParam(defaultValue = "50") int limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 1000));
        List<AuditLog> logs = auditLogRepository.findRecentLogs(pageable);
        return ResponseEntity.ok(logs);
    }

    /**
     * 특정 엔티티의 감사 로그 조회
     * 권한: 해당 엔티티에 접근 권한이 있는 사용자
     */
    @Operation(summary = "엔티티별 감사 로그 조회", description = "특정 엔티티(프로젝트, 조직 등)의 감사 로그를 조회합니다.")
    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AuditLog>> getEntityLogs(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(defaultValue = "50") int limit) {

        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            return ResponseEntity.status(401).build();
        }

        // 엔티티별 접근 권한 확인
        if (!hasEntityAccess(entityType, entityId, currentUsername)) {
            return ResponseEntity.status(403).build();
        }

        Pageable pageable = PageRequest.of(0, Math.min(limit, 1000));
        List<AuditLog> logs = auditLogRepository.findRecentLogsByEntity(
                entityType, entityId, pageable);
        return ResponseEntity.ok(logs);
    }

    /**
     * 조직 관련 감사 로그 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @Operation(summary = "조직 감사 로그 조회", description = "특정 조직의 감사 로그를 조회합니다.")
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
    public ResponseEntity<List<AuditLog>> getOrganizationLogs(
            @PathVariable String organizationId,
            @RequestParam(defaultValue = "50") int limit) {

        List<AuditLog> logs = auditLogRepository.findOrganizationLogs(organizationId);

        // 결과 제한
        if (logs.size() > limit) {
            logs = logs.subList(0, limit);
        }

        return ResponseEntity.ok(logs);
    }

    /**
     * 프로젝트 관련 감사 로그 조회
     * 권한: 프로젝트 멤버 또는 시스템 관리자
     */
    @Operation(summary = "프로젝트 감사 로그 조회", description = "특정 프로젝트의 감사 로그를 조회합니다.")
    @GetMapping("/project/{projectId}")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<List<AuditLog>> getProjectLogs(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "50") int limit) {

        List<AuditLog> logs = auditLogRepository.findProjectLogs(projectId);

        // 결과 제한
        if (logs.size() > limit) {
            logs = logs.subList(0, limit);
        }

        return ResponseEntity.ok(logs);
    }

    /**
     * 그룹 관련 감사 로그 조회
     * 권한: 그룹 멤버 또는 상위 조직/프로젝트 멤버 또는 시스템 관리자
     */
    @Operation(summary = "그룹 감사 로그 조회", description = "특정 그룹의 감사 로그를 조회합니다.")
    @GetMapping("/group/{groupId}")
    @PreAuthorize("@groupSecurityService.canAccessGroup(#groupId, authentication.name)")
    public ResponseEntity<List<AuditLog>> getGroupLogs(
            @PathVariable String groupId,
            @RequestParam(defaultValue = "50") int limit) {

        List<AuditLog> logs = auditLogRepository.findGroupLogs(groupId);

        // 결과 제한
        if (logs.size() > limit) {
            logs = logs.subList(0, limit);
        }

        return ResponseEntity.ok(logs);
    }

    /**
     * 현재 사용자의 감사 로그 조회
     * 권한: 인증된 사용자 (자기 자신의 로그만)
     */
    @Operation(summary = "내 활동 로그 조회", description = "현재 사용자의 감사 로그를 조회합니다.")
    @GetMapping("/my-activities")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AuditLog>> getMyActivities(
            @RequestParam(defaultValue = "50") int limit) {

        String currentUserId = securityContextUtil.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }

        Pageable pageable = PageRequest.of(0, Math.min(limit, 1000));
        List<AuditLog> logs = auditLogRepository.findRecentLogsByUser(currentUserId, pageable);
        return ResponseEntity.ok(logs);
    }

    /**
     * 특정 사용자의 감사 로그 조회
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "사용자별 활동 로그 조회", description = "특정 사용자의 감사 로그를 조회합니다. (시스템 관리자 전용)")
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getUserLogs(
            @PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit) {

        Pageable pageable = PageRequest.of(0, Math.min(limit, 1000));
        List<AuditLog> logs = auditLogRepository.findRecentLogsByUser(userId, pageable);
        return ResponseEntity.ok(logs);
    }

    /**
     * 액션별 감사 로그 통계 조회
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "액션별 통계 조회", description = "감사 로그의 액션 유형별 통계를 조회합니다. (시스템 관리자 전용)")
    @GetMapping("/statistics/actions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getActionStatistics() {
        List<Object[]> statistics = auditLogRepository.getActionStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 엔티티 타입별 감사 로그 통계 조회
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "엔티티 타입별 통계 조회", description = "감사 로그의 엔티티 타입별 통계를 조회합니다. (시스템 관리자 전용)")
    @GetMapping("/statistics/entity-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getEntityTypeStatistics() {
        List<Object[]> statistics = auditLogRepository.getEntityTypeStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 사용자별 활동 통계 조회
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "사용자 활동 통계 조회", description = "사용자별 활동 빈도 통계를 조회합니다. (시스템 관리자 전용)")
    @GetMapping("/statistics/user-activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getUserActivityStatistics() {
        List<Object[]> statistics = auditLogRepository.getUserActivityStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 키워드로 감사 로그 검색
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "감사 로그 검색", description = "키워드로 감사 로그를 검색합니다. (시스템 관리자 전용)")
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> searchLogs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "100") int limit) {

        List<AuditLog> logs = auditLogRepository.searchByKeyword(keyword);

        // 결과 제한
        if (logs.size() > limit) {
            logs = logs.subList(0, limit);
        }

        return ResponseEntity.ok(logs);
    }

    /**
     * 특정 기간의 감사 로그 조회
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "기간별 감사 로그 조회", description = "특정 기간 내의 감사 로그를 조회합니다. (시스템 관리자 전용)")
    @GetMapping("/period")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByPeriod(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "1000") int limit) {

        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);

            List<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end);

            // 결과 제한
            if (logs.size() > limit) {
                logs = logs.subList(0, limit);
            }

            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(null);
        }
    }

    /**
     * 엔티티 접근 권한 확인 헬퍼 메서드
     */
    private boolean hasEntityAccess(String entityType, String entityId, String username) {
        switch (entityType.toUpperCase()) {
            case "ORGANIZATION":
            case "ORGANIZATION_USER":
                return organizationSecurityService.isOrganizationMember(entityId, username);
            case "PROJECT":
            case "PROJECT_USER":
                return projectSecurityService.canAccessProject(entityId, username);
            case "GROUP":
            case "GROUP_MEMBER":
                return groupSecurityService.canAccessGroup(entityId, username);
            case "USER":
                // 자기 자신의 사용자 로그는 접근 가능, 다른 사용자는 관리자만
                String currentUserId = securityContextUtil.getCurrentUserId();
                return entityId.equals(currentUserId) || securityContextUtil.isSystemAdmin();
            default:
                // 알 수 없는 엔티티 타입은 관리자만 접근 가능
                return securityContextUtil.isSystemAdmin();
        }
    }
}