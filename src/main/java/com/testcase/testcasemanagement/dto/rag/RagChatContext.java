package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * RAG 채팅 컨텍스트 DTO
 *
 * 채팅 응답에 사용된 문서 컨텍스트 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatContext {

    /**
     * 문서 ID
     */
    @JsonProperty("id")
    private UUID id;

    /**
     * 문서 파일명
     */
    @JsonProperty("fileName")
    private String fileName;

    /**
     * 문서 제목
     */
    @JsonProperty("title")
    private String title;

    /**
     * 청크 텍스트
     */
    @JsonProperty("chunkText")
    private String chunkText;

    /**
     * 유사도 점수 (0.0 ~ 1.0)
     */
    @JsonProperty("similarity")
    private Double similarity;

    /**
     * 청크 인덱스
     */
    @JsonProperty("chunkIndex")
    private Integer chunkIndex;

    /**
     * 청크 메타데이터 (선택사항)
     */
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
}
