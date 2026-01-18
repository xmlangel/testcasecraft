package com.testcase.testcasemanagement.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.CreateOrganizationRequest;
import com.testcase.testcasemanagement.dto.InviteMemberRequest;
import com.testcase.testcasemanagement.dto.UpdateOrganizationRequest;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * 조직 관리 API 보안 및 권한 검증 테스트
 * 실제 보안 시나리오를 검증하는 테스트 케이스
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class OrganizationSecurityTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsService userDetailsService;

    private User adminUser;
    private User testerUser;
    private String adminToken;
    private String testerToken;

    @BeforeMethod
    void setUp() {
        // 테스트 사용자 생성
        adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@test.com");
        adminUser.setName("관리자");
        adminUser.setPassword(passwordEncoder.encode("admin"));
        adminUser.setRole("ADMIN");
        adminUser = userRepository.save(adminUser);

        testerUser = new User();
        testerUser.setUsername("tester");
        testerUser.setEmail("tester@test.com");
        testerUser.setName("테스터");
        testerUser.setPassword(passwordEncoder.encode("tester"));
        testerUser.setRole("TESTER");
        testerUser = userRepository.save(testerUser);

        // JWT 토큰 생성
        UserDetails adminUserDetails = userDetailsService.loadUserByUsername(adminUser.getUsername());
        UserDetails testerUserDetails = userDetailsService.loadUserByUsername(testerUser.getUsername());
        adminToken = "Bearer " + jwtTokenUtil.generateAccessToken(adminUserDetails);
        testerToken = "Bearer " + jwtTokenUtil.generateAccessToken(testerUserDetails);
    }

    @Test
    void testUnauthenticatedAccessBlocked() throws Exception {
        // 조직 목록 조회
        mockMvc.perform(get("/api/organizations"))
                .andDo(print())
                .andExpect(status().isUnauthorized());

        // 조직 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("Unauthorized Test");
        createRequest.setDescription("This should fail");

        mockMvc.perform(post("/api/organizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andDo(print())
                .andExpect(status().isUnauthorized());

        // 조직 상세 조회
        mockMvc.perform(get("/api/organizations/fake-id"))
                .andDo(print())
                .andExpect(status().isUnauthorized());

        // 조직 수정
        UpdateOrganizationRequest updateRequest = new UpdateOrganizationRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setDescription("Updated Description");

        mockMvc.perform(put("/api/organizations/fake-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isUnauthorized());

        // 조직 삭제
        mockMvc.perform(delete("/api/organizations/fake-id"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testInvalidTokenBlocked() throws Exception {
        String invalidToken = "Bearer invalid.jwt.token";

        mockMvc.perform(get("/api/organizations")
                .header("Authorization", invalidToken))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testExpiredTokenBlocked() throws Exception {
        // 잘못된 형식의 토큰으로 만료 토큰 시뮬레이션
        String expiredToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.invalid";

        mockMvc.perform(get("/api/organizations")
                .header("Authorization", expiredToken))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testOnlyOwnerCanDeleteOrganization() throws Exception {
        // admin 사용자로 조직 생성 (자동으로 OWNER가 됨)
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("Owner Test Organization");
        createRequest.setDescription("Only owner can delete this");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Organization createdOrg = objectMapper.readValue(responseBody, Organization.class);
        String orgId = createdOrg.getId();

        // tester 사용자를 ADMIN으로 초대
        InviteMemberRequest inviteRequest = new InviteMemberRequest();
        inviteRequest.setUsername("tester");
        inviteRequest.setRole(OrganizationRole.ADMIN);

        mockMvc.perform(post("/api/organizations/{organizationId}/members", orgId)
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated());

        // tester (ADMIN)가 조직 삭제 시도 - 실패해야 함
        mockMvc.perform(delete("/api/organizations/{organizationId}", orgId)
                .header("Authorization", testerToken))
                .andDo(print())
                .andExpect(status().isForbidden());

        // admin (OWNER)가 조직 삭제 - 성공해야 함
        mockMvc.perform(delete("/api/organizations/{organizationId}", orgId)
                .header("Authorization", adminToken))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testOnlyAdminCanInviteMembers() throws Exception {
        // 조직 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("Admin Test Organization");
        createRequest.setDescription("Test admin permissions");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Organization createdOrg = objectMapper.readValue(responseBody, Organization.class);
        String orgId = createdOrg.getId();

        // tester를 MEMBER로 초대
        InviteMemberRequest inviteRequest = new InviteMemberRequest();
        inviteRequest.setUsername("tester");
        inviteRequest.setRole(OrganizationRole.MEMBER);

        mockMvc.perform(post("/api/organizations/{organizationId}/members", orgId)
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated());

        // tester (MEMBER)가 다른 사용자 초대 시도 - 권한 부족으로 실패해야 함
        InviteMemberRequest anotherInviteRequest = new InviteMemberRequest();
        anotherInviteRequest.setUsername("admin"); // 이미 있는 사용자지만 권한 테스트용
        anotherInviteRequest.setRole(OrganizationRole.MEMBER);

        mockMvc.perform(post("/api/organizations/{organizationId}/members", orgId)
                .header("Authorization", testerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(anotherInviteRequest)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testOnlyMembersCanViewOrganization() throws Exception {
        // admin 사용자로 조직 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("Member Only Organization");
        createRequest.setDescription("Only members can view this");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Organization createdOrg = objectMapper.readValue(responseBody, Organization.class);
        String orgId = createdOrg.getId();

        // admin (OWNER)는 조직 조회 가능
        mockMvc.perform(get("/api/organizations/{organizationId}", orgId)
                .header("Authorization", adminToken))
                .andDo(print())
                .andExpect(status().isOk());

        // tester (비멤버)는 조직 조회 불가능
        mockMvc.perform(get("/api/organizations/{organizationId}", orgId)
                .header("Authorization", testerToken))
                .andDo(print())
                .andExpect(status().isForbidden());

        // tester를 멤버로 초대
        InviteMemberRequest inviteRequest = new InviteMemberRequest();
        inviteRequest.setUsername("tester");
        inviteRequest.setRole(OrganizationRole.MEMBER);

        mockMvc.perform(post("/api/organizations/{organizationId}/members", orgId)
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated());

        // 이제 tester (MEMBER)는 조직 조회 가능
        mockMvc.perform(get("/api/organizations/{organizationId}", orgId)
                .header("Authorization", testerToken))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testNonExistentOrganizationReturns404() throws Exception {
        String nonExistentOrgId = "non-existent-org-id";

        // 존재하지 않는 조직 조회
        mockMvc.perform(get("/api/organizations/{organizationId}", nonExistentOrgId)
                .header("Authorization", adminToken))
                .andDo(print())
                .andExpect(status().isNotFound());

        // 존재하지 않는 조직 수정
        UpdateOrganizationRequest updateRequest = new UpdateOrganizationRequest();
        updateRequest.setName("Updated Name");

        mockMvc.perform(put("/api/organizations/{organizationId}", nonExistentOrgId)
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isNotFound());

        // 존재하지 않는 조직 삭제
        mockMvc.perform(delete("/api/organizations/{organizationId}", nonExistentOrgId)
                .header("Authorization", adminToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testSelfRemovalFromOrganization() throws Exception {
        // 조직 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("Self Removal Test Org");
        createRequest.setDescription("Test self removal");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Organization createdOrg = objectMapper.readValue(responseBody, Organization.class);
        String orgId = createdOrg.getId();

        // tester 초대
        InviteMemberRequest inviteRequest = new InviteMemberRequest();
        inviteRequest.setUsername("tester");
        inviteRequest.setRole(OrganizationRole.MEMBER);

        mockMvc.perform(post("/api/organizations/{organizationId}/members", orgId)
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated());

        // tester가 본인을 조직에서 제거 (본인 탈퇴)
        mockMvc.perform(delete("/api/organizations/{organizationId}/members/{userId}", orgId, "tester")
                .header("Authorization", testerToken))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}