package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.rag.RagChatThread;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import com.testcase.testcasemanagement.service.rag.RagDataSummarizer;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import com.testcase.testcasemanagement.service.rag.RagSqlExecutor;
import com.testcase.testcasemanagement.dto.ProjectStatisticsDto;
import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * RAG 채팅 서비스 구현
 *
 * <p>RAG 문서 검색과 LLM 질의응답을 통합하여 제공
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RagChatServiceImpl implements RagChatService {

  private final RagService ragService;
  private final LlmConfigRepository llmConfigRepository;
  private final ProjectRepository projectRepository;
  private final RagChatConversationService conversationService;
  private final LlmClientFactory llmClientFactory;
  private final SystemSettingService systemSettingService;
  private final DashboardService dashboardService;
  private final TestCaseRepository testCaseRepository;
  private final TestResultRepository testResultRepository;
  private final RagQueryAnalyzer queryAnalyzer;
  private final RagSqlExecutor sqlExecutor;
  private final RagDataSummarizer dataSummarizer;

  @Override
  public RagChatResponse chat(RagChatRequest request, String username) {
    checkRagEnabled();
    long startTime = System.currentTimeMillis();

    try {
      log.info("💬 RAG 채팅 요청: user={}, message={}", username, request.getMessage());

      Project project =
          projectRepository
              .findById(request.getProjectId().toString())
              .orElseThrow(
                  () -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + request.getProjectId()));

      boolean persistConversation =
          request.getPersistConversation() == null
              || Boolean.TRUE.equals(request.getPersistConversation());

      RagChatThread thread = null;
      com.testcase.testcasemanagement.model.rag.RagChatMessage storedUserMessage = null;
      com.testcase.testcasemanagement.model.rag.RagChatMessage storedAssistantMessage = null;
      List<String> categoryIds =
          request.getCategoryIds() != null ? request.getCategoryIds() : Collections.emptyList();

      // 1. LLM 설정 가져오기
      LlmConfig llmConfig = getLlmConfig(request.getLlmConfigId());
      log.info(
          "🔧 LLM 설정: provider={}, model={}, requestedLlmConfigId={}, actualConfigId={}",
          llmConfig.getProvider(),
          llmConfig.getModelName(),
          request.getLlmConfigId(),
          llmConfig.getId());

      // 2. 질의 의도 분석 및 DB 데이터 가져오기 (지능형 컨텍스트)
      String projectIdStr = request.getProjectId().toString();
      QueryIntent intent = queryAnalyzer.analyzeIntent(request.getMessage(), projectIdStr);
      Map<String, Object> dbContext = fetchDbContext(projectIdStr, intent);

      // 3. RAG 문서 검색으로 관련 컨텍스트 가져오기 (useRagSearch 옵션 확인)
      boolean useRagSearch =
          request.getUseRagSearch() == null || Boolean.TRUE.equals(request.getUseRagSearch());
      List<RagChatContext> contextSources =
          useRagSearch ? searchRelevantContext(request) : Collections.emptyList();

      if (useRagSearch) {
        log.info("📚 RAG 검색 활성화 - 검색된 컨텍스트: {} 개", contextSources.size());
      } else {
        log.info("💬 순수 LLM 대화 모드 - RAG 검색 스킵");
      }

      // 4. 시스템 프롬프트 + 컨텍스트 + 대화 히스토리 구성
      List<RagChatMessage> messages = buildMessages(request, contextSources, dbContext, intent, llmConfig);

      if (persistConversation) {
        thread = conversationService.ensureThread(project, request, username);
        categoryIds = thread.getCategories().stream().map(category -> category.getId()).toList();
        storedUserMessage =
            conversationService.persistUserMessage(thread, request.getMessage(), username);
      }

      // 4. LLM 클라이언트 선택 및 질의
      LlmClient llmClient = llmClientFactory.getClient(llmConfig);
      LlmClient.LlmResponse llmResponse =
          llmClient.chat(llmConfig, messages, request.getTemperature(), request.getMaxTokens());

      log.info("✅ LLM 응답 생성 완료: tokens={}", llmResponse.getTokensUsed());

      if (persistConversation && thread != null && storedUserMessage != null) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("llmProvider", llmConfig.getProvider().name());
        metadata.put("llmModel", llmResponse.getModel());

        storedAssistantMessage =
            conversationService.persistAssistantMessage(
                thread,
                llmResponse.getContent(),
                username,
                storedUserMessage.getId(),
                llmConfig.getProvider().name(),
                llmResponse.getModel(),
                llmResponse.getTokensUsed(),
                request.getTemperature(),
                contextSources,
                metadata,
                request.getMessage());
      }

      // 5. 응답 구성
      long responseTime = System.currentTimeMillis() - startTime;
      return RagChatResponse.builder()
          .answer(llmResponse.getContent())
          .llmProvider(llmConfig.getProvider().name())
          .modelName(llmResponse.getModel())
          .documents(RagChatResponse.contextsToDocuments(contextSources))
          .contextCount(contextSources.size())
          .generatedAt(LocalDateTime.now())
          .tokensUsed(llmResponse.getTokensUsed())
          .responseTime(responseTime)
          .error(false)
          .threadId(thread != null ? thread.getId() : request.getThreadId())
          .userMessageId(storedUserMessage != null ? storedUserMessage.getId() : null)
          .assistantMessageId(
              storedAssistantMessage != null ? storedAssistantMessage.getId() : null)
          .categoryIds(categoryIds)
          .build();

    } catch (Exception e) {
      log.error("❌ RAG 채팅 실패", e);
      long responseTime = System.currentTimeMillis() - startTime;

      return RagChatResponse.builder()
          .answer("죄송합니다. 응답 생성 중 오류가 발생했습니다.")
          .error(true)
          .errorMessage(e.getMessage())
          .generatedAt(LocalDateTime.now())
          .responseTime(responseTime)
          .build();
    }
  }

  @Override
  public SseEmitter chatStream(RagChatRequest request, String username) {
    checkRagEnabled();
    log.info(
        "💬 RAG 채팅 스트리밍 요청: user={}, message={}, persistConversation={}",
        username,
        request.getMessage(),
        request.getPersistConversation());

    SseEmitter emitter = new SseEmitter(180000L); // 180초 (3분) 타임아웃

    // 비동기 스트리밍 처리
    new Thread(
            () -> {
              try {
                // 1. LLM 설정 가져오기
                LlmConfig llmConfig = getLlmConfig(request.getLlmConfigId());

                // 2. 질의 의도 분석 및 DB 데이터 가져오기
                String projectIdStr = request.getProjectId().toString();
                QueryIntent intent = queryAnalyzer.analyzeIntent(request.getMessage(), projectIdStr);
                Map<String, Object> dbContext = fetchDbContext(projectIdStr, intent);

                // 3. RAG 문서 검색 (useRagSearch 옵션 확인)
                boolean useRagSearch =
                    request.getUseRagSearch() == null
                        || Boolean.TRUE.equals(request.getUseRagSearch());
                List<RagChatContext> contextSources =
                    useRagSearch ? searchRelevantContext(request) : Collections.emptyList();

                if (useRagSearch) {
                  log.info("📚 RAG 검색 활성화 (스트리밍) - 검색된 컨텍스트: {} 개", contextSources.size());
                } else {
                  log.info("💬 순수 LLM 대화 모드 (스트리밍) - RAG 검색 스킵");
                }

                // 먼저 컨텍스트 정보 전송
                emitter.send(SseEmitter.event().name("context").data(contextSources));

                // 4. 메시지 구성
                List<RagChatMessage> messages = buildMessages(request, contextSources, dbContext, intent, llmConfig);

                // 4. LLM 스트리밍 호출
                LlmClient llmClient = llmClientFactory.getClient(llmConfig);
                boolean[] streamCompleted = {false}; // 스트리밍 완료 플래그

                try {
                  llmClient.chatStream(
                      llmConfig,
                      messages,
                      request.getTemperature(),
                      request.getMaxTokens(),
                      (chunk, isLast) -> {
                        try {
                          if (!chunk.isEmpty()) {
                            emitter.send(SseEmitter.event().name("chunk").data(chunk));
                          }
                          if (isLast) {
                            emitter.send(SseEmitter.event().name("done").data(""));
                            emitter.complete();
                            streamCompleted[0] = true;
                            log.info("✅ RAG 채팅 스트리밍 완료");
                          }
                        } catch (Exception e) {
                          log.error("❌ SSE 전송 실패", e);
                          emitter.completeWithError(e);
                        }
                      });

                  // 스트리밍이 정상적으로 완료되지 않은 경우 강제 완료
                  if (!streamCompleted[0]) {
                    log.warn("⚠️ 스트리밍이 완료되지 않아 강제 종료합니다");
                    emitter.send(SseEmitter.event().name("done").data(""));
                    emitter.complete();
                  }
                } catch (Exception streamEx) {
                  log.error("❌ LLM 스트리밍 처리 중 에러", streamEx);
                  throw streamEx;
                }

              } catch (Exception e) {
                log.error("❌ RAG 채팅 스트리밍 실패", e);
                try {
                  emitter.send(SseEmitter.event().name("error").data(e.getMessage()));
                  emitter.completeWithError(e);
                } catch (Exception ex) {
                  log.error("❌ 에러 전송 실패", ex);
                }
              }
            })
        .start();

    return emitter;
  }

  /** LLM 설정 가져오기 (ID 지정 or 기본 설정) Repository에서 직접 조회하여 암호화된 API Key 포함 */
  private LlmConfig getLlmConfig(String llmConfigId) {
    if (llmConfigId != null) {
      return llmConfigRepository
          .findById(llmConfigId)
          .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + llmConfigId));
    } else {
      return llmConfigRepository
          .findByIsDefaultTrueAndIsActiveTrue()
          .orElseThrow(() -> new IllegalStateException("기본 LLM 설정이 없습니다. 관리자에게 문의하세요."));
    }
  }

  /** RAG 검색으로 관련 컨텍스트 가져오기 */
  private List<RagChatContext> searchRelevantContext(RagChatRequest request) {
    // null 값 기본값 처리
    Double similarityThreshold =
        request.getSimilarityThreshold() != null
            ? request.getSimilarityThreshold()
            : 0.7; // 기본값: 0.7

    Integer maxResults =
        request.getMaxContextResults() != null ? request.getMaxContextResults() : 5; // 기본값: 5

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

  /** LLM에게 전달할 메시지 리스트 구성 */
  private List<RagChatMessage> buildMessages(
      RagChatRequest request, List<RagChatContext> contextSources, Map<String, Object> dbContext, QueryIntent intent, LlmConfig llmConfig) {
    List<RagChatMessage> messages = new ArrayList<>();
 
    // 1. 시스템 프롬프트 (RAG 컨텍스트 및 DB 데이터 포함)
    String systemPrompt = buildSystemPrompt(contextSources, dbContext, intent, llmConfig);
    messages.add(RagChatMessage.system(systemPrompt));

    // 2. 대화 히스토리 추가 (있으면)
    if (request.getConversationHistory() != null && !request.getConversationHistory().isEmpty()) {
      messages.addAll(request.getConversationHistory());
    }

    // 3. 현재 사용자 질문
    messages.add(RagChatMessage.user(request.getMessage()));

    return messages;
  }

  /** RAG 컨텍스트 및 DB 데이터를 포함한 시스템 프롬프트 생성 */
  private String buildSystemPrompt(List<RagChatContext> contextSources, Map<String, Object> dbContext, QueryIntent intent, LlmConfig llmConfig) {
    StringBuilder prompt = new StringBuilder();
 
    prompt.append("당신은 테스트 케이스 관리 시스템의 AI 어시스턴트입니다.\n");
    prompt.append("사용자의 질문에 답변할 때, 제공된 시스템 통계(DB)와 참고 문서(RAG)를 바탕으로 가장 정확한 정보를 제공하세요.\n\n");

    // 0. 테스트케이스 생성 요청 처리
    if (intent != null && intent.isNeedsTestCaseGeneration()) {
        String template = (llmConfig != null && llmConfig.getTestCaseTemplate() != null && !llmConfig.getTestCaseTemplate().isBlank())
            ? llmConfig.getTestCaseTemplate()
            : LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE;

        prompt.append("=== 테스트케이스 생성 가이드 ===\n");
        prompt.append("사용자가 테스트케이스 생성을 요청하거나 관련 질문을 하는 경우, 다음 지침을 따르세요:\n");
        prompt.append("1. 정보가 충분한 경우: 아래 JSON 형식을 참고하여 테스트케이스를 생성하고 응답에 JSON 블록을 포함하세요.\n");
        prompt.append("2. 정보가 부족하거나 모호한 경우: 바로 생성하지 말고, 어떤 기능을 테스트하고 싶은지, 특별한 조건이 있는지 등 필요한 정보를 사용자에게 추가로 질문하여 의도를 명확히 파악하세요.\n\n");
        prompt.append("```json\n");
        prompt.append(template.trim());
        prompt.append("\n```\n\n");
        prompt.append("==============================\n\n");
    }

    // 1. DB 컨텍스트 추가 (통계, 검색 결과 등)
    if (dbContext != null && !dbContext.isEmpty()) {
      prompt.append("=== 시스템 실시간 데이터 (DB) ===\n");
      
      if (dbContext.containsKey("statistics")) {
        ProjectStatisticsDto stats = (ProjectStatisticsDto) dbContext.get("statistics");
        prompt.append(String.format("- 프로젝트: %s\n", stats.getProjectName()));
        prompt.append(String.format("- 총 테스트 케이스: %d개\n", stats.getTotalTestCases()));
        prompt.append(String.format("- 실행된 케이스: %d개 (실행률: %.1f%%)\n", stats.getExecutedTestCases(), stats.getExecutionRate()));
        prompt.append(String.format("- 결과 현황: Pass(%d), Fail(%d), Blocked(%d), NotRun(%d)\n", 
            stats.getPassedTestCases(), stats.getFailedTestCases(), stats.getBlockedTestCases(), stats.getNotRunTestCases()));
        if (stats.getLastExecutionDate() != null) {
          prompt.append(String.format("- 마지막 실행: %s\n", stats.getLastExecutionDate()));
        }
      }

      if (dbContext.containsKey("searchResults")) {
        List<?> results = (List<?>) dbContext.get("searchResults");
        prompt.append("\n[관련 테스트케이스 검색 결과]\n");
        for (Object obj : results) {
          TestCase tc = (TestCase) obj;
          prompt.append(String.format("- [%s] %s (우선순위: %s)\n", tc.getDisplayId(), tc.getName(), tc.getPriority()));
        }
      }

      if (dbContext.containsKey("recentResults")) {
        List<?> results = (List<?>) dbContext.get("recentResults");
        prompt.append("\n[최근 실행 이력]\n");
        for (Object obj : results) {
          TestResult tr = (TestResult) obj;
          prompt.append(String.format("- %s: %s (실행자: %s)\n", tr.getExecutedAt(), tr.getResult(), tr.getExecutedBy() != null ? tr.getExecutedBy().getUsername() : "Unknown"));
        }
      }

      if (dbContext.containsKey("sqlData")) {
        prompt.append("\n[시스템 데이터 분석 결과]\n");
        prompt.append(dbContext.get("sqlData"));
        prompt.append("\n");
      }
      
      prompt.append("==============================\n\n");
    }

    // 2. RAG 컨텍스트 추가
    if (contextSources != null && !contextSources.isEmpty()) {
      prompt.append("=== 참고 문서 (RAG) ===\n");

      for (int i = 0; i < contextSources.size(); i++) {
        RagChatContext context = contextSources.get(i);
        prompt.append(
            String.format(
                "[출처 %d: %s (유사도: %.2f)]\n",
                i + 1,
                context.getFileName(),
                context.getSimilarity() != null ? context.getSimilarity() : 0.0));
        prompt.append(context.getChunkText());
        prompt.append("\n\n");
      }

      prompt.append("======================\n\n");
      prompt.append("위 정보를 참고하여 답변해주세요. ");
      prompt.append("수치 데이터는 '시스템 실시간 데이터'를 우선적으로 신뢰하세요.\n");
      prompt.append("답변할 때는 어느 정보를 참고했는지 명시할 수 있습니다 (예: '시스템 통계에 따르면...', '[출처 1]에 따르면...').\n");
    } else {
      prompt.append("제공된 시스템 데이터를 바탕으로 답변해주세요. ");
      prompt.append("만약 정보가 부족하다면 일반적인 테스팅 지식을 바탕으로 안내해 주세요.");
    }

    return prompt.toString();
  }

  /** 의도에 따른 DB 데이터 조회 */
  private Map<String, Object> fetchDbContext(String projectId, QueryIntent intent) {
    Map<String, Object> context = new HashMap<>();
    
    try {
      // 1. 통계 정보
      if (intent.isNeedsStatistics()) {
        context.put("statistics", dashboardService.getProjectStatistics(projectId));
      }

      // 2. 테스트케이스 검색
      if (intent.isNeedsTestCaseSearch() && intent.getSearchKeywords() != null && !intent.getSearchKeywords().isEmpty()) {
        List<TestCase> allResults = new ArrayList<>();
        for (String keyword : intent.getSearchKeywords()) {
          allResults.addAll(testCaseRepository.searchByKeyword(projectId, keyword));
        }
        // 중복 제거 및 상위 5개 제한
        context.put("searchResults", allResults.stream().distinct().limit(5).collect(Collectors.toList()));
      }

      // 3. 최근 실행 결과
      if (intent.isNeedsRecentResults()) {
        Pageable pageable = PageRequest.of(0, 5);
        context.put("recentResults", testResultRepository.findRecentTestResultsByProject(projectId, pageable));
      }

      // 4. SQL 기반 정밀 데이터 조회 및 요약
      if (intent.getGeneratedSql() != null && !intent.getGeneratedSql().isBlank()) {
        try {
          List<Map<String, Object>> sqlResults = sqlExecutor.executeSelect(intent.getGeneratedSql(), projectId);
          String summary = dataSummarizer.summarize(sqlResults, intent.getJustification());
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

  private void checkRagEnabled() {
    if (!systemSettingService.getBooleanSetting("RAG_ENABLED", true)) {
      throw new IllegalStateException("현재 RAG (AI) 시스템이 안정화를 위해 일시 중지되었습니다. 나중에 다시 시도해주세요.");
    }
  }
}
