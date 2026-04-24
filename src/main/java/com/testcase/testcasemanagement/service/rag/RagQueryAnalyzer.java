package com.testcase.testcasemanagement.service.rag;

import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * RAG 질의 의도 분석 서비스
 * 사용자의 질문을 분석하여 어떤 DB 데이터가 필요한지 판단합니다.
 */
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
        private boolean needsStatistics;         // 통계 정보(개수, 통과율 등) 필요 여부
        private boolean needsTestCaseSearch;      // 특정 테스트케이스 검색 필요 여부
        private boolean needsRecentResults;       // 최근 실행 결과 필요 여부
        private boolean needsTestCaseGeneration;  // 테스트케이스 생성 요청 여부
        private List<String> searchKeywords;      // 검색 키워드 목록
        private String generatedSql;              // 생성된 SQL 쿼리
        private String justification;             // 판단 근거
    }

    /**
     * 사용자의 질문을 분석하여 의도를 파악합니다.
     */
    public QueryIntent analyzeIntent(String message, String projectId) {
        try {
            LlmConfig llmConfig = getLlmConfig();
            LlmClient llmClient = llmClientFactory.getClient(llmConfig);

            String dbSchema = """
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

            String systemPrompt = String.format("""
                당신은 테스트 케이스 관리 시스템의 질의 의도 분석기입니다.
                사용자의 질문을 분석하여 시스템 데이터베이스에서 어떤 추가 정보가 필요한지 판단하세요.
                
                %s
                
                다음 정보를 판단해야 합니다:
                1. needsStatistics: 전체 개수, 통계, 성공률, 현황 등을 묻는 경우 true
                2. needsTestCaseSearch: 특정 기능(예: '로그인', '결제')에 대한 테스트케이스 목록이나 내용을 찾는 경우 true
                3. needsRecentResults: 최근에 실행된 결과나 히스토리를 묻는 경우 true
                4. needsTestCaseGeneration: 테스트케이스를 새로 만들어달라거나, '테스트케이스'라는 문구가 포함된 생성형 질문인 경우 true
                5. searchKeywords: 검색이 필요한 경우 사용할 핵심 키워드 목록
                6. generatedSql: 통계나 특정 조건의 검색이 필요한 경우, 위 스키마를 바탕으로 프로젝트 ID(%s)에 해당하는 SELECT 쿼리를 작성하세요.
                
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
                  "searchKeywords": ["keyword1", "keyword2"],
                  "generatedSql": "SELECT ... FROM ... WHERE project_id = '%s' ...",
                  "justification": "판단 근거 요약"
                }
                """, dbSchema, projectId, projectId, projectId, projectId);

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

    private LlmConfig getLlmConfig() {
        return llmConfigRepository.findByIsDefaultTrueAndIsActiveTrue()
                .orElseThrow(() -> new IllegalStateException("기본 LLM 설정이 없습니다."));
    }
}
