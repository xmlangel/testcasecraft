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

  @NotBlank(message = "projectId는 필수입니다.")
  private String projectId;

  @NotBlank(message = "charterId는 필수입니다.")
  private String charterId;

  @NotBlank(message = "title은 필수입니다.")
  private String title;

  private String testerId;
  private String leadId;

  @NotBlank(message = "testerName은 필수입니다.")
  private String testerName;

  @NotBlank(message = "leadName은 필수입니다.")
  private String leadName;

  @NotNull(message = "netDurationMinutes는 필수입니다.")
  @Min(value = 1, message = "netDurationMinutes는 1 이상이어야 합니다.")
  private Integer netDurationMinutes;

  @NotNull(message = "testExecutionPct는 필수입니다.")
  @Min(value = 0, message = "testExecutionPct는 0 이상이어야 합니다.")
  @Max(value = 100, message = "testExecutionPct는 100 이하여야 합니다.")
  private Integer testExecutionPct;

  @NotNull(message = "bugInvestigationPct는 필수입니다.")
  @Min(value = 0, message = "bugInvestigationPct는 0 이상이어야 합니다.")
  @Max(value = 100, message = "bugInvestigationPct는 100 이하여야 합니다.")
  private Integer bugInvestigationPct;

  @NotNull(message = "setupAdminPct는 필수입니다.")
  @Min(value = 0, message = "setupAdminPct는 0 이상이어야 합니다.")
  @Max(value = 100, message = "setupAdminPct는 100 이하여야 합니다.")
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

  @Min(value = 0)
  @Max(value = 100)
  private Integer achievement;
}
