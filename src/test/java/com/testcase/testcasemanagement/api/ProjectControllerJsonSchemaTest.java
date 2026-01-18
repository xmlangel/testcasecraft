package com.testcase.testcasemanagement.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.security.OrganizationSecurityService; // 올바른 경로로 수정
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean; // MockBean 임포트
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any; // any() 임포트
import static org.mockito.Mockito.when; // when() 임포트
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private JsonSchema projectPostSchema;

    @MockBean // OrganizationSecurityService를 MockBean으로 등록
    private OrganizationSecurityService organizationSecurityService;

    @BeforeMethod
    void setUp() throws IOException {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // project-post.json 스키마 로드
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/project-post.json")) {
            if (is == null) {
                throw new IOException("project-post.json not found in classpath");
            }
            JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V7);
            projectPostSchema = factory.getSchema(is);
        }

        // organizationSecurityService.isOrganizationMember 메서드가 항상 true를 반환하도록 모의 설정
        when(organizationSecurityService.isOrganizationMember(any(String.class), any(String.class))).thenReturn(true);
    }

    private void validateJsonAgainstSchema(String json, JsonSchema schema) throws IOException {
        JsonNode jsonNode = objectMapper.readTree(json);
        Set<ValidationMessage> errors = schema.validate(jsonNode);
        Assert.assertTrue(errors.isEmpty(), "JSON 스키마 유효성 검사 실패: " + errors);
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void testCreateProject_Success() throws Exception {
        System.out.println("MockMvc 객체: " + mockMvc); // 디버그 로그 추가
        ProjectDto newProject = new ProjectDto();
        newProject.setCode("NEW_PROJ_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newProject.setName("새로운 프로젝트 이름");
        newProject.setDescription("새로운 프로젝트 설명입니다.");

        MvcResult result = mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProject)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.code").value(newProject.getCode()))
                .andExpect(jsonPath("$.name").value(newProject.getName()))
                .andReturn();

        validateJsonAgainstSchema(result.getResponse().getContentAsString(), projectPostSchema);
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void testCreateProject_MissingCode() throws Exception {
        ProjectDto newProject = new ProjectDto();
        newProject.setName("코드 없는 프로젝트");
        newProject.setDescription("코드 필드가 누락된 프로젝트입니다.");

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProject)))
                .andDo(print()) // print 추가
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").exists());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void testCreateProject_MissingName() throws Exception {
        ProjectDto newProject = new ProjectDto();
        newProject.setCode("NO_NAME_PROJ");
        newProject.setDescription("이름 필드가 누락된 프로젝트입니다.");

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProject)))
                .andDo(print()) // print 추가
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").exists());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void testCreateOrganizationProject_Success() throws Exception {
        String organizationId = "test-org-123";

        String projectName = "조직 프로젝트 " + UUID.randomUUID().toString().substring(0, 8);
        String projectDescription = "조직에 속한 새로운 프로젝트입니다.";

        MvcResult result = mockMvc.perform(post("/api/projects/organization/{organizationId}", organizationId)
                .param("name", projectName)
                .param("description", projectDescription)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andDo(print()) // print 추가
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value(projectName))
                .andExpect(jsonPath("$.description").value(projectDescription))
                .andReturn();

        validateJsonAgainstSchema(result.getResponse().getContentAsString(), projectPostSchema);
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void testCreateOrganizationProject_MissingName() throws Exception {
        String organizationId = "test-org-123";

        mockMvc.perform(post("/api/projects/organization/{organizationId}", organizationId)
                .param("description", "이름 없는 조직 프로젝트")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andDo(print()) // print 추가
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").exists());
    }
}