package com.testcase.testcasemanagement.service.rag;

import com.testcase.testcasemanagement.dto.rag.RagChatContext;
import com.testcase.testcasemanagement.dto.rag.RagChatRequest;
import com.testcase.testcasemanagement.dto.rag.RagSearchRequest;
import com.testcase.testcasemanagement.dto.rag.RagSearchResponse;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.service.DashboardService;
import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

/**
 * 질의에 답하는 데 쓸 재료를 모은다.
 *
 * <p>두 갈래가 있다. RAG 문서에서 비슷한 내용을 찾는 것과, 질의 의도에 따라 DB 에서 통계·케이스·실행 이력·SQL 결과를 가져오는 것이다. 둘 다 외부에서
 * 재료를 가져오는 일이라 한 곳에 두었다.
 *
 * <p>`RagChatServiceImpl` 에서 떼어냈다. 그 클래스가 이 두 메서드 때문에 저장소·대시보드·질의 분석·SQL 실행·요약까지 일곱을 의존했고, 채팅 흐름을
 * 읽으려는 사람이 그것들을 함께 봐야 했다.
 *
 * <p>실패를 삼키는 것이 이 클래스의 성질이다. DB 조회가 실패해도 예외를 올리지 않고 그만큼 빈 재료로 답한다. 재료가 부족한 답이 답이 없는 것보다 나으므로
 * 의도한 것이고, 대신 무엇이 실패했는지 로그에 남긴다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RagContextCollector {

  /** 검색 유사도 기본값. 요청이 지정하지 않으면 이 값을 쓴다. */
  private static final double DEFAULT_SIMILARITY_THRESHOLD = 0.7;

  /** 검색 결과 개수 기본값. */
  private static final int DEFAULT_MAX_RESULTS = 5;

  /** 케이스 검색과 실행 이력을 프롬프트에 실을 최대 개수. 넘기면 프롬프트가 길어져 모델이 앞을 잊는다. */
  private static final int CONTEXT_ROW_LIMIT = 5;

  private final RagService ragService;
  private final DashboardService dashboardService;
  private final TestCaseRepository testCaseRepository;
  private final TestResultRepository testResultRepository;
  private final RagSqlExecutor sqlExecutor;
  private final RagDataSummarizer dataSummarizer;

  /** RAG 검색으로 관련 컨텍스트 가져오기 */
  public List<RagChatContext> searchRelevantContext(RagChatRequest request) {
    // null 값 기본값 처리
    Double similarityThreshold =
        request.getSimilarityThreshold() != null
            ? request.getSimilarityThreshold()
            : DEFAULT_SIMILARITY_THRESHOLD;

    Integer maxResults =
        request.getMaxContextResults() != null
            ? request.getMaxContextResults()
            : DEFAULT_MAX_RESULTS;

    RagSearchRequest searchRequest =
        RagSearchRequest.builder()
            .queryText(request.getMessage())
            .projectId(request.getProjectId())
            .similarityThreshold(similarityThreshold)
            .maxResults(maxResults)
            .build();

    RagSearchResponse searchResponse = ragService.searchSimilar(searchRequest);

    return searchResponse.getResults().stream()
        .map(
            result -> {
              Map<String, Object> metadata = result.getChunkMetadata();
              String resolvedTitle = result.getFileName();
              if (metadata != null) {
                Object threadTitle = metadata.get("threadTitle");
                if (threadTitle instanceof String threadTitleStr && !threadTitleStr.isBlank()) {
                  resolvedTitle = threadTitleStr;
                } else {
                  Object snakeCaseTitle = metadata.get("thread_title");
                  if (snakeCaseTitle instanceof String threadTitleSnake
                      && !threadTitleSnake.isBlank()) {
                    resolvedTitle = threadTitleSnake;
                  }
                }
              }

              return RagChatContext.builder()
                  .id(result.getDocumentId())
                  .fileName(result.getFileName())
                  .title(resolvedTitle != null ? resolvedTitle : result.getFileName())
                  .chunkText(result.getChunkText())
                  .similarity(result.getSimilarityScore())
                  .chunkIndex(result.getChunkIndex())
                  .metadata(metadata)
                  .build();
            })
        .collect(Collectors.toList());
  }


  /** 의도에 따른 DB 데이터 조회 */
  public Map<String, Object> fetchDbContext(String projectId, QueryIntent intent) {
    Map<String, Object> context = new HashMap<>();

    try {
      // 1. 통계 정보
      if (intent.isNeedsStatistics()) {
        context.put("statistics", dashboardService.getProjectStatistics(projectId));
      }

      // 2. 테스트케이스 검색
      if (intent.isNeedsTestCaseSearch()
          && intent.getSearchKeywords() != null
          && !intent.getSearchKeywords().isEmpty()) {
        List<TestCase> allResults = new ArrayList<>();
        for (String keyword : intent.getSearchKeywords()) {
          allResults.addAll(testCaseRepository.searchByKeyword(projectId, keyword));
        }
        // 중복을 없애고 상위 몇 건만 남긴다. 넘기면 프롬프트가 길어져 모델이 앞을 잊는다.
        context.put(
            "searchResults",
            allResults.stream().distinct().limit(CONTEXT_ROW_LIMIT).collect(Collectors.toList()));
      }

      // 3. 최근 실행 결과
      if (intent.isNeedsRecentResults()) {
        Pageable pageable = PageRequest.of(0, CONTEXT_ROW_LIMIT);
        context.put(
            "recentResults",
            testResultRepository.findRecentTestResultsByProject(projectId, pageable));
      }

      // 4. SQL 기반 정밀 데이터 조회 및 요약
      if (intent.getGeneratedSql() != null && !intent.getGeneratedSql().isBlank()) {
        try {
          List<Map<String, Object>> sqlResults =
              sqlExecutor.executeSelect(intent.getGeneratedSql(), projectId);
          String summary =
              dataSummarizer.summarize(
                  sqlResults, intent.getJustification(), intent.isNeedsFullList());
          context.put("sqlData", summary);
        } catch (Exception e) {
          log.warn("SQL 실행 또는 요약 실패: {}", e.getMessage());
        }
      }
    } catch (Exception e) {
      log.error("DB 컨텍스트 조회 실패: {}", e.getMessage());
    }

    return context;
  }
}
