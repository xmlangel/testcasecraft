// src/main/java/com/testcase/testcasemanagement/security/GroupSecurityService.java
package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.model.Group;
import com.testcase.testcasemanagement.model.GroupMember.GroupRole;
import com.testcase.testcasemanagement.repository.GroupMemberRepository;
import com.testcase.testcasemanagement.repository.GroupRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GroupSecurityService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    @Autowired
    private OrganizationSecurityService organizationSecurityService;

    @Autowired
    private ProjectSecurityService projectSecurityService;

    /**
     * 사용자가 그룹의 멤버인지 확인
     */
    public boolean isGroupMember(String groupId, String username) {
        return userRepository.findByUsername(username)
                .map(user -> groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId()))
                .orElse(false);
    }

    /**
     * 현재 사용자가 그룹의 멤버인지 확인
     */
    public boolean isGroupMember(String groupId) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return currentUserId != null && 
               groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUserId);
    }

    /**
     * 사용자가 그룹의 리더십 역할(LEADER, CO_LEADER)인지 확인
     */
    public boolean hasLeadershipRole(String groupId, String username) {
        return userRepository.findByUsername(username)
                .map(user -> groupMemberRepository.hasLeadershipRole(groupId, user.getId()))
                .orElse(false);
    }

    /**
     * 현재 사용자가 그룹의 리더십 역할인지 확인
     */
    public boolean hasLeadershipRole(String groupId) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return currentUserId != null && 
               groupMemberRepository.hasLeadershipRole(groupId, currentUserId);
    }

    /**
     * 사용자가 그룹의 리더인지 확인
     */
    public boolean isGroupLeader(String groupId, String username) {
        return userRepository.findByUsername(username)
                .map(user -> groupMemberRepository.isLeader(groupId, user.getId()))
                .orElse(false);
    }

    /**
     * 현재 사용자가 그룹의 리더인지 확인
     */
    public boolean isGroupLeader(String groupId) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return currentUserId != null && 
               groupMemberRepository.isLeader(groupId, currentUserId);
    }

    /**
     * 사용자가 그룹에 접근할 수 있는지 확인
     * (그룹 멤버이거나, 조직/프로젝트 멤버이거나, 시스템 관리자)
     */
    public boolean canAccessGroup(String groupId, String username) {
        // 시스템 관리자는 모든 그룹에 접근 가능
        if (userRepository.findByUsername(username)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false)) {
            return true;
        }

        // 그룹 멤버인지 확인
        if (isGroupMember(groupId, username)) {
            return true;
        }

        // 그룹이 속한 조직/프로젝트 확인
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isPresent()) {
            Group g = group.get();
            
            // 조직 그룹인 경우 조직 멤버도 접근 가능
            if (g.getOrganization() != null) {
                if (organizationSecurityService.isOrganizationMember(g.getOrganization().getId(), username)) {
                    return true;
                }
            }
            
            // 프로젝트 그룹인 경우 프로젝트 멤버도 접근 가능
            if (g.getProject() != null) {
                if (projectSecurityService.canAccessProject(g.getProject().getId(), username)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 현재 사용자가 그룹에 접근할 수 있는지 확인
     */
    public boolean canAccessGroup(String groupId) {
        // 시스템 관리자는 모든 그룹에 접근 가능
        if (securityContextUtil.isSystemAdmin()) {
            return true;
        }

        // 그룹 멤버인지 확인
        if (isGroupMember(groupId)) {
            return true;
        }

        // 그룹이 속한 조직/프로젝트 확인
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isPresent()) {
            Group g = group.get();
            
            // 조직 그룹인 경우 조직 멤버도 접근 가능
            if (g.getOrganization() != null) {
                if (organizationSecurityService.isOrganizationMember(g.getOrganization().getId())) {
                    return true;
                }
            }
            
            // 프로젝트 그룹인 경우 프로젝트 멤버도 접근 가능
            if (g.getProject() != null) {
                if (projectSecurityService.canAccessProject(g.getProject().getId())) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 사용자가 그룹을 관리할 수 있는지 확인
     * (그룹 리더이거나, 조직/프로젝트 관리자이거나, 시스템 관리자)
     */
    public boolean canManageGroup(String groupId, String username) {
        // 시스템 관리자는 모든 그룹을 관리 가능
        if (userRepository.findByUsername(username)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false)) {
            return true;
        }

        // 그룹 리더인지 확인
        if (isGroupLeader(groupId, username)) {
            return true;
        }

        // 그룹이 속한 조직/프로젝트의 관리자인지 확인
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isPresent()) {
            Group g = group.get();
            
            // 조직 그룹인 경우 조직 관리자도 관리 가능
            if (g.getOrganization() != null) {
                if (organizationSecurityService.hasOrganizationAdminRole(g.getOrganization().getId(), username)) {
                    return true;
                }
            }
            
            // 프로젝트 그룹인 경우 프로젝트 관리자도 관리 가능
            if (g.getProject() != null) {
                if (projectSecurityService.canManageProject(g.getProject().getId(), username)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 현재 사용자가 그룹을 관리할 수 있는지 확인
     */
    public boolean canManageGroup(String groupId) {
        // 시스템 관리자는 모든 그룹을 관리 가능
        if (securityContextUtil.isSystemAdmin()) {
            return true;
        }

        // 그룹 리더인지 확인
        if (isGroupLeader(groupId)) {
            return true;
        }

        // 그룹이 속한 조직/프로젝트의 관리자인지 확인
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isPresent()) {
            Group g = group.get();
            
            // 조직 그룹인 경우 조직 관리자도 관리 가능
            if (g.getOrganization() != null) {
                if (organizationSecurityService.hasOrganizationAdminRole(g.getOrganization().getId())) {
                    return true;
                }
            }
            
            // 프로젝트 그룹인 경우 프로젝트 관리자도 관리 가능
            if (g.getProject() != null) {
                if (projectSecurityService.canManageProject(g.getProject().getId())) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 사용자가 그룹 멤버를 초대할 수 있는지 확인
     */
    public boolean canInviteMembers(String groupId, String username) {
        // 그룹 리더 또는 그룹 관리자만 가능
        return hasLeadershipRole(groupId, username) || canManageGroup(groupId, username);
    }

    /**
     * 현재 사용자가 그룹 멤버를 초대할 수 있는지 확인
     */
    public boolean canInviteMembers(String groupId) {
        return hasLeadershipRole(groupId) || canManageGroup(groupId);
    }

    /**
     * 사용자가 그룹에서 특정 멤버를 제거할 수 있는지 확인
     */
    public boolean canRemoveMember(String groupId, String targetUserId, String username) {
        // 자기 자신은 항상 탈퇴 가능
        if (userRepository.findByUsername(username)
                .map(user -> user.getId().equals(targetUserId))
                .orElse(false)) {
            return true;
        }

        // 그룹 리더는 다른 멤버 제거 가능 (단, 리더는 다른 리더 제거 불가)
        if (isGroupLeader(groupId, username)) {
            // 대상이 리더인지 확인
            Optional<GroupRole> targetRole = groupMemberRepository
                    .findRoleByGroupIdAndUserId(groupId, targetUserId);
            
            if (targetRole.isPresent() && targetRole.get() == GroupRole.LEADER) {
                // 리더는 다른 리더를 제거할 수 없음
                return false;
            }
            
            return true;
        }

        // 그룹 관리자(조직/프로젝트 관리자)는 모든 멤버 제거 가능
        return canManageGroup(groupId, username);
    }

    /**
     * 현재 사용자가 그룹에서 특정 멤버를 제거할 수 있는지 확인
     */
    public boolean canRemoveMember(String groupId, String targetUserId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        return currentUsername != null && canRemoveMember(groupId, targetUserId, currentUsername);
    }

    /**
     * 사용자가 그룹을 생성할 수 있는지 확인
     */
    public boolean canCreateGroup(String organizationId, String projectId, String username) {
        if (organizationId != null) {
            // 조직 그룹인 경우 조직 관리자만 가능
            return organizationSecurityService.hasOrganizationAdminRole(organizationId, username);
        } else if (projectId != null) {
            // 프로젝트 그룹인 경우 프로젝트 관리자만 가능
            return projectSecurityService.canManageProject(projectId, username);
        } else {
            // 독립 그룹인 경우 인증된 사용자는 누구나 가능
            return userRepository.existsByUsername(username);
        }
    }

    /**
     * 현재 사용자가 그룹을 생성할 수 있는지 확인
     */
    public boolean canCreateGroup(String organizationId, String projectId) {
        if (organizationId != null) {
            // 조직 그룹인 경우 조직 관리자만 가능
            return organizationSecurityService.hasOrganizationAdminRole(organizationId);
        } else if (projectId != null) {
            // 프로젝트 그룹인 경우 프로젝트 관리자만 가능
            return projectSecurityService.canManageProject(projectId);
        } else {
            // 독립 그룹인 경우 인증된 사용자는 누구나 가능
            return securityContextUtil.isAuthenticated();
        }
    }

    /**
     * 사용자가 그룹의 리더 역할을 가지는지 확인 (Controller @PreAuthorize용)
     */
    public boolean hasLeaderRole(String groupId, String username) {
        return isGroupLeader(groupId, username) || canManageGroup(groupId, username);
    }

    /**
     * 현재 사용자가 그룹의 리더 역할을 가지는지 확인
     */
    public boolean hasLeaderRole(String groupId) {
        return isGroupLeader(groupId) || canManageGroup(groupId);
    }
}