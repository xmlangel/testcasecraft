package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RAG 채팅 메시지 DTO
 *
 * 대화 히스토리를 위한 개별 메시지
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatMessage {

    /**
     * 메시지 역할 (user, assistant, system)
     */
    @JsonProperty("role")
    private String role;

    /**
     * 메시지 내용
     */
    @JsonProperty("content")
    private String content;

    /**
     * 타임스탬프 (선택사항)
     */
    @JsonProperty("timestamp")
    private Long timestamp;

    /**
     * 정적 메서드: user 메시지 생성
     */
    public static RagChatMessage user(String content) {
        return RagChatMessage.builder()
                .role("user")
                .content(content)
                .build();
    }

    /**
     * 정적 메서드: assistant 메시지 생성
     */
    public static RagChatMessage assistant(String content) {
        return RagChatMessage.builder()
                .role("assistant")
                .content(content)
                .build();
    }

    /**
     * 정적 메서드: system 메시지 생성
     */
    public static RagChatMessage system(String content) {
        return RagChatMessage.builder()
                .role("system")
                .content(content)
                .build();
    }
}
