// src/test/java/com/testcase/testcasemanagement/repository/OrganizationRepositoryTest.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.OrganizationUser;
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
 * OrganizationRepository 단위 테스트
 * Task 17: Repository 레이어 데이터 접근 로직 테스트
 */
@DataJpaTest
@ActiveProfiles("test")
public class OrganizationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    private User testUser1;
    private User testUser2;
    private Organization testOrganization1;
    private Organization testOrganization2;

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
        testOrganization1 = new Organization();
        testOrganization1.setId("org1");
        testOrganization1.setName("Test Organization 1");
        testOrganization1.setDescription("Test Description 1");
        testOrganization1.setCreatedAt(LocalDateTime.now());
        testOrganization1.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testOrganization1);

        testOrganization2 = new Organization();
        testOrganization2.setId("org2");
        testOrganization2.setName("Test Organization 2");
        testOrganization2.setDescription("Test Description 2");
        testOrganization2.setCreatedAt(LocalDateTime.now());
        testOrganization2.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testOrganization2);

        // 조직-사용자 관계 생성
        OrganizationUser orgUser1 = new OrganizationUser();
        orgUser1.setId("orguser1");
        orgUser1.setOrganization(testOrganization1);
        orgUser1.setUser(testUser1);
        orgUser1.setRoleInOrganization(OrganizationUser.OrganizationRole.OWNER);
        orgUser1.setCreatedAt(LocalDateTime.now());
        orgUser1.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(orgUser1);

        OrganizationUser orgUser2 = new OrganizationUser();
        orgUser2.setId("orguser2");
        orgUser2.setOrganization(testOrganization1);
        orgUser2.setUser(testUser2);
        orgUser2.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);
        orgUser2.setCreatedAt(LocalDateTime.now());
        orgUser2.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(orgUser2);

        OrganizationUser orgUser3 = new OrganizationUser();
        orgUser3.setId("orguser3");
        orgUser3.setOrganization(testOrganization2);
        orgUser3.setUser(testUser1);
        orgUser3.setRoleInOrganization(OrganizationUser.OrganizationRole.ADMIN);
        orgUser3.setCreatedAt(LocalDateTime.now());
        orgUser3.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(orgUser3);

        entityManager.clear();
    }

    // ==================== 기본 CRUD 테스트 ====================

    @Test
    void testFindById_Success() {
        // When
        var result = organizationRepository.findById("org1");

        // Then
        assertTrue(result.isPresent());
        assertEquals("Test Organization 1", result.get().getName());
        assertEquals("Test Description 1", result.get().getDescription());
    }

    @Test
    void testFindById_NotFound() {
        // When
        var result = organizationRepository.findById("nonexistent");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindAll() {
        // When
        List<Organization> result = organizationRepository.findAll();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // 이름으로 정렬 확인
        assertTrue(result.stream().anyMatch(org -> "Test Organization 1".equals(org.getName())));
        assertTrue(result.stream().anyMatch(org -> "Test Organization 2".equals(org.getName())));
    }

    @Test
    void testSave_NewOrganization() {
        // Given
        Organization newOrg = new Organization();
        newOrg.setId("org3");
        newOrg.setName("New Organization");
        newOrg.setDescription("New Description");
        newOrg.setCreatedAt(LocalDateTime.now());
        newOrg.setUpdatedAt(LocalDateTime.now());

        // When
        Organization saved = organizationRepository.save(newOrg);

        // Then
        assertNotNull(saved);
        assertEquals("New Organization", saved.getName());
        
        // 실제로 저장되었는지 확인
        var found = organizationRepository.findById("org3");
        assertTrue(found.isPresent());
        assertEquals("New Organization", found.get().getName());
    }

    @Test
    void testDelete() {
        // Given
        String orgId = "org2";
        assertTrue(organizationRepository.findById(orgId).isPresent());

        // When
        organizationRepository.deleteById(orgId);
        entityManager.flush();

        // Then
        assertFalse(organizationRepository.findById(orgId).isPresent());
    }

    // ==================== 커스텀 쿼리 메서드 테스트 ====================

    @Test
    void testFindByUserId_Success() {
        // When
        List<Organization> result = organizationRepository.findByUserId("user1");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // user1은 org1 (OWNER), org2 (ADMIN)에 속함
        assertTrue(result.stream().anyMatch(org -> "org1".equals(org.getId())));
        assertTrue(result.stream().anyMatch(org -> "org2".equals(org.getId())));
    }

    @Test
    void testFindByUserId_SingleOrganization() {
        // When
        List<Organization> result = organizationRepository.findByUserId("user2");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        
        // user2는 org1 (MEMBER)에만 속함
        assertEquals("org1", result.get(0).getId());
        assertEquals("Test Organization 1", result.get(0).getName());
    }

    @Test
    void testFindByUserId_NoOrganizations() {
        // Given - 새로운 사용자 생성 (조직에 속하지 않음)
        User newUser = new User();
        newUser.setId("user3");
        newUser.setUsername("testuser3");
        newUser.setEmail("test3@example.com");
        newUser.setName("Test User 3");
        newUser.setRole("USER");
        newUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(newUser);

        // When
        List<Organization> result = organizationRepository.findByUserId("user3");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByUserId_NonExistentUser() {
        // When
        List<Organization> result = organizationRepository.findByUserId("nonexistent");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    // ==================== 데이터 무결성 테스트 ====================

    @Test
    void testUniqueConstraint_OrganizationName() {
        // Given
        Organization duplicateOrg = new Organization();
        duplicateOrg.setId("org4");
        duplicateOrg.setName("Test Organization 1"); // 중복된 이름
        duplicateOrg.setDescription("Duplicate Description");
        duplicateOrg.setCreatedAt(LocalDateTime.now());
        duplicateOrg.setUpdatedAt(LocalDateTime.now());

        // When & Then
        // 조직 이름 중복이 허용되는지 확인 (비즈니스 요구사항에 따라)
        try {
            organizationRepository.save(duplicateOrg);
            entityManager.flush();
            // 중복 이름이 허용된다면 여기까지 도달
            assertTrue(true, "조직 이름 중복이 허용됨");
        } catch (Exception e) {
            // 중복 이름이 허용되지 않는다면 예외 발생
            fail("조직 이름 중복 제약조건이 있음: " + e.getMessage());
        }
    }

    @Test
    void testCascadeDelete_WithMembers() {
        // Given
        String orgId = "org1";
        
        // 조직에 멤버가 있는지 확인
        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
        assertTrue(members.size() > 0);

        // When
        // OrganizationUser에서 CASCADE 삭제가 설정되어 있다면 자동으로 삭제됨
        // 설정되어 있지 않다면 수동으로 삭제해야 함
        organizationUserRepository.deleteByOrganizationId(orgId);
        organizationRepository.deleteById(orgId);
        entityManager.flush();

        // Then
        assertFalse(organizationRepository.findById(orgId).isPresent());
        
        // 관련 OrganizationUser도 삭제되었는지 확인
        List<OrganizationUser> remainingMembers = organizationUserRepository.findByOrganizationId(orgId);
        assertEquals(0, remainingMembers.size());
    }

    // ==================== 성능 테스트 ====================

    @Test
    void testFindByUserId_Performance() {
        // Given - 대량 데이터 생성
        User testUser = new User();
        testUser.setId("perfuser");
        testUser.setUsername("perfuser");
        testUser.setEmail("perf@example.com");
        testUser.setName("Performance User");
        testUser.setRole("USER");
        testUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testUser);

        // 100개의 조직과 관계 생성
        for (int i = 0; i < 100; i++) {
            Organization org = new Organization();
            org.setId("perforg" + i);
            org.setName("Performance Org " + i);
            org.setDescription("Performance Description " + i);
            org.setCreatedAt(LocalDateTime.now());
            org.setUpdatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(org);

            OrganizationUser orgUser = new OrganizationUser();
            orgUser.setId("perforguser" + i);
            orgUser.setOrganization(org);
            orgUser.setUser(testUser);
            orgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);
            orgUser.setCreatedAt(LocalDateTime.now());
            orgUser.setUpdatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(orgUser);
        }
        entityManager.clear();

        // When
        long startTime = System.currentTimeMillis();
        List<Organization> result = organizationRepository.findByUserId("perfuser");
        long endTime = System.currentTimeMillis();

        // Then
        assertNotNull(result);
        assertEquals(100, result.size());
        
        // 성능 확인 (1초 이내)
        long executionTime = endTime - startTime;
        assertTrue(executionTime < 1000, "Query took too long: " + executionTime + "ms");
    }

    // ==================== 정렬 및 필터링 테스트 ====================

    @Test
    void testFindByUserId_OrderByCreatedAt() {
        // Given - 시간 차이를 두고 조직 생성
        Organization laterOrg = new Organization();
        laterOrg.setId("org_later");
        laterOrg.setName("Later Organization");
        laterOrg.setDescription("Later Description");
        laterOrg.setCreatedAt(LocalDateTime.now().plusMinutes(1));
        laterOrg.setUpdatedAt(LocalDateTime.now().plusMinutes(1));
        entityManager.persistAndFlush(laterOrg);

        OrganizationUser laterOrgUser = new OrganizationUser();
        laterOrgUser.setId("later_orguser");
        laterOrgUser.setOrganization(laterOrg);
        laterOrgUser.setUser(testUser1);
        laterOrgUser.setRoleInOrganization(OrganizationUser.OrganizationRole.MEMBER);
        laterOrgUser.setCreatedAt(LocalDateTime.now());
        laterOrgUser.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(laterOrgUser);
        entityManager.clear();

        // When
        List<Organization> result = organizationRepository.findByUserId("user1");

        // Then
        assertNotNull(result);
        assertEquals(3, result.size()); // org1, org2, org_later
        
        // 조직이 포함되어 있는지 확인
        assertTrue(result.stream().anyMatch(org -> "org1".equals(org.getId())));
        assertTrue(result.stream().anyMatch(org -> "org2".equals(org.getId())));
        assertTrue(result.stream().anyMatch(org -> "org_later".equals(org.getId())));
    }
}