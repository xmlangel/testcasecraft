package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.exception.RagDisabledException;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.rag.RagChatThread;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import com.testcase.testcasemanagement.service.llm.LlmModelCatalog;
import com.testcase.testcasemanagement.service.llm.LlmModelCatalogFactory;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import com.testcase.testcasemanagement.service.rag.RagDataSummarizer;
import com.testcase.testcasemanagement.service.rag.RagPromptBuilder;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import com.testcase.testcasemanagement.service.rag.RagSqlExecutor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
  private final LlmModelCatalogFactory llmModelCatalogFactory;
  private final EncryptionUtil encryptionUtil;
  private final SystemSettingService systemSettingService;
  private final DashboardService dashboardService;
  private final TestCaseRepository testCaseRepository;
  private final TestResultRepository testResultRepository;
  private final RagQueryAnalyzer queryAnalyzer;
  private final RagSqlExecutor sqlExecutor;
  private final RagDataSummarizer dataSummarizer;
  private final RagPromptBuilder promptBuilder;

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
      LlmConfig llmConfig = resolveLlmConfig(request);
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
      List<RagChatMessage> messages =
          promptBuilder.buildMessages(request, contextSources, dbContext, intent, llmConfig);

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
                LlmConfig llmConfig = resolveLlmConfig(request);

                // 2. 질의 의도 분석 및 DB 데이터 가져오기
                String projectIdStr = request.getProjectId().toString();
                QueryIntent intent =
                    queryAnalyzer.analyzeIntent(request.getMessage(), projectIdStr);
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
                List<RagChatMessage> messages =
                    promptBuilder.buildMessages(request, contextSources, dbContext, intent, llmConfig);

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

  /**
   * 이번 질의에 쓸 LLM 설정을 정한다.
   *
   * <p>요청이 모델을 지정했으면 그 모델로 바꿔 쓴다. 관리자가 설정을 고치지 않고도 사용자가 화면에서 모델을 골라 쓸 수 있게 하려는 것이다. 다만 아무 모델이나
   * 허용하면 사용자가 유료 모델을 골라 과금이 발생한다. 그래서 <b>모델 목록을 내주는 제공자에 한해, 그 목록에 있는 모델만</b> 허용한다. 목록에 없으면 요청을
   * 거부하지 않고 설정의 기본 모델로 진행하며 그 사실을 로그에 남긴다. 모델 하나 때문에 대화가 끊기는 것보다 낫다.
   *
   * <p>저장된 엔티티를 그대로 고치면 영속 상태가 바뀌어 DB 에 반영될 수 있다. 그래서 복사본을 만들어 쓴다.
   */
  private LlmConfig resolveLlmConfig(RagChatRequest request) {
    LlmConfig config = getLlmConfig(request.getLlmConfigId());

    String requestedModel = request.getModel();
    if (requestedModel == null || requestedModel.isBlank()) {
      return config;
    }
    String model = requestedModel.trim();
    if (model.equals(config.getModelName())) {
      return config;
    }

    // 목록을 내주는 제공자에서만 모델 지정을 허용한다. 목록이 없으면 무엇이 허용된 모델인지
    // 판단할 근거가 없고, 그러면 사용자가 유료 모델을 골라 과금이 붙는 경로가 열린다.
    LlmModelCatalog catalog = llmModelCatalogFactory.find(config.getProvider()).orElse(null);
    if (catalog == null) {
      log.warn(
          "⚠️ {} 는 모델 목록을 제공하지 않아 모델 지정을 무시한다: 요청={}",
          config.getProvider().getDisplayName(),
          model);
      return config;
    }

    if (!isAllowedModel(catalog, config, model)) {
      log.warn("⚠️ 목록에 없는 모델이라 무시하고 기본 모델을 쓴다: 요청={}", model);
      return config;
    }

    LlmConfig overridden = copyWithModel(config, model);
    log.info("🔀 사용자가 고른 모델로 진행: {} → {}", config.getModelName(), model);
    return overridden;
  }

  /**
   * 요청한 모델이 이 설정의 키로 고를 수 있는 목록에 있는지 확인한다.
   *
   * <p>제공자마다 목록의 성질이 달라도 판정 방법은 같다. 그 제공자의 카탈로그가 내주는 목록에 있으면 허용한다. OpenRouter 는 무료 모델만 목록에 오르고,
   * NVIDIA 는 채팅 가능한 모델이 오른다. 어느 쪽이든 목록 밖 모델은 받지 않는다.
   */
  private boolean isAllowedModel(LlmModelCatalog catalog, LlmConfig config, String model) {
    try {
      String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());
      return catalog.listSelectableModels(apiKey).stream()
          .anyMatch(candidate -> model.equals(candidate.getId()));
    } catch (Exception e) {
      log.warn("⚠️ 모델 목록을 확인할 수 없어 모델 지정을 무시한다: {}", e.getMessage());
      return false;
    }
  }

  /** 모델만 바꾼 복사본. 영속 엔티티를 고치지 않기 위한 것이다. */
  private LlmConfig copyWithModel(LlmConfig source, String model) {
    LlmConfig copy = new LlmConfig();
    copy.setId(source.getId());
    copy.setName(source.getName());
    copy.setProvider(source.getProvider());
    copy.setApiUrl(source.getApiUrl());
    copy.setEncryptedApiKey(source.getEncryptedApiKey());
    copy.setModelName(model);
    copy.setTestCaseTemplate(source.getTestCaseTemplate());
    copy.setIsActive(source.getIsActive());
    copy.setIsDefault(source.getIsDefault());
    return copy;
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


  /** 의도에 따른 DB 데이터 조회 */
  private Map<String, Object> fetchDbContext(String projectId, QueryIntent intent) {
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
        // 중복 제거 및 상위 5개 제한
        context.put(
            "searchResults", allResults.stream().distinct().limit(5).collect(Collectors.toList()));
      }

      // 3. 최근 실행 결과
      if (intent.isNeedsRecentResults()) {
        Pageable pageable = PageRequest.of(0, 5);
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

  private void checkRagEnabled() {
    if (!systemSettingService.getBooleanSetting("RAG_ENABLED", true)) {
      throw new RagDisabledException();
    }
  }
}
