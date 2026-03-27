package com.testcase.testcasemanagement.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestSessionResponseDto {
  private String id;
  private String projectId;
  private String charterId;
  private String charterSnapshotTitle;
  private String charterSnapshotMission;
  private String testerId;
  private String leadId;
  private String testerName;
  private String leadName;
  private Integer netDurationMinutes;
  private Integer testExecutionPct;
  private Integer bugInvestigationPct;
  private Integer setupAdminPct;
  private String environmentSummary;
  private String productVersion;
  private List<String> strategyTags = new ArrayList<>();
  private List<String> areaTags = new ArrayList<>();
  private String status;
  private String reviewComment;
  private LocalDateTime startedAt;
  private LocalDateTime endedAt;
  private Integer interruptedMinutes;
  private LocalDateTime submittedAt;
  private LocalDateTime reviewedAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
