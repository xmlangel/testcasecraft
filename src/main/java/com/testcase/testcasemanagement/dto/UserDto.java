// src/main/java/com/testcase/testcasemanagement/dto/UserDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 사용자 관리 관련 DTO 클래스들 */
public class UserDto {

  /** 사용자 생성 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class CreateRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank private String name;
    @NotBlank private String password;
    private String role; // USER, ADMIN
    private String timezone; // 사용자 시간대
  }

  /** 사용자 수정 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UpdateRequest {
    @NotBlank @Email private String email;
    @NotBlank private String name;
    private String role;
    private Boolean isActive;
    private String timezone; // 사용자 시간대
  }

  /** 패스워드 변경 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ChangePasswordRequest {
    @NotBlank private String currentPassword;
    @NotBlank private String newPassword;
  }

  /** 사용자 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class Response {
    private String id;
    private String username;
    private String email;
    private String name;
    private String role;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastLoginAt;

    // 활동 통계
    private Integer organizationCount;
    private Integer projectCount;
    private Integer groupCount;
    private Integer completedTestCases;
  }

  /** 사용자 목록 응답 DTO (간소화된 버전) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ListResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private String role;
    private Boolean isActive;
    private Boolean emailVerified; // 이메일 인증 여부

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastLoginAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
  }

  /** 사용자 프로필 응답 DTO (현재 사용자용) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ProfileResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private String role;
    private String timezone; // 사용자 시간대
    private Boolean emailVerified; // 이메일 인증 여부

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastLoginAt;

    // 소속 정보
    private List<MembershipInfo> organizations;
    private List<MembershipInfo> projects;
    private List<MembershipInfo> groups;

    // 활동 통계
    private ActivityStatistics activityStatistics;
  }

  /** 멤버십 정보 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class MembershipInfo {
    private String id;
    private String name;
    private String role;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;
  }

  /** 활동 통계 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ActivityStatistics {
    private Integer totalTestCasesCreated;
    private Integer totalTestCasesExecuted;
    private Integer totalTestCasesCompleted;
    private Integer organizationsCreated;
    private Integer projectsCreated;
    private Integer groupsCreated;
    private Double averageTestPassRate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;
  }

  /** 사용자 검색 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class SearchRequest {
    private String keyword;
    private String role;
    private Boolean isActive;
    private Integer page;
    private Integer size;
  }

  /** 사용자 역할 변경 요청 DTO (관리자용) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ChangeRoleRequest {
    @NotBlank private String role; // USER, ADMIN
  }

  /** 사용자 활성화/비활성화 요청 DTO (관리자용) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ActivationRequest {
    private Boolean isActive;
    private String reason;
  }

  /** 사용자 통계 응답 DTO (관리자용) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class StatisticsResponse {
    private Integer totalUsers;
    private Integer activeUsers;
    private Integer inactiveUsers;
    private Integer adminUsers;
    private Integer regularUsers;
    private Integer newUsersThisMonth;
    private Double averageLoginFrequency;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastRegistration;
  }
}
