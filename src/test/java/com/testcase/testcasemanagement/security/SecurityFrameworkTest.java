package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 보안 프레임워크 통합 테스트
 * 권한 없는 사용자의 접근 차단을 검증합니다.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SecurityFrameworkTest {

    @Autowired
    private OrganizationSecurityService organizationSecurityService;
    
    @Autowired
    private ProjectSecurityService projectSecurityService;
    
    @Autowired
    private GroupSecurityService groupSecurityService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private OrganizationUserRepository organizationUserRepository;
    
    @Autowired
    private ProjectUserRepository projectUserRepository;
    
    @Autowired
    private GroupMemberRepository groupMemberRepository;

    private User testUser1;
    private User testUser2;
    private User adminUser;
    private Organization testOrganization;
    private Project testProject;
    private Group testGroup;

    @BeforeEach
    public void setUp() {
        // 테스트 사용자 생성
        testUser1 = new User();
        testUser1.setUsername("testuser1");
        testUser1.setEmail("testuser1@example.com");
        testUser1.setPassword("password");
        testUser1.setRole("USER");
        testUser1 = userRepository.save(testUser1);

        testUser2 = new User();
        testUser2.setUsername("testuser2");
        testUser2.setEmail("testuser2@example.com");
        testUser2.setPassword("password");
        testUser2.setRole("USER");
        testUser2 = userRepository.save(testUser2);

        adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword("password");
        adminUser.setRole("ADMIN");
        adminUser = userRepository.save(adminUser);

        // 테스트 조직 생성
        testOrganization = new Organization();
        testOrganization.setName("Test Organization");
        testOrganization.setDescription("Test Description");
        testOrganization = organizationRepository.save(testOrganization);

        // testUser1을 조직 멤버로 추가
        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setOrganization(testOrganization);
        orgUser.setUser(testUser1);
        orgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);
        organizationUserRepository.save(orgUser);

        // 테스트 프로젝트 생성 (조직에 속함)
        testProject = new Project();
        testProject.setName("Test Project");
        testProject.setDescription("Test Project Description");
        testProject.setOrganization(testOrganization);
        testProject = projectRepository.save(testProject);

        // testUser1을 프로젝트 멤버로 추가
        ProjectUser projUser = new ProjectUser();
        projUser.setProject(testProject);
        projUser.setUser(testUser1);
        projUser.setRoleInProject(ProjectUser.ProjectRole.DEVELOPER);
        projectUserRepository.save(projUser);

        // 테스트 그룹 생성 (프로젝트에 속함)
        testGroup = new Group();
        testGroup.setName("Test Group");
        testGroup.setDescription("Test Group Description");
        testGroup.setProject(testProject);
        testGroup = groupRepository.save(testGroup);

        // testUser1을 그룹 멤버로 추가
        GroupMember groupMember = new GroupMember();
        groupMember.setGroup(testGroup);
        groupMember.setUser(testUser1);
        groupMember.setRoleInGroup(GroupMember.GroupRole.MEMBER);
        groupMemberRepository.save(groupMember);
    }

    @Test
    public void testOrganizationAccessControl() {
        // testUser1은 조직 멤버이므로 접근 가능
        assertTrue(organizationSecurityService.canAccessOrganization(testOrganization.getId(), testUser1.getUsername()));
        assertTrue(organizationSecurityService.isOrganizationMember(testOrganization.getId(), testUser1.getUsername()));

        // testUser2는 조직 멤버가 아니므로 접근 불가
        assertFalse(organizationSecurityService.canAccessOrganization(testOrganization.getId(), testUser2.getUsername()));
        assertFalse(organizationSecurityService.isOrganizationMember(testOrganization.getId(), testUser2.getUsername()));

        // 관리자는 모든 조직에 접근 가능
        assertTrue(organizationSecurityService.canAccessOrganization(testOrganization.getId(), adminUser.getUsername()));

        // testUser1은 일반 멤버이므로 조직 관리 불가
        assertFalse(organizationSecurityService.canManageOrganization(testOrganization.getId(), testUser1.getUsername()));

        // 관리자는 모든 조직을 관리 가능
        assertTrue(organizationSecurityService.canManageOrganization(testOrganization.getId(), adminUser.getUsername()));
    }

    @Test
    public void testProjectAccessControl() {
        // testUser1은 프로젝트 멤버이므로 접근 가능
        assertTrue(projectSecurityService.canAccessProject(testProject.getId(), testUser1.getUsername()));
        assertTrue(projectSecurityService.isProjectMember(testProject.getId(), testUser1.getUsername()));

        // testUser2는 프로젝트 멤버가 아니지만 조직 멤버도 아니므로 접근 불가
        assertFalse(projectSecurityService.canAccessProject(testProject.getId(), testUser2.getUsername()));
        assertFalse(projectSecurityService.isProjectMember(testProject.getId(), testUser2.getUsername()));

        // 관리자는 모든 프로젝트에 접근 가능
        assertTrue(projectSecurityService.canAccessProject(testProject.getId(), adminUser.getUsername()));

        // testUser1은 개발자 역할이므로 프로젝트 관리 불가
        assertFalse(projectSecurityService.canManageProject(testProject.getId(), testUser1.getUsername()));
        assertFalse(projectSecurityService.hasManagementRole(testProject.getId(), testUser1.getUsername()));

        // 관리자는 모든 프로젝트를 관리 가능
        assertTrue(projectSecurityService.canManageProject(testProject.getId(), adminUser.getUsername()));
    }

    @Test
    public void testGroupAccessControl() {
        // testUser1은 그룹 멤버이므로 접근 가능
        assertTrue(groupSecurityService.canAccessGroup(testGroup.getId(), testUser1.getUsername()));
        assertTrue(groupSecurityService.isGroupMember(testGroup.getId(), testUser1.getUsername()));

        // testUser2는 그룹, 프로젝트, 조직 멤버가 아니므로 접근 불가
        assertFalse(groupSecurityService.canAccessGroup(testGroup.getId(), testUser2.getUsername()));
        assertFalse(groupSecurityService.isGroupMember(testGroup.getId(), testUser2.getUsername()));

        // 관리자는 모든 그룹에 접근 가능
        assertTrue(groupSecurityService.canAccessGroup(testGroup.getId(), adminUser.getUsername()));

        // testUser1은 일반 멤버이므로 그룹 관리 불가
        assertFalse(groupSecurityService.canManageGroup(testGroup.getId(), testUser1.getUsername()));
        assertFalse(groupSecurityService.hasLeadershipRole(testGroup.getId(), testUser1.getUsername()));

        // 관리자는 모든 그룹을 관리 가능
        assertTrue(groupSecurityService.canManageGroup(testGroup.getId(), adminUser.getUsername()));
    }

    @Test
    public void testOrganizationInheritanceForProjects() {
        // testUser2를 조직 멤버로 추가
        OrganizationUser orgUser2 = new OrganizationUser();
        orgUser2.setOrganization(testOrganization);
        orgUser2.setUser(testUser2);
        orgUser2.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);
        organizationUserRepository.save(orgUser2);

        // 조직 멤버는 조직 프로젝트에 접근 가능해야 함
        assertTrue(projectSecurityService.canAccessProject(testProject.getId(), testUser2.getUsername()));
    }

    @Test
    public void testProjectInheritanceForGroups() {
        // testUser2를 프로젝트 멤버로 추가 (조직 멤버가 아님)
        ProjectUser projUser2 = new ProjectUser();
        projUser2.setProject(testProject);
        projUser2.setUser(testUser2);
        projUser2.setRoleInProject(ProjectUser.ProjectRole.TESTER);
        projectUserRepository.save(projUser2);

        // 프로젝트 멤버는 프로젝트 그룹에 접근 가능해야 함
        assertTrue(groupSecurityService.canAccessGroup(testGroup.getId(), testUser2.getUsername()));
    }

    @Test
    public void testRoleBasedPermissions() {
        // testUser1을 조직 관리자로 업그레이드
        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(testOrganization.getId(), testUser1.getId())
                .orElseThrow();
        orgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.ADMIN);
        organizationUserRepository.save(orgUser);

        // 조직 관리자는 조직을 관리할 수 있어야 함
        assertTrue(organizationSecurityService.canManageOrganization(testOrganization.getId(), testUser1.getUsername()));
        assertTrue(organizationSecurityService.hasOrganizationAdminRole(testOrganization.getId(), testUser1.getUsername()));

        // 조직 관리자는 조직 프로젝트도 관리할 수 있어야 함
        assertTrue(projectSecurityService.canManageProject(testProject.getId(), testUser1.getUsername()));

        // 조직 관리자는 프로젝트 그룹도 관리할 수 있어야 함
        assertTrue(groupSecurityService.canManageGroup(testGroup.getId(), testUser1.getUsername()));
    }

    @Test
    public void testMemberRemovalPermissions() {
        // testUser1은 자기 자신을 제거할 수 있음
        assertTrue(organizationSecurityService.canRemoveMember(
                testOrganization.getId(), testUser1.getId(), testUser1.getUsername()));
        assertTrue(projectSecurityService.canRemoveMember(
                testProject.getId(), testUser1.getId(), testUser1.getUsername()));
        assertTrue(groupSecurityService.canRemoveMember(
                testGroup.getId(), testUser1.getId(), testUser1.getUsername()));

        // testUser1은 다른 사용자를 제거할 수 없음 (관리자가 아님)
        assertFalse(organizationSecurityService.canRemoveMember(
                testOrganization.getId(), testUser2.getId(), testUser1.getUsername()));
        assertFalse(projectSecurityService.canRemoveMember(
                testProject.getId(), testUser2.getId(), testUser1.getUsername()));
        assertFalse(groupSecurityService.canRemoveMember(
                testGroup.getId(), testUser2.getId(), testUser1.getUsername()));

        // 관리자는 모든 멤버를 제거할 수 있음
        assertTrue(organizationSecurityService.canRemoveMember(
                testOrganization.getId(), testUser1.getId(), adminUser.getUsername()));
        assertTrue(projectSecurityService.canRemoveMember(
                testProject.getId(), testUser1.getId(), adminUser.getUsername()));
        assertTrue(groupSecurityService.canRemoveMember(
                testGroup.getId(), testUser1.getId(), adminUser.getUsername()));
    }

    @Test
    public void testResourceCreationPermissions() {
        // 일반 사용자는 독립 프로젝트를 생성할 수 있음
        assertTrue(projectSecurityService.canCreateProject(null, testUser1.getUsername()));

        // 일반 사용자는 조직 프로젝트를 생성할 수 없음
        assertFalse(projectSecurityService.canCreateProject(testOrganization.getId(), testUser1.getUsername()));

        // 일반 사용자는 독립 그룹을 생성할 수 있음
        assertTrue(groupSecurityService.canCreateGroup(null, null, testUser1.getUsername()));

        // 일반 사용자는 조직 그룹을 생성할 수 없음
        assertFalse(groupSecurityService.canCreateGroup(testOrganization.getId(), null, testUser1.getUsername()));

        // 일반 사용자는 프로젝트 그룹을 생성할 수 없음 (프로젝트 관리자가 아님)
        assertFalse(groupSecurityService.canCreateGroup(null, testProject.getId(), testUser1.getUsername()));
    }
}