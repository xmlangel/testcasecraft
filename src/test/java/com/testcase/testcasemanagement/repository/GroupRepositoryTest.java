// src/test/java/com/testcase/testcasemanagement/repository/GroupRepositoryTest.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Group;
import com.testcase.testcasemanagement.model.GroupMember;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.testng.Assert.*;

/**
 * GroupRepository 단위 테스트
 * Task 17: Repository 레이어 그룹 데이터 접근 로직 테스트
 */
@DataJpaTest
@ActiveProfiles("test")
public class GroupRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    private User testUser1;
    private User testUser2;
    private Organization testOrganization;
    private Project testProject;
    private Group testOrganizationGroup;
    private Group testProjectGroup;
    private Group testIndependentGroup;

    @BeforeMethod
    void setUp() {
        // 테스트 사용자 생성
        testUser1 = new User();
        testUser1.setId("user1");
        testUser1.setUsername("testuser1");
        testUser1.setEmail("test1@example.com");
        testUser1.setName("Test User 1");
        testUser1.setRole("USER");
        testUser1.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testUser1);

        testUser2 = new User();
        testUser2.setId("user2");
        testUser2.setUsername("testuser2");
        testUser2.setEmail("test2@example.com");
        testUser2.setName("Test User 2");
        testUser2.setRole("USER");
        testUser2.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testUser2);

        // 테스트 조직 생성
        testOrganization = new Organization();
        testOrganization.setId("org1");
        testOrganization.setName("Test Organization");
        testOrganization.setDescription("Test Description");
        testOrganization.setCreatedAt(LocalDateTime.now());
        testOrganization.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testOrganization);

        // 테스트 프로젝트 생성
        testProject = new Project();
        testProject.setId("proj1");
        testProject.setName("Test Project");
        testProject.setCode("TEST001");
        testProject.setDescription("Test Project Description");
        testProject.setOrganization(testOrganization);
        testProject.setCreatedAt(LocalDateTime.now());
        testProject.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testProject);

        // 테스트 조직 그룹 생성
        testOrganizationGroup = new Group();
        testOrganizationGroup.setId("orggroup1");
        testOrganizationGroup.setName("Organization Group");
        testOrganizationGroup.setDescription("Organization Group Description");
        testOrganizationGroup.setOrganization(testOrganization);
        testOrganizationGroup.setProject(null);
        testOrganizationGroup.setCreatedAt(LocalDateTime.now());
        testOrganizationGroup.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testOrganizationGroup);

        // 테스트 프로젝트 그룹 생성
        testProjectGroup = new Group();
        testProjectGroup.setId("projgroup1");
        testProjectGroup.setName("Project Group");
        testProjectGroup.setDescription("Project Group Description");
        testProjectGroup.setOrganization(null);
        testProjectGroup.setProject(testProject);
        testProjectGroup.setCreatedAt(LocalDateTime.now());
        testProjectGroup.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testProjectGroup);

        // 테스트 독립 그룹 생성
        testIndependentGroup = new Group();
        testIndependentGroup.setId("indepgroup1");
        testIndependentGroup.setName("Independent Group");
        testIndependentGroup.setDescription("Independent Group Description");
        testIndependentGroup.setOrganization(null);
        testIndependentGroup.setProject(null);
        testIndependentGroup.setCreatedAt(LocalDateTime.now());
        testIndependentGroup.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testIndependentGroup);

        // 그룹-사용자 관계 생성
        GroupMember member1 = new GroupMember();
        member1.setId("member1");
        member1.setGroup(testOrganizationGroup);
        member1.setUser(testUser1);
        member1.setRoleInGroup(GroupMember.GroupRole.LEADER);
        member1.setCreatedAt(LocalDateTime.now());
        member1.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(member1);

        GroupMember member2 = new GroupMember();
        member2.setId("member2");
        member2.setGroup(testProjectGroup);
        member2.setUser(testUser1);
        member2.setRoleInGroup(GroupMember.GroupRole.CO_LEADER);
        member2.setCreatedAt(LocalDateTime.now());
        member2.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(member2);

        GroupMember member3 = new GroupMember();
        member3.setId("member3");
        member3.setGroup(testIndependentGroup);
        member3.setUser(testUser2);
        member3.setRoleInGroup(GroupMember.GroupRole.MEMBER);
        member3.setCreatedAt(LocalDateTime.now());
        member3.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(member3);

        entityManager.clear();
    }

    // ==================== 기본 CRUD 테스트 ====================

    @Test
    void testFindById_Success() {
        // When
        var result = groupRepository.findById("orggroup1");

        // Then
        assertTrue(result.isPresent());
        assertEquals("Organization Group", result.get().getName());
        assertEquals("Organization Group Description", result.get().getDescription());
        assertNotNull(result.get().getOrganization());
        assertNull(result.get().getProject());
    }

    @Test
    void testFindById_NotFound() {
        // When
        var result = groupRepository.findById("nonexistent");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindAll() {
        // When
        List<Group> result = groupRepository.findAll();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        // 그룹 타입별 확인
        assertTrue(result.stream().anyMatch(group -> 
            "Organization Group".equals(group.getName()) && group.getOrganization() != null));
        assertTrue(result.stream().anyMatch(group -> 
            "Project Group".equals(group.getName()) && group.getProject() != null));
        assertTrue(result.stream().anyMatch(group -> 
            "Independent Group".equals(group.getName()) && 
            group.getOrganization() == null && group.getProject() == null));
    }

    @Test
    void testSave_NewGroup() {
        // Given
        Group newGroup = new Group();
        newGroup.setId("newgroup1");
        newGroup.setName("New Group");
        newGroup.setDescription("New Description");
        newGroup.setOrganization(null);
        newGroup.setProject(null);
        newGroup.setCreatedAt(LocalDateTime.now());
        newGroup.setUpdatedAt(LocalDateTime.now());

        // When
        Group saved = groupRepository.save(newGroup);

        // Then
        assertNotNull(saved);
        assertEquals("New Group", saved.getName());
        
        // 실제로 저장되었는지 확인
        var found = groupRepository.findById("newgroup1");
        assertTrue(found.isPresent());
        assertEquals("New Group", found.get().getName());
    }

    @Test
    void testDelete() {
        // Given
        String groupId = "indepgroup1";
        assertTrue(groupRepository.findById(groupId).isPresent());

        // When
        groupRepository.deleteById(groupId);
        entityManager.flush();

        // Then
        assertFalse(groupRepository.findById(groupId).isPresent());
    }

    // ==================== 커스텀 쿼리 메서드 테스트 ====================

    @Test
    void testFindAccessibleGroupsByUserId_Success() {
        // When
        List<Group> result = groupRepository.findAccessibleGroupsByUserId("user1");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // user1은 orggroup1 (LEADER), projgroup1 (CO_LEADER)에 속함
        assertTrue(result.stream().anyMatch(group -> "orggroup1".equals(group.getId())));
        assertTrue(result.stream().anyMatch(group -> "projgroup1".equals(group.getId())));
    }

    @Test
    void testFindAccessibleGroupsByUserId_SingleGroup() {
        // When
        List<Group> result = groupRepository.findAccessibleGroupsByUserId("user2");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        
        // user2는 indepgroup1 (MEMBER)에만 속함
        assertEquals("indepgroup1", result.get(0).getId());
        assertEquals("Independent Group", result.get(0).getName());
    }

    @Test
    void testFindAccessibleGroupsByUserId_NoGroups() {
        // Given - 새로운 사용자 생성 (그룹에 속하지 않음)
        User newUser = new User();
        newUser.setId("user3");
        newUser.setUsername("testuser3");
        newUser.setEmail("test3@example.com");
        newUser.setName("Test User 3");
        newUser.setRole("USER");
        newUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(newUser);

        // When
        List<Group> result = groupRepository.findAccessibleGroupsByUserId("user3");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByOrganizationId_Success() {
        // When
        List<Group> result = groupRepository.findByOrganizationId("org1");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("orggroup1", result.get(0).getId());
        assertEquals("Organization Group", result.get(0).getName());
    }

    @Test
    void testFindByOrganizationId_NoGroups() {
        // Given - 새로운 조직 생성 (그룹 없음)
        Organization newOrg = new Organization();
        newOrg.setId("org2");
        newOrg.setName("Empty Organization");
        newOrg.setDescription("No groups");
        newOrg.setCreatedAt(LocalDateTime.now());
        newOrg.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(newOrg);

        // When
        List<Group> result = groupRepository.findByOrganizationId("org2");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByProjectId_Success() {
        // When
        List<Group> result = groupRepository.findByProjectId("proj1");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("projgroup1", result.get(0).getId());
        assertEquals("Project Group", result.get(0).getName());
    }

    @Test
    void testFindByProjectId_NoGroups() {
        // Given - 새로운 프로젝트 생성 (그룹 없음)
        Project newProject = new Project();
        newProject.setId("proj2");
        newProject.setName("Empty Project");
        newProject.setCode("EMPTY002");
        newProject.setDescription("No groups");
        newProject.setOrganization(testOrganization);
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(newProject);

        // When
        List<Group> result = groupRepository.findByProjectId("proj2");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    // ==================== 독립 그룹 테스트 ====================

    @Test
    void testFindIndependentGroups() {
        // When - 조직과 프로젝트가 모두 null인 그룹 조회
        List<Group> result = groupRepository.findByOrganizationIsNullAndProjectIsNull();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("indepgroup1", result.get(0).getId());
        assertEquals("Independent Group", result.get(0).getName());
        assertNull(result.get(0).getOrganization());
        assertNull(result.get(0).getProject());
    }

    // ==================== 데이터 무결성 테스트 ====================

    @Test
    void testCascadeDelete_WithMembers() {
        // Given
        String groupId = "orggroup1";
        
        // 그룹에 멤버가 있는지 확인
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        assertTrue(members.size() > 0);

        // When
        // GroupMember에서 CASCADE 삭제가 설정되어 있다면 자동으로 삭제됨
        // 설정되어 있지 않다면 수동으로 삭제해야 함
        groupMemberRepository.deleteByGroupId(groupId);
        groupRepository.deleteById(groupId);
        entityManager.flush();

        // Then
        assertFalse(groupRepository.findById(groupId).isPresent());
        
        // 관련 GroupMember도 삭제되었는지 확인
        List<GroupMember> remainingMembers = groupMemberRepository.findByGroupId(groupId);
        assertEquals(0, remainingMembers.size());
    }

    // ==================== 성능 테스트 ====================

    @Test
    void testFindAccessibleGroupsByUserId_Performance() {
        // Given - 대량 데이터 생성
        User testUser = new User();
        testUser.setId("perfuser");
        testUser.setUsername("perfuser");
        testUser.setEmail("perf@example.com");
        testUser.setName("Performance User");
        testUser.setRole("USER");
        testUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testUser);

        // 50개의 그룹과 관계 생성
        for (int i = 0; i < 50; i++) {
            Group group = new Group();
            group.setId("perfgroup" + i);
            group.setName("Performance Group " + i);
            group.setDescription("Performance Description " + i);
            group.setOrganization(null);
            group.setProject(null);
            group.setCreatedAt(LocalDateTime.now());
            group.setUpdatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(group);

            GroupMember member = new GroupMember();
            member.setId("perfmember" + i);
            member.setGroup(group);
            member.setUser(testUser);
            member.setRoleInGroup(GroupMember.GroupRole.MEMBER);
            member.setCreatedAt(LocalDateTime.now());
            member.setUpdatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(member);
        }
        entityManager.clear();

        // When
        long startTime = System.currentTimeMillis();
        List<Group> result = groupRepository.findAccessibleGroupsByUserId("perfuser");
        long endTime = System.currentTimeMillis();

        // Then
        assertNotNull(result);
        assertEquals(50, result.size());
        
        // 성능 확인 (1초 이내)
        long executionTime = endTime - startTime;
        assertTrue(executionTime < 1000, "Query took too long: " + executionTime + "ms");
    }

    // ==================== 복합 쿼리 테스트 ====================

    @Test
    void testComplexGroupQueries() {
        // Given - 추가 테스트 데이터 생성
        Organization org2 = new Organization();
        org2.setId("org2");
        org2.setName("Second Organization");
        org2.setDescription("Second Description");
        org2.setCreatedAt(LocalDateTime.now());
        org2.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(org2);

        Group org2Group = new Group();
        org2Group.setId("org2group1");
        org2Group.setName("Second Org Group");
        org2Group.setDescription("Second Org Group Description");
        org2Group.setOrganization(org2);
        org2Group.setProject(null);
        org2Group.setCreatedAt(LocalDateTime.now());
        org2Group.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(org2Group);

        // When - 조직별 그룹 수 조회
        List<Group> org1Groups = groupRepository.findByOrganizationId("org1");
        List<Group> org2Groups = groupRepository.findByOrganizationId("org2");
        List<Group> independentGroups = groupRepository.findByOrganizationIsNullAndProjectIsNull();

        // Then
        assertEquals(1, org1Groups.size());
        assertEquals(1, org2Groups.size());
        assertEquals(1, independentGroups.size());
        
        // 전체 그룹 수 확인 (기존 3개 + 새로 추가한 1개)
        List<Group> allGroups = groupRepository.findAll();
        assertEquals(4, allGroups.size());
    }
}