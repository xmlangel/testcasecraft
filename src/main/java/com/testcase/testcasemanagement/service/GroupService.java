package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.exception.AccessDeniedException;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.Group;
import com.testcase.testcasemanagement.model.GroupMember;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.GroupMemberRepository;
import com.testcase.testcasemanagement.repository.GroupRepository;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.GroupSecurityService;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private GroupSecurityService groupSecurityService;

    @Autowired
    private OrganizationSecurityService organizationSecurityService;

    @Autowired
    private ProjectSecurityService projectSecurityService;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    /**
     * 새 그룹 생성 (조직 그룹)
     */
    public Group createOrganizationGroup(String name, String description, String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 조직 그룹 생성 권한 확인
        if (!groupSecurityService.canCreateGroup(organizationId, null, currentUsername)) {
            throw new AccessDeniedException("해당 조직에 그룹을 생성할 권한이 없습니다.");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));

        // 그룹 생성
        Group group = new Group();
        group.setName(name);
        group.setDescription(description);
        group.setOrganization(organization);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        group = groupRepository.save(group);

        // 생성자를 그룹 리더로 추가
        GroupMember groupMember = new GroupMember();
        groupMember.setGroup(group);
        groupMember.setUser(currentUser);
        groupMember.setRoleInGroup(GroupMember.GroupRole.LEADER);
        groupMember.setCreatedAt(LocalDateTime.now());
        groupMember.setUpdatedAt(LocalDateTime.now());
        groupMemberRepository.save(groupMember);

        return group;
    }

    /**
     * 새 그룹 생성 (프로젝트 그룹)
     */
    public Group createProjectGroup(String name, String description, String projectId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 프로젝트 그룹 생성 권한 확인
        if (!groupSecurityService.canCreateGroup(null, projectId, currentUsername)) {
            throw new AccessDeniedException("해당 프로젝트에 그룹을 생성할 권한이 없습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        // 그룹 생성
        Group group = new Group();
        group.setName(name);
        group.setDescription(description);
        group.setProject(project);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        group = groupRepository.save(group);

        // 생성자를 그룹 리더로 추가
        GroupMember groupMember = new GroupMember();
        groupMember.setGroup(group);
        groupMember.setUser(currentUser);
        groupMember.setRoleInGroup(GroupMember.GroupRole.LEADER);
        groupMember.setCreatedAt(LocalDateTime.now());
        groupMember.setUpdatedAt(LocalDateTime.now());
        groupMemberRepository.save(groupMember);

        return group;
    }

    /**
     * 사용자가 접근 가능한 그룹 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Group> getAccessibleGroups() {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 시스템 관리자는 모든 그룹 조회 가능
        if (securityContextUtil.isSystemAdmin()) {
            return groupRepository.findAll();
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 사용자가 접근 가능한 그룹 목록 조회 (직접 멤버 + 조직/프로젝트 멤버십을 통한 접근)
        return groupRepository.findAccessibleGroupsByUserId(currentUser.getId());
    }

    /**
     * 조직별 그룹 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Group> getOrganizationGroups(String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 조직 접근 권한 확인
        if (!organizationSecurityService.canAccessOrganization(organizationId, currentUsername)) {
            throw new AccessDeniedException("조직의 그룹 목록을 조회할 권한이 없습니다.");
        }

        return groupRepository.findByOrganizationId(organizationId);
    }

    /**
     * 프로젝트별 그룹 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Group> getProjectGroups(String projectId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 프로젝트 접근 권한 확인
        if (!projectSecurityService.canAccessProject(projectId, currentUsername)) {
            throw new AccessDeniedException("프로젝트의 그룹 목록을 조회할 권한이 없습니다.");
        }

        return groupRepository.findByProjectId(projectId);
    }

    /**
     * 그룹 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public Group getGroup(String groupId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 접근 권한 확인
        if (!groupSecurityService.canAccessGroup(groupId, currentUsername)) {
            throw new AccessDeniedException("그룹에 접근할 권한이 없습니다.");
        }

        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("그룹을 찾을 수 없습니다."));
    }

    /**
     * 그룹 정보 수정
     */
    public Group updateGroup(String groupId, String name, String description) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 관리 권한 확인
        if (!groupSecurityService.canManageGroup(groupId, currentUsername)) {
            throw new AccessDeniedException("그룹을 수정할 권한이 없습니다.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("그룹을 찾을 수 없습니다."));

        group.setName(name);
        group.setDescription(description);
        group.setUpdatedAt(LocalDateTime.now());

        return groupRepository.save(group);
    }

    /**
     * 그룹 삭제
     */
    public void deleteGroup(String groupId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 그룹 리더 권한 또는 시스템 관리자 권한 확인
        if (!groupSecurityService.isGroupLeader(groupId, currentUsername) 
            && !securityContextUtil.isSystemAdmin()) {
            throw new AccessDeniedException("그룹을 삭제할 권한이 없습니다.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("그룹을 찾을 수 없습니다."));

        // 연관된 멤버 관계 먼저 삭제
        groupMemberRepository.deleteByGroupId(groupId);

        // 그룹 삭제
        groupRepository.delete(group);
    }

    /**
     * 그룹에 멤버 초대
     */
    public GroupMember inviteMember(String groupId, String username, GroupMember.GroupRole role) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 멤버 초대 권한 확인
        if (!groupSecurityService.canInviteMembers(groupId, currentUsername)) {
            throw new AccessDeniedException("멤버를 초대할 권한이 없습니다.");
        }

        // 초대할 사용자 존재 확인
        User invitedUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("초대할 사용자를 찾을 수 없습니다."));

        // 그룹 존재 확인
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("그룹을 찾을 수 없습니다."));

        // 이미 멤버인지 확인
        Optional<GroupMember> existingMember = groupMemberRepository
                .findByGroupIdAndUserId(groupId, invitedUser.getId());
        if (existingMember.isPresent()) {
            throw new IllegalArgumentException("이미 그룹의 멤버입니다.");
        }

        // 그룹 리더 역할은 현재 그룹 리더만 부여 가능
        if (role == GroupMember.GroupRole.LEADER) {
            if (!groupSecurityService.isGroupLeader(groupId, currentUsername)) {
                throw new AccessDeniedException("그룹 리더 권한을 부여할 수 없습니다.");
            }
        }

        // 멤버 추가
        GroupMember groupMember = new GroupMember();
        groupMember.setGroup(group);
        groupMember.setUser(invitedUser);
        groupMember.setRoleInGroup(role);
        groupMember.setCreatedAt(LocalDateTime.now());
        groupMember.setUpdatedAt(LocalDateTime.now());

        return groupMemberRepository.save(groupMember);
    }

    /**
     * 그룹에서 멤버 제거
     */
    public void removeMember(String groupId, String targetUserId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 멤버 제거 권한 확인
        if (!groupSecurityService.canRemoveMember(groupId, targetUserId, currentUsername)) {
            throw new AccessDeniedException("멤버를 제거할 권한이 없습니다.");
        }

        GroupMember groupMember = groupMemberRepository
                .findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("그룹 멤버를 찾을 수 없습니다."));

        groupMemberRepository.delete(groupMember);
    }

    /**
     * 멤버 역할 변경
     */
    public GroupMember updateMemberRole(String groupId, String targetUserId, GroupMember.GroupRole newRole) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 관리 권한 확인
        if (!groupSecurityService.canManageGroup(groupId, currentUsername)) {
            throw new AccessDeniedException("멤버 역할을 변경할 권한이 없습니다.");
        }

        GroupMember groupMember = groupMemberRepository
                .findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("그룹 멤버를 찾을 수 없습니다."));

        // 그룹 리더 역할 변경은 현재 그룹 리더만 가능
        if (newRole == GroupMember.GroupRole.LEADER || 
            groupMember.getRoleInGroup() == GroupMember.GroupRole.LEADER) {
            if (!groupSecurityService.isGroupLeader(groupId, currentUsername)) {
                throw new AccessDeniedException("그룹 리더 권한과 관련된 변경을 할 수 없습니다.");
            }
        }

        groupMember.setRoleInGroup(newRole);
        groupMember.setUpdatedAt(LocalDateTime.now());

        return groupMemberRepository.save(groupMember);
    }

    /**
     * 그룹 멤버 목록 조회
     */
    @Transactional(readOnly = true)
    public List<GroupMember> getGroupMembers(String groupId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 접근 권한 확인
        if (!groupSecurityService.canAccessGroup(groupId, currentUsername)) {
            throw new AccessDeniedException("그룹 멤버 목록을 조회할 권한이 없습니다.");
        }

        return groupMemberRepository.findByGroupId(groupId);
    }
}