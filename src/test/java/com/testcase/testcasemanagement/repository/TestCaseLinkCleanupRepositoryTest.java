// src/test/java/com/testcase/testcasemanagement/repository/TestCaseLinkCleanupRepositoryTest.java
package com.testcase.testcasemanagement.repository;

import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
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
 * TC 삭제 시 링크 정리 native SQL 회귀 테스트 (dev-code-review 라운드2, 양방향 삭제 정합성).
 *
 * <p>TC 삭제는 (a) 정방향 = 내가 건 링크, (b) 역방향 = 남이 나를 건 링크 를 모두 지워야 dangling 이 안 남는다. 컬럼명 하드코딩 native SQL
 * 이라 실제 Postgres 로만 검증 가능하다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class TestCaseLinkCleanupRepositoryTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestEntityManager entityManager;
  @Autowired private TestCaseRepository testCaseRepository;

  private Project project;

  @BeforeMethod
  void setUp() {
    project = new Project();
    project.setName("Cleanup Project");
    project.setCode("CLEAN-" + System.nanoTime());
    project.setCreatedAt(LocalDateTime.now());
    project.setUpdatedAt(LocalDateTime.now());
    project = entityManager.persistAndFlush(project);
  }

  private TestCase persistTc(String name) {
    TestCase tc = new TestCase();
    tc.setName(name);
    tc.setType("testcase");
    tc.setDisplayOrder(1);
    tc.setProject(project);
    return entityManager.persistAndFlush(tc);
  }

  /** deleteTestCaseLinkRefs 는 정방향(A→B)과 역방향(C→A)을 모두 지운다. */
  @Test
  public void deleteTestCaseLinkRefs_removesBothDirections() {
    TestCase a = persistTc("A");
    TestCase b = persistTc("B");
    TestCase c = persistTc("C");

    a.setLinkedTestCaseIds(List.of(b.getId())); // A → B (정방향)
    entityManager.persistAndFlush(a);
    c.setLinkedTestCaseIds(List.of(a.getId())); // C → A (A 기준 역방향)
    entityManager.persistAndFlush(c);
    entityManager.clear();

    testCaseRepository.deleteTestCaseLinkRefs(a.getId());
    entityManager.flush();
    entityManager.clear();

    TestCase reloadedA = testCaseRepository.findById(a.getId()).orElseThrow();
    TestCase reloadedC = testCaseRepository.findById(c.getId()).orElseThrow();

    assertTrue(
        reloadedA.getLinkedTestCaseIds() == null || reloadedA.getLinkedTestCaseIds().isEmpty(),
        "A의 정방향 링크(A→B)가 제거되어야 함");
    assertFalse(
        reloadedC.getLinkedTestCaseIds() != null
            && reloadedC.getLinkedTestCaseIds().contains(a.getId()),
        "C의 역방향 링크(C→A)가 제거되어야 함");
  }

  /** deleteJunitCaseLinksByTestCaseId 는 이 TC가 건 JUnit 링크만 지운다. */
  @Test
  public void deleteJunitCaseLinksByTestCaseId_removesJunitLinks() {
    TestCase a = persistTc("A-junit");
    a.setLinkedJunitTestCaseIds(List.of("junit-x", "junit-y"));
    entityManager.persistAndFlush(a);
    entityManager.clear();

    testCaseRepository.deleteJunitCaseLinksByTestCaseId(a.getId());
    entityManager.flush();
    entityManager.clear();

    TestCase reloadedA = testCaseRepository.findById(a.getId()).orElseThrow();
    assertTrue(
        reloadedA.getLinkedJunitTestCaseIds() == null
            || reloadedA.getLinkedJunitTestCaseIds().isEmpty(),
        "A의 JUnit 링크가 제거되어야 함");
  }
}
