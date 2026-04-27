package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestSessionBugDto {
  private String title;
  private String description;
  private String severity;
  private String jiraIssueKey;
}
