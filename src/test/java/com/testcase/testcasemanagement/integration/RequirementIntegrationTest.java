package com.testcase.testcasemanagement.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 요구사항 관리 API 를 실제 DB(PostgreSQL 컨테이너)·JWT·프로젝트 롤로 끝까지 돌려 본다.
 *
 * <p>문서 → 요구사항 → TC 연결 → 커버리지 → 플랜 리포트 → TC 쪽 연결 교체 → 문서 삭제 순서와, 역할별 인가(편집·조회 전용·비멤버)를 확인한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RequirementIntegrationTest extends AbstractTestNGSpringContextTests {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private UserDetailsService userDetailsService;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ProjectUserRepository projectUserRepository;
  @Autowired private TestCaseRepository testCaseRepository;
  @Autowired private TestPlanRepository testPlanRepository;
  @Autowired private TestExecutionRepository testExecutionRepository;
  @Autowired private TestResultRepository testResultRepository;

  private String uid;
  private Project projectA;
  private Project projectB;
  private String editorToken;
  private String viewerToken;
  private String outsiderToken;

  @BeforeMethod
  void setUp() {
    uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    projectA = newProject("RA" + uid);
    projectB = newProject("RB" + uid);
    editorToken = tokenFor(newUser("reqed_"), projectA, ProjectRole.CONTRIBUTOR);
    viewerToken = tokenFor(newUser("reqvw_"), projectA, ProjectRole.VIEWER);
    outsiderToken = tokenFor(newUser("reqout_"), null, null);
  }

  private User newUser(String prefix) {
    User u = new User();
    u.setUsername(prefix + uid);
    u.setEmail(prefix + uid + "@test.com");
    u.setName(prefix + uid);
    u.setPassword(passwordEncoder.encode("pw123456"));
    u.setRole("USER");
    return userRepository.save(u);
  }

  private String tokenFor(User u, Project p, ProjectRole role) {
    if (p != null) {
      ProjectUser pu = new ProjectUser();
      pu.setUser(u);
      pu.setProject(p);
      pu.setRoleInProject(role);
      projectUserRepository.save(pu);
    }
    return "Bearer "
        + jwtTokenUtil.generateAccessToken(userDetailsService.loadUserByUsername(u.getUsername()));
  }

  private Project newProject(String code) {
    Project p = new Project();
    p.setCode(code.length() > 10 ? code.substring(0, 10) : code);
    p.setName("Project " + code);
    return projectRepository.save(p);
  }

  private TestCase newCase(Project p, String name) {
    TestCase tc = new TestCase();
    tc.setProject(p);
    tc.setName(name);
    tc.setType("testcase");
    tc.setDisplayOrder(1);
    return testCaseRepository.save(tc);
  }

  private MockHttpServletResponse call(MockHttpServletRequestBuilder req, String token, Object body)
      throws Exception {
    req.header("Authorization", token);
    if (body != null) {
      req.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body));
    }
    return mockMvc.perform(req).andReturn().getResponse();
  }

  private JsonNode ok(MockHttpServletRequestBuilder req, String token, Object body, int expected)
      throws Exception {
    MockHttpServletResponse resp = call(req, token, body);
    Assert.assertEquals(resp.getStatus(), expected, resp.getContentAsString());
    String text = resp.getContentAsString();
    return text.isEmpty() ? null : objectMapper.readTree(text);
  }

  private Map<String, Object> requirementBody(
      String specId, String docId, String status, int expectedCoverage) {
    Map<String, Object> body = new HashMap<>();
    body.put("projectId", projectA.getId());
    body.put("specId", specId);
    body.put("docId", docId);
    body.put("title", "요구사항 " + docId);
    body.put("status", status);
    body.put("expectedCoverage", expectedCoverage);
    return body;
  }

  private static JsonNode find(JsonNode items, String docId) {
    for (JsonNode item : items) {
      if (docId.equals(item.get("docId").asText())) {
        return item;
      }
    }
    throw new AssertionError("항목 없음: " + docId);
  }

  @Test
  public void fullFlow_specRequirementLinkCoverageReportAndDelete() throws Exception {
    // 문서
    JsonNode spec =
        ok(
            post("/api/requirement-specs"),
            editorToken,
            Map.of("projectId", projectA.getId(), "docId", "SRS-1", "title", "로그인"),
            201);
    String specId = spec.get("id").asText();

    // 요구사항 3건: 필요 2건, 테스트 불가, 미연결
    String req1 =
        ok(
                post("/api/requirements"),
                editorToken,
                requirementBody(specId, "REQ-1", "VALID", 2),
                201)
            .get("id")
            .asText();
    ok(
        post("/api/requirements"),
        editorToken,
        requirementBody(specId, "REQ-2", "NOT_TESTABLE", 1),
        201);
    String req3 =
        ok(
                post("/api/requirements"),
                editorToken,
                requirementBody(specId, "REQ-3", "VALID", 1),
                201)
            .get("id")
            .asText();

    // 같은 문서 ID 는 거부
    Assert.assertEquals(
        call(post("/api/requirements"), editorToken, requirementBody(specId, "REQ-1", "VALID", 1))
            .getStatus(),
        400);

    TestCase tc1 = newCase(projectA, "로그인 성공");
    TestCase tc2 = newCase(projectA, "로그인 실패");
    TestCase foreign = newCase(projectB, "다른 프로젝트 케이스");

    // 연결: 같은 프로젝트 TC 만
    JsonNode linked =
        ok(
            post("/api/requirements/" + req1 + "/test-cases"),
            editorToken,
            Map.of("ids", List.of(tc1.getId())),
            200);
    Assert.assertEquals(linked.get("linkedTestCaseIds").size(), 1);
    // 목록 응답에도 커버리지 판정이 실린다(화면이 같은 규칙을 다시 계산하지 않도록)
    Assert.assertEquals(linked.get("coverage").asText(), "PARTIAL");
    Assert.assertEquals(
        call(
                post("/api/requirements/" + req1 + "/test-cases"),
                editorToken,
                Map.of("ids", List.of(foreign.getId())))
            .getStatus(),
        400);

    // 커버리지: REQ-1 부분(1/2), REQ-2 제외, REQ-3 미연결
    JsonNode coverage =
        ok(
            get("/api/projects/" + projectA.getId() + "/requirements/coverage"),
            editorToken,
            null,
            200);
    Assert.assertEquals(find(coverage.get("items"), "REQ-1").get("coverage").asText(), "PARTIAL");
    Assert.assertEquals(find(coverage.get("items"), "REQ-2").get("coverage").asText(), "EXCLUDED");
    Assert.assertEquals(find(coverage.get("items"), "REQ-3").get("coverage").asText(), "UNCOVERED");
    Assert.assertEquals(coverage.get("testable").asInt(), 2);
    Assert.assertEquals(coverage.get("covered").asInt(), 0);

    ok(
        post("/api/requirements/" + req1 + "/test-cases"),
        editorToken,
        Map.of("ids", List.of(tc2.getId())),
        200);
    coverage =
        ok(
            get("/api/projects/" + projectA.getId() + "/requirements/coverage"),
            editorToken,
            null,
            200);
    Assert.assertEquals(find(coverage.get("items"), "REQ-1").get("coverage").asText(), "COVERED");
    Assert.assertEquals(coverage.get("coverageRate").asDouble(), 50.0);

    // 플랜·실행·결과: tc1 은 FAIL 뒤에 PASS(최신), tc2 는 BLOCKED → REQ-1 은 BLOCKED
    TestPlan plan = new TestPlan();
    plan.setName("플랜 " + uid);
    plan.setProject(projectA);
    plan.setTestCaseIds(new ArrayList<>(List.of(tc1.getId(), tc2.getId())));
    plan = testPlanRepository.save(plan);
    TestExecution older = newExecution(plan, "1차");
    TestExecution newer = newExecution(plan, "2차");
    LocalDateTime t0 = LocalDateTime.now().minusHours(2);
    newResult(older, tc1, "FAIL", t0);
    newResult(newer, tc1, "PASS", t0.plusHours(1));
    newResult(newer, tc2, "BLOCKED", t0.plusHours(1));

    JsonNode report =
        ok(
            get("/api/projects/" + projectA.getId() + "/requirements/report")
                .param("testPlanId", plan.getId()),
            editorToken,
            null,
            200);
    Assert.assertEquals(find(report.get("items"), "REQ-1").get("verdict").asText(), "BLOCKED");
    Assert.assertEquals(find(report.get("items"), "REQ-3").get("verdict").asText(), "NOT_IN_PLAN");
    Assert.assertEquals(report.get("counts").get("BLOCKED").asInt(), 1);
    // 테스트 불가 요구사항은 리포트에서 빠진다
    Assert.assertEquals(report.get("items").size(), 2);

    // 실행 하나만 고르면 그 실행 결과로 판정한다: 1차에는 tc1 FAIL 만 있다
    JsonNode olderReport =
        ok(
            get("/api/projects/" + projectA.getId() + "/requirements/report")
                .param("executionId", older.getId()),
            editorToken,
            null,
            200);
    Assert.assertEquals(find(olderReport.get("items"), "REQ-1").get("verdict").asText(), "FAIL");

    // TC 쪽 교체: tc1 을 REQ-3 에만 연결
    JsonNode forCase =
        ok(
            put("/api/requirements/by-test-case/" + tc1.getId()),
            editorToken,
            Map.of("ids", List.of(req3)),
            200);
    Assert.assertEquals(forCase.size(), 1);
    Assert.assertEquals(forCase.get(0).get("docId").asText(), "REQ-3");
    JsonNode req1Now = ok(get("/api/requirements/" + req1), editorToken, null, 200);
    Assert.assertEquals(req1Now.get("linkedTestCaseIds").size(), 1);

    // 문서 삭제: 요구사항과 연결이 함께 사라진다
    ok(delete("/api/requirement-specs/" + specId), editorToken, null, 204);
    JsonNode remaining =
        ok(get("/api/projects/" + projectA.getId() + "/requirements"), editorToken, null, 200);
    Assert.assertEquals(remaining.size(), 0);
    JsonNode tcLinks =
        ok(get("/api/requirements/by-test-case/" + tc1.getId()), editorToken, null, 200);
    Assert.assertEquals(tcLinks.size(), 0);
  }

  @Test
  public void authorization_viewerReadsOnly_outsiderDenied() throws Exception {
    JsonNode spec =
        ok(
            post("/api/requirement-specs"),
            editorToken,
            Map.of("projectId", projectA.getId(), "docId", "SRS-A", "title", "권한"),
            201);

    ok(get("/api/projects/" + projectA.getId() + "/requirement-specs"), viewerToken, null, 200);
    Assert.assertEquals(
        call(
                post("/api/requirement-specs"),
                viewerToken,
                Map.of("projectId", projectA.getId(), "docId", "SRS-B", "title", "x"))
            .getStatus(),
        403);
    Assert.assertEquals(
        call(delete("/api/requirement-specs/" + spec.get("id").asText()), viewerToken, null)
            .getStatus(),
        403);

    Assert.assertEquals(
        call(get("/api/projects/" + projectA.getId() + "/requirements"), outsiderToken, null)
            .getStatus(),
        403);
    Assert.assertEquals(
        call(
                get("/api/projects/" + projectA.getId() + "/requirements/coverage"),
                outsiderToken,
                null)
            .getStatus(),
        403);
  }

  @Test
  public void relations_directionCycleDuplicateAndCleanup() throws Exception {
    String specId =
        ok(
                post("/api/requirement-specs"),
                editorToken,
                Map.of("projectId", projectA.getId(), "docId", "SRS-R", "title", "관계"),
                201)
            .get("id")
            .asText();
    String parent =
        ok(post("/api/requirements"), editorToken, requirementBody(specId, "R-1", "VALID", 1), 201)
            .get("id")
            .asText();
    String child =
        ok(post("/api/requirements"), editorToken, requirementBody(specId, "R-2", "VALID", 1), 201)
            .get("id")
            .asText();
    String other =
        ok(post("/api/requirements"), editorToken, requirementBody(specId, "R-3", "VALID", 1), 201)
            .get("id")
            .asText();

    // 상위·하위: 양쪽에서 방향이 반대로 보인다
    JsonNode fromParent =
        ok(
            post("/api/requirements/" + parent + "/relations"),
            editorToken,
            Map.of("targetId", child, "type", "PARENT_OF"),
            200);
    Assert.assertEquals(fromParent.get(0).get("direction").asText(), "OUTGOING");
    JsonNode fromChild =
        ok(get("/api/requirements/" + child + "/relations"), editorToken, null, 200);
    Assert.assertEquals(fromChild.get(0).get("direction").asText(), "INCOMING");
    Assert.assertEquals(fromChild.get(0).get("otherDocId").asText(), "R-1");

    // 순환·자기 자신·중복은 400
    Assert.assertEquals(
        call(
                post("/api/requirements/" + child + "/relations"),
                editorToken,
                Map.of("targetId", parent, "type", "PARENT_OF"))
            .getStatus(),
        400);
    Assert.assertEquals(
        call(
                post("/api/requirements/" + parent + "/relations"),
                editorToken,
                Map.of("targetId", parent, "type", "RELATED_TO"))
            .getStatus(),
        400);
    ok(
        post("/api/requirements/" + parent + "/relations"),
        editorToken,
        Map.of("targetId", other, "type", "RELATED_TO"),
        200);
    // 관련은 방향이 없어 반대쪽에서 다시 걸어도 중복이다
    Assert.assertEquals(
        call(
                post("/api/requirements/" + other + "/relations"),
                editorToken,
                Map.of("targetId", parent, "type", "RELATED_TO"))
            .getStatus(),
        400);

    // 조회 전용은 관계를 걸 수 없다
    Assert.assertEquals(
        call(
                post("/api/requirements/" + other + "/relations"),
                viewerToken,
                Map.of("targetId", child, "type", "DEPENDS_ON"))
            .getStatus(),
        403);

    // 관계도용 프로젝트 전체 조회: 지금까지 건 2건, 비멤버는 403
    JsonNode all =
        ok(
            get("/api/projects/" + projectA.getId() + "/requirement-relations"),
            viewerToken,
            null,
            200);
    Assert.assertEquals(all.size(), 2);
    Assert.assertEquals(
        call(
                get("/api/projects/" + projectA.getId() + "/requirement-relations"),
                outsiderToken,
                null)
            .getStatus(),
        403);

    // 요구사항을 지우면 그 요구사항이 걸린 관계도 사라진다
    ok(delete("/api/requirements/" + child), editorToken, null, 204);
    JsonNode afterDelete =
        ok(get("/api/requirements/" + parent + "/relations"), editorToken, null, 200);
    Assert.assertEquals(afterDelete.size(), 1);
    Assert.assertEquals(afterDelete.get(0).get("type").asText(), "RELATED_TO");
  }

  private TestExecution newExecution(TestPlan plan, String name) {
    TestExecution execution = new TestExecution();
    execution.setName(name + " " + uid);
    execution.setTestPlanId(plan.getId());
    execution.setProject(projectA);
    execution.setStatus("COMPLETED");
    return testExecutionRepository.save(execution);
  }

  private void newResult(TestExecution execution, TestCase tc, String result, LocalDateTime at) {
    TestResult r = new TestResult();
    r.setTestExecution(execution);
    r.setTestCaseId(tc.getId());
    r.setResult(result);
    r.setExecutedAt(at);
    testResultRepository.save(r);
  }
}
