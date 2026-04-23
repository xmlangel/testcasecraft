// src/main/java/com/testcase/testcasemanagement/service/TestCaseAiGenerationService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * AI 기반 테스트케이스 Name/Description 자동 생성 서비스
 *
 * <p>Step, Expected Result, PreCondition 등을 LLM에 전달하여 적절한 테스트케이스 이름과 설명을 자동으로 생성합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TestCaseAiGenerationService {

  private final LlmConfigRepository llmConfigRepository;
  private final LlmClientFactory llmClientFactory;

  /**
   * 테스트케이스 메타데이터(Name, Description) 자동 생성
   *
   * @param steps 테스트 스텝 목록 (각 스텝: description, expectedResult)
   * @param preCondition 사전 조건
   * @param existingDescription 기존 설명 (있으면 참고용으로 포함)
   * @return 생성된 name, description Map
   */
  public Map<String, String> generateMeta(
      List<Map<String, String>> steps, String preCondition, String existingDescription) {

    log.info("🤖 AI 테스트케이스 메타 생성 요청 - steps={}, preCondition={}", steps.size(), preCondition);

    // 기본 LLM 설정 조회
    LlmConfig llmConfig =
        llmConfigRepository
            .findByIsDefaultTrueAndIsActiveTrue()
            .orElseThrow(() -> new IllegalStateException("기본 LLM 설정이 없습니다. 관리자에게 문의하세요."));

    log.info(
        "🔧 LLM 설정 사용: provider={}, model={}", llmConfig.getProvider(), llmConfig.getModelName());

    // 프롬프트 구성
    String systemPrompt = buildSystemPrompt();
    String userMessage = buildUserMessage(steps, preCondition, existingDescription);

    List<RagChatMessage> messages =
        List.of(RagChatMessage.system(systemPrompt), RagChatMessage.user(userMessage));

    // LLM 호출
    LlmClient client = llmClientFactory.getClient(llmConfig);
    LlmClient.LlmResponse response = client.chat(llmConfig, messages, 0.3, 512);

    String content = response.getContent();
    log.info("✅ LLM 응답 수신 (tokens={})", response.getTokensUsed());
    log.debug("LLM 원문 응답:\n{}", content);

    // 응답 파싱
    return parseResponse(content);
  }

  /** 시스템 프롬프트 구성 */
  private String buildSystemPrompt() {
    return """
        당신은 소프트웨어 테스팅 전문가입니다.
        주어진 테스트 스텝(Step)과 기대 결과(Expected Result)를 분석하여,
        해당 테스트케이스의 이름(Name)과 설명(Description)을 한국어로 생성합니다.

        반드시 다음 형식으로만 응답하세요 (다른 내용 없이):

        NAME: [테스트케이스 이름 - 간결하고 명확하게 무엇을 테스트하는지 표현]
        DESCRIPTION: [테스트케이스 설명 - 이 테스트의 목적과 검증 내용을 2~4문장으로 설명]

        규칙:
        - NAME은 50자 이내로 간결하게 작성
        - DESCRIPTION은 테스트 목적, 검증 대상, 기대 결과를 포함
        - 전문적이고 명확한 한국어 사용
        - NAME: 과 DESCRIPTION: 접두어를 반드시 포함할 것
        """;
  }

  /** 사용자 메시지 구성 */
  private String buildUserMessage(
      List<Map<String, String>> steps, String preCondition, String existingDescription) {

    StringBuilder sb = new StringBuilder();

    if (preCondition != null && !preCondition.isBlank()) {
      sb.append("## 사전 조건\n");
      sb.append(stripMarkdown(preCondition)).append("\n\n");
    }

    if (existingDescription != null && !existingDescription.isBlank()) {
      sb.append("## 기존 설명 (참고)\n");
      sb.append(stripMarkdown(existingDescription)).append("\n\n");
    }

    sb.append("## 테스트 스텝\n");
    for (int i = 0; i < steps.size(); i++) {
      Map<String, String> step = steps.get(i);
      String description = step.getOrDefault("description", "");
      String expectedResult = step.getOrDefault("expectedResult", "");

      if (!description.isBlank() || !expectedResult.isBlank()) {
        sb.append(String.format("스텝 %d:\n", i + 1));
        if (!description.isBlank()) {
          sb.append("  - 액션: ").append(stripMarkdown(description)).append("\n");
        }
        if (!expectedResult.isBlank()) {
          sb.append("  - 기대 결과: ").append(stripMarkdown(expectedResult)).append("\n");
        }
      }
    }

    sb.append("\n위 정보를 바탕으로 테스트케이스 이름과 설명을 생성해주세요.");
    return sb.toString();
  }

  /**
   * LLM 응답을 name, description Map으로 파싱
   *
   * <p>NAME: ... / DESCRIPTION: ... 형식을 추출합니다.
   */
  private Map<String, String> parseResponse(String content) {
    String name = "";
    String description = "";

    if (content == null || content.isBlank()) {
      log.warn("⚠️ LLM 응답이 비어있음");
      return Map.of("name", name, "description", description);
    }

    String[] lines = content.split("\n");
    StringBuilder descBuilder = new StringBuilder();
    boolean inDescription = false;

    for (String line : lines) {
      String trimmed = line.trim();

      if (trimmed.startsWith("NAME:")) {
        name = trimmed.substring("NAME:".length()).trim();
        inDescription = false;
      } else if (trimmed.startsWith("DESCRIPTION:")) {
        String firstLine = trimmed.substring("DESCRIPTION:".length()).trim();
        descBuilder.append(firstLine);
        inDescription = true;
      } else if (inDescription && !trimmed.isEmpty()) {
        if (descBuilder.length() > 0) {
          descBuilder.append(" ");
        }
        descBuilder.append(trimmed);
      }
    }

    description = descBuilder.toString().trim();

    // NAME이 비어있으면 첫 번째 의미있는 라인에서 추출 시도
    if (name.isBlank() && content.contains("\n")) {
      name = content.lines().findFirst().orElse("").trim();
      if (name.length() > 50) {
        name = name.substring(0, 50);
      }
    }

    log.info("📝 파싱 결과 - name='{}', description length={}", name, description.length());
    return Map.of("name", name, "description", description);
  }

  /** 마크다운 문법을 일부 제거하여 LLM 입력 단순화 (완전한 파싱보다는 가독성 향상 목적) */
  private String stripMarkdown(String text) {
    if (text == null) return "";
    // 마크다운 헤더, 굵게, 기울임, 코드블록 제거
    return text.replaceAll("#+\\s+", "") // 헤더
        .replaceAll("\\*{1,3}([^*]+)\\*{1,3}", "$1") // bold/italic
        .replaceAll("`{1,3}[^`]*`{1,3}", "") // 코드
        .replaceAll("!\\[.*?]\\(.*?\\)", "") // 이미지
        .replaceAll("\\[([^]]+)]\\(.*?\\)", "$1") // 링크
        .replaceAll("\\n{3,}", "\n\n") // 과도한 줄바꿈
        .trim();
  }
}
