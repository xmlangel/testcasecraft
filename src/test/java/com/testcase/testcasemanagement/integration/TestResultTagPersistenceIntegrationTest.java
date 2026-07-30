// src/test/java/com/testcase/testcasemanagement/integration/TestResultTagPersistenceIntegrationTest.java

package com.testcase.testcasemanagement.integration;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.TestExecutionService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-427: 결과 입력 화면에서 넣은 태그가 DB 까지 남는지 확인하는 재현 테스트.
 *
 * <p>"태그를 입력하고 저장해도 안 된다"는 신고를 서버 경로에서 갈라내기 위한 것이다. 화면이 쓰는 두 저장 경로(신규 결과 POST =
 * updateTestResult, 기존 결과 수정 PUT = updatePreviousTestResult)와 일괄 입력을 서비스 계층에서 그대로 호출해, 저장 후 다시 읽은 값에
 * 태그가 살아 있는지 본다. 여기서 통과하면 서버는 정상이고 원인은 화면 쪽이다.
 */
@SpringBootTest
@ActiveProfiles("test")
public class TestResultTagPersistenceIntegrationTest
    extends AbstractTransactionalTestNGSpringContextTests {

  @Autowired private TestExecutionService testExecutionService;
  @Autowired private TestExecutionRepository testExecutionRepository;
  @Autowired private TestResultRepository testResultRepository;
  @Autowired private TestCaseRepository testCaseRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private UserRepository userRepository;

  private TestExecution execution;
  private TestCase testCase;

  @BeforeMethod
  public void setUp() {
    long stamp = System.nanoTime();

    User admin = new User();
    admin.setUsername("tagtest_admin_" + stamp);
    admin.setEmail("tagtest_" + stamp + "@example.com");
    admin.setName("Tag Test Admin");
    admin.setPassword("irrelevant");
    admin.setRole("ADMIN");
    admin.setIsActive(true);
    admin.setEmailVerified(true);
    admin.setCreatedAt(LocalDateTime.now());
    admin = userRepository.save(admin);

    // 서비스가 SecurityContext 에서 사용자와 권한을 읽는다 (ADMIN 은 프로젝트 권한을 우회)
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                admin.getUsername(),
                "irrelevant",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));

    Project project = new Project();
    project.setName("태그 저장 검증");
    project.setCode("TAGSAVE-" + stamp);
    project = projectRepository.save(project);

    testCase = new TestCase();
    testCase.setProject(project);
    testCase.setName("태그 저장 대상 케이스");
    testCase.setType("testcase");
    testCase.setDisplayOrder(1);
    testCase.setCreatedAt(LocalDateTime.now());
    testCase = testCaseRepository.save(testCase);

    execution = new TestExecution();
    execution.setName("태그 저장 검증 실행");
    execution.setProject(project);
    execution.setStatus("INPROGRESS");
    execution.setCreatedAt(LocalDateTime.now());
    execution.setUpdatedAt(LocalDateTime.now());
    execution = testExecutionRepository.save(execution);
  }

  @AfterMethod
  public void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test(description = "신규 결과 저장(POST 경로)에 실은 태그가 DB 와 응답에 남는다")
  public void tagsSurviveNewResultSave() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId(testCase.getId());
    dto.setResult("FAIL");
    dto.setNotes("사전조건이 화면과 다름");
    dto.setTags(List.of("수정필요", "로그인"));

    TestExecutionDto saved = testExecutionService.updateTestResult(execution.getId(), dto);

    // 응답 DTO
    assertEquals(saved.getResults().size(), 1, "결과가 한 건 생성돼야 한다");
    assertEqualsNoOrder(
        saved.getResults().get(0).getTags().toArray(),
        List.of("수정필요", "로그인").toArray(),
        "저장 응답에 태그가 실려야 한다");

    // DB 실제 값
    List<com.testcase.testcasemanagement.model.TestResult> persisted =
        testResultRepository.findByTestCaseId(testCase.getId());
    assertEquals(persisted.size(), 1);
    assertNotNull(persisted.get(0).getTags(), "DB 에 태그가 저장돼야 한다");
    assertTrue(persisted.get(0).getTags().contains("수정필요"));
    assertTrue(persisted.get(0).getTags().contains("로그인"));
  }

  @Test(description = "기존 결과 수정(PUT 경로)으로 태그를 추가할 수 있다")
  public void tagsSurvivePreviousResultUpdate() {
    // 태그 없이 먼저 저장
    TestResultDto create = new TestResultDto();
    create.setTestCaseId(testCase.getId());
    create.setResult("PASS");
    TestExecutionDto saved = testExecutionService.updateTestResult(execution.getId(), create);
    String resultId = saved.getResults().get(0).getId();

    // 화면에서 태그만 달아 다시 저장하는 상황
    TestResultDto update = new TestResultDto();
    update.setTestCaseId(testCase.getId());
    update.setResult("PASS");
    update.setTags(List.of("수정필요"));

    TestResultDto updated =
        testExecutionService.updatePreviousTestResult(
            resultId, update, SecurityContextHolder.getContext().getAuthentication().getName());

    assertEquals(updated.getTags(), List.of("수정필요"), "수정 응답에 태그가 실려야 한다");
    assertTrue(
        testResultRepository.findById(resultId).orElseThrow().getTags().contains("수정필요"),
        "DB 에 태그가 반영돼야 한다");
  }

  @Test(description = "실행 상세 재조회 시에도 태그가 함께 내려온다 (화면 표시 경로)")
  public void tagsAreReturnedWhenExecutionIsReloaded() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId(testCase.getId());
    dto.setResult("BLOCKED");
    dto.setTags(List.of("수정필요"));
    testExecutionService.updateTestResult(execution.getId(), dto);

    TestExecutionDto reloaded =
        testExecutionService.getTestExecutionById(execution.getId()).orElseThrow();

    assertEquals(reloaded.getResults().size(), 1);
    assertEquals(
        reloaded.getResults().get(0).getTags(),
        List.of("수정필요"),
        "실행을 다시 읽을 때 결과 태그가 내려와야 한다 (화면에 태그가 안 보이는 원인 확인용)");
  }

  @Test(description = "태그를 빈 배열로 보내면 지워지고, null 로 보내면 유지된다")
  public void emptyTagListClearsAndNullKeeps() {
    TestResultDto create = new TestResultDto();
    create.setTestCaseId(testCase.getId());
    create.setResult("FAIL");
    create.setTags(List.of("수정필요"));
    TestExecutionDto saved = testExecutionService.updateTestResult(execution.getId(), create);
    String resultId = saved.getResults().get(0).getId();
    String username = SecurityContextHolder.getContext().getAuthentication().getName();

    // null → 유지
    TestResultDto keep = new TestResultDto();
    keep.setTestCaseId(testCase.getId());
    keep.setResult("FAIL");
    keep.setTags(null);
    testExecutionService.updatePreviousTestResult(resultId, keep, username);
    assertTrue(
        testResultRepository.findById(resultId).orElseThrow().getTags().contains("수정필요"),
        "태그를 보내지 않으면(null) 기존 태그가 유지돼야 한다");

    // 빈 배열 → 삭제
    TestResultDto clear = new TestResultDto();
    clear.setTestCaseId(testCase.getId());
    clear.setResult("FAIL");
    clear.setTags(List.of());
    testExecutionService.updatePreviousTestResult(resultId, clear, username);
    assertTrue(
        testResultRepository.findById(resultId).orElseThrow().getTags().isEmpty(),
        "빈 배열을 보내면 태그가 지워진다 (화면이 미로딩 상태로 저장하면 태그가 사라지는 경로)");
  }
}
