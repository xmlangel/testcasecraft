package com.testcase.testcasemanagement.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import com.testcase.testcasemanagement.dto.CreateOrganizationRequest;
import com.testcase.testcasemanagement.dto.InviteMemberRequest;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.Set;

import static org.testng.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 조직 관리 API JSON 스키마 검증 테스트
 * API 응답이 정의된 JSON 스키마를 준수하는지 검증
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class OrganizationControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

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
    private String adminToken;
    private JsonSchemaFactory jsonSchemaFactory;

    @BeforeMethod
    void setUp() {
        // MockMvc 초기화
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // 테스트 사용자 생성
        adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@test.com");
        adminUser.setName("관리자");
        adminUser.setPassword(passwordEncoder.encode("admin"));
        adminUser.setRole("ADMIN");
        adminUser = userRepository.save(adminUser);

        // JWT 토큰 생성
        UserDetails adminUserDetails = userDetailsService.loadUserByUsername(adminUser.getUsername());
        adminToken = jwtTokenUtil.generateAccessToken(adminUserDetails);

        // JSON 스키마 팩토리 초기화
        jsonSchemaFactory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V7);
    }

    @Test
    void 조직_목록_조회_응답_스키마_검증() throws Exception {
        // Given: 조직 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("스키마 테스트 조직");
        createRequest.setDescription("JSON 스키마 검증용 조직");

        mockMvc.perform(post("/api/organizations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated());

        // When: 조직 목록 조회
        MvcResult result = mockMvc.perform(get("/api/organizations")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        // Then: JSON 스키마 검증
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);

        // 조직 목록 스키마 로드
        InputStream schemaStream = new ClassPathResource("schemas/organization-list-response-schema.json").getInputStream();
        JsonSchema schema = jsonSchemaFactory.getSchema(schemaStream);

        // 스키마 검증
        Set<ValidationMessage> validationMessages = schema.validate(responseJson);
        assertTrue(validationMessages.isEmpty(), 
            "응답이 스키마를 준수하지 않습니다: " + validationMessages);
    }

    @Test
    void 조직_생성_응답_스키마_검증() throws Exception {
        // Given: 조직 생성 요청
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("스키마 테스트 조직");
        createRequest.setDescription("JSON 스키마 검증용 조직");

        // When: 조직 생성
        MvcResult result = mockMvc.perform(post("/api/organizations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        // Then: JSON 스키마 검증
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);

        // 조직 생성 응답 스키마 로드
        InputStream schemaStream = new ClassPathResource("schemas/organization-create-response-schema.json").getInputStream();
        JsonSchema schema = jsonSchemaFactory.getSchema(schemaStream);

        // 스키마 검증
        Set<ValidationMessage> validationMessages = schema.validate(responseJson);
        assertTrue(validationMessages.isEmpty(), 
            "응답이 스키마를 준수하지 않습니다: " + validationMessages);
    }

    @Test
    void 조직_상세_조회_응답_스키마_검증() throws Exception {
        // Given: 조직 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("스키마 테스트 조직");
        createRequest.setDescription("JSON 스키마 검증용 조직");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        JsonNode createJson = objectMapper.readTree(createResponse);
        String orgId = createJson.get("id").asText();

        // When: 조직 상세 조회
        MvcResult result = mockMvc.perform(get("/api/organizations/" + orgId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        // Then: JSON 스키마 검증
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);

        // 조직 상세 조회 스키마 로드
        InputStream schemaStream = new ClassPathResource("schemas/organization-create-response-schema.json").getInputStream();
        JsonSchema schema = jsonSchemaFactory.getSchema(schemaStream);

        // 스키마 검증
        Set<ValidationMessage> validationMessages = schema.validate(responseJson);
        assertTrue(validationMessages.isEmpty(), 
            "응답이 스키마를 준수하지 않습니다: " + validationMessages);
    }

    @Test
    void 멤버_초대_응답_스키마_검증() throws Exception {
        // Given: 조직 생성 및 tester 사용자 생성
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("스키마 테스트 조직");
        createRequest.setDescription("JSON 스키마 검증용 조직");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        JsonNode createJson = objectMapper.readTree(createResponse);
        String orgId = createJson.get("id").asText();

        // tester 사용자 생성
        User testerUser = new User();
        testerUser.setUsername("tester");
        testerUser.setEmail("tester@test.com");
        testerUser.setName("테스터");
        testerUser.setPassword(passwordEncoder.encode("tester"));
        testerUser.setRole("TESTER");
        userRepository.save(testerUser);

        // When: 멤버 초대
        InviteMemberRequest inviteRequest = new InviteMemberRequest();
        inviteRequest.setUsername("tester");
        inviteRequest.setRole(OrganizationRole.ADMIN);

        MvcResult result = mockMvc.perform(post("/api/organizations/" + orgId + "/members")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        // Then: JSON 스키마 검증
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);

        // 멤버 초대 응답 스키마 로드
        InputStream schemaStream = new ClassPathResource("schemas/organization-member-schema.json").getInputStream();
        JsonSchema schema = jsonSchemaFactory.getSchema(schemaStream);

        // 스키마 검증
        Set<ValidationMessage> validationMessages = schema.validate(responseJson);
        assertTrue(validationMessages.isEmpty(), 
            "응답이 스키마를 준수하지 않습니다: " + validationMessages);
    }

    @Test
    void 멤버_목록_조회_응답_스키마_검증() throws Exception {
        // Given: 조직 생성 및 멤버 추가
        CreateOrganizationRequest createRequest = new CreateOrganizationRequest();
        createRequest.setName("스키마 테스트 조직");
        createRequest.setDescription("JSON 스키마 검증용 조직");

        MvcResult createResult = mockMvc.perform(post("/api/organizations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        JsonNode createJson = objectMapper.readTree(createResponse);
        String orgId = createJson.get("id").asText();

        // When: 멤버 목록 조회
        MvcResult result = mockMvc.perform(get("/api/organizations/" + orgId + "/members")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        // Then: JSON 스키마 검증
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);

        // 멤버 목록 스키마 로드
        InputStream schemaStream = new ClassPathResource("schemas/organization-members-response-schema.json").getInputStream();
        JsonSchema schema = jsonSchemaFactory.getSchema(schemaStream);

        // 스키마 검증
        Set<ValidationMessage> validationMessages = schema.validate(responseJson);
        assertTrue(validationMessages.isEmpty(), 
            "응답이 스키마를 준수하지 않습니다: " + validationMessages);
    }
}