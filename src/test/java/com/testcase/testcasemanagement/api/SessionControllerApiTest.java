package com.testcase.testcasemanagement.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SessionControllerApiTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private Project project;

    @BeforeMethod
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        project = new Project();
        project.setCode("SBTM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        project.setName("SBTM API 프로젝트");
        project.setDescription("세션 API 테스트용 프로젝트");
        project = projectRepository.save(project);
    }

    @Test
    @WithMockUser(username = "tester", roles = {"USER"})
    public void createAndGetSession() throws Exception {
        String charterId = createCharter("로그인 에러 탐색", "로그인 실패/복구 동작 탐색");

        Map<String, Object> request = buildRequest(
                charterId,
                "tester-1",
                "lead-1",
                "kim.tester",
                "park.lead",
                75,
                70,
                20,
                10,
                "macOS + Chrome",
                "1.0.41",
                List.of("exploratory", "risk-based"),
                List.of("auth", "session")
        );

        MvcResult createResult = mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.projectId", is(project.getId())))
                .andExpect(jsonPath("$.charterId", is(charterId)))
                .andExpect(jsonPath("$.charterSnapshotTitle", is("로그인 에러 탐색")))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn();

        String sessionId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("id")
                .asText();

        mockMvc.perform(get("/api/sessions/{id}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sessionId)))
                .andExpect(jsonPath("$.projectId", is(project.getId())))
                .andExpect(jsonPath("$.strategyTags", hasSize(2)));
    }

    @Test
    @WithMockUser(username = "tester", roles = {"USER"})
    public void lifecycleStartPauseResumeEnd() throws Exception {
        String charterId = createCharter("토큰 갱신", "토큰 재발급 플로우 점검");
        String sessionId = createSession(charterId, "tester-a", "lead-a");

        mockMvc.perform(post("/api/sessions/{id}/start", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RUNNING")))
                .andExpect(jsonPath("$.startedAt").exists());

        mockMvc.perform(post("/api/sessions/{id}/pause", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"환경 재시작\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PAUSED")));

        mockMvc.perform(post("/api/sessions/{id}/resume", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RUNNING")));

        mockMvc.perform(post("/api/sessions/{id}/end", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.endedAt").exists());
    }

    @Test
    @WithMockUser(username = "tester", roles = {"USER"})
    public void updateSession() throws Exception {
        String charterId = createCharter("로그인/토큰", "로그인/토큰 시나리오 탐색");
        String sessionId = createSession(charterId, "tester-1", "lead-1");

        String anotherCharterId = createCharter("세션 만료", "세션 만료 후 UX 검증");
        Map<String, Object> updateRequest = buildRequest(
                anotherCharterId,
                "tester-2",
                "lead-2",
                "kim.tester",
                "park.lead",
                90,
                60,
                30,
                10,
                "Windows + Edge",
                "1.0.42",
                List.of("tour"),
                List.of("auth")
        );

        mockMvc.perform(put("/api/sessions/{id}", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sessionId)))
                .andExpect(jsonPath("$.charterId", is(anotherCharterId)))
                .andExpect(jsonPath("$.netDurationMinutes", is(90)))
                .andExpect(jsonPath("$.productVersion", is("1.0.42")));
    }

    @Test
    @WithMockUser(username = "lead", roles = {"MANAGER"})
    public void submitApproveAndRequestUpdateFlow() throws Exception {
        String charterId = createCharter("회귀 탐색", "핵심 회귀 시나리오 탐색");
        String sessionId = createSession(charterId, "tester-1", "lead-1");

        mockMvc.perform(post("/api/sessions/{id}/submit", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));

        mockMvc.perform(post("/api/sessions/{id}/request-update", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comment\":\"시간 분배 근거 보완 필요\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("NEEDS_UPDATE")))
                .andExpect(jsonPath("$.reviewComment", is("시간 분배 근거 보완 필요")));

        mockMvc.perform(post("/api/sessions/{id}/submit", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));

        mockMvc.perform(post("/api/sessions/{id}/approve", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comment\":\"승인\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.reviewComment", is("승인")));
    }

    @Test
    @WithMockUser(username = "tester", roles = {"USER"})
    public void listSessionsByProjectAndFilters() throws Exception {
        String charterA = createCharter("차터A", "차터A 미션");
        String charterB = createCharter("차터B", "차터B 미션");

        String draftSessionId = createSession(charterA, "tester-a", "lead-1");
        String submittedSessionId = createSession(charterB, "tester-b", "lead-1");

        mockMvc.perform(post("/api/sessions/{id}/submit", submittedSessionId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/projects/{projectId}/sessions", project.getId())
                        .param("status", "SUBMITTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(submittedSessionId)))
                .andExpect(jsonPath("$[0].status", is("SUBMITTED")));

        mockMvc.perform(get("/api/projects/{projectId}/sessions", project.getId())
                        .param("charterId", charterA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(draftSessionId)));

        mockMvc.perform(get("/api/projects/{projectId}/sessions", project.getId())
                        .param("page", "0")
                        .param("size", "1")
                        .param("sort", "createdAt,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/sessions/{id}", "session-not-found"))
                .andExpect(status().isNotFound());
    }

    private String createCharter(String title, String mission) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("projectId", project.getId());
        request.put("title", title);
        request.put("mission", mission);
        request.put("areas", "auth");
        request.put("tags", "exploratory");
        request.put("createdBy", "tester");

        MvcResult result = mockMvc.perform(post("/api/charters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).path("id").asText();
    }

    private String createSession(String charterId, String testerId, String leadId) throws Exception {
        Map<String, Object> request = buildRequest(
                charterId,
                testerId,
                leadId,
                "kim.tester",
                "park.lead",
                60,
                70,
                20,
                10,
                "macOS + Chrome",
                "1.0.41",
                List.of("exploratory"),
                List.of("auth")
        );

        MvcResult result = mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).path("id").asText();
    }

    private Map<String, Object> buildRequest(
            String charterId,
            String testerId,
            String leadId,
            String testerName,
            String leadName,
            int netDurationMinutes,
            int testExecutionPct,
            int bugInvestigationPct,
            int setupAdminPct,
            String environmentSummary,
            String productVersion,
            List<String> strategyTags,
            List<String> areaTags) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("projectId", project.getId());
        request.put("charterId", charterId);
        request.put("testerId", testerId);
        request.put("leadId", leadId);
        request.put("testerName", testerName);
        request.put("leadName", leadName);
        request.put("netDurationMinutes", netDurationMinutes);
        request.put("testExecutionPct", testExecutionPct);
        request.put("bugInvestigationPct", bugInvestigationPct);
        request.put("setupAdminPct", setupAdminPct);
        request.put("environmentSummary", environmentSummary);
        request.put("productVersion", productVersion);
        request.put("strategyTags", strategyTags);
        request.put("areaTags", areaTags);
        return request;
    }
}
