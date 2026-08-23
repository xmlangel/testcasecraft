package com.testcase.testcasemanagement.service.rag;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 조회 결과를 답변 LLM 에 넘길 형태로 만든다.
 *
 * <p>행이 적으면 원본을 그대로 넘기고, 많으면 LLM 으로 줄인다. 어느 쪽이든 결과는 답변 프롬프트에 실린다.
 *
 * <p><b>줄이는 쪽은 비싸다.</b> 실측에서 요약 호출 하나가 42.9초에 7,138 토큰을 썼고, 그것을 건너뛰자 같은 질문이 50초 실패에서 11.7초 성공으로
 * 바뀌었다. 토큰도 8,552 에서 2,994 로 줄었다. 게다가 답변이 더 좋아졌다. 요약문을 거치면 원본의 표 구조가 사라지는데, 답변 LLM 이 행을 직접 읽으면
 * 스스로 표로 정리한다.
 *
 * <p>그래서 임계를 높여 원본을 그대로 넘기는 쪽을 기본으로 삼았다. 프롬프트가 무한정 커지지 않는 것은 {@code RagSqlExecutor} 가 조회 자체에 상한을
 * 두기 때문이다. 두 값은 함께 정해야 하며 한쪽만 올리면 프롬프트가 커진다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RagDataSummarizer {

  /**
   * 이 개수까지는 원본을 그대로 넘긴다.
   *
   * <p>{@code RagSqlExecutor} 의 조회 상한과 같은 값으로 둔다. 그러면 요약 경로는 사실상 「전체 목록 요청」이 아닌데도 상한을 넘긴 예외 상황에서만
   * 돈다. 상한을 낮추면 이 값도 함께 낮춘다.
   */
  public static final int RAW_PASS_THROUGH_LIMIT = RagSqlExecutor.MAX_ROWS;

  private final LlmClientFactory llmClientFactory;
  private final LlmConfigRepository llmConfigRepository;
  private final ObjectMapper objectMapper;

  /** 리스트 데이터를 요약하거나 전체 목록을 반환합니다. */
  public String summarize(
      List<Map<String, Object>> data, String originalQuery, boolean forceFullList) {
    if (data == null || data.isEmpty()) {
      return "조회된 데이터가 없습니다.";
    }

    // 전체 목록 요청이거나 상한 안이면 요약하지 않고 그대로 넘긴다.
    if (forceFullList || data.size() <= RAW_PASS_THROUGH_LIMIT) {
      try {
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
      } catch (Exception e) {
        return data.toString();
      }
    }

    try {
      LlmConfig llmConfig = withAnalysisModel(getLlmConfig());
      LlmClient llmClient = llmClientFactory.getClient(llmConfig);

      String systemPrompt =
          """
          당신은 데이터 분석 전문가입니다.
          제공된 대량의 데이터 세트를 분석하여 사용자의 원래 질문 의도에 맞게 핵심 내용을 요약하세요.
          수치적인 특징, 주요 패턴, 예외 사항 등을 중심으로 간단명료하게 정리해 주세요.
          """;

      String userMessage =
          String.format(
              """
              원래 질문: %s
              데이터 건수: %d건
              상세 데이터: %s

              위 데이터를 요약해 주세요.
              """,
              originalQuery,
              data.size(),
              objectMapper.writeValueAsString(data.subList(0, Math.min(data.size(), 50))));

      List<RagChatMessage> messages = new ArrayList<>();
      messages.add(RagChatMessage.system(systemPrompt));
      messages.add(RagChatMessage.user(userMessage));

      LlmClient.LlmResponse response = llmClient.chat(llmConfig, messages, 0.3, 1000);
      return response.getContent().trim();

    } catch (Exception e) {
      log.error("데이터 요약 실패: {}", e.getMessage());
      return String.format("총 %d건의 데이터가 조회되었습니다. (요약 실패)", data.size());
    }
  }

  /**
   * 분석용 설정 사본.
   *
   * <p>저장된 엔티티의 모델 이름을 바꾸면 영속 상태가 바뀌어 DB 에 반영될 수 있다. 그래서 복사본을 만들어 쓴다.
   */
  private LlmConfig withAnalysisModel(LlmConfig source) {
    String model = source.resolveAnalysisModelName();
    if (model == null || model.equals(source.getModelName())) {
      return source;
    }
    LlmConfig copy = new LlmConfig();
    copy.setId(source.getId());
    copy.setName(source.getName());
    copy.setProvider(source.getProvider());
    copy.setApiUrl(source.getApiUrl());
    copy.setEncryptedApiKey(source.getEncryptedApiKey());
    copy.setModelName(model);
    copy.setTestCaseTemplate(source.getTestCaseTemplate());
    copy.setAnalysisModelName(source.getAnalysisModelName());
    copy.setIsActive(source.getIsActive());
    copy.setIsDefault(source.getIsDefault());
    return copy;
  }

  private LlmConfig getLlmConfig() {
    return llmConfigRepository
        .findByIsDefaultTrueAndIsActiveTrue()
        .orElseThrow(() -> new IllegalStateException("기본 LLM 설정이 없습니다."));
  }
}
