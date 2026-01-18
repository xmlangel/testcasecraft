// src/main/java/com/testcase/testcasemanagement/service/PermissionConflictService.java
package com.testcase.testcasemanagement.service;

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

import java.util.*;
import java.util.stream.Collectors;

/**
 * 권한 충돌 검증 및 해결 서비스
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@Service
@Transactional(readOnly = true)
public class PermissionConflictService {

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
    private SecurityContextUtil securityContextUtil;
    
    @Autowired
    private OrganizationSecurityService organizationSecurityService;
    
    @Autowired
    private ProjectSecurityService projectSecurityService;

    /**
     * 포괄적인 권한 충돌 검증
     */
    public List<PermissionConflictDto> comprehensiveConflictCheck(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        // 1. 기본 검증 (중복, 권한 부족)
        conflicts.addAll(basicValidationCheck(changes));
        
        // 2. 역할 계층 충돌 검증
        conflicts.addAll(roleHierarchyConflictCheck(changes));
        
        // 3. 조직-프로젝트 관계 충돌 검증
        conflicts.addAll(organizationProjectConflictCheck(changes));
        
        // 4. 시스템 정책 충돌 검증
        conflicts.addAll(systemPolicyConflictCheck(changes));
        
        // 5. 배치 내 충돌 검증 (같은 배치 내에서 서로 충돌하는 변경사항)
        conflicts.addAll(batchInternalConflictCheck(changes));
        
        return conflicts;
    }

    /**
     * 기본 검증 (중복, 권한 부족)
     */
    private List<PermissionConflictDto> basicValidationCheck(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        for (BulkPermissionChangeDto change : changes) {
            // 중복 멤버십 검증
            if (change.getChangeType().equals("ADD_ORG_MEMBER")) {
                if (organizationUserRepository.existsByOrganizationIdAndUserId(
                        change.getResourceId(), change.getUserId())) {
                    conflicts.add(createConflict(
                            "DUPLICATE_MEMBERSHIP",
                            "사용자가 이미 조직의 멤버입니다.",
                            change,
                            "기존 멤버십을 확인하고 역할 변경으로 진행하세요.",
                            true
                    ));
                }
            }
            
            if (change.getChangeType().equals("ADD_PROJECT_MEMBER")) {
                if (projectUserRepository.existsByProjectIdAndUserId(
                        change.getResourceId(), change.getUserId())) {
                    conflicts.add(createConflict(
                            "DUPLICATE_MEMBERSHIP",
                            "사용자가 이미 프로젝트의 멤버입니다.",
                            change,
                            "기존 멤버십을 확인하고 역할 변경으로 진행하세요.",
                            true
                    ));
                }
            }

            // 권한 부족 검증
            conflicts.addAll(checkPermissionAuthority(change));
        }
        
        return conflicts;
    }

    /**
     * 역할 계층 충돌 검증
     */
    private List<PermissionConflictDto> roleHierarchyConflictCheck(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        for (BulkPermissionChangeDto change : changes) {
            if (change.getChangeType().equals("CHANGE_ORG_ROLE") || 
                change.getChangeType().equals("CHANGE_PROJECT_ROLE")) {
                
                // 현재 사용자의 역할과 비교하여 승격 권한 확인
                conflicts.addAll(checkRoleElevationAuthority(change));
                
                // 마지막 소유자/관리자 제거 방지
                conflicts.addAll(checkLastAdminRemoval(change));
            }
        }
        
        return conflicts;
    }

    /**
     * 조직-프로젝트 관계 충돌 검증
     */
    private List<PermissionConflictDto> organizationProjectConflictCheck(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        for (BulkPermissionChangeDto change : changes) {
            if (change.getChangeType().equals("ADD_PROJECT_MEMBER") || 
                change.getChangeType().equals("CHANGE_PROJECT_ROLE")) {
                
                // 프로젝트가 조직에 속한 경우, 조직 멤버십 확인
                Optional<Project> project = projectRepository.findById(change.getResourceId());
                if (project.isPresent() && project.get().getOrganization() != null) {
                    String organizationId = project.get().getOrganization().getId();
                    
                    if (!organizationUserRepository.existsByOrganizationIdAndUserId(
                            organizationId, change.getUserId())) {
                        conflicts.add(createConflict(
                                "ORG_PROJECT_RELATIONSHIP_CONFLICT",
                                "프로젝트가 속한 조직의 멤버가 아닙니다.",
                                change,
                                "먼저 조직에 사용자를 추가한 후 프로젝트에 추가하세요.",
                                true
                        ));
                    }
                }
            }
        }
        
        return conflicts;
    }

    /**
     * 시스템 정책 충돌 검증
     */
    private List<PermissionConflictDto> systemPolicyConflictCheck(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        for (BulkPermissionChangeDto change : changes) {
            // 시스템 관리자 역할 변경 제한
            if (isSystemAdminRoleChange(change)) {
                conflicts.add(createConflict(
                        "SYSTEM_ADMIN_RESTRICTION",
                        "시스템 관리자의 역할은 변경할 수 없습니다.",
                        change,
                        "시스템 관리자 권한은 별도로 관리됩니다.",
                        false
                ));
            }
            
            // 비활성 사용자 권한 변경 제한
            if (isInactiveUserChange(change)) {
                conflicts.add(createConflict(
                        "INACTIVE_USER_RESTRICTION",
                        "비활성 사용자의 권한은 변경할 수 없습니다.",
                        change,
                        "먼저 사용자를 활성화한 후 권한을 변경하세요.",
                        true
                ));
            }
        }
        
        return conflicts;
    }

    /**
     * 배치 내 충돌 검증
     */
    private List<PermissionConflictDto> batchInternalConflictCheck(List<BulkPermissionChangeDto> changes) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        // 같은 사용자-리소스 조합에 대한 중복 변경 확인
        Map<String, List<BulkPermissionChangeDto>> groupedChanges = changes.stream()
                .collect(Collectors.groupingBy(change -> 
                        change.getUserId() + ":" + change.getResourceId()));
        
        for (Map.Entry<String, List<BulkPermissionChangeDto>> entry : groupedChanges.entrySet()) {
            if (entry.getValue().size() > 1) {
                for (BulkPermissionChangeDto change : entry.getValue()) {
                    conflicts.add(createConflict(
                            "BATCH_DUPLICATE_CHANGE",
                            "같은 사용자-리소스에 대한 중복 변경이 감지되었습니다.",
                            change,
                            "배치에서 중복된 변경사항을 제거하세요.",
                            true
                    ));
                }
            }
        }
        
        return conflicts;
    }

    /**
     * 권한 승격 권한 확인
     */
    private List<PermissionConflictDto> checkRoleElevationAuthority(BulkPermissionChangeDto change) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        if (change.getResourceType().equals("ORGANIZATION")) {
            OrganizationRole currentRole = change.getCurrentRole() != null ? 
                    OrganizationRole.valueOf(change.getCurrentRole()) : null;
            OrganizationRole newRole = OrganizationRole.valueOf(change.getNewRole());
            
            // 소유자 권한 승격은 기존 소유자만 가능
            if (newRole == OrganizationRole.OWNER) {
                if (!organizationSecurityService.isOrganizationOwner(change.getResourceId())) {
                    conflicts.add(createConflict(
                            "INSUFFICIENT_ELEVATION_PERMISSION",
                            "소유자 권한 부여는 기존 소유자만 가능합니다.",
                            change,
                            "조직 소유자에게 권한 부여를 요청하세요.",
                            false
                    ));
                }
            }
        }
        
        if (change.getResourceType().equals("PROJECT")) {
            ProjectRole newRole = ProjectRole.valueOf(change.getNewRole());
            
            // 프로젝트 매니저 권한 승격은 기존 PM만 가능
            if (newRole == ProjectRole.PROJECT_MANAGER) {
                if (!projectSecurityService.isProjectManager(change.getResourceId())) {
                    conflicts.add(createConflict(
                            "INSUFFICIENT_ELEVATION_PERMISSION",
                            "프로젝트 매니저 권한 부여는 기존 PM만 가능합니다.",
                            change,
                            "프로젝트 매니저에게 권한 부여를 요청하세요.",
                            false
                    ));
                }
            }
        }
        
        return conflicts;
    }

    /**
     * 마지막 관리자 제거 방지
     */
    private List<PermissionConflictDto> checkLastAdminRemoval(BulkPermissionChangeDto change) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        if (change.getResourceType().equals("ORGANIZATION")) {
            OrganizationRole currentRole = change.getCurrentRole() != null ? 
                    OrganizationRole.valueOf(change.getCurrentRole()) : null;
            OrganizationRole newRole = OrganizationRole.valueOf(change.getNewRole());
            
            // 소유자나 관리자를 일반 멤버로 강등하는 경우
            if ((currentRole == OrganizationRole.OWNER || currentRole == OrganizationRole.ADMIN) &&
                newRole == OrganizationRole.MEMBER) {
                
                long adminCount = organizationUserRepository.countByOrganizationIdAndRole(
                        change.getResourceId(), OrganizationRole.OWNER) +
                        organizationUserRepository.countByOrganizationIdAndRole(
                        change.getResourceId(), OrganizationRole.ADMIN);
                
                if (adminCount <= 1) {
                    conflicts.add(createConflict(
                            "LAST_ADMIN_REMOVAL",
                            "조직의 마지막 관리자를 제거할 수 없습니다.",
                            change,
                            "다른 관리자를 먼저 임명한 후 진행하세요.",
                            false
                    ));
                }
            }
        }
        
        return conflicts;
    }

    /**
     * 권한 확인
     */
    private List<PermissionConflictDto> checkPermissionAuthority(BulkPermissionChangeDto change) {
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        
        if (change.getResourceType().equals("ORGANIZATION")) {
            if (!organizationSecurityService.canManageOrganization(change.getResourceId())) {
                conflicts.add(createConflict(
                        "INSUFFICIENT_PERMISSION",
                        "조직 관리 권한이 없습니다.",
                        change,
                        "조직 관리자에게 요청하세요.",
                        false
                ));
            }
        }
        
        if (change.getResourceType().equals("PROJECT")) {
            if (!projectSecurityService.canManageProject(change.getResourceId())) {
                conflicts.add(createConflict(
                        "INSUFFICIENT_PERMISSION",
                        "프로젝트 관리 권한이 없습니다.",
                        change,
                        "프로젝트 관리자에게 요청하세요.",
                        false
                ));
            }
        }
        
        return conflicts;
    }

    /**
     * 시스템 관리자 역할 변경 확인
     */
    private boolean isSystemAdminRoleChange(BulkPermissionChangeDto change) {
        Optional<User> user = userRepository.findById(change.getUserId());
        return user.isPresent() && "ADMIN".equals(user.get().getRole());
    }

    /**
     * 비활성 사용자 확인
     */
    private boolean isInactiveUserChange(BulkPermissionChangeDto change) {
        Optional<User> user = userRepository.findById(change.getUserId());
        return user.isPresent() && !user.get().getIsActive();
    }

    /**
     * 충돌 객체 생성 헬퍼 메서드
     */
    private PermissionConflictDto createConflict(String conflictType, String message, 
                                               BulkPermissionChangeDto change, 
                                               String suggestedAction, boolean canAutoResolve) {
        PermissionConflictDto conflict = new PermissionConflictDto();
        conflict.setConflictType(conflictType);
        conflict.setMessage(message);
        conflict.setUserId(change.getUserId());
        conflict.setResourceId(change.getResourceId());
        conflict.setConflictDetails(String.format("Change: %s, Resource: %s, Role: %s → %s", 
                change.getChangeType(), change.getResourceType(), 
                change.getCurrentRole(), change.getNewRole()));
        conflict.setSuggestedAction(suggestedAction);
        conflict.setCanAutoResolve(canAutoResolve);
        
        return conflict;
    }

    /**
     * 자동 해결 가능한 충돌 해결
     */
    @Transactional
    public List<BulkPermissionChangeDto> autoResolveConflicts(
            List<BulkPermissionChangeDto> changes, 
            List<PermissionConflictDto> conflicts) {
        
        List<BulkPermissionChangeDto> resolvedChanges = new ArrayList<>();
        Set<String> conflictedChangeIds = conflicts.stream()
                .filter(PermissionConflictDto::isCanAutoResolve)
                .map(conflict -> conflict.getUserId() + ":" + conflict.getResourceId())
                .collect(Collectors.toSet());
        
        for (BulkPermissionChangeDto change : changes) {
            String changeId = change.getUserId() + ":" + change.getResourceId();
            
            if (conflictedChangeIds.contains(changeId)) {
                // 자동 해결 로직 적용
                BulkPermissionChangeDto resolvedChange = applyAutoResolution(change, conflicts);
                if (resolvedChange != null) {
                    resolvedChanges.add(resolvedChange);
                }
            } else {
                resolvedChanges.add(change);
            }
        }
        
        return resolvedChanges;
    }

    /**
     * 자동 해결 로직 적용
     */
    private BulkPermissionChangeDto applyAutoResolution(BulkPermissionChangeDto change, 
                                                      List<PermissionConflictDto> conflicts) {
        // 중복 멤버십의 경우 ADD를 CHANGE로 변경
        if (change.getChangeType().equals("ADD_ORG_MEMBER") || 
            change.getChangeType().equals("ADD_PROJECT_MEMBER")) {
            
            String newChangeType = change.getChangeType().replace("ADD_", "CHANGE_").replace("_MEMBER", "_ROLE");
            change.setChangeType(newChangeType);
            
            // 현재 역할 조회 및 설정
            if (change.getResourceType().equals("ORGANIZATION")) {
                Optional<OrganizationRole> currentRole = organizationUserRepository
                        .findRoleByOrganizationIdAndUserId(change.getResourceId(), change.getUserId());
                if (currentRole.isPresent()) {
                    change.setCurrentRole(currentRole.get().toString());
                }
            } else if (change.getResourceType().equals("PROJECT")) {
                Optional<ProjectRole> currentRole = projectUserRepository
                        .findRoleByProjectIdAndUserId(change.getResourceId(), change.getUserId());
                if (currentRole.isPresent()) {
                    change.setCurrentRole(currentRole.get().toString());
                }
            }
            
            return change;
        }
        
        return change;
    }
}