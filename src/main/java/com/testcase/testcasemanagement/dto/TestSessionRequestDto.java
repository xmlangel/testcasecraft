package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TestSessionRequestDto {

  @NotBlank(message = "projectId is required.")
  private String projectId;

  @NotBlank(message = "charterId is required.")
  private String charterId;

  @NotBlank(message = "title is required.")
  private String title;

  private String testerId;
  private String leadId;

  @NotBlank(message = "testerName is required.")
  private String testerName;

  @NotBlank(message = "leadName is required.")
  private String leadName;

  @NotNull(message = "netDurationMinutes is required.")
  @Min(value = 1, message = "netDurationMinutes must be at least 1.")
  private Integer netDurationMinutes;

  @NotNull(message = "testExecutionPct is required.")
  @Min(value = 0, message = "testExecutionPct must be at least 0.")
  @Max(value = 100, message = "testExecutionPct must be at most 100.")
  private Integer testExecutionPct;

  @NotNull(message = "bugInvestigationPct is required.")
  @Min(value = 0, message = "bugInvestigationPct must be at least 0.")
  @Max(value = 100, message = "bugInvestigationPct must be at most 100.")
  private Integer bugInvestigationPct;

  @NotNull(message = "setupAdminPct is required.")
  @Min(value = 0, message = "setupAdminPct must be at least 0.")
  @Max(value = 100, message = "setupAdminPct must be at most 100.")
  private Integer setupAdminPct;

  private String environmentSummary;
  private String productVersion;

  private List<String> strategyTags = new ArrayList<>();
  private List<String> areaTags = new ArrayList<>();

  private String flowNotes;
  private String coverageNotes;
  private String oracleNotes;
  private String activityNotes;
  private String bugHeadline;
  private String blockers;
  private String remainingQuestions;
  private String testData;
  private String evaluation;
  private String nextCharter;

  private String jiraIssueKey;
  private List<TestSessionNoteDto> notes = new ArrayList<>();
  private List<TestSessionTestDto> tests = new ArrayList<>();
  private List<TestSessionBugDto> bugs = new ArrayList<>();

  @Min(value = 0)
  @Max(value = 100)
  private Integer achievement;
}
