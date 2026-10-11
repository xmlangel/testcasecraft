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

  @Size(max = 10000, message = "QA summary cannot exceed 10,000 characters.")
  private String qaSummary;
}
