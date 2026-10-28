package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.TestResultStep;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ICT-469: 스텝 하나의 결과.
 *
 * <p>요청에서는 stepNumber·result·actualResult 만 읽는다. description·expectedResult 는 응답에만 싣는 실행 당시 사본이며,
 * 요청에 넣어도 무시하고 서버가 케이스에서 복사한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResultStepDto {
  private int stepNumber;

  @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOT_RUN)$", message = "Invalid step result value")
  private String result;

  @Size(max = 10000, message = "actualResult must be 10,000 characters or fewer")
  private String actualResult;

  private String description;

  private String expectedResult;

  public static TestResultStepDto fromEntity(TestResultStep step) {
    return new TestResultStepDto(
        step.getStepNumber(),
        step.getResult(),
        step.getActualResult(),
        step.getDescription(),
        step.getExpectedResult());
  }
}
