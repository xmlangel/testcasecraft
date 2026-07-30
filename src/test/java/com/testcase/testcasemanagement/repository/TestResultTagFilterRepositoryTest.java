// src/test/java/com/testcase/testcasemanagement/repository/TestResultTagFilterRepositoryTest.java

package com.testcase.testcasemanagement.repository;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.transaction.annotation.Transactional;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-427: 결과 태그 필터 쿼리 검증.
 *
 * <p>태그 조건은 네이티브 SQL(EXISTS + LOWER(tag) IN)로 걸리므로 실제 DB 에서 돌려봐야 문법·조인·대소문자 처리가 확인된다. 태그를 붙여둔 결과만
 * 걸러지는지, 태그 없는 결과가 섞여 들어오지 않는지, 중복 제거(실행+케이스별 최신)가 유지되는지를 고정한다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class TestResultTagFilterRepositoryTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestEntityManager entityManager;
  @Autowired private TestResultRepository testResultRepository;

  private Project project;
  private TestExecution execution;
  private String taggedResultId;
  private String untaggedResultId;

  @BeforeMethod
  void setUp() {
    project = new Project();
    project.setName("ICT-427 태그 필터");
    project.setCode("ICT427-" + System.nanoTime());
    project = entityManager.persist(project);

    execution = new TestExecution();
    execution.setName("태그 필터 실행");
    execution.setProject(project);
    execution.setTestPlanId("plan-ict427");
    execution.setStatus("INPROGRESS");
    execution = entityManager.persist(execution);

    // 태그가 붙은 결과 (수정 필요로 표시해 둔 것)
    TestResult tagged = new TestResult();
    tagged.setTestExecution(execution);
    tagged.setTestCaseId("case-tagged");
    tagged.setResult("FAIL");
    tagged.setNotes("사전조건이 실제 화면과 다름");
    tagged.setExecutedAt(LocalDateTime.now().minusHours(1));
    tagged.setTags(Set.of("수정필요", "로그인"));
    taggedResultId = entityManager.persist(tagged).getId();

    // 태그가 없는 결과 (필터에 걸리면 안 된다)
    TestResult untagged = new TestResult();
    untagged.setTestExecution(execution);
    untagged.setTestCaseId("case-untagged");
    untagged.setResult("PASS");
    untagged.setExecutedAt(LocalDateTime.now());
    untaggedResultId = entityManager.persist(untagged).getId();

    entityManager.flush();
  }

  @Test(description = "프로젝트 + 태그 필터는 태그가 붙은 결과만 돌려준다")
  public void projectTagFilterReturnsOnlyTaggedResults() {
    List<String> ids =
        testResultRepository.findDedupedIdsByProjectAndTags(
            project.getId(), List.of("수정필요"), PageRequest.of(0, 20));

    assertTrue(ids.contains(taggedResultId), "태그가 붙은 결과는 포함돼야 한다");
    assertFalse(ids.contains(untaggedResultId), "태그 없는 결과가 섞여선 안 된다");
    assertEquals(
        testResultRepository.countDedupedByProjectAndTags(project.getId(), List.of("수정필요")),
        ids.size(),
        "카운트 쿼리와 목록 쿼리의 대상이 같아야 한다(페이징 총계 어긋남 방지)");
  }

  @Test(description = "태그 비교는 대소문자를 가리지 않는다 (LOWER(tag) IN 소문자 파라미터)")
  public void tagFilterIsCaseInsensitive() {
    TestResult mixedCase = new TestResult();
    mixedCase.setTestExecution(execution);
    mixedCase.setTestCaseId("case-mixed");
    mixedCase.setResult("BLOCKED");
    mixedCase.setExecutedAt(LocalDateTime.now());
    mixedCase.setTags(Set.of("NeedsFix"));
    String mixedId = entityManager.persist(mixedCase).getId();
    entityManager.flush();

    List<String> ids =
        testResultRepository.findDedupedIdsByProjectAndTags(
            project.getId(), List.of("needsfix"), PageRequest.of(0, 20));

    assertTrue(ids.contains(mixedId), "대문자로 저장된 태그도 소문자 검색어로 걸려야 한다");
  }

  @Test(description = "여러 태그는 하나만 걸려도 통과한다(OR)")
  public void tagFilterIsOrAcrossTags() {
    List<String> ids =
        testResultRepository.findDedupedIdsByProjectAndTags(
            project.getId(), List.of("없는태그", "로그인"), PageRequest.of(0, 20));

    assertTrue(ids.contains(taggedResultId), "선택한 태그 중 하나라도 걸리면 포함돼야 한다");
  }

  @Test(description = "걸리는 태그가 없으면 빈 결과 (전체가 새어 나오지 않는다)")
  public void unknownTagReturnsEmpty() {
    List<String> ids =
        testResultRepository.findDedupedIdsByProjectAndTags(
            project.getId(), List.of("존재하지않는태그"), PageRequest.of(0, 20));

    assertTrue(ids.isEmpty(), "없는 태그로 조회하면 결과가 없어야 한다");
    assertEquals(
        testResultRepository.countDedupedByProjectAndTags(project.getId(), List.of("존재하지않는태그")),
        0L);
  }

  @Test(description = "실행 ID + 태그 필터 경로도 같은 결과를 낸다")
  public void executionScopedTagFilterWorks() {
    List<String> ids =
        testResultRepository.findDedupedIdsByExecutionsAndTags(
            List.of(execution.getId()), List.of("수정필요"), PageRequest.of(0, 20));

    assertEquals(ids, List.of(taggedResultId));
    assertEquals(
        testResultRepository.countDedupedByExecutionsAndTags(
            List.of(execution.getId()), List.of("수정필요")),
        1L);
  }

  @Test(description = "플랜 + 태그 필터 경로도 같은 결과를 낸다")
  public void planScopedTagFilterWorks() {
    List<String> ids =
        testResultRepository.findDedupedIdsByProjectAndPlansAndTags(
            project.getId(), List.of("plan-ict427"), List.of("수정필요"), PageRequest.of(0, 20));

    assertEquals(ids, List.of(taggedResultId));
    assertEquals(
        testResultRepository.countDedupedByProjectAndPlansAndTags(
            project.getId(), List.of("plan-ict427"), List.of("수정필요")),
        1L);
  }

  @Test(description = "같은 실행·케이스에 결과가 여러 개면 태그가 붙은 것 중 최신 하나만 나온다")
  public void dedupKeepsLatestTaggedResultPerCase() {
    TestResult older = new TestResult();
    older.setTestExecution(execution);
    older.setTestCaseId("case-tagged");
    older.setResult("FAIL");
    older.setExecutedAt(LocalDateTime.now().minusDays(2));
    older.setTags(Set.of("수정필요"));
    String olderId = entityManager.persist(older).getId();
    entityManager.flush();

    List<String> ids =
        testResultRepository.findDedupedIdsByProjectAndTags(
            project.getId(), List.of("수정필요"), PageRequest.of(0, 20));

    assertTrue(ids.contains(taggedResultId), "최신 결과가 남아야 한다");
    assertFalse(ids.contains(olderId), "같은 케이스의 과거 결과는 중복 제거돼야 한다");
  }
}
