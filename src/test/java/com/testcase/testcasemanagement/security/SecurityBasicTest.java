package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 기본 보안 컴포넌트 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
public class SecurityBasicTest {

    @Autowired
    private SecurityContextUtil securityContextUtil;
    
    @Autowired
    private OrganizationSecurityService organizationSecurityService;
    
    @Autowired
    private ProjectSecurityService projectSecurityService;
    
    @Autowired
    private GroupSecurityService groupSecurityService;

    @Test
    public void testSecurityContextUtil() {
        // SecurityContextUtil이 정상적으로 주입되는지 확인
        assertNotNull(securityContextUtil, "SecurityContextUtil should be injected");
    }

    @Test
    public void testSecurityServices() {
        // 보안 서비스들이 정상적으로 주입되는지 확인
        assertNotNull(organizationSecurityService, "OrganizationSecurityService should be injected");
        assertNotNull(projectSecurityService, "ProjectSecurityService should be injected");
        assertNotNull(groupSecurityService, "GroupSecurityService should be injected");
    }

    @Test
    public void testNonExistentUser() {
        // 존재하지 않는 사용자에 대한 기본 테스트
        String nonExistentUser = "nonexistent";
        String fakeOrgId = "fake-org-id";
        String fakeProjectId = "fake-project-id";
        String fakeGroupId = "fake-group-id";

        // 존재하지 않는 사용자는 모든 리소스에 접근할 수 없어야 함
        assertFalse(organizationSecurityService.canAccessOrganization(fakeOrgId, nonExistentUser));
        assertFalse(projectSecurityService.canAccessProject(fakeProjectId, nonExistentUser));
        assertFalse(groupSecurityService.canAccessGroup(fakeGroupId, nonExistentUser));
    }
}