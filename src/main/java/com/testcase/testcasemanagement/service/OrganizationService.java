package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.audit.AuditAction;
import com.testcase.testcasemanagement.audit.AuditService;
import com.testcase.testcasemanagement.exception.AccessDeniedException;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.OrganizationUserRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationSecurityService organizationSecurityService;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    @Autowired
    private AuditService auditService;

    /**
     * 새 조직 생성
     */
    public Organization createOrganization(String name, String description) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 조직 생성
        Organization organization = new Organization();
        organization.setName(name);
        organization.setDescription(description);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());
        organization = organizationRepository.save(organization);

        // 생성자를 조직 소유자로 추가
        OrganizationUser organizationUser = new OrganizationUser();
        organizationUser.setOrganization(organization);
        organizationUser.setUser(currentUser);
        organizationUser.setRoleInOrganization(OrganizationUser.OrganizationRole.OWNER);
        organizationUser.setCreatedAt(LocalDateTime.now());
        organizationUser.setUpdatedAt(LocalDateTime.now());
        organizationUserRepository.save(organizationUser);

        // 감사 로그 기록
        auditService.logOrganizationAction(organization.getId(), AuditAction.CREATE, 
                String.format("Organization created: name=%s, description=%s", name, description));
        auditService.logOrganizationMemberAction(organization.getId(), currentUser.getId(), 
                AuditAction.INVITE_MEMBER, OrganizationUser.OrganizationRole.OWNER.toString());

        return organization;
    }

    /**
     * 사용자가 접근 가능한 조직 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Organization> getAccessibleOrganizations() {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 시스템 관리자는 모든 조직 조회 가능 (멤버 정보 포함)
        if (securityContextUtil.isSystemAdmin()) {
            return organizationRepository.findAllWithMembers();
        }

        // 일반 사용자는 자신이 속한 조직만 조회 (멤버 정보 포함)
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        return organizationRepository.findByUserIdWithMembers(currentUser.getId());
    }

    /**
     * 조직 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public Organization getOrganization(String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 접근 권한 확인
        if (!organizationSecurityService.canAccessOrganization(organizationId, currentUsername)) {
            throw new AccessDeniedException("조직에 접근할 권한이 없습니다.");
        }

        return organizationRepository.findByIdWithMembers(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));
    }

    /**
     * 조직 정보 수정
     */
    public Organization updateOrganization(String organizationId, String name, String description) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 관리 권한 확인
        if (!organizationSecurityService.canManageOrganization(organizationId, currentUsername)) {
            throw new AccessDeniedException("조직을 수정할 권한이 없습니다.");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));

        String oldName = organization.getName();
        String oldDescription = organization.getDescription();
        
        organization.setName(name);
        organization.setDescription(description);
        organization.setUpdatedAt(LocalDateTime.now());

        Organization updatedOrganization = organizationRepository.save(organization);
        
        // 감사 로그 기록
        auditService.logOrganizationAction(organizationId, AuditAction.UPDATE, 
                String.format("Organization updated: oldName=%s -> newName=%s, oldDescription=%s -> newDescription=%s", 
                    oldName, name, oldDescription, description));

        return updatedOrganization;
    }

    /**
     * 조직 삭제
     */
    public void deleteOrganization(String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 소유자 권한 또는 시스템 관리자 권한 확인
        if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername) 
            && !securityContextUtil.isSystemAdmin()) {
            throw new AccessDeniedException("조직을 삭제할 권한이 없습니다.");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));

        String organizationName = organization.getName();
        
        // 연관된 멤버 관계 먼저 삭제
        organizationUserRepository.deleteByOrganizationId(organizationId);

        // 조직 삭제
        organizationRepository.delete(organization);
        
        // 감사 로그 기록
        auditService.logOrganizationAction(organizationId, AuditAction.DELETE, 
                String.format("Organization deleted: name=%s", organizationName));
    }

    /**
     * 조직에 멤버 초대
     */
    public OrganizationUser inviteMember(String organizationId, String username, OrganizationUser.OrganizationRole role) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 멤버 초대 권한 확인
        if (!organizationSecurityService.canInviteMembers(organizationId, currentUsername)) {
            throw new AccessDeniedException("멤버를 초대할 권한이 없습니다.");
        }

        // 초대할 사용자 존재 확인
        User invitedUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("초대할 사용자를 찾을 수 없습니다."));

        // 조직 존재 확인
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));

        // 이미 멤버인지 확인
        Optional<OrganizationUser> existingMember = organizationUserRepository
                .findByOrganizationIdAndUserId(organizationId, invitedUser.getId());
        if (existingMember.isPresent()) {
            throw new IllegalArgumentException("이미 조직의 멤버입니다.");
        }

        // 소유자 역할은 현재 소유자만 부여 가능
        if (role == OrganizationUser.OrganizationRole.OWNER) {
            if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername)) {
                throw new AccessDeniedException("소유자 권한을 부여할 수 없습니다.");
            }
        }

        // 멤버 추가
        OrganizationUser organizationUser = new OrganizationUser();
        organizationUser.setOrganization(organization);
        organizationUser.setUser(invitedUser);
        organizationUser.setRoleInOrganization(role);
        organizationUser.setCreatedAt(LocalDateTime.now());
        organizationUser.setUpdatedAt(LocalDateTime.now());

        OrganizationUser savedMember = organizationUserRepository.save(organizationUser);
        
        // 감사 로그 기록
        auditService.logOrganizationMemberAction(organizationId, invitedUser.getId(), 
                AuditAction.INVITE_MEMBER, role.toString());

        return savedMember;
    }

    /**
     * 조직에서 멤버 제거
     */
    public void removeMember(String organizationId, String targetUserId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 멤버 제거 권한 확인
        if (!organizationSecurityService.canRemoveMember(organizationId, targetUserId, currentUsername)) {
            throw new AccessDeniedException("멤버를 제거할 권한이 없습니다.");
        }

        OrganizationUser organizationUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organizationId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("조직 멤버를 찾을 수 없습니다."));

        String removedRole = organizationUser.getRoleInOrganization().toString();
        organizationUserRepository.delete(organizationUser);
        
        // 감사 로그 기록
        auditService.logOrganizationMemberAction(organizationId, targetUserId, 
                AuditAction.REMOVE_MEMBER, removedRole);
    }

    /**
     * 멤버 역할 변경
     */
    public OrganizationUser updateMemberRole(String organizationId, String targetUserId, OrganizationUser.OrganizationRole newRole) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 관리 권한 확인
        if (!organizationSecurityService.canManageOrganization(organizationId, currentUsername)) {
            throw new AccessDeniedException("멤버 역할을 변경할 권한이 없습니다.");
        }

        OrganizationUser organizationUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organizationId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("조직 멤버를 찾을 수 없습니다."));

        // 소유자 역할 변경은 현재 소유자만 가능
        if (newRole == OrganizationUser.OrganizationRole.OWNER || 
            organizationUser.getRoleInOrganization() == OrganizationUser.OrganizationRole.OWNER) {
            if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername)) {
                throw new AccessDeniedException("소유자 권한과 관련된 변경을 할 수 없습니다.");
            }
        }

        OrganizationUser.OrganizationRole oldRole = organizationUser.getRoleInOrganization();
        organizationUser.setRoleInOrganization(newRole);
        organizationUser.setUpdatedAt(LocalDateTime.now());

        OrganizationUser updatedMember = organizationUserRepository.save(organizationUser);
        
        // 감사 로그 기록
        auditService.logOrganizationMemberAction(organizationId, targetUserId, 
                AuditAction.UPDATE_MEMBER_ROLE, 
                String.format("oldRole=%s, newRole=%s", oldRole, newRole));

        return updatedMember;
    }

    /**
     * 조직 멤버 목록 조회
     */
    @Transactional(readOnly = true)
    public List<OrganizationUser> getOrganizationMembers(String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 접근 권한 확인
        if (!organizationSecurityService.canAccessOrganization(organizationId, currentUsername)) {
            throw new AccessDeniedException("조직 멤버 목록을 조회할 권한이 없습니다.");
        }

        return organizationUserRepository.findByOrganizationId(organizationId);
    }
}