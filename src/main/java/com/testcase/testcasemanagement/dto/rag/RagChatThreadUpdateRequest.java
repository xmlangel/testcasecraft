package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
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

  @NotNull
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
