// src/main/java/com/testcase/testcasemanagement/security/OrganizationSecurityService.java
package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import com.testcase.testcasemanagement.repository.OrganizationUserRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrganizationSecurityService {

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    /**
     * 사용자가 조직의 멤버인지 확인
     */
    public boolean isOrganizationMember(String organizationId, String username) {
        Optional<com.testcase.testcasemanagement.model.User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        com.testcase.testcasemanagement.model.User user = userOpt.get();
        return organizationUserRepository.existsByOrganizationIdAndUserId(organizationId, user.getId());
    }

    /**
     * 현재 사용자가 조직의 멤버인지 확인
     */
    public boolean isOrganizationMember(String organizationId) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return currentUserId != null && 
               organizationUserRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId);
    }

    /**
     * 사용자가 조직의 관리자(OWNER, ADMIN)인지 확인
     */
    public boolean hasOrganizationAdminRole(String organizationId, String username) {
        return userRepository.findByUsername(username)
                .map(user -> organizationUserRepository.hasAdminRole(organizationId, user.getId()))
                .orElse(false);
    }

    /**
     * 현재 사용자가 조직의 관리자인지 확인
     */
    public boolean hasOrganizationAdminRole(String organizationId) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return currentUserId != null && 
               organizationUserRepository.hasAdminRole(organizationId, currentUserId);
    }

    /**
     * 사용자가 조직의 소유자인지 확인
     */
    public boolean isOrganizationOwner(String organizationId, String username) {
        return userRepository.findByUsername(username)
                .flatMap(user -> organizationUserRepository.findRoleByOrganizationIdAndUserId(organizationId, user.getId()))
                .map(role -> role == OrganizationRole.OWNER)
                .orElse(false);
    }

    /**
     * 현재 사용자가 조직의 소유자인지 확인
     */
    public boolean isOrganizationOwner(String organizationId) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return currentUserId != null && 
               organizationUserRepository.findRoleByOrganizationIdAndUserId(organizationId, currentUserId)
                       .map(role -> role == OrganizationRole.OWNER)
                       .orElse(false);
    }

    /**
     * 사용자가 조직에 접근할 수 있는지 확인
     * (멤버이거나 시스템 관리자)
     */
    public boolean canAccessOrganization(String organizationId, String username) {
        // 시스템 관리자는 모든 조직에 접근 가능
        if (userRepository.findByUsername(username)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false)) {
            return true;
        }
        
        // 조직 멤버인지 확인
        return isOrganizationMember(organizationId, username);
    }

    /**
     * 현재 사용자가 조직에 접근할 수 있는지 확인
     */
    public boolean canAccessOrganization(String organizationId) {
        // 시스템 관리자는 모든 조직에 접근 가능
        if (securityContextUtil.isSystemAdmin()) {
            return true;
        }

        return isOrganizationMember(organizationId);
    }

    /**
     * 사용자가 조직을 관리할 수 있는지 확인
     * (소유자, 관리자이거나 시스템 관리자)
     */
    public boolean canManageOrganization(String organizationId, String username) {
        // 시스템 관리자는 모든 조직을 관리 가능
        if (userRepository.findByUsername(username)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false)) {
            return true;
        }
        
        // 조직 소유자 또는 관리자인지 확인
        return hasOrganizationAdminRole(organizationId, username);
    }

    /**
     * 현재 사용자가 조직을 관리할 수 있는지 확인
     */
    public boolean canManageOrganization(String organizationId) {
        // 시스템 관리자는 모든 조직을 관리 가능
        if (securityContextUtil.isSystemAdmin()) {
            return true;
        }
        
        // 조직 소유자 또는 관리자인지 확인
        return hasOrganizationAdminRole(organizationId);
    }

    /**
     * 사용자가 조직 멤버를 초대할 수 있는지 확인
     */
    public boolean canInviteMembers(String organizationId, String username) {
        return canManageOrganization(organizationId, username);
    }

    /**
     * 현재 사용자가 조직 멤버를 초대할 수 있는지 확인
     */
    public boolean canInviteMembers(String organizationId) {
        return canManageOrganization(organizationId);
    }

    /**
     * 사용자가 조직에서 특정 멤버를 제거할 수 있는지 확인
     */
    public boolean canRemoveMember(String organizationId, String targetUserId, String username) {
        // 시스템 관리자는 모든 멤버 제거 가능
        if (userRepository.findByUsername(username)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false)) {
            return true;
        }

        // 자기 자신은 항상 탈퇴 가능
        if (userRepository.findByUsername(username)
                .map(user -> user.getId().equals(targetUserId))
                .orElse(false)) {
            return true;
        }

        // 관리자는 다른 멤버 제거 가능 (단, 소유자는 제거 불가)
        if (canManageOrganization(organizationId, username)) {
            // 대상이 소유자인지 확인
            Optional<OrganizationRole> targetRole = organizationUserRepository
                    .findRoleByOrganizationIdAndUserId(organizationId, targetUserId);

            if (targetRole.isPresent() && targetRole.get() == OrganizationRole.OWNER) {
                // 소유자는 다른 소유자만 제거 가능
                return isOrganizationOwner(organizationId, username);
            }

            return true;
        }

        return false;
    }

    /**
     * 현재 사용자가 조직에서 특정 멤버를 제거할 수 있는지 확인
     */
    public boolean canRemoveMember(String organizationId, String targetUserId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        return currentUsername != null && canRemoveMember(organizationId, targetUserId, currentUsername);
    }

    /**
     * 사용자가 조직을 삭제할 수 있는지 확인
     * (조직 소유자이거나 시스템 관리자)
     */
    public boolean canDeleteOrganization(String organizationId, String username) {
        // 시스템 관리자는 모든 조직을 삭제 가능
        if (userRepository.findByUsername(username)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false)) {
            return true;
        }
        
        // 조직 소유자인지 확인
        return isOrganizationOwner(organizationId, username);
    }

    /**
     * 현재 사용자가 조직을 삭제할 수 있는지 확인
     */
    public boolean canDeleteOrganization(String organizationId) {
        // 시스템 관리자는 모든 조직을 삭제 가능
        if (securityContextUtil.isSystemAdmin()) {
            return true;
        }
        
        // 조직 소유자인지 확인
        return isOrganizationOwner(organizationId);
    }
}