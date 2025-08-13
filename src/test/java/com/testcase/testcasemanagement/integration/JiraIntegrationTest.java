// src/test/java/com/testcase/testcasemanagement/integration/JiraIntegrationTest.java
package com.testcase.testcasemanagement.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.JiraConfig;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.JiraConfigRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.EncryptionService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;

import org.springframework.security.core.userdetails.UserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(locations = "classpath:application-test.properties")
@ActiveProfiles("test")
@Transactional
class JiraIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JiraConfigRepository jiraConfigRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // 테스트 사용자 생성
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPassword("encodedPassword");
        testUser.setRole("USER");
        testUser.setIsActive(true);
        testUser = userRepository.save(testUser);

        // JWT 토큰 생성
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(testUser.getUsername())
            .password(testUser.getPassword())
            .authorities("ROLE_USER")
            .build();
        jwtToken = jwtTokenUtil.generateToken(userDetails);
    }

    @Test
    @DisplayName("JIRA 설정 저장 및 조회 테스트")
    void testSaveAndRetrieveJiraConfig() throws Exception {
        // Given
        JiraConfigDto configDto = JiraConfigDto.builder()
            .serverUrl("https://test.atlassian.net")
            .username("testuser@example.com")
            .apiToken("test-api-token-12345")
            .build();

        String requestBody = objectMapper.writeValueAsString(configDto);

        // When & Then - 설정 저장
        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.serverUrl", is("https://test.atlassian.net")))
            .andExpect(jsonPath("$.username", is("testuser@example.com")))
            .andExpect(jsonPath("$.isActive", is(true)))
            .andExpect(jsonPath("$.apiToken").doesNotExist()); // 보안상 응답에 포함되지 않아야 함

        // When & Then - 설정 조회
        mockMvc.perform(get("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.serverUrl", is("https://test.atlassian.net")))
            .andExpect(jsonPath("$.username", is("testuser@example.com")))
            .andExpect(jsonPath("$.isActive", is(true)));
    }

    @Test
    @DisplayName("암호화/복호화 보안 테스트")
    void testEncryptionDecryption() {
        // Given
        String originalApiToken = "test-api-token-very-secret";

        // When
        String encrypted = encryptionService.encrypt(originalApiToken);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertNotEquals(originalApiToken, encrypted, "원본 토큰과 암호화된 토큰이 달라야 함");
        assertEquals(originalApiToken, decrypted, "복호화된 토큰이 원본과 같아야 함");
        assertTrue(encrypted.length() > originalApiToken.length(), "암호화된 데이터가 더 길어야 함");
    }

    @Test
    @DisplayName("JIRA 설정 권한 테스트 - 다른 사용자의 설정 접근 불가")
    void testJiraConfigAccessControl() throws Exception {
        // Given - 첫 번째 사용자의 설정 저장
        JiraConfigDto configDto = JiraConfigDto.builder()
            .serverUrl("https://test1.atlassian.net")
            .username("user1@example.com")
            .apiToken("user1-token")
            .build();

        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDto)))
            .andExpect(status().isOk());

        // 두 번째 사용자 생성
        User anotherUser = new User();
        anotherUser.setUsername("anotheruser");
        anotherUser.setEmail("another@example.com");
        anotherUser.setName("Another User");
        anotherUser.setPassword("encodedPassword");
        anotherUser.setRole("USER");
        anotherUser.setIsActive(true);
        anotherUser = userRepository.save(anotherUser);

        UserDetails anotherUserDetails = org.springframework.security.core.userdetails.User.builder()
            .username(anotherUser.getUsername())
            .password(anotherUser.getPassword())
            .authorities("ROLE_USER")
            .build();
        String anotherUserToken = jwtTokenUtil.generateToken(anotherUserDetails);

        // When & Then - 다른 사용자로 설정 조회 시도
        mockMvc.perform(get("/api/jira/config")
                .header("Authorization", "Bearer " + anotherUserToken))
            .andExpect(status().isNotFound()); // 설정이 없어야 함
    }

    @Test
    @DisplayName("JIRA 설정 삭제 테스트")
    void testDeleteJiraConfig() throws Exception {
        // Given - 설정 저장
        JiraConfigDto configDto = JiraConfigDto.builder()
            .serverUrl("https://test.atlassian.net")
            .username("testuser@example.com")
            .apiToken("test-api-token")
            .build();

        String configResponse = mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDto)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        JiraConfigDto savedConfig = objectMapper.readValue(configResponse, JiraConfigDto.class);

        // When & Then - 설정 삭제
        mockMvc.perform(delete("/api/jira/config/" + savedConfig.getId())
                .header("Authorization", "Bearer " + jwtToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)));

        // 삭제 후 조회 시 404 응답
        mockMvc.perform(get("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("JIRA 연결 상태 조회 테스트")
    void testJiraConnectionStatus() throws Exception {
        // When & Then - 설정이 없는 상태에서 연결 상태 조회
        mockMvc.perform(get("/api/jira/connection-status")
                .header("Authorization", "Bearer " + jwtToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hasConfig", is(false)));

        // Given - 설정 저장
        JiraConfigDto configDto = JiraConfigDto.builder()
            .serverUrl("https://test.atlassian.net")
            .username("testuser@example.com")
            .apiToken("test-api-token")
            .build();

        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDto)))
            .andExpect(status().isOk());

        // When & Then - 설정이 있는 상태에서 연결 상태 조회
        mockMvc.perform(get("/api/jira/connection-status")
                .header("Authorization", "Bearer " + jwtToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hasConfig", is(true)))
            .andExpect(jsonPath("$.serverUrl", is("https://test.atlassian.net")))
            .andExpect(jsonPath("$.username", is("testuser@example.com")));
    }

    @Test
    @DisplayName("잘못된 JWT 토큰으로 접근 시 401 응답")
    void testInvalidJwtToken() throws Exception {
        mockMvc.perform(get("/api/jira/config")
                .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT 토큰 없이 접근 시 401 응답")
    void testNoJwtToken() throws Exception {
        mockMvc.perform(get("/api/jira/config"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JIRA 설정 입력값 검증 테스트")
    void testJiraConfigValidation() throws Exception {
        // 빈 서버 URL
        JiraConfigDto invalidConfig1 = JiraConfigDto.builder()
            .serverUrl("")
            .username("testuser@example.com")
            .apiToken("test-token")
            .build();

        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidConfig1)))
            .andExpect(status().isBadRequest());

        // 빈 사용자명
        JiraConfigDto invalidConfig2 = JiraConfigDto.builder()
            .serverUrl("https://test.atlassian.net")
            .username("")
            .apiToken("test-token")
            .build();

        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidConfig2)))
            .andExpect(status().isBadRequest());

        // 빈 API 토큰
        JiraConfigDto invalidConfig3 = JiraConfigDto.builder()
            .serverUrl("https://test.atlassian.net")
            .username("testuser@example.com")
            .apiToken("")
            .build();

        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidConfig3)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("데이터베이스에 암호화된 API 토큰 저장 확인")
    void testApiTokenEncryptionInDatabase() throws Exception {
        // Given
        String originalApiToken = "test-api-token-12345";
        JiraConfigDto configDto = JiraConfigDto.builder()
            .serverUrl("https://test.atlassian.net")
            .username("testuser@example.com")
            .apiToken(originalApiToken)
            .build();

        // When
        mockMvc.perform(post("/api/jira/config")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDto)))
            .andExpect(status().isOk());

        // Then
        JiraConfig savedConfig = jiraConfigRepository.findByUserIdAndIsActiveTrue(testUser.getId())
            .orElseThrow(() -> new AssertionError("설정을 찾을 수 없음"));

        assertNotEquals(originalApiToken, savedConfig.getEncryptedApiToken(),
            "데이터베이스에 암호화되지 않은 토큰이 저장되면 안됨");

        // 복호화하여 원본과 같은지 확인
        String decryptedToken = encryptionService.decrypt(savedConfig.getEncryptedApiToken());
        assertEquals(originalApiToken, decryptedToken, "복호화한 토큰이 원본과 같아야 함");
    }
}