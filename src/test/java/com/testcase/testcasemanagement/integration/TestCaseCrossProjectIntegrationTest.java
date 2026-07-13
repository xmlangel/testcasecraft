package com.testcase.testcasemanagement.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.Map;
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
import org.springframework.transaction.annotation.Transactional;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 크로스 프로젝트 이동/복사의 HTTP + 권한 롤 통합 검증 (JWT + MockMvc + 실제 ProjectSecurityService).
 *
 * <p>{@code hasEditRole}은 시스템 ADMIN을 우회하지 않고 project_users 롤만 본다. 따라서 출발/대상 프로젝트 각각에 대해 실제 {@link
 * ProjectUser} 롤 행으로 권한을 구성한 뒤, 이동 성공(200)과 권한 부족(403)을 검증한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class TestCaseCrossProjectIntegrationTest extends AbstractTestNGSpringContextTests {

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

  private String uid;
  private User mover;
  private String moverToken;
  private Project source;
  private Project target;
  private TestCase destFolder;

  @BeforeMethod
  void setUp() {
    uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

    mover = new User();
    mover.setUsername("mover_" + uid);
    mover.setEmail("mover_" + uid + "@test.com");
    mover.setName("Mover " + uid);
    mover.setPassword(passwordEncoder.encode("pw123456"));
    mover.setRole("USER");
    mover = userRepository.save(mover);

    UserDetails details = userDetailsService.loadUserByUsername(mover.getUsername());
    moverToken = "Bearer " + jwtTokenUtil.generateAccessToken(details);

    source = newProject("SRC" + uid);
    target = newProject("DST" + uid);
    destFolder = newCase(target, "DEST", "folder", null, null);
  }

  private Project newProject(String code) {
    Project p = new Project();
    p.setCode(code.length() > 10 ? code.substring(0, 10) : code);
    p.setName("Project " + code);
    return projectRepository.save(p);
  }

  private void grant(User u, Project p, ProjectRole role) {
    ProjectUser pu = new ProjectUser();
    pu.setUser(u);
    pu.setProject(p);
    pu.setRoleInProject(role);
    projectUserRepository.save(pu);
  }

  private TestCase newCase(Project p, String name, String type, String parentId, Integer seq) {
    TestCase tc = new TestCase();
    tc.setProject(p);
    tc.setName(name);
    tc.setType(type);
    tc.setParentId(parentId);
    tc.setDisplayOrder(1);
    tc.setSequentialId(seq);
    return testCaseRepository.save(tc);
  }

  private String moveBody(List<String> ids, String targetParentId) throws Exception {
    return objectMapper.writeValueAsString(
        Map.of("ids", ids, "targetProjectId", target.getId(), "targetParentId", targetParentId));
  }

  // ============================ Tests ============================

  @Test
  void move_withEditRoleOnBothProjects_succeeds_andCarriesResults() throws Exception {
    grant(mover, source, ProjectRole.PROJECT_MANAGER);
    grant(mover, target, ProjectRole.PROJECT_MANAGER);

    TestCase t1 = newCase(source, "Login test", "testcase", null, 1);
    TestExecution exec = new TestExecution();
    exec.setName("Run 1");
    exec.setProject(source);
    exec.setStatus("COMPLETED");
    exec = testExecutionRepository.save(exec);

    TestResult r = new TestResult();
    r.setTestCaseId(t1.getId());
    r.setTestExecution(exec);
    r.setResult("FAIL");
    r.setJiraIssueKey("BUG-" + uid);
    r = testResultRepository.save(r);
    String resultId = r.getId();

    mockMvc
        .perform(
            post("/api/testcases/cross-project/move")
                .header("Authorization", moverToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(moveBody(List.of(t1.getId()), destFolder.getId())))
        .andExpect(status().isOk());

    // 케이스가 대상 프로젝트로 이동
    TestCase moved = testCaseRepository.findById(t1.getId()).orElseThrow();
    Assert.assertEquals(moved.getProject().getId(), target.getId());
    Assert.assertEquals(moved.getParentId(), destFolder.getId());

    // 결과가 미러 실행을 통해 대상 프로젝트로 따라옴 + 버그 필드 보존
    TestResult movedResult = testResultRepository.findById(resultId).orElseThrow();
    Assert.assertEquals(movedResult.getTestExecution().getProject().getId(), target.getId());
    Assert.assertNotEquals(movedResult.getTestExecution().getId(), exec.getId());
    Assert.assertEquals(movedResult.getJiraIssueKey(), "BUG-" + uid);
    Assert.assertEquals(movedResult.getResult(), "FAIL");
  }

  @Test
  void move_withoutEditRoleOnTarget_returns403_andDoesNotMove() throws Exception {
    grant(mover, source, ProjectRole.PROJECT_MANAGER);
    grant(mover, target, ProjectRole.VIEWER); // 대상은 뷰어 → 편집 불가

    TestCase t1 = newCase(source, "Logout test", "testcase", null, 1);

    mockMvc
        .perform(
            post("/api/testcases/cross-project/move")
                .header("Authorization", moverToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(moveBody(List.of(t1.getId()), destFolder.getId())))
        .andExpect(status().isForbidden());

    // 권한 거부 시 출발 프로젝트에 그대로 남아야 함
    TestCase stay = testCaseRepository.findById(t1.getId()).orElseThrow();
    Assert.assertEquals(stay.getProject().getId(), source.getId());
  }

  @Test
  void copy_withEditRoleOnTarget_succeeds_andLeavesSourceUnchanged() throws Exception {
    grant(mover, source, ProjectRole.PROJECT_MANAGER);
    grant(mover, target, ProjectRole.DEVELOPER);

    TestCase t1 = newCase(source, "Signup test", "testcase", null, 1);

    mockMvc
        .perform(
            post("/api/testcases/cross-project/copy")
                .header("Authorization", moverToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(moveBody(List.of(t1.getId()), destFolder.getId())))
        .andExpect(status().isOk());

    // 원본은 출발 프로젝트에 그대로
    TestCase src = testCaseRepository.findById(t1.getId()).orElseThrow();
    Assert.assertEquals(src.getProject().getId(), source.getId());
    // 대상 프로젝트에 복제본이 1개 생김 (DEST 폴더 자식)
    List<TestCase> destChildren = testCaseRepository.findByParentId(destFolder.getId());
    Assert.assertEquals(destChildren.size(), 1);
    Assert.assertEquals(destChildren.get(0).getName(), "Signup test");
  }

  @Test
  void move_intoProjectRootWithExistingData_appendsLast_realDb() throws Exception {
    // 실제 Postgres에서 루트(parentId=null) 순서 버그 회귀 가드.
    // target 루트에는 이미 destFolder(displayOrder=1)가 있다. 케이스를 루트로 이동하면
    // 1로 충돌(중간 삽입)하지 않고 마지막(2)로 들어가야 한다.
    grant(mover, source, ProjectRole.PROJECT_MANAGER);
    grant(mover, target, ProjectRole.PROJECT_MANAGER);
    TestCase t1 = newCase(source, "Root move test", "testcase", null, 1);

    mockMvc
        .perform(
            post("/api/testcases/cross-project/move")
                .header("Authorization", moverToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("ids", List.of(t1.getId()), "targetProjectId", target.getId()))))
        .andExpect(status().isOk());

    TestCase moved = testCaseRepository.findById(t1.getId()).orElseThrow();
    Assert.assertEquals(moved.getProject().getId(), target.getId());
    Assert.assertNull(moved.getParentId(), "루트로 이동");
    Assert.assertTrue(
        moved.getDisplayOrder() > destFolder.getDisplayOrder(),
        "기존 루트 항목(destFolder order="
            + destFolder.getDisplayOrder()
            + ") 뒤로 들어가야 함: 실제="
            + moved.getDisplayOrder());
  }
}
