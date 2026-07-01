package com.testcase.testcasemanagement.integration;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
@Transactional
public class JiraSmartRedirectIntegrationTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext webApplicationContext;

  @Autowired private UserRepository userRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private TestExecutionRepository testExecutionRepository;

  @Autowired private TestResultRepository testResultRepository;

  @Autowired private JwtTokenUtil jwtTokenUtil;

  private MockMvc mockMvc;
  private User testUser;
  private String jwtToken;
  private Project testProject;

  @BeforeMethod
  public void setUp() {
    mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

    // 테스트 사용자 생성
    testUser = new User();
    testUser.setUsername("redirect-user-" + UUID.randomUUID().toString().substring(0, 8));
    testUser.setEmail("redirect@example.com");
    testUser.setName("Redirect User");
    testUser.setPassword("password");
    testUser.setRole("ADMIN");
    testUser.setIsActive(true);
    testUser = userRepository.save(testUser);

    // JWT 토큰 생성
    UserDetails userDetails =
        org.springframework.security.core.userdetails.User.builder()
            .username(testUser.getUsername())
            .password(testUser.getPassword())
            .authorities("ROLE_ADMIN")
            .build();
    jwtToken = jwtTokenUtil.generateToken(userDetails);

    // 테스트 프로젝트 생성
    testProject = new Project();
    testProject.setName("Redirect Test Project");
    testProject.setCode("REDIR-PROJ-" + UUID.randomUUID().toString().substring(0, 8));
    testProject.setDescription("Project for testing smart redirect");
    testProject = projectRepository.save(testProject);
  }

  @Test
  public void testLatestExecutionContext_SingleMatch() throws Exception {
    // Given
    String issueKey = "ON-101";

    TestExecution execution = createExecution("Execution 1", testProject);
    createResult(execution, "TC-001", issueKey, LocalDateTime.now());

    // When & Then
    mockMvc
        .perform(
            get("/api/jira-integration/latest-execution-context")
                .header("Authorization", "Bearer " + jwtToken)
                .param("issueKey", issueKey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].executionName", is("Execution 1")))
        .andExpect(jsonPath("$[0].projectId", is(testProject.getId())))
        .andExpect(jsonPath("$[0].testCaseId", is("TC-001")));
  }

  @Test
  public void testLatestExecutionContext_MultiMatch() throws Exception {
    // Given
    String issueKey = "ON-202";

    // 실행 1 (과거)
    TestExecution execution1 = createExecution("Execution Past", testProject);
    createResult(execution1, "TC-001", issueKey, LocalDateTime.now().minusDays(1));

    // 실행 2 (최신)
    TestExecution execution2 = createExecution("Execution Recent", testProject);
    createResult(execution2, "TC-002", issueKey, LocalDateTime.now());

    // 동일 실행 내 다른 결과 (중복 제거 확인용)
    createResult(execution2, "TC-003", issueKey, LocalDateTime.now().minusMinutes(5));

    // When & Then
    mockMvc
        .perform(
            get("/api/jira-integration/latest-execution-context")
                .header("Authorization", "Bearer " + jwtToken)
                .param("issueKey", issueKey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].executionName", is("Execution Recent"))) // 최신이 먼저 나와야 함
        .andExpect(jsonPath("$[1].executionName", is("Execution Past")));
  }

  @Test
  public void testLatestExecutionContext_NoMatch() throws Exception {
    // 유효한 JIRA 키 형식이지만 어떤 실행에도 연결되지 않은 경우 -> 404
    mockMvc
        .perform(
            get("/api/jira-integration/latest-execution-context")
                .header("Authorization", "Bearer " + jwtToken)
                .param("issueKey", "NOTEXIST-9999"))
        .andExpect(status().isNotFound());
  }

  @Test
  public void testLatestExecutionContext_InvalidKey() throws Exception {
    // When & Then
    mockMvc
        .perform(
            get("/api/jira-integration/latest-execution-context")
                .header("Authorization", "Bearer " + jwtToken)
                .param("issueKey", "invalid-key"))
        .andExpect(status().isBadRequest());
  }

  private TestExecution createExecution(String name, Project project) {
    TestExecution execution = new TestExecution();
    execution.setName(name);
    execution.setProject(project);
    execution.setStatus("INPROGRESS");
    execution.setStartDate(LocalDateTime.now());
    return testExecutionRepository.save(execution);
  }

  private TestResult createResult(
      TestExecution execution, String testCaseId, String issueKey, LocalDateTime executedAt) {
    TestResult result = new TestResult();
    result.setTestExecution(execution);
    result.setTestCaseId(testCaseId);
    result.setJiraIssueKey(issueKey);
    result.setResult("PASS");
    result.setExecutedAt(executedAt);
    result.setExecutedBy(testUser);
    return testResultRepository.save(result);
  }
}
