// src/main/java/com/testcase/testcasemanagement/dto/AuditLogDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.testcase.testcasemanagement.audit.AuditAction;
import com.testcase.testcasemanagement.audit.AuditEntityType;
import com.testcase.testcasemanagement.audit.AuditExportFormat;
import com.testcase.testcasemanagement.audit.AuditLogLevel;
import com.testcase.testcasemanagement.audit.AuditSeverity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 감사 로그 관련 DTO 클래스들 */
public class AuditLogDto {

  /** 감사 로그 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class Response {
    private String id;
    private AuditEntityType entityType;
    private String entityId;
    private String entityName; // 조직명, 프로젝트명 등
    private AuditAction action;
    private String actionDescription;
    private String performedById;
    private String performedByUsername;
    private String performedByName;
    private String details;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    // 추가 컨텍스트 정보
    private String ipAddress;
    private String userAgent;
    private AuditSeverity severity; // LOW, MEDIUM, HIGH, CRITICAL
  }

  /** 감사 로그 검색 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class SearchRequest {
    private AuditEntityType entityType;
    private String entityId;
    private AuditAction action;
    private String performedBy;
    private String keyword;
    private AuditSeverity severity;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Min(0)
    private Integer page;

    @Min(1)
    @Max(100)
    private Integer size;

    private String sortBy; // timestamp, action, entityType
    private String sortDirection; // asc, desc
  }

  /** 감사 로그 통계 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class StatisticsResponse {
    private Long totalLogs;
    private Long todayLogs;
    private Long thisWeekLogs;
    private Long thisMonthLogs;

    private List<ActionStatistic> actionStatistics;
    private List<EntityTypeStatistic> entityTypeStatistics;
    private List<UserActivityStatistic> userActivityStatistics;
    private List<DailyLogCount> dailyLogCounts;
  }

  /** 액션 통계 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ActionStatistic {
    private AuditAction action;
    private String actionDescription;
    private Long count;
    private Double percentage;
  }

  /** 엔티티 타입 통계 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class EntityTypeStatistic {
    private AuditEntityType entityType;
    private String entityTypeDescription;
    private Long count;
    private Double percentage;
  }

  /** 사용자 활동 통계 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class UserActivityStatistic {
    private String userId;
    private String username;
    private String name;
    private Long actionsCount;
    private Double percentage;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;
  }

  /** 일별 로그 수 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class DailyLogCount {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime date;

    private Long count;
  }

  /** 감사 로그 내보내기 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ExportRequest {
    @NotNull private AuditExportFormat format; // CSV, JSON, PDF
    private AuditEntityType entityType;
    private String entityId;
    private AuditAction action;
    private String performedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private Boolean includeDetails;
    private Boolean includeStatistics;
  }

  /** 감사 로그 내보내기 응답 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ExportResponse {
    private String fileId;
    private String fileName;
    private AuditExportFormat format;
    private Long fileSize;
    private Integer recordCount;
    private String downloadUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime exportedAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;
  }

  /** 감사 로그 설정 요청 DTO */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ConfigurationRequest {
    private Boolean enabledAutoCleanup;

    @Min(1)
    @Max(3650)
    private Integer retentionDays;

    private AuditLogLevel logLevel; // ALL, HIGH, CRITICAL
    private Boolean enabledRealTimeAlerts;
    private List<AuditAction> alertActions; // CREATE, DELETE, INVITE_MEMBER 등
    private List<String> alertRecipients; // 이메일 주소들
  }
}
