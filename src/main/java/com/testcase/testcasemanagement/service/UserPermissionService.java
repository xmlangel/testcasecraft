// src/main/java/com/testcase/testcasemanagement/service/UserPermissionService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.UserPermissionDto;
import com.testcase.testcasemanagement.dto.BulkPermissionChangeDto;
import com.testcase.testcasemanagement.dto.PermissionConflictDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.repository.*;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 사용자 권한 및 역할 관리를 위한 통합 서비스
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@Service
@Transactional
public class UserPermissionService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private OrganizationUserRepository organizationUserRepository;
    
    @Autowired
    private ProjectUserRepository projectUserRepository;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private SecurityContextUtil securityContextUtil;
    
    @Autowired
    private OrganizationSecurityService organizationSecurityService;
    
    @Autowired
    private ProjectSecurityService projectSecurityService;

    /**
     * 사용자의 모든 권한 정보 조회
     */
    @Transactional(readOnly = true)
    public UserPermissionDto getUserPermissions(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        // 조직 멤버십 조회
        List<OrganizationUser> orgMemberships = organizationUserRepository.findByUserId(userId);
        
        // 프로젝트 멤버십 조회
        List<ProjectUser> projectMemberships = projectUserRepository.findByUserId(userId);

        UserPermissionDto dto = new UserPermissionDto();
        dto.setUserId(userId);
        dto.setUsername(user.getUsername());
        dto.setUserRole(user.getRole());
        dto.setOrganizationMemberships(orgMemberships);
        dto.setProjectMemberships(projectMemberships);
        dto.setSystemRole(user.getRole());
        dto.setIsActive(user.getIsActive());

        return dto;
    }

    /**
     * 사용자를 조직에 추가하고 역할 부여
     */
    public void addUserToOrganization(String userId, String organizationId, OrganizationRole role) {
        // 권한 확인
        if (!organizationSecurityService.canManageOrganization(organizationId)) {
            throw new RuntimeException("조직 관리 권한이 없습니다.");
        }

        // 중복 체크
        if (organizationUserRepository.existsByOrganizationIdAndUserId(organizationId, userId)) {
            throw new RuntimeException("사용자가 이미 조직의 멤버입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("조직을 찾을 수 없습니다: " + organizationId));

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setUser(user);
        orgUser.setOrganization(organization);
        orgUser.setRoleInOrganization(role);
        
        organizationUserRepository.save(orgUser);

        // 감사 로그 기록
        logPermissionChange("ORGANIZATION_MEMBER_ADDED", userId, organizationId, 
                null, role.toString(), "조직에 사용자 추가");
    }

    /**
     * 사용자를 프로젝트에 추가하고 역할 부여
     */
    public void addUserToProject(String userId, String projectId, ProjectRole role) {
        // 권한 확인
        if (!projectSecurityService.canManageProject(projectId)) {
            throw new RuntimeException("프로젝트 관리 권한이 없습니다.");
        }

        // 중복 체크
        if (projectUserRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new RuntimeException("사용자가 이미 프로젝트의 멤버입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다: " + projectId));

        ProjectUser projectUser = new ProjectUser();
        projectUser.setUser(user);
        projectUser.setProject(project);
        projectUser.setRoleInProject(role);
        
        projectUserRepository.save(projectUser);

        // 감사 로그 기록
        logPermissionChange("PROJECT_MEMBER_ADDED", userId, projectId, 
                null, role.toString(), "프로젝트에 사용자 추가");
    }

    /**
     * 조직 내 사용자 역할 변경
     */
    public void changeOrganizationRole(String userId, String organizationId, OrganizationRole newRole) {
        // 권한 확인
        if (!organizationSecurityService.canManageOrganization(organizationId)) {
            throw new RuntimeException("조직 관리 권한이 없습니다.");
        }

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new RuntimeException("조직 멤버십을 찾을 수 없습니다."));

        OrganizationRole oldRole = orgUser.getRoleInOrganization();
        orgUser.setRoleInOrganization(newRole);
        organizationUserRepository.save(orgUser);

        // 감사 로그 기록
        logPermissionChange("ORGANIZATION_ROLE_CHANGED", userId, organizationId, 
                oldRole.toString(), newRole.toString(), "조직 역할 변경");
    }

    /**
     * 프로젝트 내 사용자 역할 변경
     */
    public void changeProjectRole(String userId, String projectId, ProjectRole newRole) {
        // 권한 확인
        if (!projectSecurityService.canManageProject(projectId)) {
            throw new RuntimeException("프로젝트 관리 권한이 없습니다.");
        }

        ProjectUser projectUser = projectUserRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("프로젝트 멤버십을 찾을 수 없습니다."));

        ProjectRole oldRole = projectUser.getRoleInProject();
        projectUser.setRoleInProject(newRole);
        projectUserRepository.save(projectUser);

        // 감사 로그 기록
        logPermissionChange("PROJECT_ROLE_CHANGED", userId, projectId, 
                oldRole.toString(), newRole.toString(), "프로젝트 역할 변경");
    }

    /**
     * 조직에서 사용자 제거
     */
    public void removeUserFromOrganization(String userId, String organizationId) {
        // 권한 확인
        if (!organizationSecurityService.canRemoveMember(organizationId, userId)) {
            throw new RuntimeException("멤버 제거 권한이 없습니다.");
        }

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new RuntimeException("조직 멤버십을 찾을 수 없습니다."));

        String oldRole = orgUser.getRoleInOrganization().toString();
        organizationUserRepository.delete(orgUser);

        // 감사 로그 기록
        logPermissionChange("ORGANIZATION_MEMBER_REMOVED", userId, organizationId, 
                oldRole, null, "조직에서 사용자 제거");
    }

    /**
     * 프로젝트에서 사용자 제거
     */
    public void removeUserFromProject(String userId, String projectId) {
        // 권한 확인
        if (!projectSecurityService.canRemoveMember(projectId, userId)) {
            throw new RuntimeException("멤버 제거 권한이 없습니다.");
        }

        ProjectUser projectUser = projectUserRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("프로젝트 멤버십을 찾을 수 없습니다."));

        String oldRole = projectUser.getRoleInProject().toString();
        projectUserRepository.delete(projectUser);

        // 감사 로그 기록
        logPermissionChange("PROJECT_MEMBER_REMOVED", userId, projectId, 
                oldRole, null, "프로젝트에서 사용자 제거");
    }

    /**
     * 특정 조직의 모든 멤버 조회
     */
    @Transactional(readOnly = true)
    public List<UserPermissionDto> getOrganizationMembers(String organizationId) {
        // 권한 확인
        if (!organizationSecurityService.canAccessOrganization(organizationId)) {
            throw new RuntimeException("조직 접근 권한이 없습니다.");
        }

        List<OrganizationUser> orgUsers = organizationUserRepository.findByOrganizationId(organizationId);
        return orgUsers.stream()
                .map(orgUser -> {
                    UserPermissionDto dto = getUserPermissions(orgUser.getUser().getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 프로젝트의 모든 멤버 조회
     */
    @Transactional(readOnly = true)
    public List<UserPermissionDto> getProjectMembers(String projectId) {
        // 권한 확인
        if (!projectSecurityService.canAccessProject(projectId)) {
            throw new RuntimeException("프로젝트 접근 권한이 없습니다.");
        }

        List<ProjectUser> projectUsers = projectUserRepository.findByProjectId(projectId);
        return projectUsers.stream()
                .map(projectUser -> {
                    UserPermissionDto dto = getUserPermissions(projectUser.getUser().getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 대량 권한 변경 처리
     */
    public void processBulkPermissionChanges(List<BulkPermissionChangeDto> changes) {
        // 권한 충돌 검증
        List<PermissionConflictDto> conflicts = validatePermissionChanges(changes);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("권한 충돌이 발견되었습니다. 먼저 충돌을 해결해주세요.");
        }

        for (BulkPermissionChangeDto change : changes) {
            try {
                switch (change.getChangeType()) {
                    case "ADD_ORG_MEMBER":
                        addUserToOrganization(change.getUserId(), change.getResourceId(), 
                                OrganizationRole.valueOf(change.getNewRole()));
                        break;
                    case "ADD_PROJECT_MEMBER":
                        addUserToProject(change.getUserId(), change.getResourceId(), 
                                ProjectRole.valueOf(change.getNewRole()));
                        break;
                    case "CHANGE_ORG_ROLE":
                        changeOrganizationRole(change.getUserId(), change.getResourceId(), 
                                OrganizationRole.valueOf(change.getNewRole()));
                        break;
                    case "CHANGE_PROJECT_ROLE":
                        changeProjectRole(change.getUserId(), change.getResourceId(), 
                                ProjectRole.valueOf(change.getNewRole()));
                        break;
                    case "REMOVE_ORG_MEMBER":
                        removeUserFromOrganization(change.getUserId(), change.getResourceId());
                        break;
                    case "REMOVE_PROJECT_MEMBER":
                        removeUserFromProject(change.getUserId(), change.getResourceId());
                        break;
                }
            } catch (Exception e) {
                // 개별 변경 실패 시 로그 기록하고 계속 진행
                logPermissionChange("BULK_CHANGE_FAILED", change.getUserId(), 
                        change.getResourceId(), null, null, 
                        "대량 변경 실패: " + e.getMessage());
            }
        }

        // 대량 변경 완료 로그
        logPermissionChange("BULK_CHANGE_COMPLETED", null, null, null, null, 
                "대량 권한 변경 완료: " + changes.size() + "건 처리");
    }

    /**
     * 권한 변경 시 충돌 검증
     */
    @Transactional(readOnly = true)
    public List<PermissionConflictDto> validatePermissionChanges(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();

        for (BulkPermissionChangeDto change : changes) {
            // 중복 멤버십 검증
            if (change.getChangeType().equals("ADD_ORG_MEMBER")) {
                if (organizationUserRepository.existsByOrganizationIdAndUserId(
                        change.getResourceId(), change.getUserId())) {
                    conflicts.add(new PermissionConflictDto(
                            "DUPLICATE_MEMBERSHIP",
                            "사용자가 이미 조직의 멤버입니다.",
                            change.getUserId(),
                            change.getResourceId()
                    ));
                }
            }
            
            if (change.getChangeType().equals("ADD_PROJECT_MEMBER")) {
                if (projectUserRepository.existsByProjectIdAndUserId(
                        change.getResourceId(), change.getUserId())) {
                    conflicts.add(new PermissionConflictDto(
                            "DUPLICATE_MEMBERSHIP",
                            "사용자가 이미 프로젝트의 멤버입니다.",
                            change.getUserId(),
                            change.getResourceId()
                    ));
                }
            }

            // 권한 부족 검증
            if (change.getChangeType().startsWith("ORG_") && 
                !organizationSecurityService.canManageOrganization(change.getResourceId())) {
                conflicts.add(new PermissionConflictDto(
                        "INSUFFICIENT_PERMISSION",
                        "조직 관리 권한이 없습니다.",
                        change.getUserId(),
                        change.getResourceId()
                ));
            }
            
            if (change.getChangeType().startsWith("PROJECT_") && 
                !projectSecurityService.canManageProject(change.getResourceId())) {
                conflicts.add(new PermissionConflictDto(
                        "INSUFFICIENT_PERMISSION",
                        "프로젝트 관리 권한이 없습니다.",
                        change.getUserId(),
                        change.getResourceId()
                ));
            }
        }

        return conflicts;
    }

    /**
     * 사용자의 권한 변경 이력 조회
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getUserPermissionHistory(String userId) {
        return auditLogRepository.findByEntityIdOrderByTimestampDesc(userId);
    }

    /**
     * 권한 변경 로그 기록
     */
    private void logPermissionChange(String action, String userId, String resourceId, 
                                   String oldValue, String newValue, String details) {
        AuditLog log = new AuditLog();
        log.setEntityType("USER_PERMISSION");
        log.setEntityId(userId);
        log.setAction(action);
        String currentUserId = securityContextUtil.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        log.setPerformedBy(currentUser);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(details + " | Resource: " + resourceId + " | Old: " + oldValue + " | New: " + newValue);
        
        auditLogRepository.save(log);
    }
}