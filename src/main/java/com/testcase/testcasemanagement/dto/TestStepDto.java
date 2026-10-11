// src/main/java/com/testcase/testcasemanagement/dto/TestStepDto.java

package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestStepDto {
  private int stepNumber;

  @NotBlank(message = "Step description is required")
  @Size(max = 10000, message = "Step description must be 10,000 characters or fewer")
  private String description; // ✅ 필수 필드

  @Size(max = 10000, message = "Expected result must be 10,000 characters or fewer")
  private String expectedResult;
}
