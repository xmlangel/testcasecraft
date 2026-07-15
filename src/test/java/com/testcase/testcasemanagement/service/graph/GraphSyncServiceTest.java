package com.testcase.testcasemanagement.service.graph;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.TestCase;
import java.util.List;
import java.util.Map;
import org.testng.annotations.Test;

/**
 * GraphSyncService 의 태그 겹침 유사도 알고리즘({@link GraphSyncService#computeSharedTagPairs}) 단위 테스트. Cypher
 * 방출(syncSimilarity)은 AgensGraph 가 있어야 하므로, 순수 계산 로직만 검증한다.
 */
public class GraphSyncServiceTest {

  private static final int MAX = 50;

  private TestCase tc(String id, String type, List<String> tags) {
    TestCase t = new TestCase();
    t.setId(id);
    t.setType(type);
    t.setTags(tags);
    return t;
  }

  @Test(description = "두 케이스가 공유한 태그 수를 정확히 센다")
  public void countsSharedTags() {
    List<TestCase> cases =
        List.of(
            tc("a", "testcase", List.of("login", "smoke", "auth")),
            tc("b", "testcase", List.of("login", "auth", "regression")));

    Map<String, Integer> pairs = GraphSyncService.computeSharedTagPairs(cases, MAX);

    assertEquals(pairs.get("a|b"), Integer.valueOf(2)); // login, auth
  }

  @Test(description = "키는 항상 작은id|큰id 순서로 결정적이다")
  public void keyIsDeterministicallyOrdered() {
    List<TestCase> cases =
        List.of(
            tc("zzz", "testcase", List.of("x", "y")),
            tc("aaa", "testcase", List.of("x", "y")));

    Map<String, Integer> pairs = GraphSyncService.computeSharedTagPairs(cases, MAX);

    assertTrue(pairs.containsKey("aaa|zzz"));
    assertFalse(pairs.containsKey("zzz|aaa"));
    assertEquals(pairs.get("aaa|zzz"), Integer.valueOf(2));
  }

  @Test(description = "너무 흔한(비변별적) 태그는 유사도 계산에서 제외한다")
  public void skipsNonDiscriminativeTags() {
    // 'common' 은 3개 케이스가 공유 → maxCasesPerTag=2 초과라 제외. 'rare' 만 a,b 를 잇는다.
    List<TestCase> cases =
        List.of(
            tc("a", "testcase", List.of("common", "rare")),
            tc("b", "testcase", List.of("common", "rare")),
            tc("c", "testcase", List.of("common")));

    Map<String, Integer> pairs = GraphSyncService.computeSharedTagPairs(cases, 2);

    assertEquals(pairs.get("a|b"), Integer.valueOf(1)); // rare 만 집계, common 은 제외
    assertNull(pairs.get("a|c"));
    assertNull(pairs.get("b|c"));
  }

  @Test(description = "폴더와 태그 없는 케이스는 제외한다")
  public void excludesFoldersAndUntagged() {
    List<TestCase> cases =
        List.of(
            tc("folder1", "folder", List.of("login", "auth")),
            tc("a", "testcase", List.of("login", "auth")),
            tc("b", "testcase", null));

    Map<String, Integer> pairs = GraphSyncService.computeSharedTagPairs(cases, MAX);

    assertTrue(pairs.isEmpty()); // 폴더 제외 + b 태그없음 → 유효 쌍 없음
  }

  @Test(description = "공유 태그가 없으면 쌍이 생기지 않는다")
  public void noPairWhenNoSharedTag() {
    List<TestCase> cases =
        List.of(
            tc("a", "testcase", List.of("x")), tc("b", "testcase", List.of("y")));

    Map<String, Integer> pairs = GraphSyncService.computeSharedTagPairs(cases, MAX);

    assertTrue(pairs.isEmpty());
  }
}
