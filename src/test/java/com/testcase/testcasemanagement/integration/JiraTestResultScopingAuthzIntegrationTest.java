package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.WebApplicationContext;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-review R2(P1) 인가 커버리지 편차 회귀 가드 — 실데이터 시딩.
 *
 * <p>(1) test-results-by-issue / all-test-results-by-issue 는 projectId 가 아니라 jiraIssueKey 로만
 * 조회해 @PreAuthorize 로 게이팅할 수 없었고, 결과 후필터링도 없어 <b>임의 사용자가 모든 프로젝트의 테스트 결과를 열람</b>할 수 있었다. 이제 접근 가능한
 * 프로젝트의 결과만 반환한다. (2) POST /upload/{testCaseId} 는 @PreAuthorize 가 없어 비멤버가 타 프로젝트 테스트케이스에 업로드할 수
 * 있었다. 이제 canUploadTestCase 로 게이팅한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class JiraTestResultScopingAuthzIntegrationTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private UserDetailsService userDetailsService;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ProjectUserRepository projectUserRepository;
  @Autowired private TestCaseRepository testCaseRepository;
  @Autowired private TestExecutionRepository testExecutionRepository;
  @Autowired private TestResultRepository testResultRepository;
  @Autowired private PlatformTransactionManager txManager;

  private MockMvc mockMvc;

  private static final String MEMBER = "jscope_member";
  private static final String OUTSIDER = "jscope_outsider";
  private final Set<String> createdUserIds = new HashSet<>();
  private String memberToken;
  private String outsiderToken;

  private Project projectA; // MEMBER 가 속함
  private Project projectB; // 아무도 안 속함(타 프로젝트)
  private String jiraKey;
  private String testCaseAId;

  @BeforeClass
  public void mvc() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  @BeforeMethod
  void setUp() {
    memberToken = ensureUser(MEMBER);
    outsiderToken = ensureUser(OUTSIDER);
    String uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    // Jira 키 형식([A-Z]+-\d+) 준수 — 숫자 파트는 테스트 간 충돌을 피하려 UUID 해시에서 파생.
    jiraKey = "SCOPE-" + Math.abs(UUID.randomUUID().hashCode());

    projectA = newProject("JA" + uid);
    projectB = newProject("JB" + uid);
    grant(MEMBER, projectA, ProjectRole.DEVELOPER); // MEMBER 는 A 만

    testCaseAId = newCase(projectA, "case A " + uid).getId();
    // 같은 Jira 키에 A·B 각각의 결과를 1건씩 연결
    seedResult(projectA, jiraKey);
    seedResult(projectB, jiraKey);
  }

  @AfterMethod
  void tearDown() {
    new TransactionTemplate(txManager)
        .executeWithoutResult(
            status -> {
              for (Project p : new Project[] {projectA, projectB}) {
                if (p == null) {
                  continue;
                }
                String pid = p.getId();
                testResultRepository.deleteByProjectId(pid);
                testExecutionRepository.deleteByProjectId(pid);
                testCaseRepository.deleteByProjectId(pid);
                projectUserRepository.deleteByProjectId(pid);
                projectRepository.deleteById(pid);
              }
            });
    projectA = null;
    projectB = null;
  }

  @AfterClass(alwaysRun = true)
  void tearDownClass() {
    if (createdUserIds.isEmpty()) {
      return;
    }
    new TransactionTemplate(txManager)
        .executeWithoutResult(
            status ->
                createdUserIds.forEach(
                    id -> {
                      if (userRepository.existsById(id)) {
                        userRepository.deleteById(id);
                      }
                    }));
    createdUserIds.clear();
  }

  private String ensureUser(String username) {
    User u =
        userRepository
            .findByUsername(username)
            .orElseGet(
                () -> {
                  User c = new User();
                  c.setUsername(username);
                  c.setName(username);
                  c.setEmail(username + "@jscope-it.local");
                  c.setPassword(passwordEncoder.encode("pw123456"));
                  c.setRole("TESTER");
                  User saved = userRepository.save(c);
                  createdUserIds.add(saved.getId());
                  return saved;
                });
    UserDetails d = userDetailsService.loadUserByUsername(username);
    return "Bearer " + jwtTokenUtil.generateAccessToken(d);
  }

  private Project newProject(String code) {
    Project p = new Project();
    p.setCode(code);
    p.setName("Proj " + code);
    return projectRepository.save(p);
  }

  private void grant(String username, Project p, ProjectRole role) {
    ProjectUser pu = new ProjectUser();
    pu.setUser(userRepository.findByUsername(username).orElseThrow());
    pu.setProject(p);
    pu.setRoleInProject(role);
    projectUserRepository.save(pu);
  }

  private TestCase newCase(Project p, String name) {
    TestCase tc = new TestCase();
    tc.setProject(p);
    tc.setName(name);
    tc.setType("testcase");
    tc.setDisplayOrder(1);
    return testCaseRepository.save(tc);
  }

  private void seedResult(Project p, String jiraIssueKey) {
    TestExecution exec = new TestExecution();
    exec.setName("run " + p.getCode());
    exec.setProject(p);
    exec.setStatus("INPROGRESS");
    exec = testExecutionRepository.save(exec);

    TestResult r = new TestResult();
    r.setTestExecution(exec);
    r.setResult("PASS");
    r.setJiraIssueKey(jiraIssueKey);
    r.setExecutedAt(java.time.LocalDateTime.now()); // recent 쿼리는 executedAt IS NOT NULL 요구
    testResultRepository.save(r);
  }

  private int httpStatus(org.springframework.test.web.servlet.RequestBuilder rb) throws Exception {
    return mockMvc.perform(rb).andReturn().getResponse().getStatus();
  }

  // 응답이 TestResult 엔티티 전체 그래프(거대·순환)라 JSON 파싱 대신 프로젝트 id 포함 여부로 스코핑을 검증한다.
  private void assertScopedToProjectA(String path) throws Exception {
    String body =
        mockMvc
            .perform(get(path).param("jiraIssueKey", jiraKey).header("Authorization", memberToken))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    Assert.assertTrue(body.contains(projectA.getId()), "접근 가능한 프로젝트 A 의 결과는 포함돼야 함");
    Assert.assertFalse(body.contains(projectB.getId()), "비접근 프로젝트 B 의 결과가 유출되면 안 됨(크로스-프로젝트 차단)");
  }

  @Test
  void allTestResultsByIssue_scopedToAccessibleProjects() throws Exception {
    // A·B 두 프로젝트에 같은 Jira 키 결과가 있지만 MEMBER 는 A 만 접근 가능 → A 만 노출, B 는 차단.
    assertScopedToProjectA("/api/jira-integration/all-test-results-by-issue");
  }

  @Test
  void recentTestResultsByIssue_scopedToAccessibleProjects() throws Exception {
    assertScopedToProjectA("/api/jira-integration/test-results-by-issue");
  }

  @Test
  void uploadToTestCase_outsiderForbidden() throws Exception {
    MockMultipartFile file = new MockMultipartFile("file", "x.txt", "text/plain", "hi".getBytes());
    int st =
        httpStatus(
            multipart("/api/testcase-attachments/upload/" + testCaseAId)
                .file(file)
                .header("Authorization", outsiderToken));
    Assert.assertEquals(st, 403, "비멤버는 타 프로젝트 테스트케이스에 업로드 불가(403), 실제=" + st);
  }
}
