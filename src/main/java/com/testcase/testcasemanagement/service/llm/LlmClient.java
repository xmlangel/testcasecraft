package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;

import java.util.List;

/**
 * LLM 클라이언트 인터페이스
 *
 * 다양한 LLM 제공자(OpenWebUI, OpenAI, Ollama 등)에 대한 통합 인터페이스
 * 각 제공자별 구현체가 이 인터페이스를 구현
 */
public interface LlmClient {

    /**
     * LLM에게 메시지를 전송하고 응답 받기
     *
     * @param config LLM 설정 (API URL, 모델, API Key 등)
     * @param messages 대화 메시지 리스트 (시스템 프롬프트 + 대화 히스토리 + 현재 질문)
     * @param temperature 온도 설정 (0.0 ~ 2.0)
     * @param maxTokens 최대 토큰 수
     * @return LLM 응답
     * @throws LlmClientException LLM API 호출 실패 시
     */
    LlmResponse chat(LlmConfig config, List<RagChatMessage> messages,
                     Double temperature, Integer maxTokens) throws LlmClientException;

    /**
     * 스트리밍 방식으로 LLM 응답 받기
     *
     * @param config LLM 설정
     * @param messages 대화 메시지 리스트
     * @param temperature 온도 설정
     * @param maxTokens 최대 토큰 수
     * @param callback 스트리밍 청크를 받을 콜백 함수
     * @throws LlmClientException LLM API 호출 실패 시
     */
    void chatStream(LlmConfig config, List<RagChatMessage> messages,
                    Double temperature, Integer maxTokens,
                    StreamCallback callback) throws LlmClientException;

    /**
     * 이 클라이언트가 지원하는 LLM 제공자
     *
     * @return LLM 제공자 (OPENWEBUI, OPENAI, OLLAMA)
     */
    LlmConfig.LlmProvider getSupportedProvider();

    /**
     * 스트리밍 콜백 인터페이스
     */
    @FunctionalInterface
    interface StreamCallback {
        /**
         * 스트리밍 청크를 받을 때 호출
         *
         * @param chunk 응답 청크
         * @param isLast 마지막 청크 여부
         */
        void onChunk(String chunk, boolean isLast);
    }

    /**
     * LLM 응답 DTO
     */
    class LlmResponse {
        private final String content;
        private final Integer tokensUsed;
        private final String model;

        public LlmResponse(String content, Integer tokensUsed, String model) {
            this.content = content;
            this.tokensUsed = tokensUsed;
            this.model = model;
        }

        public String getContent() {
            return content;
        }

        public Integer getTokensUsed() {
            return tokensUsed;
        }

        public String getModel() {
            return model;
        }
    }

    /**
     * LLM 클라이언트 예외
     */
    class LlmClientException extends RuntimeException {
        public LlmClientException(String message) {
            super(message);
        }

        public LlmClientException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
