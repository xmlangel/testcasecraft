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
          1. Table: testcases (테스트 케이스 본문)
             - id (VARCHAR36), project_id (Project 외래키), parent_id (상위 폴더 id)
             - name (제목), type ('testcase' | 'folder' | 'systemFolder'), description (설명)
             - pre_condition (사전조건), post_condition (사후조건), expected_results (전체 예상결과)
             - priority ('HIGH' | 'MEDIUM' | 'LOW'), is_automated (boolean)
             - execution_type ('Manual' | 'Automated'), test_technique (테스트 기법)
             - display_id (예: SHOP-1), sequential_id (정수), created_at, updated_at, created_by, updated_by
             - 주의: 폴더는 type='folder'/'systemFolder'. 실제 케이스만 세려면 type='testcase' 조건을 넣는다.

          2. Table: testcase_tags (테스트 케이스 태그 — 케이스당 여러 행)
             - testcase_id (testcases.id 외래키), tag (태그 문자열)
             - 태그로 케이스를 찾으려면 testcases 와 JOIN 한다.

          3. Table: testcasesteps (테스트 스텝 — 케이스당 여러 행)
             - testcase_id (testcases.id 외래키), step_number (순번)
             - description (스텝 내용), expected_result (스텝 예상결과)
             - 스텝 내용으로 찾으려면 testcases 와 JOIN 한다.

          4. Table: test_executions (테스트 실행 — 실행 회차)
             - id (VARCHAR), project_id (Project 외래키), test_plan_id (TestPlan 외래키)
             - name (실행명), description (설명), status (상태)
             - qa_summary (QA 의견/총평 — 실행 회차에 대한 QA 담당의 정리글)
             - start_date, end_date, created_at, updated_at

          5. Table: test_results (개별 실행 결과 — 케이스 1건의 판정)
             - id (VARCHAR), test_execution_id (test_executions.id 외래키), test_case_id (testcases.id 외래키)
             - result ('PASS' | 'FAIL' | 'BLOCKED' | 'NOT_RUN'), notes (실행 비고/코멘트)
             - executed_at, executed_by
             - project_id 컬럼이 없다. testcases 또는 test_executions 와 JOIN 해 project_id 를 건다.

          6. Table: projects (프로젝트 정보)
             - id (VARCHAR36), name (이름), code (코드), description (설명)

          [테이블 선택 가이드]
          - 케이스 제목/설명/사전조건/기법/태그/스텝 = testcases (+ testcase_tags / testcasesteps JOIN)
          - QA 의견·총평 = test_executions.qa_summary
          - 통과/실패/차단 판정과 실행 비고 = test_results (JOIN 으로 project_id)
          - 개수·통과율·현황 통계 = 위 테이블에 COUNT/집계
          - users 테이블은 조회할 수 없다. 작성자·실행자 이름이 필요해도 users 와 JOIN 하지 마라.
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
7. generatedSql: 통계·목록·특정 조건 검색이 필요하면, 위 스키마로 프로젝트 ID(%s)에 대한 단일 SELECT 를 작성하세요.
   - 키워드로 케이스 찾기(제목·설명·태그를 함께 본다 — 태그만 보지 마라. 태그가 없는 프로젝트가 많다):
     SELECT DISTINCT t.display_id, t.name FROM testcases t LEFT JOIN testcase_tags tg ON tg.testcase_id = t.id WHERE t.project_id = '%s' AND (t.name ILIKE '%%수정%%' OR t.description ILIKE '%%수정%%' OR tg.tag ILIKE '%%수정%%')
   - 실행 결과/비고에서 키워드 찾기(예: '수정' 이 들어간 결과):
     SELECT t.display_id, t.name, r.result, r.notes FROM test_results r JOIN testcases t ON t.id = r.test_case_id WHERE t.project_id = '%s' AND r.notes ILIKE '%%수정%%'
   - QA 의견/총평 보기:
     SELECT name, status, qa_summary FROM test_executions WHERE project_id = '%s' AND qa_summary IS NOT NULL
   - 스텝 내용으로 찾기:
     SELECT DISTINCT t.display_id, t.name FROM testcasesteps s JOIN testcases t ON t.id = s.testcase_id WHERE t.project_id = '%s' AND s.description ILIKE '%%로그인%%'
   - 케이스 개수:
     SELECT count(*) FROM testcases WHERE project_id = '%s' AND type = 'testcase'
   - 키워드가 태그인지 제목/본문인지 확실치 않으면 제목·설명·태그를 함께 본다(태그만으로 좁히지 마라).
   - '실행 결과/실행 이력에서 ~ 찾아줘' 류는 test_results.notes 를 본다.
   - 부분 문자열 검색은 대소문자 무시 ILIKE '%%키워드%%' 를 쓴다.

[보안 규칙 - 필독]
- 반드시 SELECT 하나여야 하며, 세미콜론으로 여러 문장을 잇지 않는다.
- WHERE 절에 반드시 project_id = '%s' 조건이 있어야 한다.
  project_id 컬럼이 없는 테이블(test_results / testcase_tags / testcasesteps)은
  testcases(t.project_id) 또는 test_executions(project_id) 와 JOIN 해서 그 조건을 건다.
- 다른 프로젝트의 데이터를 조회하는 것은 심각한 보안 위반이다. 오직 지정된 프로젝트 ID(%s)만 조회한다.
- users·비밀번호·API 키 등 민감 테이블/컬럼은 조회하지 않는다. 이런 SQL 은 실행기가 거부한다.

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
              dbSchema,
              projectId, projectId, projectId, projectId, projectId,
              projectId, projectId, projectId, projectId);

      List<RagChatMessage> messages = new ArrayList<>();
      messages.add(RagChatMessage.system(systemPrompt));
      messages.add(RagChatMessage.user("질문: " + message));

      LlmClient.LlmResponse response = llmClient.chat(llmConfig, messages, 0.1, 800);
      String content = response.getContent().trim();

      return objectMapper.readValue(extractJson(content), QueryIntent.class);

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
   * 모델 응답에서 JSON 본문만 뽑아낸다.
   *
   * <p>모델이 JSON 을 코드펜스로 감싸거나(```json … ```), 추론 모델(예: gemma4:e2b)처럼 설명 문장 사이에 끼워 넣는다. 예전에는
   * 펜스를 `lastIndexOf("```")` 로 잘랐는데, 여는 펜스만 있고 닫는 펜스가 없으면 -1 이 되어 {@code substring(0, -1)} 이
   * 예외를 던졌다(실측: Range [0, -1)). 그래서 펜스는 짝이 맞을 때만 걷어내고, 그다음 첫 `{` 부터 마지막 `}` 까지를 취해 앞뒤 산문을
   * 버린다. 어느 경우에도 예외로 죽지 않고, 못 찾으면 원본을 그대로 넘겨 상위 catch 가 기본값으로 처리하게 둔다.
   */
  private String extractJson(String raw) {
    String content = raw == null ? "" : raw.trim();

    // 1. 코드펜스가 여닫이 짝으로 있으면 그 안쪽만 취한다.
    int fenceStart = content.indexOf("```");
    if (fenceStart >= 0) {
      int bodyStart = content.indexOf('\n', fenceStart);
      bodyStart = bodyStart < 0 ? fenceStart + 3 : bodyStart + 1;
      int fenceEnd = content.indexOf("```", bodyStart);
      if (fenceEnd > bodyStart) {
        content = content.substring(bodyStart, fenceEnd).trim();
      }
    }

    // 2. 첫 '{' 부터 마지막 '}' 까지 — 앞뒤 설명 문장을 버린다.
    int objStart = content.indexOf('{');
    int objEnd = content.lastIndexOf('}');
    if (objStart >= 0 && objEnd > objStart) {
      return content.substring(objStart, objEnd + 1);
    }
    return content;
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
