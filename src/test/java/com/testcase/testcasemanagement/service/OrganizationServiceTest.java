// src/test/java/com/testcase/testcasemanagement/service/OrganizationServiceTest.java
package com.testcase.testcasemanagement.service;

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

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.testng.Assert.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * OrganizationService 단위 테스트
 * Task 17: Service 레이어 비즈니스 로직 및 권한 검증 테스트
 */
public class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationUserRepository organizationUserRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationSecurityService organizationSecurityService;

    @Mock
    private SecurityContextUtil securityContextUtil;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private OrganizationService organizationService;

    private User testUser;
    private Organization testOrganization;
    private OrganizationUser testOrganizationUser;

    @BeforeMethod
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // 테스트 사용자 설정
        testUser = new User();
        testUser.setId("user123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setRole("USER");

        // 테스트 조직 설정
        testOrganization = new Organization();
        testOrganization.setId("org123");
        testOrganization.setName("Test Organization");
        testOrganization.setDescription("Test Description");
        testOrganization.setCreatedAt(LocalDateTime.now());

        // 테스트 조직 사용자 관계 설정
        testOrganizationUser = new OrganizationUser();
        testOrganizationUser.setId("orguser123");
        testOrganizationUser.setOrganization(testOrganization);
        testOrganizationUser.setUser(testUser);
        testOrganizationUser.setRoleInOrganization(OrganizationUser.OrganizationRole.OWNER);
    }

    // ==================== 조직 생성 테스트 ====================

    @Test
    void testCreateOrganization_Success() {
        // Given
        String orgName = "New Organization";
        String orgDescription = "New Description";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrganization);
        when(organizationUserRepository.save(any(OrganizationUser.class))).thenReturn(testOrganizationUser);

        // When
        Organization result = organizationService.createOrganization(orgName, orgDescription);

        // Then
        assertNotNull(result);
        assertEquals(testOrganization.getId(), result.getId());
        
        // 조직 저장 확인
        verify(organizationRepository).save(argThat(org -> 
            orgName.equals(org.getName()) && orgDescription.equals(org.getDescription())
        ));
        
        // 생성자가 OWNER로 추가되는지 확인
        verify(organizationUserRepository).save(argThat(orgUser -> 
            orgUser.getUser().equals(testUser) && 
            orgUser.getRoleInOrganization() == OrganizationUser.OrganizationRole.OWNER
        ));
        
        // 감사 로그 기록 확인
        verify(auditService, times(2)).logOrganizationAction(any(), any(), any());
        verify(auditService).logOrganizationMemberAction(any(), any(), any(), any());
    }

    @Test
    void testCreateOrganization_NotAuthenticated() {
        // Given
        when(securityContextUtil.getCurrentUsername()).thenReturn(null);

        // When & Then
        try {
            organizationService.createOrganization("Test Org", "Description");
            fail("AccessDeniedException이 발생해야 함");
        } catch (AccessDeniedException exception) {
            // Expected exception
            assertEquals("인증이 필요합니다.", exception.getMessage());
        }
        verify(organizationRepository, never()).save(any());
    }

    @Test
    void testCreateOrganization_UserNotFound() {
        // Given
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        try {
            organizationService.createOrganization("Test Org", "Description");
            fail("ResourceNotFoundException이 발생해야 함");
        } catch (ResourceNotFoundException exception) {
            assertEquals("사용자를 찾을 수 없습니다.", exception.getMessage());
        }
    }

    // ==================== 접근 가능한 조직 목록 조회 테스트 ====================

    @Test
    void testGetAccessibleOrganizations_RegularUser() {
        // Given
        List<Organization> userOrganizations = Arrays.asList(testOrganization);
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(securityContextUtil.isSystemAdmin()).thenReturn(false);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(organizationRepository.findByUserId("user123")).thenReturn(userOrganizations);

        // When
        List<Organization> result = organizationService.getAccessibleOrganizations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testOrganization.getId(), result.get(0).getId());
        
        verify(organizationRepository).findByUserId("user123");
        verify(organizationRepository, never()).findAll();
    }

    @Test
    void testGetAccessibleOrganizations_SystemAdmin() {
        // Given
        List<Organization> allOrganizations = Arrays.asList(testOrganization);
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("admin");
        when(securityContextUtil.isSystemAdmin()).thenReturn(true);
        when(organizationRepository.findAll()).thenReturn(allOrganizations);

        // When
        List<Organization> result = organizationService.getAccessibleOrganizations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        
        verify(organizationRepository).findAll();
        verify(organizationRepository, never()).findByUserId(any());
    }

    // ==================== 조직 상세 정보 조회 테스트 ====================

    @Test
    void testGetOrganization_Success() {
        // Given
        String orgId = "org123";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canAccessOrganization(orgId, "testuser")).thenReturn(true);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(testOrganization));

        // When
        Organization result = organizationService.getOrganization(orgId);

        // Then
        assertNotNull(result);
        assertEquals(testOrganization.getId(), result.getId());
        
        verify(organizationSecurityService).canAccessOrganization(orgId, "testuser");
    }

    @Test
    void testGetOrganization_AccessDenied() {
        // Given
        String orgId = "org123";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canAccessOrganization(orgId, "testuser")).thenReturn(false);

        // When & Then
        try {
            organizationService.getOrganization(orgId);
            fail("AccessDeniedException이 발생해야 함");
        } catch (AccessDeniedException exception) {
            assertEquals("조직에 접근할 권한이 없습니다.", exception.getMessage());
        }
        verify(organizationRepository, never()).findById(any());
    }

    // ==================== 조직 정보 수정 테스트 ====================

    @Test
    void testUpdateOrganization_Success() {
        // Given
        String orgId = "org123";
        String newName = "Updated Organization";
        String newDescription = "Updated Description";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canManageOrganization(orgId, "testuser")).thenReturn(true);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(testOrganization));
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrganization);

        // When
        Organization result = organizationService.updateOrganization(orgId, newName, newDescription);

        // Then
        assertNotNull(result);
        
        verify(organizationSecurityService).canManageOrganization(orgId, "testuser");
        verify(organizationRepository).save(argThat(org -> 
            newName.equals(org.getName()) && newDescription.equals(org.getDescription())
        ));
        verify(auditService).logOrganizationAction(eq(orgId), any(), contains("Organization updated"));
    }

    // ==================== 조직 삭제 테스트 ====================

    @Test
    void testDeleteOrganization_Success() {
        // Given
        String orgId = "org123";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.isOrganizationOwner(orgId, "testuser")).thenReturn(true);
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(testOrganization));

        // When
        organizationService.deleteOrganization(orgId, false);

        // Then
        verify(organizationUserRepository).deleteByOrganizationId(orgId);
        verify(organizationRepository).delete(testOrganization);
        verify(auditService).logOrganizationAction(eq(orgId), any(), contains("Organization deleted"));
    }

    @Test
    void testDeleteOrganization_NotOwner() {
        // Given
        String orgId = "org123";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.isOrganizationOwner(orgId, "testuser")).thenReturn(false);
        when(securityContextUtil.isSystemAdmin()).thenReturn(false);

        // When & Then
        try {
            organizationService.deleteOrganization(orgId, false);
            fail("AccessDeniedException이 발생해야 함");
        } catch (AccessDeniedException exception) {
            assertEquals("조직을 삭제할 권한이 없습니다.", exception.getMessage());
        }
        verify(organizationRepository, never()).delete(any());
    }

    // ==================== 멤버 초대 테스트 ====================

    @Test
    void testInviteMember_Success() {
        // Given
        String orgId = "org123";
        String username = "newuser";
        OrganizationUser.OrganizationRole role = OrganizationUser.OrganizationRole.MEMBER;
        
        User invitedUser = new User();
        invitedUser.setId("newuser123");
        invitedUser.setUsername(username);
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canInviteMembers(orgId, "testuser")).thenReturn(true);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(invitedUser));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(testOrganization));
        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, "newuser123"))
            .thenReturn(Optional.empty());
        when(organizationUserRepository.save(any(OrganizationUser.class))).thenReturn(testOrganizationUser);

        // When
        OrganizationUser result = organizationService.inviteMember(orgId, username, role);

        // Then
        assertNotNull(result);
        
        verify(organizationSecurityService).canInviteMembers(orgId, "testuser");
        verify(organizationUserRepository).save(argThat(orgUser -> 
            orgUser.getUser().equals(invitedUser) && orgUser.getRoleInOrganization() == role
        ));
        verify(auditService).logOrganizationMemberAction(eq(orgId), eq("newuser123"), any(), eq(role.toString()));
    }

    @Test
    void testInviteMember_AlreadyMember() {
        // Given
        String orgId = "org123";
        String username = "existinguser";
        OrganizationUser.OrganizationRole role = OrganizationUser.OrganizationRole.MEMBER;
        
        User existingUser = new User();
        existingUser.setId("existing123");
        existingUser.setUsername(username);
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canInviteMembers(orgId, "testuser")).thenReturn(true);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(testOrganization));
        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, "existing123"))
            .thenReturn(Optional.of(testOrganizationUser));

        // When & Then
        try {
            organizationService.inviteMember(orgId, username, role);
            fail("IllegalArgumentException이 발생해야 함");
        } catch (IllegalArgumentException exception) {
            assertEquals("이미 조직의 멤버입니다.", exception.getMessage());
        }
        verify(organizationUserRepository, never()).save(any());
    }

    // ==================== 멤버 제거 테스트 ====================

    @Test
    void testRemoveMember_Success() {
        // Given
        String orgId = "org123";
        String targetUserId = "target123";
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canRemoveMember(orgId, targetUserId, "testuser")).thenReturn(true);
        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, targetUserId))
            .thenReturn(Optional.of(testOrganizationUser));

        // When
        organizationService.removeMember(orgId, targetUserId);

        // Then
        verify(organizationSecurityService).canRemoveMember(orgId, targetUserId, "testuser");
        verify(organizationUserRepository).delete(testOrganizationUser);
        verify(auditService).logOrganizationMemberAction(eq(orgId), eq(targetUserId), any(), any());
    }

    // ==================== 멤버 역할 변경 테스트 ====================

    @Test
    void testUpdateMemberRole_Success() {
        // Given
        String orgId = "org123";
        String targetUserId = "target123";
        OrganizationUser.OrganizationRole newRole = OrganizationUser.OrganizationRole.ADMIN;
        OrganizationUser.OrganizationRole oldRole = OrganizationUser.OrganizationRole.MEMBER;
        
        testOrganizationUser.setRoleInOrganization(oldRole);
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canManageOrganization(orgId, "testuser")).thenReturn(true);
        when(organizationUserRepository.findByOrganizationIdAndUserId(orgId, targetUserId))
            .thenReturn(Optional.of(testOrganizationUser));
        when(organizationUserRepository.save(any(OrganizationUser.class))).thenReturn(testOrganizationUser);

        // When
        OrganizationUser result = organizationService.updateMemberRole(orgId, targetUserId, newRole);

        // Then
        assertNotNull(result);
        
        verify(organizationSecurityService).canManageOrganization(orgId, "testuser");
        verify(organizationUserRepository).save(argThat(orgUser -> 
            orgUser.getRoleInOrganization() == newRole
        ));
        verify(auditService).logOrganizationMemberAction(eq(orgId), eq(targetUserId), any(), 
            contains("oldRole=" + oldRole + ", newRole=" + newRole));
    }

    // ==================== 조직 멤버 목록 조회 테스트 ====================

    @Test
    void testGetOrganizationMembers_Success() {
        // Given
        String orgId = "org123";
        List<OrganizationUser> members = Arrays.asList(testOrganizationUser);
        
        when(securityContextUtil.getCurrentUsername()).thenReturn("testuser");
        when(organizationSecurityService.canAccessOrganization(orgId, "testuser")).thenReturn(true);
        when(organizationUserRepository.findByOrganizationId(orgId)).thenReturn(members);

        // When
        List<OrganizationUser> result = organizationService.getOrganizationMembers(orgId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testOrganizationUser.getId(), result.get(0).getId());
        
        verify(organizationSecurityService).canAccessOrganization(orgId, "testuser");
    }
}