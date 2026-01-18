package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.RagChatRequest;
import com.testcase.testcasemanagement.dto.rag.RagChatResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * RAG 채팅 서비스 인터페이스
 *
 * RAG 문서 검색 + LLM 질의응답 통합 서비스
 */
public interface RagChatService {

    /**
     * RAG 기반 채팅 응답 생성
     *
     * 1. 사용자 질문으로 RAG 문서 검색
     * 2. 검색된 컨텍스트와 함께 LLM에게 질의
     * 3. LLM 응답과 출처 정보 반환
     *
     * @param request  채팅 요청
     * @param username 요청 사용자명
     * @return 채팅 응답 (LLM 답변 + RAG 출처)
     */
    RagChatResponse chat(RagChatRequest request, String username);

    /**
     * RAG 기반 스트리밍 채팅 응답 생성
     *
     * SSE(Server-Sent Events)로 실시간 스트리밍 응답
     *
     * @param request  채팅 요청
     * @param username 요청 사용자명
     * @return SSE Emitter
     */
    SseEmitter chatStream(RagChatRequest request, String username);
}
