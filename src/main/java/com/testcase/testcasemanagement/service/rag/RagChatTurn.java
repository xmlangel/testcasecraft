package com.testcase.testcasemanagement.service.rag;

import com.testcase.testcasemanagement.dto.rag.RagChatContext;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import java.util.List;

/**
 * 한 번의 채팅 질의에 필요한 재료를 모아 둔 것.
 *
 * <p>동기 채팅과 스트리밍 채팅이 준비 단계를 똑같이 수행하고 마지막 호출만 다르다. 준비 결과를 이 형태로 묶어 두면 두 경로가 같은 재료를 쓴다는 것이 코드에
 * 드러나고, 검색 조건이나 프롬프트 조립을 고칠 때 한 곳만 손대면 된다.
 *
 * @param llmConfig 이번 질의에 쓸 설정. 요청이 모델을 지정했으면 그 모델로 바꾼 복사본이다
 * @param contextSources RAG 검색 결과. 검색을 끄면 빈 목록이다
 * @param messages LLM 에게 보낼 메시지 목록
 * @param ragSearchUsed 검색을 실제로 했는지. 응답과 로그에서 구분해야 한다
 */
public record RagChatTurn(
    LlmConfig llmConfig,
    List<RagChatContext> contextSources,
    List<RagChatMessage> messages,
    boolean ragSearchUsed) {}
