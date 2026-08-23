package com.testcase.testcasemanagement.service.rag;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import java.util.List;
import java.util.Optional;
import org.mockito.ArgumentCaptor;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 분석에 쓰는 모델을 답변 모델과 갈라 쓰는 동작을 고정한다.
 *
 * <p>의도 분석은 질문을 읽고 JSON 한 덩이를 뱉는 분류 작업이다. 정해진 형식으로 답하면 되므로 추론이 값어치를 내지 않는다. 그런데 지금 기본 설정이 추론
 * 모델이라(`...-reasoning:free`) 답 전에 생각을 길게 하고, 실측에서 그 호출 하나가 7.3초에 1,275 토큰을 썼다.
 *
 * <p>설정에 분석용 모델을 따로 두면 답변은 좋은 모델로, 분석은 값싼 모델로 갈라 쓸 수 있다. 비워 두면 지금과 같이 답변 모델을 쓴다.
 */
public class RagAnalysisModelTest {

  private LlmClient llmClient;
  private LlmConfig config;
  private RagQueryAnalyzer analyzer;

  @BeforeMethod
  public void setUp() {
    LlmClientFactory clientFactory = mock(LlmClientFactory.class);
    LlmConfigRepository configRepository = mock(LlmConfigRepository.class);
    llmClient = mock(LlmClient.class);

    config = new LlmConfig();
    config.setModelName("답변용-좋은-모델");
    when(configRepository.findByIsDefaultTrueAndIsActiveTrue()).thenReturn(Optional.of(config));
    when(clientFactory.getClient(any())).thenReturn(llmClient);
    when(llmClient.chat(any(), any(), anyDouble(), anyInt()))
        .thenReturn(
            new LlmClient.LlmResponse(
                "{\"needsStatistics\":true,\"searchKeywords\":[],\"justification\":\"분석\"}",
                100,
                "model"));

    analyzer = new RagQueryAnalyzer(clientFactory, configRepository, new ObjectMapper());
  }

  @Test(description = "분석용 모델을 지정하면 그 모델로 분석한다")
  public void usesAnalysisModelWhenConfigured() {
    config.setAnalysisModelName("분석용-값싼-모델");

    analyzer.analyzeIntent("테스트케이스가 몇 건인가요?", "p-1");

    assertEquals(capturedModel(), "분석용-값싼-모델", "분석은 지정한 모델로 한다");
    assertEquals(config.getModelName(), "답변용-좋은-모델", "원본 설정을 고치지 않는다");
  }

  @Test(description = "분석용 모델이 없으면 답변 모델을 쓴다")
  public void fallsBackToAnswerModel() {
    // 지금까지의 동작이다. 설정을 손대지 않은 사용자에게 달라지는 것이 없어야 한다.
    for (String blank : List.of("", "   ")) {
      config.setAnalysisModelName(blank);
      analyzer.analyzeIntent("몇 건인가요?", "p-1");
      assertEquals(capturedModel(), "답변용-좋은-모델", "빈 값은 없는 것으로 본다");
    }
    config.setAnalysisModelName(null);
    analyzer.analyzeIntent("몇 건인가요?", "p-1");
    assertEquals(capturedModel(), "답변용-좋은-모델");
  }

  /** 마지막 호출에 쓰인 모델 이름. */
  private String capturedModel() {
    ArgumentCaptor<LlmConfig> captor = ArgumentCaptor.forClass(LlmConfig.class);
    org.mockito.Mockito.verify(llmClient, org.mockito.Mockito.atLeastOnce())
        .chat(captor.capture(), any(), anyDouble(), anyInt());
    return captor.getValue().getModelName();
  }
}
