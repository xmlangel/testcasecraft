// src/main/java/com/testcase/testcasemanagement/dto/JiraConfigDto.java
package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JiraConfigDto {
    private String id;
    private String userId;
    private String serverUrl;
    private String username;
    
    private String apiToken;  // 마스킹된 API 토큰 (응답에 포함)
    
    private String testProjectKey;  // 테스트할 프로젝트 키 (선택적)
    
    private Boolean isActive;
    private Boolean connectionVerified;
    private LocalDateTime lastConnectionTest;
    private String lastConnectionError;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 연결 상태 확인용 응답 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionStatusDto {
        private Boolean isConnected;
        private String status;
        private String message;
        private LocalDateTime lastTested;
        private String jiraVersion;
        private String projectKey;  // 테스트 프로젝트 키 (선택적)
    }
    
    // JIRA 설정 테스트 요청 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestConnectionDto {
        private String serverUrl;
        private String username;
        private String apiToken;
        private String testProjectKey;  // 테스트할 프로젝트 키 (선택적)
    }
    
    // JIRA 프로젝트 목록 DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JiraProjectDto {
        private String id;
        private String key;
        private String name;
        private String description;
        private String projectTypeKey;
        private String leadDisplayName;
    }
}