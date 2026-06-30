package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 테스트케이스를 다른 프로젝트로 이동/복사하는 요청.
 *
 * <p>이동(move): 선택한 케이스(폴더면 하위 전체)를 {@code targetProjectId}로 옮기며, 연결된 테스트 결과는 "실행 미러링"으로 함께 이동한다.
 * 복사(copy): 케이스만 복제하며 결과는 가져오지 않는다.
 *
 * <p>{@code ids}는 모두 같은 출발 프로젝트에 속해야 하며, {@code targetParentId}는 대상 프로젝트의 폴더(또는 루트 = null)여야 한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrossProjectTransferRequest {
  @NotEmpty private List<String> ids;

  @NotNull private String targetProjectId;

  /** 대상 프로젝트 내 부모 폴더 ID. null이면 대상 프로젝트 루트로 이동/복사. */
  private String targetParentId;
}
