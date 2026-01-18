package com.testcase.testcasemanagement.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDto {
    @NotBlank(message = "결과 값은 필수입니다")
    @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOT_RUN)$",
            message = "유효하지 않은 결과 값입니다")
    private String result; // 문자열만 허용

    // 테스트 결과 ID (저장된 후 반환됨, 첨부파일 조회에 필요)
    private String id;

    private String testCaseId;

    @Size(max = 10000, message = "notes는 10,000자 이내로 입력해주세요")
    private String notes;

    private String executedBy; // 사용자명 또는 ID

    private LocalDateTime executedAt;

    private String testExecutionId;

    private String testExecutionName;
    
    // ICT-178: JIRA 연동 필드 추가
    @Size(max = 100, message = "JIRA 이슈 키는 100자 이내로 입력해주세요")
    @Pattern(regexp = "^$|^[A-Z]+-\\d+$", 
            message = "JIRA 이슈 키는 'PROJECT-123' 형식이어야 합니다")
    private String jiraIssueKey;

    private int attachmentCount;

    private List<String> tags;

    @Override
    public String toString() {
        return "TestResultDto{" +
                "id='" + id + '\'' +
                ", result='" + result + '\'' +
                ", testCaseId='" + testCaseId + '\'' +
                ", notes='" + notes + '\'' +
                ", executedBy='" + executedBy + '\'' +
                ", executedAt='" + executedAt + '\'' +
                ", testExecutionId='" + testExecutionId + '\'' +
                ", testExecutionName='" + testExecutionName + '\'' +
                ", jiraIssueKey='" + jiraIssueKey + '\'' +
                '}';
    }
}
