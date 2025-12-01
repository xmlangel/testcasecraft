// src/test/java/com/testcase/testcasemanagement/security/SimpleSecurityServiceTest.java
package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.GroupMember;
import com.testcase.testcasemanagement.repository.OrganizationUserRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.GroupMemberRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.GroupRepository;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

/**
 * SecurityService 기본 테스트
 * Task 17: Security 서비스 기본 기능 검증
 */
public class SimpleSecurityServiceTest {

    @Mock
    private OrganizationUserRepository organizationUserRepository;

    @Mock
    private ProjectUserRepository projectUserRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private OrganizationSecurityService organizationSecurityService;

    @InjectMocks
    private ProjectSecurityService projectSecurityService;

    @InjectMocks
    private GroupSecurityService groupSecurityService;

    @BeforeMethod
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ==================== OrganizationSecurityService 기본 테스트 ====================

    @Test
    void testOrganizationSecurityService_Creation() {
        // When & Then
        assertNotNull(organizationSecurityService);
    }

    @Test
    void testIsOrganizationMember_WithMember() {
        // Given
        String orgId = "org123";
        String userId = "user123";

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);

        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, userId))
                .thenReturn(Optional.of(orgUser));

        // When
        boolean result = organizationSecurityService.isOrganizationMember(orgId, userId);

        // Then
        assertTrue(result);
        verify(organizationUserRepository).findByOrganizationIdAndUserId(orgId, userId);
    }

    @Test
    void testIsOrganizationMember_WithoutMember() {
        // Given
        String orgId = "org123";
        String userId = "user123";

        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, userId))
                .thenReturn(Optional.empty());

        // When
        boolean result = organizationSecurityService.isOrganizationMember(orgId, userId);

        // Then
        assertFalse(result);
    }

    @Test
    void testIsOrganizationOwner_WithOwner() {
        // Given
        String orgId = "org123";
        String userId = "user123";

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.OWNER);

        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, userId))
                .thenReturn(Optional.of(orgUser));

        // When
        boolean result = organizationSecurityService.isOrganizationOwner(orgId, userId);

        // Then
        assertTrue(result);
    }

    @Test
    void testIsOrganizationOwner_WithMember() {
        // Given
        String orgId = "org123";
        String userId = "user123";

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);

        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, userId))
                .thenReturn(Optional.of(orgUser));

        // When
        boolean result = organizationSecurityService.isOrganizationOwner(orgId, userId);

        // Then
        assertFalse(result);
    }

    // ==================== ProjectSecurityService 기본 테스트 ====================

    @Test
    void testProjectSecurityService_Creation() {
        // When & Then
        assertNotNull(projectSecurityService);
    }

    @Test
    void testIsProjectMember_WithMember() {
        // Given
        String projectId = "proj123";
        String userId = "user123";

        ProjectUser projUser = new ProjectUser();
        projUser.setRoleInProject(ProjectUser.ProjectRole.DEVELOPER);

        when(projectUserRepository.findByProjectIdAndUserId(projectId, userId))
                .thenReturn(Optional.of(projUser));

        // When
        boolean result = projectSecurityService.isProjectMember(projectId, userId);

        // Then
        assertTrue(result);
        verify(projectUserRepository).findByProjectIdAndUserId(projectId, userId);
    }

    @Test
    void testIsProjectMember_WithoutMember() {
        // Given
        String projectId = "proj123";
        String userId = "user123";

        when(projectUserRepository.findByProjectIdAndUserId(projectId, userId))
                .thenReturn(Optional.empty());

        // When
        boolean result = projectSecurityService.isProjectMember(projectId, userId);

        // Then
        assertFalse(result);
    }

    // ==================== GroupSecurityService 기본 테스트 ====================

    @Test
    void testGroupSecurityService_Creation() {
        // When & Then
        assertNotNull(groupSecurityService);
    }

    @Test
    void testIsGroupMember_WithMember() {
        // Given
        String groupId = "group123";
        String userId = "user123";

        GroupMember groupMember = new GroupMember();
        groupMember.setRoleInGroup(GroupMember.GroupRole.MEMBER);

        when(groupMemberRepository.findByGroupIdAndUserId(groupId, userId))
                .thenReturn(Optional.of(groupMember));

        // When
        boolean result = groupSecurityService.isGroupMember(groupId, userId);

        // Then
        assertTrue(result);
        verify(groupMemberRepository).findByGroupIdAndUserId(groupId, userId);
    }

    @Test
    void testIsGroupMember_WithoutMember() {
        // Given
        String groupId = "group123";
        String userId = "user123";

        when(groupMemberRepository.findByGroupIdAndUserId(groupId, userId))
                .thenReturn(Optional.empty());

        // When
        boolean result = groupSecurityService.isGroupMember(groupId, userId);

        // Then
        assertFalse(result);
    }

    // ==================== 권한 레벨 테스트 ====================

    @Test
    void testOrganizationRoleHierarchy() {
        // Given
        OrganizationUser.OrganizationRole owner = OrganizationUser.OrganizationRole.OWNER;
        OrganizationUser.OrganizationRole admin = OrganizationUser.OrganizationRole.ADMIN;
        OrganizationUser.OrganizationRole member = OrganizationUser.OrganizationRole.MEMBER;

        // When & Then - 권한 계층 확인
        assertNotNull(owner);
        assertNotNull(admin);
        assertNotNull(member);

        // 각 역할이 다른지 확인
        assertNotEquals(owner, admin);
        assertNotEquals(admin, member);
        assertNotEquals(owner, member);
    }

    @Test
    void testProjectRoleHierarchy() {
        // Given
        ProjectUser.ProjectRole manager = ProjectUser.ProjectRole.PROJECT_MANAGER;
        ProjectUser.ProjectRole lead = ProjectUser.ProjectRole.LEAD_DEVELOPER;
        ProjectUser.ProjectRole developer = ProjectUser.ProjectRole.DEVELOPER;
        ProjectUser.ProjectRole tester = ProjectUser.ProjectRole.TESTER;
        ProjectUser.ProjectRole contributor = ProjectUser.ProjectRole.CONTRIBUTOR;
        ProjectUser.ProjectRole viewer = ProjectUser.ProjectRole.VIEWER;

        // When & Then - 모든 역할이 존재하는지 확인
        assertNotNull(manager);
        assertNotNull(lead);
        assertNotNull(developer);
        assertNotNull(tester);
        assertNotNull(contributor);
        assertNotNull(viewer);
    }

    @Test
    void testGroupRoleHierarchy() {
        // Given
        GroupMember.GroupRole leader = GroupMember.GroupRole.LEADER;
        GroupMember.GroupRole coLeader = GroupMember.GroupRole.CO_LEADER;
        GroupMember.GroupRole member = GroupMember.GroupRole.MEMBER;

        // When & Then - 권한 계층 확인
        assertNotNull(leader);
        assertNotNull(coLeader);
        assertNotNull(member);

        // 각 역할이 다른지 확인
        assertNotEquals(leader, coLeader);
        assertNotEquals(coLeader, member);
        assertNotEquals(leader, member);
    }
}