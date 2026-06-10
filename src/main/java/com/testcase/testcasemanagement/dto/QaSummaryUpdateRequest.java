// src/main/java/com/testcase/testcasemanagement/dto/QaSummaryUpdateRequest.java

package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** QA 총평 저장 요청 — 실행 단위 마크다운 코멘트 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QaSummaryUpdateRequest {

  @Size(max = 10000, message = "QA 총평은 10,000자를 초과할 수 없습니다.")
  private String qaSummary;
}
