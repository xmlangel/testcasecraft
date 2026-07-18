package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** RAG 채팅 카테고리 생성 요청 DTO */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatCategoryCreateRequest {

  @NotNull
  @JsonProperty("projectId")
  @JsonAlias("project_id")
  private UUID projectId;

  @NotBlank
  @JsonProperty("name")
  private String name;

  @JsonProperty("color")
  private String color;

  @JsonProperty("description")
  private String description;
}
