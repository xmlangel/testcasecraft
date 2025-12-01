package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.rag.RagChatRequest;
import com.testcase.testcasemanagement.dto.rag.RagChatResponse;
import com.testcase.testcasemanagement.service.RagChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * RAG 채팅 REST API 컨트롤러
 *
 * RAG 문서 검색 + LLM 질의응답 기능 제공
 * 일반 응답과 스트리밍 응답 모두 지원
 */
@RestController
@RequestMapping("/api/rag/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "RAG - Chat", description = "RAG 기반 LLM 채팅 API")
public class RagChatController {

  private final RagChatService ragChatService;

  /**
   * RAG 기반 채팅 (일반 응답)
   *
   * POST /api/rag/chat
   *
   * RAG 문서 검색 → LLM 질의 → 응답 반환
   * 전체 응답이 생성된 후 한 번에 반환
   *
   * @param request        채팅 요청 (질문, 프로젝트 ID, LLM 설정 등)
   * @param authentication 인증 정보
   * @return 채팅 응답 (LLM 답변 + 출처 정보)
   */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  @Operation(summary = "RAG 기반 채팅", description = """
      RAG 문서 검색 결과를 바탕으로 LLM이 질문에 답변합니다.

      **처리 과정**:
      1. 질문으로 RAG 문서 검색 (벡터 유사도)
      2. 검색된 컨텍스트와 함께 LLM에게 질의
      3. LLM 응답과 출처 정보 반환

      **LLM 설정**:
      - llmConfigId 지정: 특정 LLM 설정 사용
      - llmConfigId 미지정: 기본 LLM 설정 사용
      """)
  public RagChatResponse chat(
      @Valid @RequestBody RagChatRequest request,
      Authentication authentication) {
    String username = authentication.getName();
    log.info("💬 RAG 채팅 요청: user={}, project={}, llmConfigId={}", username, request.getProjectId(),
        request.getLlmConfigId());

    return ragChatService.chat(request, username);
  }

  /**
   * RAG 기반 채팅 (스트리밍 응답)
   *
   * POST /api/rag/chat/stream
   *
   * SSE(Server-Sent Events)로 실시간 스트리밍 응답
   * LLM이 생성하는 응답을 실시간으로 전송
   *
   * @param request        채팅 요청
   * @param authentication 인증 정보
   * @return SSE Emitter
   */
  @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @PreAuthorize("isAuthenticated()")
  @Operation(summary = "RAG 기반 채팅 (스트리밍)", description = """
      RAG 문서 검색 결과를 바탕으로 LLM이 실시간 스트리밍으로 답변합니다.

      **SSE 이벤트 타입**:
      - `context`: 검색된 RAG 컨텍스트 정보 (첫 번째로 전송)
      - `chunk`: LLM 응답 청크 (여러 번 전송)
      - `done`: 응답 완료 신호
      - `error`: 에러 발생 시

      **사용 예시**:
      ```javascript
      const eventSource = new EventSource('/api/rag/chat/stream');
      eventSource.addEventListener('context', (e) => {
        const contexts = JSON.parse(e.data);
        console.log('출처:', contexts);
      });
      eventSource.addEventListener('chunk', (e) => {
        console.log('응답 청크:', e.data);
      });
      eventSource.addEventListener('done', () => {
        eventSource.close();
      });
      ```
      """)
  public SseEmitter chatStream(
      @Valid @RequestBody RagChatRequest request,
      Authentication authentication) {
    String username = authentication.getName();
    log.info("💬 RAG 채팅 스트리밍 요청: user={}, project={}", username, request.getProjectId());

    return ragChatService.chatStream(request, username);
  }
}
