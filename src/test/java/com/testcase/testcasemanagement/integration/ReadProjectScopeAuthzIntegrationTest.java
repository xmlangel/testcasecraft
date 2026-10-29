package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
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
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
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
 * ICT-442 회귀 가드 — 조회 API 가 프로젝트 소속을 검사하는지 실데이터로 확인한다.
 *
 * <p>로그인 사용자(시스템 역할 TESTER)가 자기가 속하지 않은 프로젝트의 테스트 결과·버전·차터·첨부 목록을 조회할 수 있었다. 프로젝트 A 에만 속한 사용자로 A 는
 * 열리고 B 는 403 인지 본다. 결과 조회 필터는 실행 ID 가 있으면 projectId 를 보지 않으므로, 자기 프로젝트 ID 에 남의 실행 ID 를 붙이는 우회도 함께
 * 확인한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReadProjectScopeAuthzIntegrationTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private UserDetailsService userDetailsService;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ProjectUserRepository projectUserRepository;
  @Autowired private TestExecutionRepository testExecutionRepository;
  @Autowired private TestResultRepository testResultRepository;
  @Autowired private PlatformTransactionManager txManager;

  private MockMvc mockMvc;

  private static final String MEMBER = "rscope_member";
  private final Set<String> createdUserIds = new HashSet<>();
  private String memberToken;

  private Project projectA; // MEMBER 가 속함
  private Project projectB; // MEMBER 가 속하지 않음
  private String executionBId;
  private String resultAId;
  private String resultBId;

  @BeforeClass
  public void mvc() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  @BeforeMethod
  void setUp() {
    memberToken = ensureUser(MEMBER);
    String uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

    projectA = newProject("RA" + uid);
    projectB = newProject("RB" + uid);
    grant(MEMBER, projectA, ProjectRole.TESTER);

    resultAId = seedResult(projectA).getId();
    TestResult resultB = seedResult(projectB);
    resultBId = resultB.getId();
    executionBId = resultB.getTestExecution().getId();
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
    userRepository
        .findByUsername(username)
        .orElseGet(
            () -> {
              User c = new User();
              c.setUsername(username);
              c.setName(username);
              c.setEmail(username + "@rscope-it.local");
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

  private TestResult seedResult(Project p) {
    TestExecution exec = new TestExecution();
    exec.setName("run " + p.getCode());
    exec.setProject(p);
    exec.setStatus("INPROGRESS");
    exec = testExecutionRepository.save(exec);

    TestResult r = new TestResult();
    r.setTestExecution(exec);
    r.setResult("PASS");
    r.setExecutedAt(java.time.LocalDateTime.now());
    return testResultRepository.save(r);
  }

  private int status(RequestBuilder rb) throws Exception {
    return mockMvc.perform(rb).andReturn().getResponse().getStatus();
  }

  private void assertForbidden(RequestBuilder rb, String label) throws Exception {
    int st = status(rb);
    Assert.assertEquals(st, 403, label + " 는 비소속 사용자에게 403 이어야 함, 실제=" + st);
  }

  private void assertOk(RequestBuilder rb, String label) throws Exception {
    int st = status(rb);
    Assert.assertEquals(st, 200, label + " 는 소속 사용자에게 200 이어야 함, 실제=" + st);
  }

  @Test
  void testResultsByProject_memberAllowed_outsiderForbidden() throws Exception {
    assertOk(
        get("/api/test-results/by-project/" + projectA.getId())
            .header("Authorization", memberToken),
        "소속 프로젝트 결과 조회");
    assertForbidden(
        get("/api/test-results/by-project/" + projectB.getId())
            .header("Authorization", memberToken),
        "비소속 프로젝트 결과 조회");
  }

  @Test
  void resultSearch_foreignExecutionWithOwnProjectId_forbidden() throws Exception {
    String body =
        "{\"projectId\":\""
            + projectA.getId()
            + "\",\"testExecutionIds\":[\""
            + executionBId
            + "\"]}";
    assertForbidden(
        post("/api/test-results-v2/search")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body)
            .header("Authorization", memberToken),
        "자기 projectId 에 남의 실행 ID 를 붙인 결과 검색");
  }

  @Test
  void resultStatistics_withoutScope_forbiddenForNonAdmin() throws Exception {
    assertForbidden(
        get("/api/test-results/statistics").header("Authorization", memberToken),
        "projectId 없는 전체 결과 통계");
  }

  @Test
  void resultEditHistory_memberAllowed_outsiderForbidden() throws Exception {
    assertOk(
        get("/api/test-results/edits/test-result/" + resultAId + "/history")
            .header("Authorization", memberToken),
        "소속 프로젝트 결과 수정 이력");
    assertForbidden(
        get("/api/test-results/edits/test-result/" + resultBId + "/history")
            .header("Authorization", memberToken),
        "비소속 프로젝트 결과 수정 이력");
  }

  @Test
  void resultAttachmentList_memberAllowed_outsiderForbidden() throws Exception {
    assertOk(
        get("/api/attachments/testresult/" + resultAId).header("Authorization", memberToken),
        "소속 프로젝트 결과 첨부 목록");
    assertForbidden(
        get("/api/attachments/testresult/" + resultBId).header("Authorization", memberToken),
        "비소속 프로젝트 결과 첨부 목록");
  }

  @Test
  void currentVersionsByProject_memberAllowed_outsiderForbidden() throws Exception {
    assertOk(
        get("/api/testcase-versions/project/" + projectA.getId() + "/current")
            .header("Authorization", memberToken),
        "소속 프로젝트 테스트케이스 현재 버전");
    assertForbidden(
        get("/api/testcase-versions/project/" + projectB.getId() + "/current")
            .header("Authorization", memberToken),
        "비소속 프로젝트 테스트케이스 현재 버전");
  }

  @Test
  void projectCharters_memberAllowed_outsiderForbidden() throws Exception {
    assertOk(
        get("/api/projects/" + projectA.getId() + "/charters").header("Authorization", memberToken),
        "소속 프로젝트 차터 목록");
    assertForbidden(
        get("/api/projects/" + projectB.getId() + "/charters").header("Authorization", memberToken),
        "비소속 프로젝트 차터 목록");
  }

  @Test
  void ragSearch_withoutProjectId_forbiddenForNonAdmin() throws Exception {
    assertForbidden(
        post("/api/rag/search/similar")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"queryText\":\"로그인\"}")
            .header("Authorization", memberToken),
        "projectId 없는 RAG 유사도 검색");
  }
}
