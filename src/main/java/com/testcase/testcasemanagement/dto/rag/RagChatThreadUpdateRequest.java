package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 채팅 스레드 갱신 요청 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatThreadUpdateRequest {

  // threadId 는 요청 본문이 아니라 경로변수(PATCH /threads/{threadId})에서 컨트롤러가 주입한다.
  // @Valid 는 메서드 본문 실행 전에 돌기 때문에 @NotNull 을 걸면 프론트의 정상 PATCH(본문에 threadId 없음)가
  // MethodArgumentNotValidException(400)으로 거부돼 스레드 수정 전체가 파손된다. path 파생 필드라 검증 대상 아님.
  @JsonProperty("threadId")
  private String threadId;

  @JsonProperty("title")
  private String title;

  @JsonProperty("description")
  private String description;

  @JsonProperty("archived")
  private Boolean archived;

  @JsonProperty("categoryIds")
  @JsonAlias("category_ids")
  private List<String> categoryIds;
}
