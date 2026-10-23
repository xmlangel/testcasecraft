package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TestCharterRequestDto {

  @NotBlank(message = "projectId is required.")
  private String projectId;

  @NotBlank(message = "title is required.")
  private String title;

  @NotBlank(message = "mission is required.")
  private String mission;

  private String areas;
  private String tags;
  private String status;
}
