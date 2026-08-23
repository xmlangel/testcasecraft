package com.testcase.testcasemanagement.service.rag;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.rag.RagChatContext;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.dto.rag.RagChatRequest;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.service.rag.RagQueryAnalyzer.QueryIntent;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 프롬프트 조립 동작을 고정한다.
 *
 * <p>이 시험은 `RagChatServiceImpl` 을 가르기 전에 세우는 안전망이다. 그 클래스는 채팅 실행·컨텍스트 조립·프롬프트 조립·모델 결정을 함께 다루면서 단위
 * 시험이 하나도 없었다. 프롬프트 조립부터 떼어낸 이유는 저장소에 의존하지 않아 목을 만들지 않고 확인할 수 있고, 분기가 열한 갈래라 시험 값어치가 가장 크기 때문이다.
 *
 * <p>문구 전문을 비교하지 않는다. 프롬프트 문구는 앞으로 다듬을 것이므로, 그때마다 시험이 깨지면 시험을 고치는 일이 늘어난다. 대신 <b>어떤 재료가 프롬프트에
 * 들어갔는지</b>를 본다.
 */
public class RagPromptBuilderTest {

  private RagPromptBuilder builder;

  @BeforeMethod
  public void setUp() {
    builder = new RagPromptBuilder();
  }

  // ---------- 메시지 순서 ----------

  @Test(description = "시스템 프롬프트 다음 지난 대화, 마지막이 이번 질문이다")
  public void ordersSystemThenHistoryThenQuestion() {
    RagChatRequest request = request("지금 몇 건인가요?");
    request.setConversationHistory(
        List.of(RagChatMessage.user("앞 질문"), RagChatMessage.assistant("앞 답변")));

    List<RagChatMessage> messages = builder.buildMessages(request, List.of(), Map.of(), null, null);

    assertEquals(messages.size(), 4, "시스템 1 + 지난 대화 2 + 이번 질문 1");
    assertEquals(messages.get(0).getRole(), "system", "첫 번째가 시스템 프롬프트다");
    assertEquals(messages.get(1).getContent(), "앞 질문", "지난 대화가 순서대로 온다");
    assertEquals(messages.get(2).getContent(), "앞 답변");
    assertEquals(messages.get(3).getContent(), "지금 몇 건인가요?", "마지막이 이번 질문이다");
  }

  @Test(description = "지난 대화가 없으면 시스템 프롬프트와 질문만 남는다")
  public void omitsHistoryWhenAbsent() {
    List<RagChatMessage> messages =
        builder.buildMessages(request("질문"), List.of(), Map.of(), null, null);

    assertEquals(messages.size(), 2, "시스템 1 + 질문 1");
  }

  // ---------- 테스트케이스 생성 안내 ----------

  @Test(description = "생성 요청이면 설정의 템플릿을 프롬프트에 싣는다")
  public void usesConfiguredTemplateForGeneration() {
    LlmConfig config = new LlmConfig();
    config.setTestCaseTemplate("이 프로젝트만의 템플릿");
    QueryIntent intent = QueryIntent.builder().needsTestCaseGeneration(true).build();

    String prompt = builder.buildSystemPrompt(List.of(), Map.of(), intent, config);

    assertTrue(prompt.contains("이 프로젝트만의 템플릿"), "설정한 템플릿이 들어간다");
  }

  @Test(description = "설정에 템플릿이 없으면 기본 템플릿을 쓴다")
  public void fallsBackToDefaultTemplate() {
    // 빈 문자열도 없는 것으로 본다. 관리자가 지우고 저장한 경우다.
    LlmConfig blank = new LlmConfig();
    blank.setTestCaseTemplate("   ");
    QueryIntent intent = QueryIntent.builder().needsTestCaseGeneration(true).build();

    String fromBlank = builder.buildSystemPrompt(List.of(), Map.of(), intent, blank);
    String fromNull = builder.buildSystemPrompt(List.of(), Map.of(), intent, null);

    for (String prompt : List.of(fromBlank, fromNull)) {
      assertTrue(
          prompt.contains(LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE.substring(0, 20)),
          "기본 템플릿으로 대체한다");
    }
  }

  @Test(description = "생성 요청이 아니면 생성 안내를 넣지 않는다")
  public void omitsGenerationGuideWhenNotRequested() {
    QueryIntent intent = QueryIntent.builder().needsTestCaseGeneration(false).build();

    String prompt = builder.buildSystemPrompt(List.of(), Map.of(), intent, null);

    assertFalse(prompt.contains("테스트케이스 생성 가이드"), "요청하지 않은 안내는 넣지 않는다");
  }

  // ---------- RAG 검색 결과 ----------

  @Test(description = "검색된 문서의 제목과 내용을 프롬프트에 싣는다")
  public void includesSearchedDocuments() {
    RagChatContext context =
        RagChatContext.builder()
            .id(UUID.randomUUID())
            .fileName("배포절차.md")
            .title("배포 절차")
            .chunkText("먼저 백업을 받는다")
            .similarity(0.87)
            .chunkIndex(0)
            .build();

    String prompt = builder.buildSystemPrompt(List.of(context), Map.of(), null, null);

    assertTrue(prompt.contains("배포 절차"), "출처를 제목으로 밝힌다");
    assertTrue(prompt.contains("먼저 백업을 받는다"), "문서 내용이 들어간다");
    assertTrue(prompt.contains("0.87"), "유사도를 밝혀 모델이 신뢰도를 판단하게 한다");
  }

  @Test(description = "제목이 없으면 파일명으로 출처를 밝힌다")
  public void fallsBackToFileNameAsSource() {
    // 수집 쪽이 제목을 늘 채우지만, 다른 경로로 만든 컨텍스트가 들어올 수 있다.
    RagChatContext noTitle =
        RagChatContext.builder()
            .id(UUID.randomUUID())
            .fileName("규정.md")
            .chunkText("내용")
            .similarity(0.5)
            .build();
    RagChatContext blankTitle =
        RagChatContext.builder()
            .id(UUID.randomUUID())
            .fileName("절차서.md")
            .title("   ")
            .chunkText("내용")
            .similarity(0.5)
            .build();

    assertTrue(
        builder.buildSystemPrompt(List.of(noTitle), Map.of(), null, null).contains("규정.md"),
        "제목이 없으면 파일명");
    assertTrue(
        builder.buildSystemPrompt(List.of(blankTitle), Map.of(), null, null).contains("절차서.md"),
        "빈 제목도 없는 것으로 본다");
  }

  @Test(description = "검색 결과가 없으면 그 사실을 프롬프트에 밝힌다")
  public void statesWhenNoDocumentFound() {
    String empty = builder.buildSystemPrompt(List.of(), Map.of(), null, null);
    String nullSources = builder.buildSystemPrompt(null, Map.of(), null, null);

    // 없다는 사실을 밝히지 않으면 모델이 문서를 본 것처럼 답한다.
    for (String prompt : List.of(empty, nullSources)) {
      assertFalse(prompt.contains("=== 참고 문서 (RAG) ==="), "없는 문서 구획을 열지 않는다");
      assertTrue(prompt.contains("제공된 시스템 데이터를 바탕으로"), "무엇을 근거로 답할지 알린다");
    }
  }

  // ---------- DB 통계 ----------

  @Test(description = "DB 컨텍스트가 비어 있으면 통계 구획을 넣지 않는다")
  public void omitsDbSectionWhenEmpty() {
    String fromEmpty = builder.buildSystemPrompt(List.of(), Map.of(), null, null);
    String fromNull = builder.buildSystemPrompt(List.of(), null, null, null);

    for (String prompt : List.of(fromEmpty, fromNull)) {
      assertFalse(prompt.contains("=== 시스템 실시간 데이터 (DB) ==="), "없는 데이터 구획을 열지 않는다");
    }
  }

  @Test(description = "SQL 조회 결과가 있으면 프롬프트에 싣는다")
  public void includesSqlData() {
    String prompt =
        builder.buildSystemPrompt(
            List.of(), Map.of("sqlData", List.of(Map.of("이름", "로그인 케이스"))), null, null);

    assertTrue(prompt.contains("로그인 케이스"), "조회 결과가 들어간다");
  }

  // ---------- 항상 지켜야 하는 것 ----------

  @Test(description = "재료가 모두 없어도 프롬프트는 비지 않는다")
  public void neverReturnsEmptyPrompt() {
    String prompt = builder.buildSystemPrompt(null, null, null, null);

    assertFalse(prompt.isBlank(), "빈 프롬프트를 보내면 모델이 역할을 모른다");
    assertTrue(prompt.contains("어시스턴트"), "역할을 알리는 문장은 늘 있다");
  }

  /** 시험용 요청. 질문만 채우고 나머지는 기본값으로 둔다. */
  private RagChatRequest request(String message) {
    RagChatRequest request = new RagChatRequest();
    request.setMessage(message);
    return request;
  }
}
