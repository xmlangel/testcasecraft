package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.Group;
import com.testcase.testcasemanagement.model.GroupMember;
import com.testcase.testcasemanagement.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

/**
 * 그룹 관리 컨트롤러
 * Spring Security @PreAuthorize를 통한 메서드 레벨 보안 적용
 */
@Tag(name = "User - Group Management", description = "그룹 관리 API")
@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupService groupService;

    /**
     * 사용자가 접근 가능한 그룹 목록 조회
     * 권한: 인증된 사용자만 가능
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Group>> getAccessibleGroups() {
        List<Group> groups = groupService.getAccessibleGroups();
        return ResponseEntity.ok(groups);
    }

    /**
     * 조직에 새 그룹 생성
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @PostMapping("/organization/{organizationId}")
    @PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
    public ResponseEntity<Group> createOrganizationGroup(@PathVariable String organizationId,
                                                       @RequestParam String name,
                                                       @RequestParam(required = false) String description) {
        Group group = groupService.createOrganizationGroup(name, description, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    /**
     * 프로젝트에 새 그룹 생성
     * 권한: 프로젝트 멤버 또는 시스템 관리자
     */
    @PostMapping("/project/{projectId}")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<Group> createProjectGroup(@PathVariable String projectId,
                                                   @RequestParam String name,
                                                   @RequestParam(required = false) String description) {
        Group group = groupService.createProjectGroup(name, description, projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    /**
     * 조직별 그룹 목록 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
    public ResponseEntity<List<Group>> getOrganizationGroups(@PathVariable String organizationId) {
        List<Group> groups = groupService.getOrganizationGroups(organizationId);
        return ResponseEntity.ok(groups);
    }

    /**
     * 프로젝트별 그룹 목록 조회
     * 권한: 프로젝트 멤버 또는 시스템 관리자
     */
    @GetMapping("/project/{projectId}")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<List<Group>> getProjectGroups(@PathVariable String projectId) {
        List<Group> groups = groupService.getProjectGroups(projectId);
        return ResponseEntity.ok(groups);
    }

    /**
     * 그룹 상세 정보 조회
     * 권한: 그룹 멤버 또는 상위 조직/프로젝트 멤버 또는 시스템 관리자
     */
    @GetMapping("/{groupId}")
    @PreAuthorize("@groupSecurityService.canAccessGroup(#groupId, authentication.name)")
    public ResponseEntity<Group> getGroup(@PathVariable String groupId) {
        Group group = groupService.getGroup(groupId);
        return ResponseEntity.ok(group);
    }

    /**
     * 그룹 정보 수정
     * 권한: 그룹 리더 이상 또는 시스템 관리자
     */
    @PutMapping("/{groupId}")
    @PreAuthorize("@groupSecurityService.hasLeaderRole(#groupId, authentication.name)")
    public ResponseEntity<Group> updateGroup(@PathVariable String groupId,
                                           @RequestParam String name,
                                           @RequestParam(required = false) String description) {
        Group group = groupService.updateGroup(groupId, name, description);
        return ResponseEntity.ok(group);
    }

    /**
     * 그룹 삭제
     * 권한: 그룹 리더 또는 시스템 관리자
     */
    @DeleteMapping("/{groupId}")
    @PreAuthorize("@groupSecurityService.hasLeaderRole(#groupId, authentication.name)")
    public ResponseEntity<Void> deleteGroup(@PathVariable String groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 그룹에 멤버 초대
     * 권한: 그룹 리더 이상 또는 시스템 관리자
     */
    @PostMapping("/{groupId}/members")
    @PreAuthorize("@groupSecurityService.hasLeaderRole(#groupId, authentication.name)")
    public ResponseEntity<GroupMember> inviteGroupMember(@PathVariable String groupId,
                                                       @RequestParam String username,
                                                       @RequestParam GroupMember.GroupRole role) {
        GroupMember member = groupService.inviteMember(groupId, username, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    /**
     * 그룹에서 멤버 제거
     * 권한: 그룹 리더 이상 또는 시스템 관리자 (자기 자신은 항상 가능)
     */
    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("@groupSecurityService.hasLeaderRole(#groupId, authentication.name) or authentication.name == #userId")
    public ResponseEntity<Void> removeGroupMember(@PathVariable String groupId,
                                                 @PathVariable String userId) {
        groupService.removeMember(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 그룹 멤버 역할 변경
     * 권한: 그룹 리더 이상 또는 시스템 관리자
     */
    @PutMapping("/{groupId}/members/{userId}/role")
    @PreAuthorize("@groupSecurityService.hasLeaderRole(#groupId, authentication.name)")
    public ResponseEntity<GroupMember> updateGroupMemberRole(@PathVariable String groupId,
                                                           @PathVariable String userId,
                                                           @RequestParam GroupMember.GroupRole role) {
        GroupMember member = groupService.updateMemberRole(groupId, userId, role);
        return ResponseEntity.ok(member);
    }

    /**
     * 그룹 멤버 목록 조회
     * 권한: 그룹 멤버 또는 상위 조직/프로젝트 멤버 또는 시스템 관리자
     */
    @GetMapping("/{groupId}/members")
    @PreAuthorize("@groupSecurityService.canAccessGroup(#groupId, authentication.name)")
    public ResponseEntity<List<GroupMember>> getGroupMembers(@PathVariable String groupId) {
        List<GroupMember> members = groupService.getGroupMembers(groupId);
        return ResponseEntity.ok(members);
    }
}