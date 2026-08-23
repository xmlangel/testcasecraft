package com.testcase.testcasemanagement.service.rag;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.Locale;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** RAG 질의 의도 분석 서비스 사용자의 질문을 분석하여 어떤 DB 데이터가 필요한지 판단합니다. */
@Service
@RequiredArgsConstructor
@Slf4j
public class RagQueryAnalyzer {

  private final LlmClientFactory llmClientFactory;
  private final LlmConfigRepository llmConfigRepository;
  private final ObjectMapper objectMapper;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class QueryIntent {
    private boolean needsStatistics; // 통계 정보(개수, 통과율 등) 필요 여부
    private boolean needsTestCaseSearch; // 특정 테스트케이스 검색 필요 여부
    private boolean needsRecentResults; // 최근 실행 결과 필요 여부
    private boolean needsTestCaseGeneration; // 테스트케이스 생성 요청 여부
    private boolean needsFullList; // 전체 목록 나열 요청 여부 (예: '모두 나열해줘', '전체 다 보여줘')
    private List<String> searchKeywords; // 검색 키워드 목록
    private String generatedSql; // 생성된 SQL 쿼리
    private String justification; // 판단 근거
  }

  /**
   * 조회가 필요 없는 것이 확실한 문구.
   *
   * <p>여기 걸리면 LLM 을 부르지 않는다. 의도 분석은 스키마 설명과 판단 규칙을 합쳐 1,968자를 매번 보내고 실측에서 7.3초가 걸렸다. 인사 한마디에 같은
   * 값을 보낼 이유가 없다.
   *
   * <p><b>확실한 것만 넣는다.</b> 오판의 비용이 비대칭이다. 잘못 걸러 조회를 건너뛰면 답변 품질이 떨어지지만, 잘못 통과시켜도 지금과 같다. 그래서
   * 애매한 문구는 통과시킨다.
   *
   * <p>공백을 뺀 형태로 적는다. 견줄 때도 공백을 걷어내므로 「잘 부탁드립니다」는 `잘부탁드립니다` 로 걸린다.
   */
  private static final Set<String> CHIT_CHAT =
      Set.of(
          "안녕", "안녕하세요", "안녕하십니까", "반갑습니다", "반가워요",
          "고마워", "고마워요", "고맙습니다", "감사", "감사해요", "감사합니다",
          "수고하셨습니다", "수고하세요", "잘부탁드립니다",
          "네", "예", "응", "ㅇㅇ", "ㅇㅋ", "알겠습니다", "알겠어요",
          "hi", "hello", "hey", "thanks", "thankyou", "ok", "okay", "yes");


  /** 사용자의 질문을 분석하여 의도를 파악합니다. */
  public QueryIntent analyzeIntent(String message, String projectId) {
    if (needsNoLookup(message)) {
      log.info("💨 조회가 필요 없는 문구로 판단해 의도 분석을 건너뛴다: {}", message);
      return QueryIntent.builder()
          .searchKeywords(new ArrayList<>())
          .justification("조회가 필요 없는 문구")
          .build();
    }

    try {
      LlmConfig llmConfig = withAnalysisModel(getLlmConfig());
      LlmClient llmClient = llmClientFactory.getClient(llmConfig);

      String dbSchema =
          """
          === 데이터베이스 스키마 정보 ===
          1. Table: testcases (테스트 케이스 정보)
             - id (UUID), project_id (Project 외래키)
             - name (제목), type ('testcase', 'folder'), description (설명)
             - priority ('HIGH', 'MEDIUM', 'LOW'), is_automated (boolean)
             - execution_type ('Manual', 'Automated'), display_id (예: PRJ-1)
             - created_at, updated_at, created_by, updated_by

          2. Table: test_results (테스트 실행 결과)
             - id (UUID), test_execution_id (TestExecution 외래키)
             - test_case_id (TestCase ID), result ('PASS', 'FAIL', 'BLOCKED', 'NOT_RUN')
             - notes (비고), executed_at, executed_by (User 외래키)

          3. Table: projects (프로젝트 정보)
             - id (UUID), name (이름), code (코드), description (설명)

          4. Table: users (사용자 정보)
             - id (Long), username (아이디), nickname (닉네임)
          """;

      String systemPrompt =
          String.format(
              """
당신은 테스트 케이스 관리 시스템의 질의 의도 분석기입니다.
사용자의 질문을 분석하여 시스템 데이터베이스에서 어떤 추가 정보가 필요한지 판단하세요.

%s

다음 정보를 판단해야 합니다:
1. needsStatistics: 전체 개수, 통계, 성공률, 현황 등을 묻는 경우 true
2. needsTestCaseSearch: 특정 기능(예: '로그인', '결제')에 대한 테스트케이스 목록이나 내용을 찾는 경우 true
3. needsRecentResults: 최근에 실행된 결과나 히스토리를 묻는 경우 true
4. needsTestCaseGeneration: 테스트케이스를 새로 만들어달라거나, '테스트케이스'라는 문구가 포함된 생성형 질문인 경우 true
5. needsFullList: 사용자가 '모두', '전체', '나열', '목록 다', '36개 다'와 같이 수집된 데이터를 요약하지 말고 모두 보여달라고 명시적으로 요청하는 경우 true
6. searchKeywords: 검색이 필요한 경우 사용할 핵심 키워드 목록
7. generatedSql: 통계나 특정 조건의 검색이 필요한 경우, 위 스키마를 바탕으로 프로젝트 ID(%s)에 해당하는 SELECT 쿼리를 작성하세요.

[보안 규칙 - 필독]
- 반드시 SELECT 쿼리여야 합니다.
- 반드시 WHERE 절에 project_id = '%s' 조건이 포함되어야 합니다.
- 다른 프로젝트의 데이터를 조회하는 것은 심각한 보안 위반입니다. 오직 지정된 프로젝트 ID(%s)만 조회하세요.

응답은 반드시 아래 형식의 JSON이어야 합니다:
{
  "needsStatistics": boolean,
  "needsTestCaseSearch": boolean,
  "needsRecentResults": boolean,
  "needsTestCaseGeneration": boolean,
  "needsFullList": boolean,
  "searchKeywords": ["keyword1", "keyword2"],
  "generatedSql": "SELECT ... FROM ... WHERE project_id = '%s' ...",
  "justification": "판단 근거 요약"
}
""",
              dbSchema, projectId, projectId, projectId, projectId);

      List<RagChatMessage> messages = new ArrayList<>();
      messages.add(RagChatMessage.system(systemPrompt));
      messages.add(RagChatMessage.user("질문: " + message));

      LlmClient.LlmResponse response = llmClient.chat(llmConfig, messages, 0.1, 800);
      String content = response.getContent().trim();

      // JSON 추출 (코드 블록 제거 등)
      if (content.contains("```json")) {
        content = content.substring(content.indexOf("```json") + 7);
        content = content.substring(0, content.lastIndexOf("```"));
      } else if (content.contains("```")) {
        content = content.substring(content.indexOf("```") + 3);
        content = content.substring(0, content.lastIndexOf("```"));
      }

      return objectMapper.readValue(content, QueryIntent.class);

    } catch (Exception e) {
      log.error("질의 의도 분석 실패, 기본값 반환: {}", e.getMessage());
      // 실패 시 기본적으로 통계 정보는 포함하도록 설정 (사용자 요청 기반)
      return QueryIntent.builder()
          .needsStatistics(true)
          .searchKeywords(new ArrayList<>())
          .justification("분석 실패로 인한 기본값 적용")
          .build();
    }
  }

  /**
   * 조회 없이 답할 수 있는 문구인지 본다.
   *
   * <p>정형 문구와 <b>완전히 같을 때만</b> 걸러낸다. 문장부호와 공백은 걷어내고 견주므로 「안녕하세요!」와 「  안녕  」은 같은 것으로 본다. 낱말이 하나라도
   * 더 붙으면(「안녕하세요, 몇 건인가요?」) 통과시켜 LLM 이 판단하게 한다.
   *
   * <p>처음에는 길이 상한과 조회 낱말 검사를 함께 뒀는데, 회귀 확인에서 <b>둘 다 도달할 수 없는 코드</b>임이 드러났다. 완전 일치가 이미 그 경우를
   * 막으므로 앞의 검사를 지워도 판정이 같았다. 조건을 늘리면 안전해 보이지만 실제로는 읽는 사람만 헷갈린다.
   */
  private boolean needsNoLookup(String message) {
    if (message == null) {
      return false;
    }
    String core = message.replaceAll("[\\s.,!?~…·]+", "").toLowerCase(Locale.ROOT);
    return !core.isEmpty() && CHIT_CHAT.contains(core);
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
