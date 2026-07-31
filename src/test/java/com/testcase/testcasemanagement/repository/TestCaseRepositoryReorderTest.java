// src/test/java/com/testcase/testcasemanagement/repository/TestCaseRepositoryReorderTest.java
package com.testcase.testcasemanagement.repository;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
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
 * 트리 이동/정렬용 형제 조회 쿼리({@code findByProjectIdAndParentIdOrderByDisplayOrder}) 회귀 테스트.
 *
 * <p>배경 1 — 루트 노드 실패: {@code t.parentId = :parentId} JPQL 은 :parentId 가 null 이면 UNKNOWN 으로 평가되어 0건을
 * 반환한다. 이 때문에 최상위(폴더 밖) 노드끼리의 드래그앤드롭 순서 변경이 서버에서 실패했다(빈 형제 목록 → beforeId/afterId 미발견 → 400).
 *
 * <p>배경 2 — 크로스 프로젝트 누수: 루트(parentId=null)는 프로젝트 경계가 없어 parentId 만으로 조회하면 모든 프로젝트의 루트 노드가 섞인다. 따라서
 * 조회를 반드시 projectId 로 한정해야 한다.
 *
 * <p>단위 테스트({@code TestCaseTreeMoveServiceTest})는 인메모리 가짜 리포지토리라 실제 JPQL null 시맨틱과 프로젝트 누수를 재현하지
 * 못하므로, 실제 DB(Postgres)를 태우는 {@code @DataJpaTest} 로만 이 회귀를 잡을 수 있다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class TestCaseRepositoryReorderTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestEntityManager entityManager;

  @Autowired private TestCaseRepository testCaseRepository;

  private Project projectA;
  private Project projectB;

  private TestCase folderA; // projectA 폴더

  @BeforeMethod
  void setUp() {
    projectA = persistProject("Reorder Project A", "REORD-A-" + System.nanoTime());
    projectB = persistProject("Reorder Project B", "REORD-B-" + System.nanoTime());

    // projectA 루트 3개 + 폴더 1개(순서 4), 폴더 안 케이스 2개
    persistNode(projectA, "rootA1", "folder", null, 1);
    persistNode(projectA, "rootA2", "folder", null, 2);
    persistNode(projectA, "rootA3", "folder", null, 3);
    folderA = persistNode(projectA, "folderA", "folder", null, 4);
    persistNode(projectA, "childX", "testcase", folderA.getId(), 1);
    persistNode(projectA, "childY", "testcase", folderA.getId(), 2);

    // projectB 루트 2개 — projectA 루트 조회에 절대 섞이면 안 된다
    persistNode(projectB, "rootB1", "folder", null, 1);
    persistNode(projectB, "rootB2", "folder", null, 2);

    entityManager.flush();
    entityManager.clear();
  }

  private Project persistProject(String name, String code) {
    Project p = new Project();
    p.setName(name);
    p.setCode(code);
    p.setOrganization(null);
    p.setCreatedAt(LocalDateTime.now());
    p.setUpdatedAt(LocalDateTime.now());
    return entityManager.persistAndFlush(p);
  }

  private TestCase persistNode(
      Project project, String name, String type, String parentId, int order) {
    TestCase tc = new TestCase();
    tc.setName(name);
    tc.setType(type);
    tc.setParentId(parentId);
    tc.setDisplayOrder(order);
    tc.setProject(project);
    return entityManager.persistAndFlush(tc);
  }

  private List<String> names(List<TestCase> nodes) {
    return nodes.stream().map(TestCase::getName).collect(Collectors.toList());
  }

  /** 핵심 회귀 1: 루트 형제를 displayOrder 순으로 반환해야 한다(수정 전에는 빈 리스트 → 400). */
  @Test
  public void projectScopedSiblings_rootNodes_returnsAllInOrder() {
    List<TestCase> siblings =
        testCaseRepository.findByProjectIdAndParentIdOrderByDisplayOrder(projectA.getId(), null);
    assertEquals(names(siblings), List.of("rootA1", "rootA2", "rootA3", "folderA"));
  }

  /** 핵심 회귀 2: 루트 조회가 다른 프로젝트의 루트 노드를 절대 포함하면 안 된다. */
  @Test
  public void projectScopedSiblings_rootNodes_isProjectIsolated() {
    List<TestCase> siblings =
        testCaseRepository.findByProjectIdAndParentIdOrderByDisplayOrder(projectA.getId(), null);
    assertFalse(names(siblings).contains("rootB1"), "projectB 루트가 projectA 조회에 섞임");
    assertFalse(names(siblings).contains("rootB2"), "projectB 루트가 projectA 조회에 섞임");

    List<TestCase> bSiblings =
        testCaseRepository.findByProjectIdAndParentIdOrderByDisplayOrder(projectB.getId(), null);
    assertEquals(names(bSiblings), List.of("rootB1", "rootB2"));
  }

  /** 대조군: 폴더 안(non-null parent) 조회는 그대로 동작. */
  @Test
  public void projectScopedSiblings_folderChildren_returnsInOrder() {
    List<TestCase> children =
        testCaseRepository.findByProjectIdAndParentIdOrderByDisplayOrder(
            projectA.getId(), folderA.getId());
    assertEquals(names(children), List.of("childX", "childY"));
  }
}
