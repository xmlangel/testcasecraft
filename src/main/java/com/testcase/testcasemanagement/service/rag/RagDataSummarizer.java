package com.testcase.testcasemanagement.service.rag;

import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 대용량 데이터 요약 서비스
 * SQL 결과가 너무 많을 경우 LLM을 통해 요약합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RagDataSummarizer {

    private final LlmClientFactory llmClientFactory;
    private final LlmConfigRepository llmConfigRepository;
    private final ObjectMapper objectMapper;

    /**
     * 리스트 데이터를 요약하거나 전체 목록을 반환합니다.
     */
    public String summarize(List<Map<String, Object>> data, String originalQuery, boolean forceFullList) {
        if (data == null || data.isEmpty()) {
            return "조회된 데이터가 없습니다.";
        }

        // 전체 목록 나열 요청이거나 데이터가 적은 경우 (10건 이하) 요약하지 않고 그대로 반환
        if (forceFullList || data.size() <= 10) {
            try {
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
            } catch (Exception e) {
                return data.toString();
            }
        }

        try {
            LlmConfig llmConfig = getLlmConfig();
            LlmClient llmClient = llmClientFactory.getClient(llmConfig);

            String systemPrompt = """
                당신은 데이터 분석 전문가입니다.
                제공된 대량의 데이터 세트를 분석하여 사용자의 원래 질문 의도에 맞게 핵심 내용을 요약하세요.
                수치적인 특징, 주요 패턴, 예외 사항 등을 중심으로 간단명료하게 정리해 주세요.
                """;

            String userMessage = String.format("""
                원래 질문: %s
                데이터 건수: %d건
                상세 데이터: %s
                
                위 데이터를 요약해 주세요.
                """, originalQuery, data.size(), objectMapper.writeValueAsString(data.subList(0, Math.min(data.size(), 50))));

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

    private LlmConfig getLlmConfig() {
        return llmConfigRepository.findByIsDefaultTrueAndIsActiveTrue()
                .orElseThrow(() -> new IllegalStateException("기본 LLM 설정이 없습니다."));
    }
}
