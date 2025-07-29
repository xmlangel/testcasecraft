// src/main/java/com/testcase/testcasemanagement/dto/RecentTestResultDto.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentTestResultDto {
    private String testResultId;
    private String testCaseId;
    private String testCaseName;
    private String projectId;
    private String projectName;
    private String testExecutionId;
    private String testExecutionName;
    private String result; // NOT_RUN, PASS, FAIL, BLOCKED
    private String notes;
    private LocalDateTime executedAt;
    private String executedBy;
}