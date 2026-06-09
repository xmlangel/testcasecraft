// src/main/java/com/testcase/testcasemanagement/dto/BookmarkDto.java
// 북마크(즐겨찾기) 기능 요청/응답 DTO 묶음.
package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class BookmarkDto {

  /** 북마크 모음 응답. */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CollectionResponse {
    private String id;
    private String projectId;
    private String name;
    private String description;
    private boolean isDefault;
    private long itemCount;
    private String createdAt;
    private String updatedAt;
  }

  /** 모음 생성 요청. */
  @Data
  public static class CreateCollectionRequest {
    @NotBlank private String projectId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;
  }

  /** 모음 수정 요청(이름/설명). */
  @Data
  public static class UpdateCollectionRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;
  }

  /** 모음 내 북마크 항목 응답(읽기 전용 케이스 요약 포함). */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ItemResponse {
    private String id; // bookmark item id
    private String collectionId;
    private String note;
    private String createdAt;
    // 읽기 전용 케이스 요약
    private String testCaseId;
    private String testCaseName;
    private String testCaseDisplayId;
    private String testCasePriority;
    private String projectId;
  }

  /** 모음에 케이스 추가 요청. */
  @Data
  public static class AddItemRequest {
    @NotBlank private String testCaseId;

    @Size(max = 1000)
    private String note;
  }

  /** 항목 메모 수정 요청. */
  @Data
  public static class UpdateItemRequest {
    @Size(max = 1000)
    private String note;
  }

  /** 별(즐겨찾기) 토글 결과. */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ToggleResponse {
    private String testCaseId;
    private boolean bookmarked; // 토글 후 상태(기본 모음 기준)
  }

  /** 프로젝트 케이스의 즐겨찾기 상태 map. */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StatusResponse {
    private String projectId;
    private List<String> bookmarkedTestCaseIds;
    private Map<String, Boolean> status; // testCaseId -> bookmarked
  }
}
