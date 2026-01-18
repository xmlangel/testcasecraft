// src/main/java/com/testcase/testcasemanagement/dto/JiraConfigDto.java
package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;

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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastConnectionTest;

    private String lastConnectionError;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
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

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
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
    
    // JIRA 이슈 존재 여부 확인 결과 DTO
    // ICT-184: 이슈 입력 시 존재 여부 검증
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueExistsDto {
        private Boolean exists;
        private String issueKey;
        private String summary;
        private String status;
        private String priority;
        private String issueType;
        private String errorMessage;
    }
}