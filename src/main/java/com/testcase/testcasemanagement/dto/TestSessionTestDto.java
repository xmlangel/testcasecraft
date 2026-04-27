package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestSessionTestDto {
  private String title;
  private String steps;
  private String expectedResult;
  private String status;
}
