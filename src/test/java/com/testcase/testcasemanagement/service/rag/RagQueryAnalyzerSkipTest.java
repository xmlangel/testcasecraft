package com.testcase.testcasemanagement.service.rag;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import java.util.Optional;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * 조회가 필요 없는 질문을 LLM 없이 걸러내는 동작을 고정한다.
 *
 * <p>의도 분석은 스키마 설명과 판단 규칙을 합쳐 1,968자를 매번 보낸다. 실측에서 이 호출 하나가 7.3~7.6초에 1,275~1,414 토큰을 썼다. 인사
 * 한마디에도 같은 값을 보내는 것이 낭비다.
 *
 * <p><b>오판의 비용이 비대칭이다.</b> 잘못 걸러 조회를 건너뛰면 답변 품질이 떨어지지만, 잘못 통과시켜도 지금과 같다. 그래서 확실한 것만 걸러야 하고, 이
 * 시험의 절반은 <b>걸러서는 안 되는 질문</b>을 확인한다.
 */
public class RagQueryAnalyzerSkipTest {

  private LlmClient llmClient;
  private RagQueryAnalyzer analyzer;

  @BeforeMethod
  public void setUp() {
    LlmClientFactory clientFactory = mock(LlmClientFactory.class);
    LlmConfigRepository configRepository = mock(LlmConfigRepository.class);
    llmClient = mock(LlmClient.class);

    when(configRepository.findByIsDefaultTrueAndIsActiveTrue())
        .thenReturn(Optional.of(new LlmConfig()));
    when(clientFactory.getClient(any())).thenReturn(llmClient);
    // 걸러지지 않으면 이 상항이 쓰인다. 걸러지면 호출 자체가 없다.
    when(llmClient.chat(any(), any(), anyDouble(), anyInt()))
        .thenReturn(
            new LlmClient.LlmResponse(
                "{\"needsStatistics\":true,\"searchKeywords\":[],\"justification\":\"분석함\"}",
                100,
                "model"));

    analyzer = new RagQueryAnalyzer(clientFactory, configRepository, new ObjectMapper());
  }

  @DataProvider(name = "조회가 필요 없는 질문")
  public Object[][] chitChat() {
    return new Object[][] {
      {"안녕하세요"}, {"안녕"}, {"고맙습니다"}, {"감사합니다"}, {"고마워"},
      {"수고하셨습니다"}, {"잘 부탁드립니다"}, {"네"}, {"응"}, {"ㅇㅇ"},
      {"ok"}, {"thanks"}, {"hi"}, {"  안녕하세요  "},
    };
  }

  @DataProvider(name = "조회가 필요한 질문")
  public Object[][] realQuestions() {
    return new Object[][] {
      // 조회 낱말이 있다
      {"테스트케이스가 몇 건인가요?"},
      {"로그인 관련 케이스 보여줘"},
      {"최근 실행 결과 알려줘"},
      {"통과율이 어떻게 되나요"},
      // 인사로 시작하지만 뒤에 질문이 붙는다. 이것을 걸러내면 답변 품질이 떨어진다.
      {"안녕하세요, 테스트케이스가 몇 건인가요?"},
      {"고맙습니다. 그런데 실패한 케이스는 몇 개예요?"},
      // 짧지만 조회가 필요하다
      {"몇 건?"},
      {"통계"},
    };
  }

  @Test(dataProvider = "조회가 필요 없는 질문", description = "인사·감사에는 LLM 을 부르지 않는다")
  public void skipsLlmForChitChat(String message) {
    QueryIntent intent = analyzer.analyzeIntent(message, "p-1");

    verify(llmClient, never()).chat(any(), any(), anyDouble(), anyInt());
    assertFalse(intent.isNeedsStatistics(), message + ": 통계를 요구하지 않는다");
    assertFalse(intent.isNeedsTestCaseSearch(), message + ": 검색을 요구하지 않는다");
    assertTrue(
        intent.getGeneratedSql() == null || intent.getGeneratedSql().isBlank(),
        message + ": SQL 을 만들지 않는다");
  }

  @Test(dataProvider = "조회가 필요한 질문", description = "조회가 필요한 질문은 걸러내지 않는다")
  public void analysesRealQuestions(String message) {
    analyzer.analyzeIntent(message, "p-1");

    // 걸러냈으면 이 호출이 없다. 걸러서는 안 되는 질문을 걸러낸 것이 이 시험이 막는 것이다.
    verify(llmClient).chat(any(), any(), anyDouble(), anyInt());
  }
}
