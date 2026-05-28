package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 트리 드래그앤드롭 단건 이동 요청.
 *
 * <p>{@code beforeId}와 {@code afterId} 중 하나만 지정 가능. 둘 다 null이면 {@code targetParentId} 자식의 마지막에 추가.
 * {@code targetParentId}가 null이면 루트로 이동.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseMoveRequest {
  private String targetParentId;
  private String beforeId;
  private String afterId;
}
