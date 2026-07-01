package com.testcase.testcasemanagement.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
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
 * 프로젝트 역할(ProjectRole) 기반 인가를 HTTP end-to-end로 검증하는 통합 테스트.
 *
 * <p>검증 대상(이 세션의 인가 하드닝 결과):
 *
 * <ul>
 *   <li>읽기(GET /api/testcases/project/{id}): 프로젝트 멤버는 어떤 롤이든 200, 비멤버는 403
 *   <li>편집(POST /api/testcases): 편집 롤(PM/DEV 등)만 201, VIEWER/TESTER는 403
 *   <li>결과 기록(POST /api/test-executions/{id}/results): 편집 롤 + TESTER는 200, VIEWER는 403
 *   <li>전체 트리(GET /api/testcases/tree): 시스템 ADMIN만 200, 그 외(프로젝트 멤버 포함)는 403
 *   <li>회원가입(POST /api/auth/register): 요청 바디의 role을 무시하고 항상 TESTER로 고정
 * </ul>
 *
 * <p><b>Setup/Teardown 전략(명시적 정리):</b> {@code @Transactional} 롤백에 의존하지 않고 실제 커밋 + 명시적 삭제를 사용한다.
 *
 * <ul>
 *   <li>사용자는 <b>get-or-create</b> — 이미 존재하면 재사용(생성하지 않음), 없을 때만 생성한다. 그리고 <b>이 테스트가 직접 생성한
 *       사용자만</b> {@code @AfterClass}에서 삭제한다(기존 사용자는 건드리지 않는다).
 *   <li>프로젝트/실행/테스트케이스/결과/멤버십 등 각 테스트에서 만든 데이터는 {@code @AfterMethod}에서 FK 안전 순서로 삭제한다.
 *   <li>회원가입 테스트가 생성한 사용자도 추적하여 정리한다.
 * </ul>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectRoleAuthorizationIntegrationTest extends AbstractTestNGSpringContextTests {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
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

  // 이 테스트가 사용하는 고정 사용자명 (get-or-create 대상). 실제 운영 계정과 충돌하지 않도록 전용 접두사 사용.
  private static final String PM = "authz_it_pm";
  private static final String DEV = "authz_it_dev";
  private static final String TESTER = "authz_it_tester";
  private static final String VIEWER = "authz_it_viewer";
  private static final String OUTSIDER = "authz_it_outsider";
  private static final String SYSADMIN = "authz_it_sysadmin";

  // 이 테스트가 "직접 생성한" 사용자 ID만 담는다 → @AfterClass에서 이것만 삭제(기존 사용자 보존).
  private final Set<String> createdUserIds = new HashSet<>();
  // 회원가입 테스트가 생성한 사용자 ID (매 테스트 후 정리).
  private final Set<String> registrationUserIds = new HashSet<>();

  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, String> tokens = new LinkedHashMap<>();

  private Project project;
  private TestExecution execution;
  private String resultTargetCaseId;

  // ============================ Setup / Teardown ============================

  @BeforeMethod
  void setUp() {
    // 1) 사용자 get-or-create (없을 때만 생성, 생성한 것만 추적)
    ensureUser(PM, "TESTER");
    ensureUser(DEV, "TESTER");
    ensureUser(TESTER, "TESTER");
    ensureUser(VIEWER, "TESTER");
    ensureUser(OUTSIDER, "TESTER");
    ensureUser(SYSADMIN, "ADMIN");

    // 2) 프로젝트 생성 (독립 프로젝트 — 조직 멤버십 우회 없음)
    String uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    project = new Project();
    project.setCode("AZ" + uid);
    project.setName("AuthzProject " + uid);
    project = projectRepository.save(project);

    // 3) 프로젝트에 롤별로 초대 (OUTSIDER/SYSADMIN은 멤버로 넣지 않음)
    grant(users.get(PM), ProjectRole.PROJECT_MANAGER);
    grant(users.get(DEV), ProjectRole.DEVELOPER);
    grant(users.get(TESTER), ProjectRole.TESTER);
    grant(users.get(VIEWER), ProjectRole.VIEWER);

    // 4) 결과 기록 테스트용 실행 + 대상 테스트케이스 시드
    execution = new TestExecution();
    execution.setName("Run " + uid);
    execution.setProject(project);
    execution.setStatus("INPROGRESS");
    execution = testExecutionRepository.save(execution);

    resultTargetCaseId = newCase("Login case " + uid).getId();
  }

  @AfterMethod
  void tearDownMethod() {
    // 이 테스트에서 만든 프로젝트 하위 데이터 전부 삭제 (FK 안전 순서). @Modifying 쿼리라 트랜잭션 필요.
    if (project != null) {
      String pid = project.getId();
      new TransactionTemplate(txManager)
          .executeWithoutResult(
              status -> {
                testResultRepository.deleteByProjectId(pid); // 실행에 매달린 결과 먼저
                testExecutionRepository.deleteByProjectId(pid);
                testCaseRepository.deleteByProjectId(pid);
                projectUserRepository.deleteByProjectId(pid);
                projectRepository.deleteById(pid);
              });
      project = null;
    }
    // 회원가입 테스트가 만든 사용자 정리
    if (!registrationUserIds.isEmpty()) {
      new TransactionTemplate(txManager)
          .executeWithoutResult(
              status -> registrationUserIds.forEach(userRepository::deleteById));
      registrationUserIds.clear();
    }
  }

  @AfterClass(alwaysRun = true)
  void tearDownClass() {
    // 이 테스트가 직접 생성한 사용자만 삭제한다(기존 사용자는 보존).
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

  /** username이 없으면 생성(생성 시 createdUserIds에 기록), 있으면 재사용. 토큰도 준비한다. */
  private void ensureUser(String username, String systemRole) {
    User u =
        userRepository
            .findByUsername(username)
            .orElseGet(
                () -> {
                  User created = new User();
                  created.setUsername(username);
                  created.setEmail(username + "@authz-it.local");
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

  private TestCase newCase(String name) {
    TestCase tc = new TestCase();
    tc.setProject(project);
    tc.setName(name);
    tc.setType("testcase");
    tc.setDisplayOrder(1);
    return testCaseRepository.save(tc);
  }

  private int readStatus(String username) throws Exception {
    return mockMvc
        .perform(
            get("/api/testcases/project/" + project.getId())
                .header("Authorization", tokens.get(username)))
        .andReturn()
        .getResponse()
        .getStatus();
  }

  private int createCaseStatus(String username) throws Exception {
    String body =
        objectMapper.writeValueAsString(
            Map.of("name", "New by " + username, "type", "testcase", "projectId", project.getId()));
    return mockMvc
        .perform(
            post("/api/testcases")
                .header("Authorization", tokens.get(username))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andReturn()
        .getResponse()
        .getStatus();
  }

  private int recordResultStatus(String username) throws Exception {
    String body =
        objectMapper.writeValueAsString(Map.of("testCaseId", resultTargetCaseId, "result", "PASS"));
    return mockMvc
        .perform(
            post("/api/test-executions/" + execution.getId() + "/results")
                .header("Authorization", tokens.get(username))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andReturn()
        .getResponse()
        .getStatus();
  }

  // ============================ Tests ============================

  @Test
  void read_anyProjectMember_allowed_nonMember_forbidden() throws Exception {
    Assert.assertEquals(readStatus(PM), 200, "PM 조회 가능");
    Assert.assertEquals(readStatus(DEV), 200, "DEVELOPER 조회 가능");
    Assert.assertEquals(readStatus(TESTER), 200, "TESTER 조회 가능");
    Assert.assertEquals(readStatus(VIEWER), 200, "VIEWER 조회 가능");
    Assert.assertEquals(readStatus(OUTSIDER), 403, "비멤버는 조회 불가(403)");
  }

  @Test
  void edit_editorRoles_allowed_viewerAndTester_forbidden() throws Exception {
    Assert.assertEquals(createCaseStatus(PM), 201, "PM은 테스트케이스 생성 가능");
    Assert.assertEquals(createCaseStatus(DEV), 201, "DEVELOPER는 생성 가능");
    Assert.assertEquals(createCaseStatus(TESTER), 403, "TESTER는 편집 불가(403)");
    Assert.assertEquals(createCaseStatus(VIEWER), 403, "VIEWER는 편집 불가(403)");
    Assert.assertEquals(createCaseStatus(OUTSIDER), 403, "비멤버는 편집 불가(403)");
  }

  @Test
  void recordResult_editorsAndTester_allowed_viewer_forbidden() throws Exception {
    Assert.assertEquals(recordResultStatus(PM), 200, "PM은 결과 기록 가능");
    Assert.assertEquals(recordResultStatus(DEV), 200, "DEVELOPER는 결과 기록 가능");
    Assert.assertEquals(recordResultStatus(TESTER), 200, "TESTER는 결과 기록 가능(편집과 달리 허용)");
    Assert.assertEquals(recordResultStatus(VIEWER), 403, "VIEWER는 결과 기록 불가(403)");
    Assert.assertEquals(recordResultStatus(OUTSIDER), 403, "비멤버는 결과 기록 불가(403)");
  }

  @Test
  void fullTree_systemAdminOnly() throws Exception {
    int pmStatus =
        mockMvc
            .perform(get("/api/testcases/tree").header("Authorization", tokens.get(PM)))
            .andReturn()
            .getResponse()
            .getStatus();
    Assert.assertEquals(pmStatus, 403, "프로젝트 PM이라도 시스템 전체 트리 조회는 불가(403)");

    int adminStatus =
        mockMvc
            .perform(get("/api/testcases/tree").header("Authorization", tokens.get(SYSADMIN)))
            .andReturn()
            .getResponse()
            .getStatus();
    Assert.assertEquals(adminStatus, 200, "시스템 ADMIN만 전체 트리 조회 가능(200)");
  }

  @Test
  void registration_ignoresRequestedRole_forcesTester() throws Exception {
    String uid = UUID.randomUUID().toString().substring(0, 8);
    String username = "authz_it_reg_" + uid;
    String body =
        objectMapper.writeValueAsString(
            Map.of(
                "username", username,
                "email", username + "@authz-it.local",
                "name", "Reg " + uid,
                "password", "Passw0rd!",
                "role", "ADMIN")); // 악의적으로 ADMIN 요청

    int status =
        mockMvc
            .perform(
                post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andReturn()
            .getResponse()
            .getStatus();
    Assert.assertEquals(status, 200, "회원가입 성공(200)");

    User created = userRepository.findByUsername(username).orElseThrow();
    registrationUserIds.add(created.getId()); // teardown 대상 등록
    Assert.assertEquals(
        created.getRole(), "TESTER", "요청 role=ADMIN을 무시하고 서버가 TESTER로 강제해야 함");
  }
}
