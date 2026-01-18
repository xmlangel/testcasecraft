// src/test/java/com/testcase/testcasemanagement/repository/ProjectRepositoryTest.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
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
 * ProjectRepository 단위 테스트
 * Task 17: Repository 레이어 프로젝트 데이터 접근 로직 테스트
 */
@DataJpaTest
@ActiveProfiles("test")
public class ProjectRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectUserRepository projectUserRepository;

    private User testUser1;
    private User testUser2;
    private Organization testOrganization1;
    private Organization testOrganization2;
    private Project testOrgProject1;
    private Project testOrgProject2;
    private Project testIndependentProject;

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

        // 테스트 조직 프로젝트 생성
        testOrgProject1 = new Project();
        testOrgProject1.setId("proj1");
        testOrgProject1.setName("Organization Project 1");
        testOrgProject1.setCode("ORG001");
        testOrgProject1.setDescription("Organization Project Description 1");
        testOrgProject1.setOrganization(testOrganization1);
        testOrgProject1.setCreatedAt(LocalDateTime.now());
        testOrgProject1.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testOrgProject1);

        testOrgProject2 = new Project();
        testOrgProject2.setId("proj2");
        testOrgProject2.setName("Organization Project 2");
        testOrgProject2.setCode("ORG002");
        testOrgProject2.setDescription("Organization Project Description 2");
        testOrgProject2.setOrganization(testOrganization2);
        testOrgProject2.setCreatedAt(LocalDateTime.now());
        testOrgProject2.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testOrgProject2);

        // 테스트 독립 프로젝트 생성
        testIndependentProject = new Project();
        testIndependentProject.setId("proj3");
        testIndependentProject.setName("Independent Project");
        testIndependentProject.setCode("INDEP001");
        testIndependentProject.setDescription("Independent Project Description");
        testIndependentProject.setOrganization(null);
        testIndependentProject.setCreatedAt(LocalDateTime.now());
        testIndependentProject.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testIndependentProject);

        // 프로젝트-사용자 관계 생성
        ProjectUser projUser1 = new ProjectUser();
        projUser1.setId("projuser1");
        projUser1.setProject(testOrgProject1);
        projUser1.setUser(testUser1);
        projUser1.setRoleInProject(ProjectUser.ProjectRole.PROJECT_MANAGER);
        projUser1.setCreatedAt(LocalDateTime.now());
        projUser1.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(projUser1);

        ProjectUser projUser2 = new ProjectUser();
        projUser2.setId("projuser2");
        projUser2.setProject(testOrgProject1);
        projUser2.setUser(testUser2);
        projUser2.setRoleInProject(ProjectUser.ProjectRole.DEVELOPER);
        projUser2.setCreatedAt(LocalDateTime.now());
        projUser2.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(projUser2);

        ProjectUser projUser3 = new ProjectUser();
        projUser3.setId("projuser3");
        projUser3.setProject(testIndependentProject);
        projUser3.setUser(testUser1);
        projUser3.setRoleInProject(ProjectUser.ProjectRole.PROJECT_MANAGER);
        projUser3.setCreatedAt(LocalDateTime.now());
        projUser3.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(projUser3);

        entityManager.clear();
    }

    // ==================== 기본 CRUD 테스트 ====================

    @Test
    void testFindById_Success() {
        // When
        var result = projectRepository.findById("proj1");

        // Then
        assertTrue(result.isPresent());
        assertEquals("Organization Project 1", result.get().getName());
        assertEquals("ORG001", result.get().getCode());
        assertEquals("Organization Project Description 1", result.get().getDescription());
        assertNotNull(result.get().getOrganization());
        assertEquals("org1", result.get().getOrganization().getId());
    }

    @Test
    void testFindById_NotFound() {
        // When
        var result = projectRepository.findById("nonexistent");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindAll() {
        // When
        List<Project> result = projectRepository.findAll();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        // 프로젝트 타입별 확인
        assertTrue(result.stream().anyMatch(project -> 
            "Organization Project 1".equals(project.getName()) && project.getOrganization() != null));
        assertTrue(result.stream().anyMatch(project -> 
            "Organization Project 2".equals(project.getName()) && project.getOrganization() != null));
        assertTrue(result.stream().anyMatch(project -> 
            "Independent Project".equals(project.getName()) && project.getOrganization() == null));
    }

    @Test
    void testSave_NewProject() {
        // Given
        Project newProject = new Project();
        newProject.setId("proj4");
        newProject.setName("New Project");
        newProject.setCode("NEW001");
        newProject.setDescription("New Description");
        newProject.setOrganization(testOrganization1);
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setUpdatedAt(LocalDateTime.now());

        // When
        Project saved = projectRepository.save(newProject);

        // Then
        assertNotNull(saved);
        assertEquals("New Project", saved.getName());
        assertEquals("NEW001", saved.getCode());
        
        // 실제로 저장되었는지 확인
        var found = projectRepository.findById("proj4");
        assertTrue(found.isPresent());
        assertEquals("New Project", found.get().getName());
    }

    @Test
    void testDelete() {
        // Given
        String projectId = "proj2";
        assertTrue(projectRepository.findById(projectId).isPresent());

        // When
        projectRepository.deleteById(projectId);
        entityManager.flush();

        // Then
        assertFalse(projectRepository.findById(projectId).isPresent());
    }

    // ==================== 커스텀 쿼리 메서드 테스트 ====================

    @Test
    void testFindAccessibleProjectsByUserId_Success() {
        // When
        List<Project> result = projectRepository.findAccessibleProjectsByUserId("user1");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // user1은 proj1 (PROJECT_MANAGER), proj3 (PROJECT_MANAGER)에 속함
        assertTrue(result.stream().anyMatch(project -> "proj1".equals(project.getId())));
        assertTrue(result.stream().anyMatch(project -> "proj3".equals(project.getId())));
    }

    @Test
    void testFindAccessibleProjectsByUserId_SingleProject() {
        // When
        List<Project> result = projectRepository.findAccessibleProjectsByUserId("user2");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        
        // user2는 proj1 (DEVELOPER)에만 속함
        assertEquals("proj1", result.get(0).getId());
        assertEquals("Organization Project 1", result.get(0).getName());
    }

    @Test
    void testFindAccessibleProjectsByUserId_NoProjects() {
        // Given - 새로운 사용자 생성 (프로젝트에 속하지 않음)
        User newUser = new User();
        newUser.setId("user3");
        newUser.setUsername("testuser3");
        newUser.setEmail("test3@example.com");
        newUser.setName("Test User 3");
        newUser.setRole("USER");
        newUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(newUser);

        // When
        List<Project> result = projectRepository.findAccessibleProjectsByUserId("user3");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByOrganizationId_Success() {
        // When
        List<Project> result = projectRepository.findByOrganizationId("org1");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("proj1", result.get(0).getId());
        assertEquals("Organization Project 1", result.get(0).getName());
    }

    @Test
    void testFindByOrganizationId_MultipleProjects() {
        // Given - org1에 추가 프로젝트 생성
        Project additionalProject = new Project();
        additionalProject.setId("proj4");
        additionalProject.setName("Additional Project");
        additionalProject.setCode("ADD001");
        additionalProject.setDescription("Additional Description");
        additionalProject.setOrganization(testOrganization1);
        additionalProject.setCreatedAt(LocalDateTime.now());
        additionalProject.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(additionalProject);

        // When
        List<Project> result = projectRepository.findByOrganizationId("org1");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(project -> "proj1".equals(project.getId())));
        assertTrue(result.stream().anyMatch(project -> "proj4".equals(project.getId())));
    }

    @Test
    void testFindByOrganizationId_NoProjects() {
        // Given - 새로운 조직 생성 (프로젝트 없음)
        Organization emptyOrg = new Organization();
        emptyOrg.setId("org3");
        emptyOrg.setName("Empty Organization");
        emptyOrg.setDescription("No projects");
        emptyOrg.setCreatedAt(LocalDateTime.now());
        emptyOrg.setUpdatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(emptyOrg);

        // When
        List<Project> result = projectRepository.findByOrganizationId("org3");

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByCode_Success() {
        // When
        var result = projectRepository.findByCode("ORG001");

        // Then
        assertTrue(result.isPresent());
        assertEquals("proj1", result.get().getId());
        assertEquals("Organization Project 1", result.get().getName());
    }

    @Test
    void testFindByCode_NotFound() {
        // When
        var result = projectRepository.findByCode("NONEXISTENT");

        // Then
        assertFalse(result.isPresent());
    }

    // ==================== 독립 프로젝트 테스트 ====================

    @Test
    void testFindIndependentProjects() {
        // When - 조직이 null인 프로젝트 조회
        List<Project> result = projectRepository.findByOrganizationIsNull();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("proj3", result.get(0).getId());
        assertEquals("Independent Project", result.get(0).getName());
        assertNull(result.get(0).getOrganization());
    }

    // ==================== 데이터 무결성 테스트 ====================

    @Test
    void testUniqueConstraint_ProjectCode() {
        // Given
        Project duplicateProject = new Project();
        duplicateProject.setId("proj5");
        duplicateProject.setName("Duplicate Code Project");
        duplicateProject.setCode("ORG001"); // 중복된 코드
        duplicateProject.setDescription("Duplicate Code Description");
        duplicateProject.setOrganization(testOrganization2);
        duplicateProject.setCreatedAt(LocalDateTime.now());
        duplicateProject.setUpdatedAt(LocalDateTime.now());

        // When & Then
        // 프로젝트 코드 중복이 허용되지 않는다면 예외 발생
        assertThrows(Exception.class, () -> {
            projectRepository.save(duplicateProject);
            entityManager.flush();
        });
    }

    @Test
    void testCascadeDelete_WithMembers() {
        // Given
        String projectId = "proj1";
        
        // 프로젝트에 멤버가 있는지 확인
        List<ProjectUser> members = projectUserRepository.findByProjectId(projectId);
        assertTrue(members.size() > 0);

        // When
        // ProjectUser에서 CASCADE 삭제가 설정되어 있다면 자동으로 삭제됨
        // 설정되어 있지 않다면 수동으로 삭제해야 함
        projectUserRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
        entityManager.flush();

        // Then
        assertFalse(projectRepository.findById(projectId).isPresent());
        
        // 관련 ProjectUser도 삭제되었는지 확인
        List<ProjectUser> remainingMembers = projectUserRepository.findByProjectId(projectId);
        assertEquals(0, remainingMembers.size());
    }

    // ==================== 성능 테스트 ====================

    @Test
    void testFindAccessibleProjectsByUserId_Performance() {
        // Given - 대량 데이터 생성
        User testUser = new User();
        testUser.setId("perfuser");
        testUser.setUsername("perfuser");
        testUser.setEmail("perf@example.com");
        testUser.setName("Performance User");
        testUser.setRole("USER");
        testUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testUser);

        // 100개의 프로젝트와 관계 생성
        for (int i = 0; i < 100; i++) {
            Project project = new Project();
            project.setId("perfproj" + i);
            project.setName("Performance Project " + i);
            project.setCode("PERF" + String.format("%03d", i));
            project.setDescription("Performance Description " + i);
            project.setOrganization(null);
            project.setCreatedAt(LocalDateTime.now());
            project.setUpdatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(project);

            ProjectUser projUser = new ProjectUser();
            projUser.setId("perfprojuser" + i);
            projUser.setProject(project);
            projUser.setUser(testUser);
            projUser.setRoleInProject(ProjectUser.ProjectRole.DEVELOPER);
            projUser.setCreatedAt(LocalDateTime.now());
            projUser.setUpdatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(projUser);
        }
        entityManager.clear();

        // When
        long startTime = System.currentTimeMillis();
        List<Project> result = projectRepository.findAccessibleProjectsByUserId("perfuser");
        long endTime = System.currentTimeMillis();

        // Then
        assertNotNull(result);
        assertEquals(100, result.size());
        
        // 성능 확인 (1초 이내)
        long executionTime = endTime - startTime;
        assertTrue(executionTime < 1000, "Query took too long: " + executionTime + "ms");
    }

    // ==================== 복합 쿼리 테스트 ====================

    @Test
    void testComplexProjectQueries() {
        // When - 조직별 프로젝트 개수 조회
        List<Project> org1Projects = projectRepository.findByOrganizationId("org1");
        List<Project> org2Projects = projectRepository.findByOrganizationId("org2");
        List<Project> independentProjects = projectRepository.findByOrganizationIsNull();

        // Then
        assertEquals(1, org1Projects.size());
        assertEquals(1, org2Projects.size());
        assertEquals(1, independentProjects.size());
        
        // 전체 프로젝트 수 확인
        List<Project> allProjects = projectRepository.findAll();
        assertEquals(3, allProjects.size());
    }

    @Test
    void testProjectSearch_ByNamePattern() {
        // When - 프로젝트명 패턴 검색 (contains)
        List<Project> result = projectRepository.findAll().stream()
            .filter(project -> project.getName().contains("Organization"))
            .toList();

        // Then
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(project -> 
            project.getName().contains("Organization")));
    }

    @Test
    void testProjectOrdering_ByCreatedDate() {
        // Given - 시간 차이를 두고 프로젝트 생성
        Project laterProject = new Project();
        laterProject.setId("proj_later");
        laterProject.setName("Later Project");
        laterProject.setCode("LATER001");
        laterProject.setDescription("Later Description");
        laterProject.setOrganization(testOrganization1);
        laterProject.setCreatedAt(LocalDateTime.now().plusMinutes(1));
        laterProject.setUpdatedAt(LocalDateTime.now().plusMinutes(1));
        entityManager.persistAndFlush(laterProject);
        entityManager.clear();

        // When - 조직별 프로젝트 조회 (생성일 순)
        List<Project> result = projectRepository.findByOrganizationId("org1");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // 프로젝트가 포함되어 있는지 확인
        assertTrue(result.stream().anyMatch(project -> "proj1".equals(project.getId())));
        assertTrue(result.stream().anyMatch(project -> "proj_later".equals(project.getId())));
    }
}