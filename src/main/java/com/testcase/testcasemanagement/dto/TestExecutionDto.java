// src/main/java/com/testcase/testcasemanagement/dto/TestExecutionDto.java

package com.testcase.testcasemanagement.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestExecutionDto {
    private String id;
    private String name;
    private String testPlanId;
    private String projectId;
    private String description;
    private String status; // NOTSTARTED, INPROGRESS, COMPLETED
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<TestResultDto> results;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> tags;

}
