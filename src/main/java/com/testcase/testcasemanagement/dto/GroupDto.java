// src/main/java/com/testcase/testcasemanagement/dto/GroupDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.testcase.testcasemanagement.model.GroupMember;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 그룹 관리 관련 DTO 클래스들 */
public class GroupDto {

  /** 그룹 생성 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class CreateRequest {
    @NotBlank private String name;
    private String description;
    private String organizationId; // nullable - 조직 그룹인 경우
    private String projectId; // nullable - 프로젝트 그룹인 경우
  }

  /** 그룹 수정 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateRequest {
    @NotBlank private String name;
    private String description;
  }

  /** 그룹 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class Response {
    private String id;
    private String name;
    private String description;

    // 소속 정보
    private String organizationId;
    private String organizationName;
    private String projectId;
    private String projectName;

    // 통계 정보
    private Integer memberCount;
    private Integer leaderCount;

    // 내 역할
    private GroupMember.GroupRole myRole;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
  }

  /** 그룹 멤버 초대 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class InviteMemberRequest {
    @NotBlank private String username;
    @NotNull private GroupMember.GroupRole role;
  }

  /** 그룹 멤버 역할 변경 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateMemberRoleRequest {
    @NotNull private GroupMember.GroupRole role;
  }

  /** 그룹 멤버 응답 DTO */
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
    private GroupMember.GroupRole roleInGroup;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;

    // 활동 통계
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;

    private Integer contributionCount;
  }

  /** 그룹 목록 응답 DTO (간소화된 버전) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ListResponse {
    private String id;
    private String name;
    private String description;
    private String organizationId;
    private String organizationName;
    private String projectId;
    private String projectName;
    private Integer memberCount;
    private GroupMember.GroupRole myRole;
    private String groupType; // "ORGANIZATION", "PROJECT", "INDEPENDENT"

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;
  }

  /** 그룹 이전 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class TransferRequest {
    private String newOrganizationId; // null이면 독립 그룹으로 이전
    private String newProjectId; // null이면 프로젝트 그룹에서 해제
  }

  /** 그룹 통계 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class StatisticsResponse {
    private String groupId;
    private String groupName;
    private String groupType;
    private Integer totalMembers;
    private Integer leadersCount;
    private Integer activeMembers;
    private Integer totalContributions;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
  }

  /** 그룹 멤버 일괄 초대 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class BulkInviteRequest {
    @NotEmpty private List<String> usernames;
    @NotNull private GroupMember.GroupRole role;
  }

  /** 그룹 멤버 일괄 초대 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class BulkInviteResponse {
    private Integer successCount;
    private Integer failureCount;
    private List<String> successUsers;
    private List<String> failureUsers;
    private List<String> failureReasons;
  }
}
