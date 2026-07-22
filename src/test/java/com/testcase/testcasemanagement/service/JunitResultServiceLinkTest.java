// src/test/java/com/testcase/testcasemanagement/service/JunitResultServiceLinkTest.java
package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.JunitTestCase;
import com.testcase.testcasemanagement.model.JunitTestResult;
import com.testcase.testcasemanagement.model.JunitTestSuite;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.JunitTestCaseRepository;
import com.testcase.testcasemanagement.repository.JunitTestResultRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * JunitResultService 링크 관련 로직 검증 (dev-code-review 라운드2):
 *
 * <ul>
 *   <li>{@code deleteTestResult}: 결과 삭제 시 TC의 역방향 JUnit 링크를 함께 정리(P0-3 부분 커밋 방지 리팩터 이후), 없는 id 는
 *       false
 *   <li>{@code getLinkedTestCasesByResult}: 이 결과의 케이스를 연결한 TC 역조회 집계
 * </ul>
 *
 * <p>{@code @DataJpaTest} 는 서비스 빈을 로드하지 않으므로 서비스를 직접 생성하고 리포지토리를 리플렉션으로 주입한다(파일 스토리지는 목).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class JunitResultServiceLinkTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestEntityManager entityManager;
  @Autowired private JunitTestResultRepository junitTestResultRepository;
  @Autowired private JunitTestCaseRepository junitTestCaseRepository;
  @Autowired private TestCaseRepository testCaseRepository;

  private JunitResultService service;

  private String projectId;
  private String resultId;
  private String junitCaseId;
  private String linkingTestCaseId;

  @BeforeMethod
  void setUp() {
    service = new JunitResultService();
    ReflectionTestUtils.setField(service, "testResultRepository", junitTestResultRepository);
    ReflectionTestUtils.setField(service, "testCaseRepository", junitTestCaseRepository);
    ReflectionTestUtils.setField(service, "projectTestCaseRepository", testCaseRepository);
    ReflectionTestUtils.setField(
        service,
        "fileStorageService",
        Mockito.mock(com.testcase.testcasemanagement.service.JunitFileStorageService.class));

    Project project = new Project();
    project.setName("Svc Link Project");
    project.setCode("SVC-" + System.nanoTime());
    project.setCreatedAt(LocalDateTime.now());
    project.setUpdatedAt(LocalDateTime.now());
    project = entityManager.persistAndFlush(project);
    projectId = project.getId();

    User user = new User();
    user.setUsername("svc-" + System.nanoTime());
    user.setEmail("svc-" + System.nanoTime() + "@example.com");
    user.setName("Svc Tester");
    user.setPassword("x");
    user.setCreatedAt(LocalDateTime.now());
    user = entityManager.persistAndFlush(user);

    JunitTestResult result = new JunitTestResult();
    result.setFileName("res.xml");
    result.setFileSize(1L);
    result.setProjectId(projectId);
    result.setTestExecutionName("exec");
    result.setUploadedBy(user);
    result.setUploadedAt(LocalDateTime.now());

    JunitTestSuite suite = new JunitTestSuite();
    suite.setName("com.example.Suite");
    suite.setJunitTestResult(result);

    JunitTestCase jcase = new JunitTestCase();
    jcase.setName("shouldWork");
    jcase.setClassName("com.example.SampleTest");
    jcase.setJunitTestSuite(suite);

    suite.setTestCases(List.of(jcase));
    result.setTestSuites(List.of(suite));
    result = entityManager.persistAndFlush(result);
    resultId = result.getId();
    junitCaseId = jcase.getId();

    TestCase tc = new TestCase();
    tc.setName("Linking TC");
    tc.setType("testcase");
    tc.setDisplayOrder(1);
    tc.setProject(project);
    tc.setLinkedJunitTestCaseIds(List.of(junitCaseId));
    tc = entityManager.persistAndFlush(tc);
    linkingTestCaseId = tc.getId();

    entityManager.flush();
    entityManager.clear();
  }

  /** 역조회 집계: 이 결과의 케이스를 연결한 TC 1건, 필드가 채워져 반환된다. */
  @Test
  public void getLinkedTestCasesByResult_returnsLinkingTestCase() {
    List<Map<String, Object>> linked = service.getLinkedTestCasesByResult(resultId);
    assertEquals(linked.size(), 1);
    Map<String, Object> row = linked.get(0);
    assertEquals(row.get("testCaseId"), linkingTestCaseId);
    assertEquals(row.get("junitCaseId"), junitCaseId);
    assertEquals(row.get("junitCaseName"), "shouldWork");
    assertEquals(row.get("projectId"), projectId);
  }

  /** deleteTestResult: 결과 삭제 시 TC의 역방향 링크가 함께 정리되고 true 를 반환. */
  @Test
  public void deleteTestResult_cleansReverseLinks_andReturnsTrue() {
    boolean deleted = service.deleteTestResult(resultId);
    entityManager.flush();
    entityManager.clear();

    assertTrue(deleted);
    assertTrue(junitTestResultRepository.findById(resultId).isEmpty(), "결과가 삭제되어야 함");

    TestCase reloaded = testCaseRepository.findById(linkingTestCaseId).orElseThrow();
    assertFalse(
        reloaded.getLinkedJunitTestCaseIds() != null
            && reloaded.getLinkedJunitTestCaseIds().contains(junitCaseId),
        "삭제된 결과의 케이스를 가리키던 TC 링크가 정리되어야 함");
  }

  /** deleteTestResult: 존재하지 않는 id 는 false (예외 아님). */
  @Test
  public void deleteTestResult_notFound_returnsFalse() {
    assertFalse(service.deleteTestResult("no-such-result"));
  }
}
