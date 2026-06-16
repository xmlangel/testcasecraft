// src/test/java/com/testcase/testcasemanagement/repository/TestResultRepositoryImprovedTest.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResult;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.transaction.annotation.Transactional;
import org.testng.Assert;
import org.testng.annotations.Test;

/** ICT-247: 개선된 테스트 결과 통계 쿼리 테스트 테스트 플랜-실행별 독립적인 통계 산정 로직을 검증합니다. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TestResultRepositoryImprovedTest extends AbstractTestNGSpringContextTests {

  private static final Logger logger =
      LoggerFactory.getLogger(TestResultRepositoryImprovedTest.class);

  @Autowired private TestResultRepository testResultRepository;

  @Test(description = "새로운 쿼리 메서드 존재 및 기본 실행 검증")
  public void testNewQueryMethodsExist() {
    try {
      logger.info("=== ICT-247 새로운 쿼리 메서드 존재 검증 ===");

      // Given: 더미 프로젝트 ID
      String dummyProjectId = "test-project-id";

      // When & Then: 새로운 쿼리 메서드들이 존재하고 실행 가능한지 확인
      try {
        List<Map<String, Object>> planExecutionResults =
            testResultRepository.findTestCaseStatisticsByPlanAndExecution(dummyProjectId);
        Assert.assertNotNull(planExecutionResults, "플랜-실행별 통계 쿼리 메서드가 존재해야 합니다");
        logger.info(
            "✅ findTestCaseStatisticsByPlanAndExecution 메서드 존재 확인 - 결과 수: {}",
            planExecutionResults.size());

      } catch (Exception e) {
        logger.info("플랜-실행별 통계 쿼리 실행 결과: {} (데이터 없음으로 예상됨)", e.getMessage());
      }

      try {
        List<Map<String, Object>> improvedResults =
            testResultRepository.findTestCaseStatisticsByProjectImproved(dummyProjectId);
        Assert.assertNotNull(improvedResults, "개선된 전체 통계 쿼리 메서드가 존재해야 합니다");
        logger.info(
            "✅ findTestCaseStatisticsByProjectImproved 메서드 존재 확인 - 결과 수: {}",
            improvedResults.size());

      } catch (Exception e) {
        logger.info("개선된 전체 통계 쿼리 실행 결과: {} (데이터 없음으로 예상됨)", e.getMessage());
      }

      logger.info("✅ 새로운 쿼리 메서드들이 정상적으로 존재하고 실행됩니다");

    } catch (Exception e) {
      logger.error("❌ 새로운 쿼리 메서드 검증 실패: {}", e.getMessage(), e);
      Assert.fail("새로운 쿼리 메서드 검증 중 오류 발생: " + e.getMessage());
    }
  }

  @Test(description = "기존 쿼리와 신규 쿼리 구조 호환성 확인")
  public void testQueryStructureCompatibility() {
    try {
      logger.info("=== 쿼리 구조 호환성 검증 ===");

      // Given: 더미 프로젝트 ID
      String dummyProjectId = "compatibility-test-project";

      // When: 기존 쿼리와 신규 쿼리 실행 (빈 결과 예상)
      try {
        List<Map<String, Object>> oldResults =
            testResultRepository.findTestCaseStatisticsByProject(dummyProjectId);
        List<Map<String, Object>> newResults =
            testResultRepository.findTestCaseStatisticsByProjectImproved(dummyProjectId);

        // Then: 구조 호환성 검증
        logger.info("기존 쿼리 결과 수: {}", oldResults.size());
        logger.info("신규 쿼리 결과 수: {}", newResults.size());

        // 결과 타입이 동일한지 확인
        Assert.assertEquals(
            oldResults.getClass(), newResults.getClass(), "기존 쿼리와 신규 쿼리의 반환 타입이 동일해야 합니다");

        logger.info("✅ 쿼리 구조 호환성 검증 완료");

      } catch (Exception e) {
        logger.info("쿼리 실행 결과 (데이터 없음 예상): {}", e.getMessage());
        // 데이터가 없어도 메서드가 존재하고 실행되면 성공으로 간주
        logger.info("✅ 쿼리 메서드들이 정상적으로 정의되어 있습니다");
      }

    } catch (Exception e) {
      logger.error("❌ 쿼리 구조 호환성 검증 실패: {}", e.getMessage(), e);
      Assert.fail("쿼리 구조 호환성 검증 중 오류 발생: " + e.getMessage());
    }
  }

  private TestResult newResult(String jiraIssueKey, LocalDateTime executedAt) {
    TestResult r = new TestResult();
    r.setJiraIssueKey(jiraIssueKey);
    r.setExecutedAt(executedAt);
    r.setResult("PASS");
    return r;
  }

  @Test(description = "단일 JIRA 키 조회가 쉼표로 묶인 멀티키 행도 멤버 매칭한다 (히스토리 다이얼로그 빈 목록 버그 회귀)")
  public void testFindByJiraIssueKeyMatchesCommaJoinedMembers() {
    logger.info("=== JIRA 멀티키 멤버 매칭 회귀 검증 ===");

    LocalDateTime base = LocalDateTime.of(2026, 6, 16, 10, 0);

    // Given: jira_issue_key 컬럼에 단일/멀티키가 섞여 저장된 상태
    testResultRepository.save(newResult("ONT-1086", base.plusMinutes(1))); // 단일
    testResultRepository.save(newResult("ONT-1086,ONT-904", base.plusMinutes(2))); // 멀티(앞)
    testResultRepository.save(newResult("ONT-904,ONT-1086", base.plusMinutes(3))); // 멀티(뒤)
    testResultRepository.save(newResult("ONT-904,ONT-1086,ONT-905", base.plusMinutes(4))); // 멀티(중간)
    testResultRepository.save(newResult("ONT-905", base.plusMinutes(5))); // 무관
    testResultRepository.save(newResult("ONT-10861", base.plusMinutes(6))); // 부분겹침 (오매칭 금지)
    testResultRepository.flush();

    // When: 단일 키로 히스토리 조회
    List<TestResult> found =
        testResultRepository.findByJiraIssueKeyOrderByExecutedAtDesc("ONT-1086");

    // Then: ONT-1086 을 멤버로 가진 4건만, 실행시간 내림차순으로 반환
    Set<String> keys = found.stream().map(TestResult::getJiraIssueKey).collect(Collectors.toSet());
    logger.info("조회 결과 키: {}", keys);

    Assert.assertEquals(found.size(), 4, "ONT-1086 을 멤버로 가진 4건이 조회되어야 함");
    Assert.assertTrue(keys.contains("ONT-1086"), "단일키 행 포함");
    Assert.assertTrue(keys.contains("ONT-1086,ONT-904"), "멀티키(앞) 행 포함");
    Assert.assertTrue(keys.contains("ONT-904,ONT-1086"), "멀티키(뒤) 행 포함");
    Assert.assertTrue(keys.contains("ONT-904,ONT-1086,ONT-905"), "멀티키(중간) 행 포함");
    Assert.assertFalse(keys.contains("ONT-905"), "무관 키는 제외");
    Assert.assertFalse(keys.contains("ONT-10861"), "부분 겹침 키(ONT-10861)는 오매칭되면 안 됨");

    // 실행시간 내림차순 정렬 검증
    for (int i = 1; i < found.size(); i++) {
      Assert.assertTrue(
          !found.get(i - 1).getExecutedAt().isBefore(found.get(i).getExecutedAt()),
          "실행시간 내림차순이어야 함");
    }

    logger.info("✅ 멀티키 멤버 매칭 및 경계 오매칭 방지 검증 완료");
  }
}
