package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 트리 드래그앤드롭 다중 이동 요청.
 *
 * <p>{@code ids} 배열 순서대로 {@code targetParentId} 자식의 displayOrder가 부여된다. 같은 트랜잭션에서 처리되며, 하나라도 실패하면
 * 전체 롤백된다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseMoveBatchRequest {
  @NotEmpty private List<String> ids;

  private String targetParentId;
  private String beforeId;
  private String afterId;
}
