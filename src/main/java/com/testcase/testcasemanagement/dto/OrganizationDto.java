// src/main/java/com/testcase/testcasemanagement/dto/OrganizationDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.testcase.testcasemanagement.model.OrganizationUser;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 조직 관련 DTO 클래스들 */
public class OrganizationDto {

  /** 조직 생성 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class CreateRequest {
    @NotBlank private String name;
    private String description;
  }

  /** 조직 수정 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateRequest {
    @NotBlank private String name;
    private String description;
  }

  /** 조직 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class Response {
    private String id;
    private String name;
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    private Integer memberCount;
    private Integer projectCount;
  }

  /** 조직 멤버 초대 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class InviteMemberRequest {
    @NotBlank private String username;
    @NotNull private OrganizationUser.OrganizationRole role;
  }

  /** 조직 멤버 역할 변경 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateMemberRoleRequest {
    @NotNull private OrganizationUser.OrganizationRole role;
  }

  /** 조직 멤버 응답 DTO */
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
    private OrganizationUser.OrganizationRole roleInOrganization;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;
  }

  /** 조직 목록 응답 DTO (간소화된 버전) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ListResponse {
    private String id;
    private String name;
    private String description;
    private Integer memberCount;
    private Integer projectCount;
    private OrganizationUser.OrganizationRole myRole;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
  }

  /** 조직 통계 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class StatisticsResponse {
    private String organizationId;
    private String organizationName;
    private Integer totalMembers;
    private Integer totalProjects;
    private Integer totalGroups;
    private Integer activeProjects;
    private Integer completedTestCases;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;
  }
}
