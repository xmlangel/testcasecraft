// src/main/java/com/testcase/testcasemanagement/dto/AuditLogDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 감사 로그 관련 DTO 클래스들
 */
public class AuditLogDto {

    /**
     * 감사 로그 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private String id;
        private String entityType;
        private String entityId;
        private String entityName; // 조직명, 프로젝트명 등
        private String action;
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
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        
        public String getEntityName() { return entityName; }
        public void setEntityName(String entityName) { this.entityName = entityName; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public String getActionDescription() { return actionDescription; }
        public void setActionDescription(String actionDescription) { this.actionDescription = actionDescription; }
        
        public String getPerformedById() { return performedById; }
        public void setPerformedById(String performedById) { this.performedById = performedById; }
        
        public String getPerformedByUsername() { return performedByUsername; }
        public void setPerformedByUsername(String performedByUsername) { this.performedByUsername = performedByUsername; }
        
        public String getPerformedByName() { return performedByName; }
        public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
        
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        
        public String getUserAgent() { return userAgent; }
        public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
        
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }

    /**
     * 감사 로그 검색 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SearchRequest {
        private String entityType;
        private String entityId;
        private String action;
        private String performedBy;
        private String keyword;
        private String severity;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime startDate;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime endDate;
        
        private Integer page;
        private Integer size;
        private String sortBy; // timestamp, action, entityType
        private String sortDirection; // asc, desc

        // Getters and Setters
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public String getPerformedBy() { return performedBy; }
        public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
        
        public String getKeyword() { return keyword; }
        public void setKeyword(String keyword) { this.keyword = keyword; }
        
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        
        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        
        public Integer getSize() { return size; }
        public void setSize(Integer size) { this.size = size; }
        
        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy; }
        
        public String getSortDirection() { return sortDirection; }
        public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
    }

    /**
     * 감사 로그 통계 응답 DTO
     */
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

        public Long getTotalLogs() { return totalLogs; }
        public void setTotalLogs(Long totalLogs) { this.totalLogs = totalLogs; }
        
        public Long getTodayLogs() { return todayLogs; }
        public void setTodayLogs(Long todayLogs) { this.todayLogs = todayLogs; }
        
        public Long getThisWeekLogs() { return thisWeekLogs; }
        public void setThisWeekLogs(Long thisWeekLogs) { this.thisWeekLogs = thisWeekLogs; }
        
        public Long getThisMonthLogs() { return thisMonthLogs; }
        public void setThisMonthLogs(Long thisMonthLogs) { this.thisMonthLogs = thisMonthLogs; }
        
        public List<ActionStatistic> getActionStatistics() { return actionStatistics; }
        public void setActionStatistics(List<ActionStatistic> actionStatistics) { this.actionStatistics = actionStatistics; }
        
        public List<EntityTypeStatistic> getEntityTypeStatistics() { return entityTypeStatistics; }
        public void setEntityTypeStatistics(List<EntityTypeStatistic> entityTypeStatistics) { this.entityTypeStatistics = entityTypeStatistics; }
        
        public List<UserActivityStatistic> getUserActivityStatistics() { return userActivityStatistics; }
        public void setUserActivityStatistics(List<UserActivityStatistic> userActivityStatistics) { this.userActivityStatistics = userActivityStatistics; }
        
        public List<DailyLogCount> getDailyLogCounts() { return dailyLogCounts; }
        public void setDailyLogCounts(List<DailyLogCount> dailyLogCounts) { this.dailyLogCounts = dailyLogCounts; }
    }

    /**
     * 액션 통계 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ActionStatistic {
        private String action;
        private String actionDescription;
        private Long count;
        private Double percentage;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public String getActionDescription() { return actionDescription; }
        public void setActionDescription(String actionDescription) { this.actionDescription = actionDescription; }
        
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
        
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }

    /**
     * 엔티티 타입 통계 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class EntityTypeStatistic {
        private String entityType;
        private String entityTypeDescription;
        private Long count;
        private Double percentage;

        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        
        public String getEntityTypeDescription() { return entityTypeDescription; }
        public void setEntityTypeDescription(String entityTypeDescription) { this.entityTypeDescription = entityTypeDescription; }
        
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
        
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }

    /**
     * 사용자 활동 통계 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UserActivityStatistic {
        private String userId;
        private String username;
        private String name;
        private Long actionsCount;
        private Double percentage;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastActivity;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public Long getActionsCount() { return actionsCount; }
        public void setActionsCount(Long actionsCount) { this.actionsCount = actionsCount; }
        
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    }

    /**
     * 일별 로그 수 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DailyLogCount {
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDateTime date;
        private Long count;

        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }
        
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
    }

    /**
     * 감사 로그 내보내기 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ExportRequest {
        private String format; // CSV, JSON, PDF
        private String entityType;
        private String entityId;
        private String action;
        private String performedBy;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime startDate;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime endDate;
        
        private Boolean includeDetails;
        private Boolean includeStatistics;

        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
        
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public String getPerformedBy() { return performedBy; }
        public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
        
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        
        public Boolean getIncludeDetails() { return includeDetails; }
        public void setIncludeDetails(Boolean includeDetails) { this.includeDetails = includeDetails; }
        
        public Boolean getIncludeStatistics() { return includeStatistics; }
        public void setIncludeStatistics(Boolean includeStatistics) { this.includeStatistics = includeStatistics; }
    }

    /**
     * 감사 로그 내보내기 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ExportResponse {
        private String fileId;
        private String fileName;
        private String format;
        private Long fileSize;
        private Integer recordCount;
        private String downloadUrl;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime exportedAt;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime expiresAt;

        public String getFileId() { return fileId; }
        public void setFileId(String fileId) { this.fileId = fileId; }
        
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        
        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
        
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
        
        public Integer getRecordCount() { return recordCount; }
        public void setRecordCount(Integer recordCount) { this.recordCount = recordCount; }
        
        public String getDownloadUrl() { return downloadUrl; }
        public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
        
        public LocalDateTime getExportedAt() { return exportedAt; }
        public void setExportedAt(LocalDateTime exportedAt) { this.exportedAt = exportedAt; }
        
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    }

    /**
     * 감사 로그 설정 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ConfigurationRequest {
        private Boolean enabledAutoCleanup;
        private Integer retentionDays;
        private String logLevel; // ALL, HIGH, CRITICAL
        private Boolean enabledRealTimeAlerts;
        private String[] alertActions; // CREATE, DELETE, INVITE_MEMBER 등
        private String[] alertRecipients; // 이메일 주소들

        public Boolean getEnabledAutoCleanup() { return enabledAutoCleanup; }
        public void setEnabledAutoCleanup(Boolean enabledAutoCleanup) { this.enabledAutoCleanup = enabledAutoCleanup; }
        
        public Integer getRetentionDays() { return retentionDays; }
        public void setRetentionDays(Integer retentionDays) { this.retentionDays = retentionDays; }
        
        public String getLogLevel() { return logLevel; }
        public void setLogLevel(String logLevel) { this.logLevel = logLevel; }
        
        public Boolean getEnabledRealTimeAlerts() { return enabledRealTimeAlerts; }
        public void setEnabledRealTimeAlerts(Boolean enabledRealTimeAlerts) { this.enabledRealTimeAlerts = enabledRealTimeAlerts; }
        
        public String[] getAlertActions() { return alertActions; }
        public void setAlertActions(String[] alertActions) { this.alertActions = alertActions; }
        
        public String[] getAlertRecipients() { return alertRecipients; }
        public void setAlertRecipients(String[] alertRecipients) { this.alertRecipients = alertRecipients; }
    }
}