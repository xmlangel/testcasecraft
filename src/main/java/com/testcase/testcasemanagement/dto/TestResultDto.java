package com.testcase.testcasemanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDto {
  // ICT-469: steps 를 보내면 result 를 빼도 된다(서버가 스텝 결과로 계산). steps 도 없으면 서비스가 거부한다.
  @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOT_RUN)$", message = "Invalid result value")
  private String result; // 문자열만 허용

  // 테스트 결과 ID (저장된 후 반환됨, 첨부파일 조회에 필요)
  private String id;

  private String testCaseId;
  private String displayId;

  @Size(max = 10000, message = "notes must be 10,000 characters or fewer")
  private String notes;

  private String executedBy; // 사용자명 또는 ID

  private LocalDateTime executedAt;

  private String testExecutionId;

  private String testExecutionName;

  // ICT-178: JIRA 연동 필드 추가 (URL 입력 지원을 위해 @Pattern 제거)
  @Size(max = 500, message = "JIRA issue key must be 500 characters or fewer")
  private String jiraIssueKey;

  private int attachmentCount;

  private List<String> tags;

  // ICT-469: 스텝별 결과. 보내지 않으면 지금처럼 케이스 결과 하나로만 기록한다.
  @Valid private List<TestResultStepDto> steps;

  @Override
  public String toString() {
    return "TestResultDto{"
        + "id='"
        + id
        + '\''
        + ", result='"
        + result
        + '\''
        + ", testCaseId='"
        + testCaseId
        + '\''
        + ", notes='"
        + notes
        + '\''
        + ", executedBy='"
        + executedBy
        + '\''
        + ", executedAt='"
        + executedAt
        + '\''
        + ", testExecutionId='"
        + testExecutionId
        + '\''
        + ", testExecutionName='"
        + testExecutionName
        + '\''
        + ", jiraIssueKey='"
        + jiraIssueKey
        + '\''
        + '}';
  }
}
