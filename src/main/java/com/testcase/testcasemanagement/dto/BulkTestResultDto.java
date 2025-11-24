package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 일괄 테스트 결과 입력을 위한 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkTestResultDto {

    /**
     * 결과를 입력할 테스트케이스 ID 목록
     */
    @NotEmpty(message = "테스트케이스 ID 목록은 필수입니다")
    private List<String> testCaseIds;

    /**
     * 공통 결과 값
     */
    @NotBlank(message = "결과 값은 필수입니다")
    @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOT_RUN)$", message = "유효하지 않은 결과 값입니다")
    private String result;

    /**
     * 공통 비고
     */
    @Size(max = 10000, message = "notes는 10,000자 이내로 입력해주세요")
    private String notes;

    /**
     * 공통 태그
     */
    private List<String> tags;

    /**
     * 공통 JIRA 이슈 키
     */
    @Size(max = 100, message = "JIRA 이슈 키는 100자 이내로 입력해주세요")
    @Pattern(regexp = "^$|^[A-Z]+-\\d+$", message = "JIRA 이슈 키는 'PROJECT-123' 형식이어야 합니다")
    private String jiraIssueKey;

    @Override
    public String toString() {
        return "BulkTestResultDto{" +
                "testCaseIds=" + testCaseIds +
                ", result='" + result + '\'' +
                ", notes='" + notes + '\'' +
                ", tags=" + tags +
                ", jiraIssueKey='" + jiraIssueKey + '\'' +
                '}';
    }
}
