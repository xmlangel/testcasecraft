package com.testcase.testcasemanagement.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestCharterRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-444 회귀 가드. 소속 검사 없이 열려 있던 LLM 호출 API 와 테스트 차터 생성·수정을 HTTP 로 확인한다.
 *
 * <ul>
 *   <li>POST /api/charters: 대상 프로젝트에서 세션을 진행할 수 있는 사람만 만든다. 작성자는 본문 값이 아니라 로그인한 사람이다
 *   <li>PUT /api/charters/{id}: 시스템 MANAGER 라도 차터가 속한 프로젝트에 소속되지 않으면 고칠 수 없다
 *   <li>POST /api/testcases/ai/generate-meta: 본문 projectId 의 편집 권한이 있어야 하고, projectId 가 없으면 거부한다
 *   <li>POST /api/rag/search/advanced: projectId 가 있으면 그 프로젝트 접근 권한이 있어야 한다
 *   <li>LLM 호출 API 는 사용자별 호출 빈도 제한을 넘으면 429 로 거부한다
 * </ul>
 *
 * <p>테스트 환경에는 기본 LLM 설정과 RAG 서비스가 없어서 권한을 통과한 호출은 503(또는 500)으로 끝난다. 여기서는 "권한 검사에서 막혔는가"만 보므로 통과 쪽은
 * 401·403 이 아닌지로 판정한다. 정리는 ProjectRoleAuthorizationIntegrationTest 와 같이 실제 커밋 후 명시적 삭제로 한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class LlmAndCharterProjectAuthzIntegrationTest extends AbstractTestNGSpringContextTests {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private UserDetailsService userDetailsService;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ProjectUserRepository projectUserRepository;
  @Autowired private TestCharterRepository testCharterRepository;
  @Autowired private PlatformTransactionManager txManager;

  private static final String DEV = "ict444_it_dev";
  private static final String TESTER = "ict444_it_tester";
  private static final String VIEWER = "ict444_it_viewer";
  private static final String OUTSIDER = "ict444_it_outsider";
  private static final String MANAGER_MEMBER = "ict444_it_mgr_member";
  private static final String MANAGER_OUTSIDER = "ict444_it_mgr_outsider";
  private static final String RATE_USER = "ict444_it_rate";

  private final Set<String> createdUserIds = new HashSet<>();
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, String> tokens = new LinkedHashMap<>();

  private Project project;

  @BeforeMethod
  void setUp() {
    ensureUser(DEV, "TESTER");
    ensureUser(TESTER, "TESTER");
    ensureUser(VIEWER, "TESTER");
    ensureUser(OUTSIDER, "TESTER");
    ensureUser(MANAGER_MEMBER, "MANAGER");
    ensureUser(MANAGER_OUTSIDER, "MANAGER");
    ensureUser(RATE_USER, "TESTER");

    String uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    project = new Project();
    project.setCode("I444" + uid);
    project.setName("ICT-444 Project " + uid);
    project = projectRepository.save(project);

    grant(users.get(DEV), ProjectRole.DEVELOPER);
    grant(users.get(TESTER), ProjectRole.TESTER);
    grant(users.get(VIEWER), ProjectRole.VIEWER);
    grant(users.get(MANAGER_MEMBER), ProjectRole.TESTER);
    grant(users.get(RATE_USER), ProjectRole.TESTER);
  }

  @AfterMethod(alwaysRun = true)
  void tearDownMethod() {
    if (project == null) {
      return;
    }
    String pid = project.getId();
    new TransactionTemplate(txManager)
        .executeWithoutResult(
            status -> {
              testCharterRepository.deleteAll(
                  testCharterRepository.findByProjectIdOrderByCreatedAtDesc(pid));
              projectUserRepository.deleteByProjectId(pid);
              projectRepository.deleteById(pid);
            });
    project = null;
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

  // ============================ Helpers ============================

  private void ensureUser(String username, String systemRole) {
    User u =
        userRepository
            .findByUsername(username)
            .orElseGet(
                () -> {
                  User created = new User();
                  created.setUsername(username);
                  created.setEmail(username + "@ict444-it.local");
                  created.setName(username);
                  created.setPassword(passwordEncoder.encode("pw123456"));
                  created.setRole(systemRole);
                  User saved = userRepository.save(created);
                  createdUserIds.add(saved.getId());
                  return saved;
                });
    users.put(username, u);
    UserDetails details = userDetailsService.loadUserByUsername(username);
    tokens.put(username, "Bearer " + jwtTokenUtil.generateAccessToken(details));
  }

  private void grant(User u, ProjectRole role) {
    ProjectUser pu = new ProjectUser();
    pu.setUser(u);
    pu.setProject(project);
    pu.setRoleInProject(role);
    projectUserRepository.save(pu);
  }

  private MockHttpServletResponse postJson(String username, String path, Object body)
      throws Exception {
    return mockMvc
        .perform(
            post(path)
                .header("Authorization", tokens.get(username))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andReturn()
        .getResponse();
  }

  private MockHttpServletResponse createCharter(String username, String createdByInBody)
      throws Exception {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("projectId", project.getId());
    body.put("title", "차터 by " + username);
    body.put("mission", "로그인 실패 흐름 탐색");
    // 서버는 이 값을 쓰지 않아야 한다. 남의 이름을 넣어 본다.
    body.put("createdBy", createdByInBody);
    return postJson(username, "/api/charters", body);
  }

  private int updateCharterStatus(String username, String charterId) throws Exception {
    return mockMvc
        .perform(
            put("/api/charters/" + charterId)
                .header("Authorization", tokens.get(username))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("title", "고친 제목"))))
        .andReturn()
        .getResponse()
        .getStatus();
  }

  private Map<String, Object> generateMetaBody(String projectId) {
    Map<String, Object> body = new LinkedHashMap<>();
    if (projectId != null) {
      body.put("projectId", projectId);
    }
    body.put("steps", List.of(Map.of("description", "로그인", "expectedResult", "대시보드가 열린다")));
    return body;
  }

  private Map<String, Object> advancedSearchBody(String projectId) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("queryText", "로그인");
    if (projectId != null) {
      body.put("projectId", projectId);
    }
    body.put("searchMethod", "hybrid_rerank");
    return body;
  }

  private static void assertPassedAuthorization(int status, String label) {
    Assert.assertTrue(status != 401 && status != 403, label + " 는 권한 검사를 통과해야 한다, 실제=" + status);
  }

  // ============================ 차터 ============================

  @Test
  void createCharter_memberWhoCanRunSessions_allowed_andAuthorIsPrincipal() throws Exception {
    MockHttpServletResponse resp = createCharter(TESTER, "someone-else");
    Assert.assertEquals(resp.getStatus(), 201, "프로젝트 TESTER 는 차터를 만들 수 있다");

    JsonNode json = objectMapper.readTree(resp.getContentAsString());
    Assert.assertEquals(json.path("createdBy").asText(), TESTER, "작성자는 본문 값이 아니라 로그인한 사용자여야 한다");
    Assert.assertEquals(
        testCharterRepository.findById(json.path("id").asText()).orElseThrow().getCreatedBy(),
        TESTER,
        "저장된 작성자도 로그인한 사용자여야 한다");

    Assert.assertEquals(createCharter(DEV, null).getStatus(), 201, "DEVELOPER 는 차터를 만들 수 있다");
  }

  @Test
  void createCharter_viewerAndOutsider_forbidden() throws Exception {
    Assert.assertEquals(createCharter(VIEWER, VIEWER).getStatus(), 403, "VIEWER 는 차터를 만들 수 없다");
    Assert.assertEquals(
        createCharter(OUTSIDER, OUTSIDER).getStatus(), 403, "소속되지 않은 프로젝트에는 차터를 만들 수 없다");
    Assert.assertEquals(
        createCharter(MANAGER_OUTSIDER, MANAGER_OUTSIDER).getStatus(),
        403,
        "시스템 MANAGER 라도 소속되지 않은 프로젝트에는 차터를 만들 수 없다");
  }

  @Test
  void updateCharter_systemManagerOutsideProject_forbidden_member_allowed() throws Exception {
    String charterId =
        objectMapper.readTree(createCharter(TESTER, null).getContentAsString()).path("id").asText();

    Assert.assertEquals(
        updateCharterStatus(MANAGER_OUTSIDER, charterId), 403, "소속되지 않은 시스템 MANAGER 는 차터를 고칠 수 없다");
    Assert.assertEquals(
        updateCharterStatus(MANAGER_MEMBER, charterId), 200, "프로젝트에 소속된 시스템 MANAGER 는 고칠 수 있다");
    Assert.assertEquals(
        updateCharterStatus(TESTER, charterId), 403, "시스템 역할 제한(ADMIN·MANAGER)은 그대로 유지된다");
  }

  // ============================ LLM 호출 ============================

  @Test
  void generateMeta_requiresEditPermissionOnBodyProject() throws Exception {
    String pid = project.getId();
    assertPassedAuthorization(
        postJson(DEV, "/api/testcases/ai/generate-meta", generateMetaBody(pid)).getStatus(),
        "편집 권한이 있는 DEVELOPER 의 메타 생성");
    Assert.assertEquals(
        postJson(TESTER, "/api/testcases/ai/generate-meta", generateMetaBody(pid)).getStatus(),
        403,
        "편집 권한이 없는 TESTER 는 메타 생성을 부를 수 없다");
    Assert.assertEquals(
        postJson(OUTSIDER, "/api/testcases/ai/generate-meta", generateMetaBody(pid)).getStatus(),
        403,
        "소속되지 않은 프로젝트로는 메타 생성을 부를 수 없다");
    Assert.assertEquals(
        postJson(DEV, "/api/testcases/ai/generate-meta", generateMetaBody(null)).getStatus(),
        403,
        "projectId 가 없는 메타 생성 요청은 거부한다");
  }

  @Test
  void advancedSearch_requiresAccessToRequestedProject() throws Exception {
    String pid = project.getId();
    assertPassedAuthorization(
        postJson(VIEWER, "/api/rag/search/advanced", advancedSearchBody(pid)).getStatus(),
        "프로젝트 멤버(VIEWER)의 고급 검색");
    Assert.assertEquals(
        postJson(OUTSIDER, "/api/rag/search/advanced", advancedSearchBody(pid)).getStatus(),
        403,
        "소속되지 않은 프로젝트로는 고급 검색을 할 수 없다");
    assertPassedAuthorization(
        postJson(OUTSIDER, "/api/rag/search/advanced", advancedSearchBody(null)).getStatus(),
        "projectId 없는 고급 검색(공통 문서만 대상)");
  }

  @Test
  void advancedSearch_rateLimitedPerUser() throws Exception {
    // 기본 한도는 사용자·동작별 분당 20회다(app.ratelimit.llm.limit-per-minute).
    String pid = project.getId();
    for (int i = 0; i < 20; i++) {
      int status =
          postJson(RATE_USER, "/api/rag/search/advanced", advancedSearchBody(pid)).getStatus();
      Assert.assertNotEquals(status, 429, (i + 1) + "번째 호출은 한도 안이다");
    }
    Assert.assertEquals(
        postJson(RATE_USER, "/api/rag/search/advanced", advancedSearchBody(pid)).getStatus(),
        429,
        "한도를 넘은 호출은 429 로 거부한다");
  }
}
