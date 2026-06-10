// src/main/java/com/testcase/testcasemanagement/dto/TestExecutionDto.java

package com.testcase.testcasemanagement.dto;

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
  private String qaSummary;
  private String qaSummaryUpdatedBy;
  private LocalDateTime qaSummaryUpdatedAt;
  private Integer totalCount;
  private Integer passedCount;
  private Integer failedCount;
  private Integer skippedCount;
  private Integer progress;
}
