// src/test/java/com/testcase/testcasemanagement/repository/TestCaseFolderCountRepositoryTest.java
package com.testcase.testcasemanagement.repository;

import static org.testng.Assert.assertEquals;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import java.time.LocalDateTime;
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
 * 폴더가 테스트케이스 수에 섞여 들어가지 않는지 검증한다.
 *
 * <p>testcases 테이블에는 폴더도 같은 행으로 들어 있어(type = testcase | folder | systemFolder), 타입을 거르지 않으면 총계가 부풀고
 * 챗봇이 "폴더 1 + 케이스 1"을 "케이스 2개"로 답한다. 폴더가 sequential_id 를 가진 경우가 실제로 있어(운영 데이터에서 29개 중 24개) 그 값으로는
 * 구분할 수 없다 — type 으로만 갈라야 한다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class TestCaseFolderCountRepositoryTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestEntityManager entityManager;
  @Autowired private TestCaseRepository testCaseRepository;

  private Project project;

  @BeforeMethod
  void setUp() {
    project = new Project();
    project.setName("Folder Count Project");
    project.setCode("FCNT-" + System.nanoTime());
    project.setCreatedAt(LocalDateTime.now());
    project.setUpdatedAt(LocalDateTime.now());
    project = entityManager.persistAndFlush(project);
  }

  private void persist(String name, String type, Integer sequentialId) {
    TestCase tc = new TestCase();
    tc.setName(name);
    tc.setType(type);
    tc.setSequentialId(sequentialId);
    tc.setDisplayOrder(1);
    tc.setProject(project);
    entityManager.persistAndFlush(tc);
  }

  /** 사용자가 보고한 상황 그대로 — 폴더 1개와 케이스 1개는 "케이스 1개"로 세어야 한다. */
  @Test
  public void countTestCasesOnly_폴더는_케이스로_세지_않는다() {
    persist("루트 폴더", "folder", null);
    persist("로그인 검증", "testcase", 1);

    assertEquals(testCaseRepository.countTestCasesOnlyByProjectId(project.getId()), 1L);
    assertEquals(testCaseRepository.countFoldersByProjectId(project.getId()), 1L);
    assertEquals(testCaseRepository.countByProjectId(project.getId()), 2L);
  }

  /** sequential_id 를 가진 폴더도 케이스가 아니다. 이 값으로 구분하려던 조건이 실제로 틀렸다. */
  @Test
  public void countTestCasesOnly_순차ID를_가진_폴더도_제외한다() {
    persist("순차ID 있는 폴더", "folder", 7);
    persist("케이스", "testcase", 8);

    assertEquals(testCaseRepository.countTestCasesOnlyByProjectId(project.getId()), 1L);
    assertEquals(testCaseRepository.countFoldersByProjectId(project.getId()), 1L);
  }

  /** systemFolder 도 폴더로 센다. */
  @Test
  public void countFolders_시스템폴더도_폴더로_센다() {
    persist("시스템 폴더", "systemFolder", null);
    persist("일반 폴더", "folder", null);
    persist("케이스", "testcase", 1);

    assertEquals(testCaseRepository.countTestCasesOnlyByProjectId(project.getId()), 1L);
    assertEquals(testCaseRepository.countFoldersByProjectId(project.getId()), 2L);
  }

  /** 케이스만 있으면 폴더는 0 이다. */
  @Test
  public void countFolders_폴더가_없으면_0() {
    persist("케이스 1", "testcase", 1);
    persist("케이스 2", "testcase", 2);

    assertEquals(testCaseRepository.countTestCasesOnlyByProjectId(project.getId()), 2L);
    assertEquals(testCaseRepository.countFoldersByProjectId(project.getId()), 0L);
  }
}
