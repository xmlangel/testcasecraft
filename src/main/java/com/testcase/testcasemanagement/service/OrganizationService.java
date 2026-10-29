package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.audit.AuditAction;
import com.testcase.testcasemanagement.audit.AuditService;
import com.testcase.testcasemanagement.exception.AccessDeniedException;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.OrganizationUserRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrganizationService {

  @Autowired private OrganizationRepository organizationRepository;

  @Autowired private OrganizationUserRepository organizationUserRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private OrganizationSecurityService organizationSecurityService;

  @Autowired private SecurityContextUtil securityContextUtil;

  @Autowired private AuditService auditService;

  @Autowired private ProjectService projectService;

  /** 새 조직 생성 */
  public Organization createOrganization(String name, String description) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    User currentUser =
        userRepository
            .findByUsername(currentUsername)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));

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
    auditService.logOrganizationAction(
        organization.getId(),
        AuditAction.CREATE,
        String.format("Organization created: name=%s, description=%s", name, description));
    auditService.logOrganizationMemberAction(
        organization.getId(),
        currentUser.getId(),
        AuditAction.INVITE_MEMBER,
        OrganizationUser.OrganizationRole.OWNER.toString());

    return organization;
  }

  /** 사용자가 접근 가능한 조직 목록 조회 */
  @Transactional(readOnly = true)
  public List<Organization> getAccessibleOrganizations() {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    List<Organization> organizations;

    // 시스템 관리자는 모든 조직 조회 가능 (멤버 정보 포함)
    if (securityContextUtil.isSystemAdmin()) {
      organizations = organizationRepository.findAllWithMembers();
    } else {
      // 일반 사용자는 자신이 속한 조직만 조회 (멤버 정보 포함)
      User currentUser =
          userRepository
              .findByUsername(currentUsername)
              .orElseThrow(() -> new ResourceNotFoundException("User not found."));
      organizations = organizationRepository.findByUserIdWithMembers(currentUser.getId());
    }

    // 각 조직에 대해 현재 사용자의 역할 설정
    for (Organization org : organizations) {
      String userRole = getUserRoleInOrganization(org, currentUsername);
      org.setUserRole(userRole);
    }

    return organizations;
  }

  /** 특정 조직에서 사용자의 역할을 조회 */
  private String getUserRoleInOrganization(Organization organization, String username) {
    // 시스템 관리자인 경우 ADMIN 역할
    if (securityContextUtil.isSystemAdmin()) {
      return "ADMIN";
    }

    // 조직 멤버 중에서 현재 사용자 찾기
    for (OrganizationUser orgUser : organization.getOrganizationUsers()) {
      if (orgUser.getUser().getUsername().equals(username)) {
        return orgUser.getRoleInOrganization().toString();
      }
    }

    return "MEMBER"; // 기본값
  }

  /** 조직 상세 정보 조회 */
  @Transactional(readOnly = true)
  public Organization getOrganization(String organizationId) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 접근 권한 확인
    if (!organizationSecurityService.canAccessOrganization(organizationId, currentUsername)) {
      throw new AccessDeniedException("You do not have permission to access this organization.");
    }

    return organizationRepository
        .findByIdWithMembers(organizationId)
        .orElseThrow(() -> new ResourceNotFoundException("Organization not found."));
  }

  /** 조직 정보 수정 */
  public Organization updateOrganization(String organizationId, String name, String description) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 관리 권한 확인
    if (!organizationSecurityService.canManageOrganization(organizationId, currentUsername)) {
      throw new AccessDeniedException("You do not have permission to update this organization.");
    }

    Organization organization =
        organizationRepository
            .findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found."));

    String oldName = organization.getName();
    String oldDescription = organization.getDescription();

    organization.setName(name);
    organization.setDescription(description);
    organization.setUpdatedAt(LocalDateTime.now());

    Organization updatedOrganization = organizationRepository.save(organization);

    // 감사 로그 기록
    auditService.logOrganizationAction(
        organizationId,
        AuditAction.UPDATE,
        String.format(
            "Organization updated: oldName=%s -> newName=%s, oldDescription=%s ->"
                + " newDescription=%s",
            oldName, name, oldDescription, description));

    return updatedOrganization;
  }

  /**
   * 조직 삭제
   *
   * @param organizationId 삭제할 조직 ID
   * @param force 강제 삭제 여부 (true: 프로젝트 포함 강제 삭제, false: 일반 삭제)
   */
  public void deleteOrganization(String organizationId, boolean force) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 소유자 권한 또는 시스템 관리자 권한 확인
    if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername)
        && !securityContextUtil.isSystemAdmin()) {
      throw new AccessDeniedException("You do not have permission to delete this organization.");
    }

    Organization organization =
        organizationRepository
            .findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found."));

    String organizationName = organization.getName();

    // 프로젝트 확인 및 삭제 처리
    List<Project> projects = projectService.getOrganizationProjects(organizationId);

    if (!projects.isEmpty()) {
      if (!force) {
        // 일반 삭제: 프로젝트가 있으면 삭제 불가
        throw new IllegalStateException(
            String.format(
                "The organization has %d project(s). Use force delete (force=true) or delete the"
                    + " projects first.",
                projects.size()));
      } else {
        // 강제 삭제: 프로젝트들을 모두 삭제
        for (Project project : projects) {
          projectService.deleteProject(project.getId(), true); // 프로젝트도 강제 삭제
        }
      }
    }

    // 연관된 멤버 관계 삭제
    organizationUserRepository.deleteByOrganizationId(organizationId);

    // 조직 삭제
    organizationRepository.delete(organization);

    // 감사 로그 기록
    auditService.logOrganizationAction(
        organizationId,
        AuditAction.DELETE,
        String.format("Organization deleted: name=%s", organizationName));
  }

  /**
   * 조직 소유권 이전
   *
   * @param organizationId 조직 ID
   * @param newOwnerUserId 새로운 소유자 사용자 ID
   * @return 업데이트된 조직 정보
   */
  @Transactional
  public Organization transferOwnership(String organizationId, String newOwnerUserId) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 소유자 권한 또는 시스템 관리자 권한 확인
    if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername)
        && !securityContextUtil.isSystemAdmin()) {
      throw new AccessDeniedException(
          "You do not have permission to transfer organization ownership.");
    }

    // 조직 존재 확인
    Organization organization =
        organizationRepository
            .findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found."));

    // 새로운 소유자가 조직의 멤버인지 확인
    OrganizationUser newOwnerMember =
        organizationUserRepository
            .findByOrganizationIdAndUserId(organizationId, newOwnerUserId)
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "The new owner must be a member of the organization."));

    // 조직의 현재 OWNER 찾기 (로그인한 사용자가 아닌 실제 OWNER)
    List<OrganizationUser> allMembers =
        organizationUserRepository.findByOrganizationId(organizationId);
    OrganizationUser currentOwner =
        allMembers.stream()
            .filter(
                member -> member.getRoleInOrganization() == OrganizationUser.OrganizationRole.OWNER)
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Current owner not found."));

    // 자기 자신에게 이전하는 경우 방지
    if (currentOwner.getUser().getId().equals(newOwnerUserId)) {
      throw new IllegalStateException("The current owner is already the same user.");
    }

    // 기존 소유자를 MANAGER(ADMIN)로 변경
    currentOwner.setRoleInOrganization(OrganizationUser.OrganizationRole.ADMIN);
    currentOwner.setUpdatedAt(LocalDateTime.now());

    // 새로운 소유자를 OWNER로 변경
    newOwnerMember.setRoleInOrganization(OrganizationUser.OrganizationRole.OWNER);
    newOwnerMember.setUpdatedAt(LocalDateTime.now());

    // 변경사항 저장
    organizationUserRepository.save(currentOwner);
    organizationUserRepository.save(newOwnerMember);

    // 감사 로그 기록
    auditService.logOrganizationAction(
        organizationId,
        AuditAction.UPDATE,
        String.format(
            "Ownership transferred from %s to %s (by %s)",
            currentOwner.getUser().getUsername(),
            newOwnerMember.getUser().getUsername(),
            currentUsername));

    return organization;
  }

  /** 조직에 멤버 초대 */
  public OrganizationUser inviteMember(
      String organizationId, String username, OrganizationUser.OrganizationRole role) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 멤버 초대 권한 확인
    if (!organizationSecurityService.canInviteMembers(organizationId, currentUsername)) {
      throw new AccessDeniedException("You do not have permission to invite members.");
    }

    // 초대할 사용자 존재 확인
    User invitedUser =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User to invite not found."));

    // 조직 존재 확인
    Organization organization =
        organizationRepository
            .findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found."));

    // 이미 멤버인지 확인
    Optional<OrganizationUser> existingMember =
        organizationUserRepository.findByOrganizationIdAndUserId(
            organizationId, invitedUser.getId());
    if (existingMember.isPresent()) {
      throw new IllegalArgumentException("User is already a member of the organization.");
    }

    // 소유자 역할은 현재 소유자만 부여 가능
    if (role == OrganizationUser.OrganizationRole.OWNER) {
      if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername)) {
        throw new AccessDeniedException("Owner role cannot be granted.");
      }
      // 조직당 OWNER는 1명만 존재해야 함 (transferOwnership()이 단일 OWNER를 전제로 동작함)
      boolean ownerAlreadyExists =
          organizationUserRepository.findByOrganizationId(organizationId).stream()
              .anyMatch(
                  member ->
                      member.getRoleInOrganization() == OrganizationUser.OrganizationRole.OWNER);
      if (ownerAlreadyExists) {
        throw new IllegalStateException(
            "The organization already has an OWNER. Use transferOwnership to transfer ownership.");
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
    auditService.logOrganizationMemberAction(
        organizationId, invitedUser.getId(), AuditAction.INVITE_MEMBER, role.toString());

    return savedMember;
  }

  /** 조직에서 멤버 제거 */
  public void removeMember(String organizationId, String targetUserId) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 멤버 제거 권한 확인
    if (!organizationSecurityService.canRemoveMember(
        organizationId, targetUserId, currentUsername)) {
      throw new AccessDeniedException("You do not have permission to remove members.");
    }

    OrganizationUser organizationUser =
        organizationUserRepository
            .findByOrganizationIdAndUserId(organizationId, targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization member not found."));

    String removedRole = organizationUser.getRoleInOrganization().toString();
    organizationUserRepository.delete(organizationUser);

    // 감사 로그 기록
    auditService.logOrganizationMemberAction(
        organizationId, targetUserId, AuditAction.REMOVE_MEMBER, removedRole);
  }

  /** 멤버 역할 변경 */
  public OrganizationUser updateMemberRole(
      String organizationId, String targetUserId, OrganizationUser.OrganizationRole newRole) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 관리 권한 확인
    if (!organizationSecurityService.canManageOrganization(organizationId, currentUsername)) {
      throw new AccessDeniedException("You do not have permission to change member roles.");
    }

    OrganizationUser organizationUser =
        organizationUserRepository
            .findByOrganizationIdAndUserId(organizationId, targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization member not found."));

    // 소유자 역할 변경은 현재 소유자만 가능
    if (newRole == OrganizationUser.OrganizationRole.OWNER
        || organizationUser.getRoleInOrganization() == OrganizationUser.OrganizationRole.OWNER) {
      if (!organizationSecurityService.isOrganizationOwner(organizationId, currentUsername)) {
        throw new AccessDeniedException("Changes involving the owner role are not allowed.");
      }
    }

    // 조직당 OWNER는 1명만 존재해야 함 (transferOwnership()이 단일 OWNER를 전제로 동작함)
    if (newRole == OrganizationUser.OrganizationRole.OWNER
        && organizationUser.getRoleInOrganization() != OrganizationUser.OrganizationRole.OWNER) {
      boolean ownerAlreadyExists =
          organizationUserRepository.findByOrganizationId(organizationId).stream()
              .anyMatch(
                  member ->
                      member.getRoleInOrganization() == OrganizationUser.OrganizationRole.OWNER);
      if (ownerAlreadyExists) {
        throw new IllegalStateException(
            "The organization already has an OWNER. Use transferOwnership to transfer ownership.");
      }
    }

    OrganizationUser.OrganizationRole oldRole = organizationUser.getRoleInOrganization();
    organizationUser.setRoleInOrganization(newRole);
    organizationUser.setUpdatedAt(LocalDateTime.now());

    OrganizationUser updatedMember = organizationUserRepository.save(organizationUser);

    // 감사 로그 기록
    auditService.logOrganizationMemberAction(
        organizationId,
        targetUserId,
        AuditAction.UPDATE_MEMBER_ROLE,
        String.format("oldRole=%s, newRole=%s", oldRole, newRole));

    return updatedMember;
  }

  /** 조직 멤버 목록 조회 */
  @Transactional(readOnly = true)
  public List<OrganizationUser> getOrganizationMembers(String organizationId) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    if (currentUsername == null) {
      throw new AccessDeniedException("Authentication required.");
    }

    // 접근 권한 확인
    if (!organizationSecurityService.canAccessOrganization(organizationId, currentUsername)) {
      throw new AccessDeniedException(
          "You do not have permission to view the organization member list.");
    }

    return organizationUserRepository.findByOrganizationId(organizationId);
  }
}
