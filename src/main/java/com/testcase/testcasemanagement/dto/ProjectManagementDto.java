// src/main/java/com/testcase/testcasemanagement/dto/ProjectManagementDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.testcase.testcasemanagement.model.ProjectUser;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 프로젝트 관리 관련 DTO 클래스들 */
public class ProjectManagementDto {

  /** 프로젝트 생성 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class CreateRequest {
    @NotBlank private String name;
    @NotBlank private String code;
    private String description;
    private String organizationId; // nullable - 독립 프로젝트인 경우 null
  }

  /** 프로젝트 수정 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateRequest {
    @NotBlank private String name;
    @NotBlank private String code;
    private String description;
  }

  /** 프로젝트 응답 DTO (확장된 버전) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class DetailResponse {
    private String id;
    private String name;
    private String code;
    private String description;

    // 조직 정보
    private String organizationId;
    private String organizationName;

    // 통계 정보
    private Integer memberCount;
    private Integer testCaseCount;
    private Integer completedTestCount;
    private Integer totalTestPlanCount;

    // 내 역할
    private ProjectUser.ProjectRole myRole;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
  }

  /** 프로젝트 멤버 초대 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class InviteMemberRequest {
    @NotBlank private String username;
    @NotNull private ProjectUser.ProjectRole role;
  }

  /** 프로젝트 멤버 역할 변경 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateMemberRoleRequest {
    @NotNull private ProjectUser.ProjectRole role;
  }

  /** 프로젝트 멤버 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class MemberResponse {
    private String id;
    private String userId;
    private String username;
    private String userEmail;
    private String userDisplayName;
    private ProjectUser.ProjectRole roleInProject;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;

    // 최근 활동 정보
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;

    private Integer completedTestCases;
  }

  /** 프로젝트 목록 응답 DTO (간소화된 버전) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ListResponse {
    private String id;
    private String name;
    private String code;
    private String description;
    private String organizationId;
    private String organizationName;
    private Integer memberCount;
    private Integer testCaseCount;
    private ProjectUser.ProjectRole myRole;
    private Double progressPercentage;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;
  }

  /** 프로젝트 이전 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class TransferRequest {
    private String newOrganizationId; // null이면 독립 프로젝트로 이전
    private String newProjectManagerUsername; // 새로운 프로젝트 매니저
  }

  /** 프로젝트 통계 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class StatisticsResponse {
    private String projectId;
    private String projectName;
    private Integer totalMembers;
    private Integer totalTestCases;
    private Integer completedTests;
    private Integer failedTests;
    private Integer totalTestPlans;
    private Integer activeTestPlans;
    private Double overallProgress;
    private Double passRate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastTestExecution;
  }
}
