// src/main/java/com/testcase/testcasemanagement/dto/UserActivityDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.testcase.testcasemanagement.audit.AuditSeverity;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 사용자 활동 이력 관련 DTO 클래스들 */
public class UserActivityDto {

  /** 사용자 활동 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class Response {
    private String id;
    private String userId;
    private String username;
    private String userFullName;
    private String activityType;
    private String activityTypeDescription;
    private String activityCategory;
    private String activityCategoryDescription;
    private String targetEntityType;
    private String targetEntityId;
    private String targetEntityName;
    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private Long durationMs;
    private Boolean isSuccessful;
    private String errorMessage;
    private String details;
    private Integer riskScore;
    private AuditSeverity riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private Boolean anomalyDetected;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
  }

  /** 사용자 활동 검색 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class SearchRequest {
    private String userId;
    private String activityType;
    private String activityCategory;
    private String targetEntityType;
    private String targetEntityId;
    private String sessionId;
    private String ipAddress;
    private Boolean isSuccessful;
    private Boolean anomalyDetected;
    private Integer minRiskScore;
    private Integer maxRiskScore;
    private String keyword;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Min(0)
    private Integer page;

    @Min(1)
    private Integer size;

    private String sortBy; // timestamp, activityType, riskScore
    private String sortDirection; // asc, desc
  }

  /** 사용자 활동 통계 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class StatisticsResponse {
    private String userId;
    private String username;
    private String userFullName;
    private Long totalActivities;
    private Long successfulActivities;
    private Long failedActivities;
    private Long distinctSessions;
    private Double averageSessionDurationMinutes;
    private Integer averageRiskScore;
    private Long anomalousActivities;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivityTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastLoginTime;

    private String lastLoginIp;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime statisticsStartDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime statisticsEndDate;

    private Map<String, Long> activityTypeStatistics;
    private Map<String, Long> activityCategoryStatistics;
    private List<Object[]> dailyActivityStatistics;
    private List<Object[]> hourlyActivityStatistics;
    private Map<String, Long> failureStatistics;
    private List<String> mostActiveIpAddresses;
    private List<String> activeSessions;
  }

  /** 활동 생성 요청 DTO (테스트용) */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class CreateRequest {
    @NotBlank private String userId;
    @NotBlank private String activityType;
    private String activityCategory;
    private String targetEntityType;
    private String targetEntityId;
    private String targetEntityName;
    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private String details;
    private Boolean isSuccessful;
    private String errorMessage;
  }

  /** 이상 활동 알림 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class AnomalyAlert {
    private String activityId;
    private String userId;
    private String username;
    private String activityType;
    private String activityCategory;
    private Integer riskScore;
    private String anomalyReason;
    private String ipAddress;
    private String userAgent;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime detectedAt;

    private AuditSeverity severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String recommendedAction;
  }

  /** 활동 요약 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ActivitySummary {
    private String activityType;
    private String activityTypeDescription;
    private Long count;
    private Long successCount;
    private Long failureCount;
    private Double successRate;
    private Double averageRiskScore;
    private Long anomalyCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastOccurrence;
  }
}
