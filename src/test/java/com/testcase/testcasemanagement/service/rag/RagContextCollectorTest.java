package com.testcase.testcasemanagement.service.rag;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.dto.rag.RagChatContext;
import com.testcase.testcasemanagement.dto.rag.RagChatRequest;
import com.testcase.testcasemanagement.dto.rag.RagSearchRequest;
import com.testcase.testcasemanagement.dto.rag.RagSearchResponse;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.service.DashboardService;
import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.mockito.ArgumentCaptor;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 재료 수집 동작을 고정한다.
 *
 * <p>이 클래스는 실패를 삼키는 성질이 있다. DB 조회가 실패해도 예외를 올리지 않고 그만큼 빈 재료로 답한다. 그래서 <b>실패했을 때 무엇이 남는지</b>를 시험으로
 * 남기는 것이 중요하다. 예외가 올라가지 않는다는 것만 확인하면, 조회가 통째로 실패해도 시험이 통과한다.
 */
public class RagContextCollectorTest {

  private RagService ragService;
  private DashboardService dashboardService;
  private TestCaseRepository testCaseRepository;
  private TestResultRepository testResultRepository;
  private RagSqlExecutor sqlExecutor;
  private RagDataSummarizer dataSummarizer;
  private RagContextCollector collector;

  @BeforeMethod
  public void setUp() {
    ragService = mock(RagService.class);
    dashboardService = mock(DashboardService.class);
    testCaseRepository = mock(TestCaseRepository.class);
    testResultRepository = mock(TestResultRepository.class);
    sqlExecutor = mock(RagSqlExecutor.class);
    dataSummarizer = mock(RagDataSummarizer.class);
    collector =
        new RagContextCollector(
            ragService,
            dashboardService,
            testCaseRepository,
            testResultRepository,
            sqlExecutor,
            dataSummarizer);
  }

  // ---------- 문서 검색 ----------

  @Test(description = "요청이 값을 주지 않으면 기본 유사도와 개수로 검색한다")
  public void usesDefaultSearchSettings() {
    when(ragService.searchSimilar(any())).thenReturn(emptySearchResponse());

    collector.searchRelevantContext(request("질문"));

    ArgumentCaptor<RagSearchRequest> captor = ArgumentCaptor.forClass(RagSearchRequest.class);
    verify(ragService).searchSimilar(captor.capture());
    assertEquals(captor.getValue().getSimilarityThreshold(), 0.7, "기본 유사도");
    assertEquals(captor.getValue().getMaxResults().intValue(), 5, "기본 개수");
  }

  @Test(description = "요청이 값을 주면 그 값으로 검색한다")
  public void honoursRequestedSearchSettings() {
    when(ragService.searchSimilar(any())).thenReturn(emptySearchResponse());
    RagChatRequest request = request("질문");
    request.setSimilarityThreshold(0.9);
    request.setMaxContextResults(3);

    collector.searchRelevantContext(request);

    ArgumentCaptor<RagSearchRequest> captor = ArgumentCaptor.forClass(RagSearchRequest.class);
    verify(ragService).searchSimilar(captor.capture());
    assertEquals(captor.getValue().getSimilarityThreshold(), 0.9);
    assertEquals(captor.getValue().getMaxResults().intValue(), 3);
  }

  @Test(description = "대화 기록 문서는 스레드 제목을 제목으로 쓴다")
  public void prefersThreadTitleOverFileName() {
    // RAG 문서가 지난 대화라면 파일명이 뜻을 담지 않는다. 메타데이터의 스레드 제목이 더 낫다.
    when(ragService.searchSimilar(any()))
        .thenReturn(
            searchResponse(
                result("chunk-1.txt", "지난 대화 내용", Map.of("threadTitle", "배포 절차 문의"))));

    List<RagChatContext> contexts = collector.searchRelevantContext(request("질문"));

    assertEquals(contexts.size(), 1);
    assertEquals(contexts.get(0).getTitle(), "배포 절차 문의", "스레드 제목을 제목으로 쓴다");
    assertEquals(contexts.get(0).getFileName(), "chunk-1.txt", "파일명은 그대로 남긴다");
  }

  @Test(description = "스네이크 표기 스레드 제목도 읽는다")
  public void readsSnakeCaseThreadTitle() {
    // 저장 시점에 따라 두 표기가 섞여 있다. 한쪽만 읽으면 절반이 파일명으로 떨어진다.
    when(ragService.searchSimilar(any()))
        .thenReturn(
            searchResponse(result("chunk-2.txt", "내용", Map.of("thread_title", "권한 오류 문의"))));

    List<RagChatContext> contexts = collector.searchRelevantContext(request("질문"));

    assertEquals(contexts.get(0).getTitle(), "권한 오류 문의");
  }

  @Test(description = "스레드 제목이 없거나 비면 파일명으로 대체한다")
  public void fallsBackToFileNameForTitle() {
    when(ragService.searchSimilar(any()))
        .thenReturn(
            searchResponse(
                result("절차서.md", "내용", null),
                result("규정.md", "내용", Map.of("threadTitle", "   "))));

    List<RagChatContext> contexts = collector.searchRelevantContext(request("질문"));

    assertEquals(contexts.get(0).getTitle(), "절차서.md", "메타데이터가 없으면 파일명");
    assertEquals(contexts.get(1).getTitle(), "규정.md", "빈 제목도 없는 것으로 본다");
  }

  // ---------- DB 재료 ----------

  @Test(description = "의도가 요구하지 않으면 조회하지 않는다")
  public void skipsQueriesNotRequested() {
    QueryIntent intent = QueryIntent.builder().build();

    Map<String, Object> context = collector.fetchDbContext("p-1", intent);

    assertTrue(context.isEmpty(), "쓰지 않을 재료를 모으지 않는다");
    verify(dashboardService, never()).getProjectStatistics(anyString());
    verify(testResultRepository, never()).findRecentTestResultsByProject(anyString(), any());
  }

  @Test(description = "검색 키워드가 비면 케이스를 찾지 않는다")
  public void skipsSearchWhenNoKeyword() {
    QueryIntent intent =
        QueryIntent.builder().needsTestCaseSearch(true).searchKeywords(List.of()).build();

    Map<String, Object> context = collector.fetchDbContext("p-1", intent);

    assertFalse(context.containsKey("searchResults"), "키워드 없이 검색하지 않는다");
  }

  @Test(description = "SQL 실행이 실패해도 나머지 재료는 남는다")
  public void keepsOtherContextWhenSqlFails() {
    // 이 클래스가 실패를 삼키는 성질을 고정한다. SQL 하나가 실패해도 통계는 살아 있어야 한다.
    when(dashboardService.getProjectStatistics("p-1")).thenReturn(null);
    when(sqlExecutor.executeSelect(anyString(), anyString()))
        .thenThrow(new RuntimeException("문법 오류"));
    QueryIntent intent =
        QueryIntent.builder()
            .needsStatistics(true)
            .generatedSql("SELECT 1")
            .build();

    Map<String, Object> context = collector.fetchDbContext("p-1", intent);

    assertTrue(context.containsKey("statistics"), "통계는 남는다");
    assertFalse(context.containsKey("sqlData"), "실패한 SQL 결과는 담지 않는다");
  }

  @Test(description = "SQL 결과는 요약해서 담는다")
  public void summarizesSqlResults() {
    // 원본 행을 그대로 프롬프트에 실으면 길이가 폭발한다.
    when(sqlExecutor.executeSelect(anyString(), anyString()))
        .thenReturn(List.of(Map.of("cnt", 42)));
    when(dataSummarizer.summarize(any(), any(), any(Boolean.class))).thenReturn("케이스 42건");
    QueryIntent intent = QueryIntent.builder().generatedSql("SELECT count(*)").build();

    Map<String, Object> context = collector.fetchDbContext("p-1", intent);

    assertEquals(context.get("sqlData"), "케이스 42건", "요약본을 담는다");
  }

  // ---------- 시험 재료 ----------

  private RagChatRequest request(String message) {
    RagChatRequest request = new RagChatRequest();
    request.setMessage(message);
    request.setProjectId(UUID.randomUUID());
    return request;
  }

  private RagSearchResponse emptySearchResponse() {
    return RagSearchResponse.builder().results(List.of()).build();
  }

  private RagSearchResponse searchResponse(RagSearchResponse.SearchResult... results) {
    return RagSearchResponse.builder().results(List.of(results)).build();
  }

  private RagSearchResponse.SearchResult result(
      String fileName, String chunkText, Map<String, Object> metadata) {
    return RagSearchResponse.SearchResult.builder()
        .documentId(UUID.randomUUID())
        .fileName(fileName)
        .chunkText(chunkText)
        .similarityScore(0.8)
        .chunkIndex(0)
        .chunkMetadata(metadata)
        .build();
  }
}
