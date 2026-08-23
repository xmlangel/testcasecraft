package com.testcase.testcasemanagement.service.rag;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 조회 결과를 언제 LLM 으로 요약하고 언제 그대로 넘기는지 고정한다.
 *
 * <p>이 판단이 응답 시간을 좌우한다. 실측에서 요약 호출 하나가 42.9초에 7,138 토큰을 썼고, 그것을 건너뛰자 같은 질문이 50초 실패에서 11.7초 성공으로
 * 바뀌었다. 요약을 부르는 임계가 곧 사용자가 기다리는 시간이다.
 */
public class RagDataSummarizerTest {

  private LlmClientFactory clientFactory;
  private LlmConfigRepository configRepository;
  private LlmClient llmClient;
  private RagDataSummarizer summarizer;

  @BeforeMethod
  public void setUp() {
    clientFactory = mock(LlmClientFactory.class);
    configRepository = mock(LlmConfigRepository.class);
    llmClient = mock(LlmClient.class);

    LlmConfig config = new LlmConfig();
    when(configRepository.findByIsDefaultTrueAndIsActiveTrue()).thenReturn(Optional.of(config));
    when(clientFactory.getClient(any())).thenReturn(llmClient);
    when(llmClient.chat(any(), any(), anyDouble(), anyInt()))
        .thenReturn(new LlmClient.LlmResponse("요약문", 100, "model"));

    summarizer = new RagDataSummarizer(clientFactory, configRepository, new ObjectMapper());
  }

  @Test(description = "행이 없으면 LLM 을 부르지 않고 없다고 알린다")
  public void reportsEmptyWithoutLlm() {
    assertTrue(summarizer.summarize(List.of(), "질문", false).contains("없습니다"));
    assertTrue(summarizer.summarize(null, "질문", false).contains("없습니다"));
    verify(llmClient, never()).chat(any(), any(), anyDouble(), anyInt());
  }

  @Test(description = "임계 안이면 원본을 그대로 넘긴다")
  public void passesRawDataWithinThreshold() {
    // 원본을 넘기면 답변 LLM 이 표 구조를 그대로 읽는다. 요약문을 거치면 그 구조가 사라진다.
    String result = summarizer.summarize(rows(RagDataSummarizer.RAW_PASS_THROUGH_LIMIT), "질문", false);

    assertTrue(result.contains("로그인 케이스 0"), "원본 값이 그대로 들어간다");
    verify(llmClient, never()).chat(any(), any(), anyDouble(), anyInt());
  }

  @Test(description = "임계를 넘으면 LLM 으로 요약한다")
  public void summarizesBeyondThreshold() {
    String result =
        summarizer.summarize(rows(RagDataSummarizer.RAW_PASS_THROUGH_LIMIT + 1), "질문", false);

    assertTrue(result.contains("요약문"));
    verify(llmClient).chat(any(), any(), anyDouble(), anyInt());
  }

  @Test(description = "전체 목록 요청이면 개수와 무관하게 원본을 넘긴다")
  public void honoursFullListRequest() {
    // 사용자가 「전체 다 보여줘」라고 했으면 요약이 그 뜻을 거스른다.
    String result = summarizer.summarize(rows(500), "전체 다 보여줘", true);

    assertTrue(result.contains("로그인 케이스 499"), "마지막 행까지 들어간다");
    verify(llmClient, never()).chat(any(), any(), anyDouble(), anyInt());
  }

  @Test(description = "요약이 실패해도 건수는 알린다")
  public void reportsCountWhenSummaryFails() {
    when(llmClient.chat(any(), any(), anyDouble(), anyInt()))
        .thenThrow(new RuntimeException("한도 초과"));

    String result =
        summarizer.summarize(rows(RagDataSummarizer.RAW_PASS_THROUGH_LIMIT + 5), "질문", false);

    assertTrue(result.contains("건"), "몇 건인지는 알려 준다");
  }

  /** 시험용 조회 행. 이름에 순번을 넣어 어느 행까지 들어갔는지 볼 수 있게 한다. */
  private List<Map<String, Object>> rows(int count) {
    List<Map<String, Object>> rows = new ArrayList<>(count);
    for (int i = 0; i < count; i++) {
      rows.add(Map.of("name", "로그인 케이스 " + i, "priority", "HIGH"));
    }
    return rows;
  }
}
