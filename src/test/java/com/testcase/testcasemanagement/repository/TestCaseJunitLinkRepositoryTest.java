// src/test/java/com/testcase/testcasemanagement/repository/TestCaseJunitLinkRepositoryTest.java
package com.testcase.testcasemanagement.repository;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.JunitTestCase;
import com.testcase.testcasemanagement.model.JunitTestResult;
import com.testcase.testcasemanagement.model.JunitTestSuite;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.User;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.transaction.annotation.Transactional;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * TC↔JUnit 링크 native SQL 회귀 테스트 (dev-code-review 라운드2).
 *
 * <p>이 세 쿼리는 @ElementCollection 테이블(testcase_linked_junit_cases)과
 * junit_test_cases/junit_test_suites 를 테이블·컬럼명 하드코딩 native SQL 로 만진다 — 컴파일은 통과하지만 매핑이 바뀌면 런타임에만
 * 깨진다. 실제 Postgres 로만 잡을 수 있어 {@code @DataJpaTest} 로 검증한다: (1) 프로젝트 스코프 by-ids 조회, (2) 결과
 * 역조회(TC↔junit 케이스 쌍), (3) 결과 삭제 시 링크 정리.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class TestCaseJunitLinkRepositoryTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestEntityManager entityManager;
  @Autowired private TestCaseRepository testCaseRepository;
  @Autowired private JunitTestCaseRepository junitTestCaseRepository;

  private String projectId;
  private String resultId;
  private String junitCaseId;
  private String linkingTestCaseId;

  @BeforeMethod
  void setUp() {
    Project project = new Project();
    project.setName("Link Test Project");
    project.setCode("LINK-" + System.nanoTime());
    project.setCreatedAt(LocalDateTime.now());
    project.setUpdatedAt(LocalDateTime.now());
    project = entityManager.persistAndFlush(project);
    projectId = project.getId();

    User user = new User();
    user.setUsername("linktester-" + System.nanoTime());
    user.setEmail("linktester-" + System.nanoTime() + "@example.com");
    user.setName("Link Tester");
    user.setPassword("x");
    user.setCreatedAt(LocalDateTime.now());
    user = entityManager.persistAndFlush(user);

    // JUnit 결과 → 스위트 → 케이스 (cascade ALL)
    JunitTestResult result = new JunitTestResult();
    result.setFileName("res.xml");
    result.setFileSize(1L);
    result.setProjectId(projectId);
    result.setTestExecutionName("exec");
    result.setUploadedBy(user);
    result.setUploadedAt(LocalDateTime.now());

    JunitTestSuite suite = new JunitTestSuite();
    suite.setName("com.example.SampleSuite");
    suite.setJunitTestResult(result);

    JunitTestCase jcase = new JunitTestCase();
    jcase.setName("shouldDoThing");
    jcase.setClassName("com.example.SampleTest");
    jcase.setJunitTestSuite(suite);

    suite.setTestCases(List.of(jcase));
    result.setTestSuites(List.of(suite));

    result = entityManager.persistAndFlush(result);
    resultId = result.getId();
    junitCaseId = jcase.getId();

    // 이 JUnit 케이스를 연결한 테스트케이스
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

  /** (1) 프로젝트 스코프 by-ids 조회가 JOIN FETCH 로 정상 반환. */
  @Test
  public void findByProjectIdAndIdIn_returnsCase() {
    List<JunitTestCase> cases =
        junitTestCaseRepository.findByProjectIdAndIdIn(projectId, List.of(junitCaseId));
    assertEquals(cases.size(), 1);
    assertEquals(cases.get(0).getId(), junitCaseId);
    assertEquals(cases.get(0).getClassName(), "com.example.SampleTest");
  }

  /** (1b) 다른 프로젝트 id 로는 조회되지 않아야 한다(cross-project 격리). */
  @Test
  public void findByProjectIdAndIdIn_wrongProject_returnsEmpty() {
    List<JunitTestCase> cases =
        junitTestCaseRepository.findByProjectIdAndIdIn("no-such-project", List.of(junitCaseId));
    assertTrue(cases.isEmpty());
  }

  /** (2) 결과 역조회: (testcase_id, junit_test_case_id) 쌍을 반환. */
  @Test
  public void findTestCaseJunitLinksByResultId_returnsPair() {
    List<Object[]> pairs = testCaseRepository.findTestCaseJunitLinksByResultId(resultId);
    assertEquals(pairs.size(), 1);
    assertEquals(pairs.get(0)[0], linkingTestCaseId);
    assertEquals(pairs.get(0)[1], junitCaseId);
  }

  /** (3) 결과에 속한 케이스를 참조하는 TC 링크를 삭제하면 역조회가 비어야 한다. */
  @Test
  public void deleteTestCaseLinksByResultId_removesLinks() {
    junitTestCaseRepository.deleteTestCaseLinksByResultId(resultId);
    entityManager.flush();
    entityManager.clear();

    List<Object[]> pairs = testCaseRepository.findTestCaseJunitLinksByResultId(resultId);
    assertTrue(pairs.isEmpty(), "결과 삭제 대비 링크 정리 후 역조회는 비어야 함");

    // TC 자체는 남아 있어야 한다
    assertTrue(testCaseRepository.findById(linkingTestCaseId).isPresent());
  }
}
