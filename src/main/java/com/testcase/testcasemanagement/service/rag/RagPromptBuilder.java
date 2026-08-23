package com.testcase.testcasemanagement.service.rag;

import com.testcase.testcasemanagement.dto.ProjectStatisticsDto;
import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.rag.RagChatContext;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.dto.rag.RagChatRequest;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * LLM 에게 보낼 메시지를 조립한다.
 *
 * <p>이 클래스는 저장소나 외부 서비스에 의존하지 않는다. 받은 재료(검색 결과·DB 통계·질의 의도·설정)로 문자열을 만드는 일만 한다. 그래서 시험에서 목을 만들지 않고
 * 곧바로 확인할 수 있고, 분기가 열한 갈래라 시험 값어치가 크다.
 *
 * <p>`RagChatServiceImpl` 에서 떼어냈다. 그 클래스는 의존성이 열넷이고 채팅 실행·컨텍스트 조립·프롬프트 조립·모델 결정을 함께 다뤄, 프롬프트 한 줄을 고치려면
 * 나머지 셋을 함께 이해해야 했다.
 */
@Component
@Slf4j
public class RagPromptBuilder {

  /**
   * LLM 에게 보낼 메시지 목록을 만든다.
   *
   * <p>순서가 뜻을 갖는다. 시스템 프롬프트가 먼저 오고, 그다음 지난 대화, 마지막이 이번 질문이다. 이 순서가 바뀌면 모델이 맥락을 잘못 읽는다.
   */
  public List<RagChatMessage> buildMessages(
      RagChatRequest request,
      List<RagChatContext> contextSources,
      Map<String, Object> dbContext,
      QueryIntent intent,
      LlmConfig llmConfig) {
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
  public String buildSystemPrompt(
      List<RagChatContext> contextSources,
      Map<String, Object> dbContext,
      QueryIntent intent,
      LlmConfig llmConfig) {
    StringBuilder prompt = new StringBuilder();

    prompt.append("당신은 테스트 케이스 관리 시스템의 AI 어시스턴트입니다.\n");
    prompt.append("사용자의 질문에 답변할 때, 제공된 시스템 통계(DB)와 참고 문서(RAG)를 바탕으로 가장 정확한 정보를 제공하세요.\n\n");

    // 0. 테스트케이스 생성 요청 처리
    if (intent != null && intent.isNeedsTestCaseGeneration()) {
      String template =
          (llmConfig != null
                  && llmConfig.getTestCaseTemplate() != null
                  && !llmConfig.getTestCaseTemplate().isBlank())
              ? llmConfig.getTestCaseTemplate()
              : LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE;

      prompt.append("=== 테스트케이스 생성 가이드 ===\n");
      prompt.append("사용자가 테스트케이스 생성을 요청하거나 관련 질문을 하는 경우, 다음 지침을 따르세요:\n");
      prompt.append("1. 정보가 충분한 경우: 아래 JSON 형식을 참고하여 테스트케이스를 생성하고 응답에 JSON 블록을 포함하세요.\n");
      prompt.append(
          "2. 정보가 부족하거나 모호한 경우: 바로 생성하지 말고, 어떤 기능을 테스트하고 싶은지, 특별한 조건이 있는지 등 필요한 정보를 사용자에게 추가로 질문하여"
              + " 의도를 명확히 파악하세요.\n\n");
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
        // 폴더와 케이스를 갈라 적는다. 한 수치로 합치면 답변이 폴더까지 케이스로 세어 말한다.
        prompt.append(String.format("- 총 테스트 케이스: %d개 (폴더 제외)\n", stats.getTotalTestCases()));
        prompt.append(
            String.format(
                "- 폴더: %d개 (테스트 케이스 수에 포함하지 않음)\n",
                stats.getTotalFolders() != null ? stats.getTotalFolders() : 0));
        prompt.append(
            String.format(
                "- 실행된 케이스: %d개 (실행률: %.1f%%)\n",
                stats.getExecutedTestCases(), stats.getExecutionRate()));
        prompt.append(
            String.format(
                "- 결과 현황: Pass(%d), Fail(%d), Blocked(%d), NotRun(%d)\n",
                stats.getPassedTestCases(),
                stats.getFailedTestCases(),
                stats.getBlockedTestCases(),
                stats.getNotRunTestCases()));
        if (stats.getLastExecutionDate() != null) {
          prompt.append(String.format("- 마지막 실행: %s\n", stats.getLastExecutionDate()));
        }
      }

      if (dbContext.containsKey("searchResults")) {
        List<?> results = (List<?>) dbContext.get("searchResults");
        prompt.append("\n[관련 테스트케이스 검색 결과]\n");
        for (Object obj : results) {
          TestCase tc = (TestCase) obj;
          prompt.append(
              String.format(
                  "- [%s] %s (우선순위: %s)\n", tc.getDisplayId(), tc.getName(), tc.getPriority()));
        }
      }

      if (dbContext.containsKey("recentResults")) {
        List<?> results = (List<?>) dbContext.get("recentResults");
        prompt.append("\n[최근 실행 이력]\n");
        for (Object obj : results) {
          TestResult tr = (TestResult) obj;
          prompt.append(
              String.format(
                  "- %s: %s (실행자: %s)\n",
                  tr.getExecutedAt(),
                  tr.getResult(),
                  tr.getExecutedBy() != null ? tr.getExecutedBy().getUsername() : "Unknown"));
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
}
