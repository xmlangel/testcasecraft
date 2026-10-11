package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 일괄 테스트 결과 입력을 위한 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkTestResultDto {

  /** 결과를 입력할 테스트케이스 ID 목록 */
  @NotEmpty(message = "Test case ID list is required")
  private List<String> testCaseIds;

  private List<String> displayIds;

  /** 공통 결과 값 */
  @NotBlank(message = "Result value is required")
  @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOT_RUN)$", message = "Invalid result value")
  private String result;

  /** 공통 비고 */
  @Size(max = 10000, message = "notes must be 10,000 characters or fewer")
  private String notes;

  /** 공통 태그 */
  private List<String> tags;

  /** 공통 JIRA 이슈 키 */
  @Size(max = 500, message = "JIRA issue key must be 500 characters or fewer")
  @Pattern(
      regexp = "^$|^[A-Z][A-Z0-9]+-[0-9]+(,[A-Z][A-Z0-9]+-[0-9]+)*$",
      message = "JIRA issue key must be in the format 'PROJECT-123' or 'PRJ-1,PRJ-2'")
  private String jiraIssueKey;

  @Override
  public String toString() {
    return "BulkTestResultDto{"
        + "testCaseIds="
        + testCaseIds
        + ", result='"
        + result
        + '\''
        + ", notes='"
        + notes
        + '\''
        + ", tags="
        + tags
        + ", jiraIssueKey='"
        + jiraIssueKey
        + '\''
        + '}';
  }
}
