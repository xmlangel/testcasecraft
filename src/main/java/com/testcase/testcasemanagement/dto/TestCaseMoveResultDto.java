package com.testcase.testcasemanagement.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 이동 결과 — 단건/배치 공용. 단건은 {@code moved}에 1개, {@code batchGroupId}는 null. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseMoveResultDto {

  private List<MovedNode> moved;
  private String batchGroupId;
  private List<String> auditLogIds;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class MovedNode {
    private String id;
    private String parentId;
    private Integer displayOrder;
  }
}
