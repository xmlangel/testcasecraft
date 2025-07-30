// src/main/java/com/testcase/testcasemanagement/dto/ProjectManagementDto.java
package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.ProjectUser;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * 프로젝트 관리 관련 DTO 클래스들
 */
public class ProjectManagementDto {

    /**
     * 프로젝트 생성 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CreateRequest {
        private String name;
        private String code;
        private String description;
        private String organizationId; // nullable - 독립 프로젝트인 경우 null

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOrganizationId() { return organizationId; }
        public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    }

    /**
     * 프로젝트 수정 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateRequest {
        private String name;
        private String code;
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    /**
     * 프로젝트 응답 DTO (확장된 버전)
     */
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

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOrganizationId() { return organizationId; }
        public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
        
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
        
        public Integer getMemberCount() { return memberCount; }
        public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
        
        public Integer getTestCaseCount() { return testCaseCount; }
        public void setTestCaseCount(Integer testCaseCount) { this.testCaseCount = testCaseCount; }
        
        public Integer getCompletedTestCount() { return completedTestCount; }
        public void setCompletedTestCount(Integer completedTestCount) { this.completedTestCount = completedTestCount; }
        
        public Integer getTotalTestPlanCount() { return totalTestPlanCount; }
        public void setTotalTestPlanCount(Integer totalTestPlanCount) { this.totalTestPlanCount = totalTestPlanCount; }
        
        public ProjectUser.ProjectRole getMyRole() { return myRole; }
        public void setMyRole(ProjectUser.ProjectRole myRole) { this.myRole = myRole; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    /**
     * 프로젝트 멤버 초대 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InviteMemberRequest {
        private String username;
        private ProjectUser.ProjectRole role;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public ProjectUser.ProjectRole getRole() { return role; }
        public void setRole(ProjectUser.ProjectRole role) { this.role = role; }
    }

    /**
     * 프로젝트 멤버 역할 변경 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateMemberRoleRequest {
        private ProjectUser.ProjectRole role;

        public ProjectUser.ProjectRole getRole() { return role; }
        public void setRole(ProjectUser.ProjectRole role) { this.role = role; }
    }

    /**
     * 프로젝트 멤버 응답 DTO
     */
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

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        
        public String getUserDisplayName() { return userDisplayName; }
        public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
        
        public ProjectUser.ProjectRole getRoleInProject() { return roleInProject; }
        public void setRoleInProject(ProjectUser.ProjectRole roleInProject) { 
            this.roleInProject = roleInProject; 
        }
        
        public LocalDateTime getJoinedAt() { return joinedAt; }
        public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        
        public Integer getCompletedTestCases() { return completedTestCases; }
        public void setCompletedTestCases(Integer completedTestCases) { this.completedTestCases = completedTestCases; }
    }

    /**
     * 프로젝트 목록 응답 DTO (간소화된 버전)
     */
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

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOrganizationId() { return organizationId; }
        public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
        
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
        
        public Integer getMemberCount() { return memberCount; }
        public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
        
        public Integer getTestCaseCount() { return testCaseCount; }
        public void setTestCaseCount(Integer testCaseCount) { this.testCaseCount = testCaseCount; }
        
        public ProjectUser.ProjectRole getMyRole() { return myRole; }
        public void setMyRole(ProjectUser.ProjectRole myRole) { this.myRole = myRole; }
        
        public Double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    }

    /**
     * 프로젝트 이전 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TransferRequest {
        private String newOrganizationId; // null이면 독립 프로젝트로 이전
        private String newProjectManagerUsername; // 새로운 프로젝트 매니저

        public String getNewOrganizationId() { return newOrganizationId; }
        public void setNewOrganizationId(String newOrganizationId) { this.newOrganizationId = newOrganizationId; }
        
        public String getNewProjectManagerUsername() { return newProjectManagerUsername; }
        public void setNewProjectManagerUsername(String newProjectManagerUsername) { 
            this.newProjectManagerUsername = newProjectManagerUsername; 
        }
    }

    /**
     * 프로젝트 통계 응답 DTO
     */
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

        // Getters and Setters
        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        
        public Integer getTotalMembers() { return totalMembers; }
        public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }
        
        public Integer getTotalTestCases() { return totalTestCases; }
        public void setTotalTestCases(Integer totalTestCases) { this.totalTestCases = totalTestCases; }
        
        public Integer getCompletedTests() { return completedTests; }
        public void setCompletedTests(Integer completedTests) { this.completedTests = completedTests; }
        
        public Integer getFailedTests() { return failedTests; }
        public void setFailedTests(Integer failedTests) { this.failedTests = failedTests; }
        
        public Integer getTotalTestPlans() { return totalTestPlans; }
        public void setTotalTestPlans(Integer totalTestPlans) { this.totalTestPlans = totalTestPlans; }
        
        public Integer getActiveTestPlans() { return activeTestPlans; }
        public void setActiveTestPlans(Integer activeTestPlans) { this.activeTestPlans = activeTestPlans; }
        
        public Double getOverallProgress() { return overallProgress; }
        public void setOverallProgress(Double overallProgress) { this.overallProgress = overallProgress; }
        
        public Double getPassRate() { return passRate; }
        public void setPassRate(Double passRate) { this.passRate = passRate; }
        
        public LocalDateTime getLastTestExecution() { return lastTestExecution; }
        public void setLastTestExecution(LocalDateTime lastTestExecution) { this.lastTestExecution = lastTestExecution; }
    }
}