// src/main/java/com/testcase/testcasemanagement/dto/UserActivityDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 사용자 활동 이력 관련 DTO 클래스들
 */
public class UserActivityDto {

    /**
     * 사용자 활동 응답 DTO
     */
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
        private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
        private Boolean anomalyDetected;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getUserFullName() { return userFullName; }
        public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
        
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        
        public String getActivityTypeDescription() { return activityTypeDescription; }
        public void setActivityTypeDescription(String activityTypeDescription) { this.activityTypeDescription = activityTypeDescription; }
        
        public String getActivityCategory() { return activityCategory; }
        public void setActivityCategory(String activityCategory) { this.activityCategory = activityCategory; }
        
        public String getActivityCategoryDescription() { return activityCategoryDescription; }
        public void setActivityCategoryDescription(String activityCategoryDescription) { this.activityCategoryDescription = activityCategoryDescription; }
        
        public String getTargetEntityType() { return targetEntityType; }
        public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }
        
        public String getTargetEntityId() { return targetEntityId; }
        public void setTargetEntityId(String targetEntityId) { this.targetEntityId = targetEntityId; }
        
        public String getTargetEntityName() { return targetEntityName; }
        public void setTargetEntityName(String targetEntityName) { this.targetEntityName = targetEntityName; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        
        public String getUserAgent() { return userAgent; }
        public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
        
        public Long getDurationMs() { return durationMs; }
        public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
        
        public Boolean getIsSuccessful() { return isSuccessful; }
        public void setIsSuccessful(Boolean isSuccessful) { this.isSuccessful = isSuccessful; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        
        public Boolean getAnomalyDetected() { return anomalyDetected; }
        public void setAnomalyDetected(Boolean anomalyDetected) { this.anomalyDetected = anomalyDetected; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    /**
     * 사용자 활동 검색 요청 DTO
     */
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
        
        private Integer page;
        private Integer size;
        private String sortBy; // timestamp, activityType, riskScore
        private String sortDirection; // asc, desc

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        
        public String getActivityCategory() { return activityCategory; }
        public void setActivityCategory(String activityCategory) { this.activityCategory = activityCategory; }
        
        public String getTargetEntityType() { return targetEntityType; }
        public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }
        
        public String getTargetEntityId() { return targetEntityId; }
        public void setTargetEntityId(String targetEntityId) { this.targetEntityId = targetEntityId; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        
        public Boolean getIsSuccessful() { return isSuccessful; }
        public void setIsSuccessful(Boolean isSuccessful) { this.isSuccessful = isSuccessful; }
        
        public Boolean getAnomalyDetected() { return anomalyDetected; }
        public void setAnomalyDetected(Boolean anomalyDetected) { this.anomalyDetected = anomalyDetected; }
        
        public Integer getMinRiskScore() { return minRiskScore; }
        public void setMinRiskScore(Integer minRiskScore) { this.minRiskScore = minRiskScore; }
        
        public Integer getMaxRiskScore() { return maxRiskScore; }
        public void setMaxRiskScore(Integer maxRiskScore) { this.maxRiskScore = maxRiskScore; }
        
        public String getKeyword() { return keyword; }
        public void setKeyword(String keyword) { this.keyword = keyword; }
        
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
     * 사용자 활동 통계 응답 DTO
     */
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

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getUserFullName() { return userFullName; }
        public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
        
        public Long getTotalActivities() { return totalActivities; }
        public void setTotalActivities(Long totalActivities) { this.totalActivities = totalActivities; }
        
        public Long getSuccessfulActivities() { return successfulActivities; }
        public void setSuccessfulActivities(Long successfulActivities) { this.successfulActivities = successfulActivities; }
        
        public Long getFailedActivities() { return failedActivities; }
        public void setFailedActivities(Long failedActivities) { this.failedActivities = failedActivities; }
        
        public Long getDistinctSessions() { return distinctSessions; }
        public void setDistinctSessions(Long distinctSessions) { this.distinctSessions = distinctSessions; }
        
        public Double getAverageSessionDurationMinutes() { return averageSessionDurationMinutes; }
        public void setAverageSessionDurationMinutes(Double averageSessionDurationMinutes) { this.averageSessionDurationMinutes = averageSessionDurationMinutes; }
        
        public Integer getAverageRiskScore() { return averageRiskScore; }
        public void setAverageRiskScore(Integer averageRiskScore) { this.averageRiskScore = averageRiskScore; }
        
        public Long getAnomalousActivities() { return anomalousActivities; }
        public void setAnomalousActivities(Long anomalousActivities) { this.anomalousActivities = anomalousActivities; }
        
        public LocalDateTime getLastActivityTime() { return lastActivityTime; }
        public void setLastActivityTime(LocalDateTime lastActivityTime) { this.lastActivityTime = lastActivityTime; }
        
        public LocalDateTime getLastLoginTime() { return lastLoginTime; }
        public void setLastLoginTime(LocalDateTime lastLoginTime) { this.lastLoginTime = lastLoginTime; }
        
        public String getLastLoginIp() { return lastLoginIp; }
        public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }
        
        public LocalDateTime getStatisticsStartDate() { return statisticsStartDate; }
        public void setStatisticsStartDate(LocalDateTime statisticsStartDate) { this.statisticsStartDate = statisticsStartDate; }
        
        public LocalDateTime getStatisticsEndDate() { return statisticsEndDate; }
        public void setStatisticsEndDate(LocalDateTime statisticsEndDate) { this.statisticsEndDate = statisticsEndDate; }
        
        public Map<String, Long> getActivityTypeStatistics() { return activityTypeStatistics; }
        public void setActivityTypeStatistics(Map<String, Long> activityTypeStatistics) { this.activityTypeStatistics = activityTypeStatistics; }
        
        public Map<String, Long> getActivityCategoryStatistics() { return activityCategoryStatistics; }
        public void setActivityCategoryStatistics(Map<String, Long> activityCategoryStatistics) { this.activityCategoryStatistics = activityCategoryStatistics; }
        
        public List<Object[]> getDailyActivityStatistics() { return dailyActivityStatistics; }
        public void setDailyActivityStatistics(List<Object[]> dailyActivityStatistics) { this.dailyActivityStatistics = dailyActivityStatistics; }
        
        public List<Object[]> getHourlyActivityStatistics() { return hourlyActivityStatistics; }
        public void setHourlyActivityStatistics(List<Object[]> hourlyActivityStatistics) { this.hourlyActivityStatistics = hourlyActivityStatistics; }
        
        public Map<String, Long> getFailureStatistics() { return failureStatistics; }
        public void setFailureStatistics(Map<String, Long> failureStatistics) { this.failureStatistics = failureStatistics; }
        
        public List<String> getMostActiveIpAddresses() { return mostActiveIpAddresses; }
        public void setMostActiveIpAddresses(List<String> mostActiveIpAddresses) { this.mostActiveIpAddresses = mostActiveIpAddresses; }
        
        public List<String> getActiveSessions() { return activeSessions; }
        public void setActiveSessions(List<String> activeSessions) { this.activeSessions = activeSessions; }
    }

    /**
     * 활동 생성 요청 DTO (테스트용)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CreateRequest {
        private String userId;
        private String activityType;
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

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        
        public String getActivityCategory() { return activityCategory; }
        public void setActivityCategory(String activityCategory) { this.activityCategory = activityCategory; }
        
        public String getTargetEntityType() { return targetEntityType; }
        public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }
        
        public String getTargetEntityId() { return targetEntityId; }
        public void setTargetEntityId(String targetEntityId) { this.targetEntityId = targetEntityId; }
        
        public String getTargetEntityName() { return targetEntityName; }
        public void setTargetEntityName(String targetEntityName) { this.targetEntityName = targetEntityName; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        
        public String getUserAgent() { return userAgent; }
        public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
        
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        
        public Boolean getIsSuccessful() { return isSuccessful; }
        public void setIsSuccessful(Boolean isSuccessful) { this.isSuccessful = isSuccessful; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }

    /**
     * 이상 활동 알림 DTO
     */
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
        
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
        private String recommendedAction;

        // Getters and Setters
        public String getActivityId() { return activityId; }
        public void setActivityId(String activityId) { this.activityId = activityId; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        
        public String getActivityCategory() { return activityCategory; }
        public void setActivityCategory(String activityCategory) { this.activityCategory = activityCategory; }
        
        public Integer getRiskScore() { return riskScore; }
        public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
        
        public String getAnomalyReason() { return anomalyReason; }
        public void setAnomalyReason(String anomalyReason) { this.anomalyReason = anomalyReason; }
        
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        
        public String getUserAgent() { return userAgent; }
        public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
        
        public LocalDateTime getDetectedAt() { return detectedAt; }
        public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
        
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        
        public String getRecommendedAction() { return recommendedAction; }
        public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
    }

    /**
     * 활동 요약 DTO
     */
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

        // Getters and Setters
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        
        public String getActivityTypeDescription() { return activityTypeDescription; }
        public void setActivityTypeDescription(String activityTypeDescription) { this.activityTypeDescription = activityTypeDescription; }
        
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
        
        public Long getSuccessCount() { return successCount; }
        public void setSuccessCount(Long successCount) { this.successCount = successCount; }
        
        public Long getFailureCount() { return failureCount; }
        public void setFailureCount(Long failureCount) { this.failureCount = failureCount; }
        
        public Double getSuccessRate() { return successRate; }
        public void setSuccessRate(Double successRate) { this.successRate = successRate; }
        
        public Double getAverageRiskScore() { return averageRiskScore; }
        public void setAverageRiskScore(Double averageRiskScore) { this.averageRiskScore = averageRiskScore; }
        
        public Long getAnomalyCount() { return anomalyCount; }
        public void setAnomalyCount(Long anomalyCount) { this.anomalyCount = anomalyCount; }
        
        public LocalDateTime getLastOccurrence() { return lastOccurrence; }
        public void setLastOccurrence(LocalDateTime lastOccurrence) { this.lastOccurrence = lastOccurrence; }
    }
}