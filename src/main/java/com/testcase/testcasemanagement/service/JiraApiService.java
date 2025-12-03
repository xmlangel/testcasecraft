// src/main/java/com/testcase/testcasemanagement/service/JiraApiService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class JiraApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final JiraConnectionManager jiraConnectionManager;
    private final Optional<JiraMonitoringService> jiraMonitoringService;

    public JiraApiService(RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Lazy Optional<JiraConnectionManager> jiraConnectionManager,
            @Lazy Optional<JiraMonitoringService> jiraMonitoringService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.jiraConnectionManager = jiraConnectionManager.orElse(null);
        this.jiraMonitoringService = jiraMonitoringService;
    }

    /**
     * JIRA 서버 연결 테스트
     */
    public JiraConfigDto.ConnectionStatusDto testConnection(JiraConfigDto.TestConnectionDto testConfig) {
        long startTime = System.currentTimeMillis();
        boolean success = false;

        try {
            String serverUrl = normalizeServerUrl(testConfig.getServerUrl());
            String authHeader = createBasicAuthHeader(testConfig.getUsername(), testConfig.getApiToken());

            // JIRA 서버 정보 조회
            String serverInfoUrl = serverUrl + "/rest/api/3/serverInfo";
            HttpHeaders headers = createHeaders(authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 연결 풀에서 최적화된 RestTemplate 획득
            RestTemplate optimizedRestTemplate = jiraConnectionManager != null
                    ? jiraConnectionManager.getRestTemplate(serverUrl)
                    : restTemplate;

            ResponseEntity<String> response = optimizedRestTemplate.exchange(
                    URI.create(serverInfoUrl),
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode serverInfo = objectMapper.readTree(response.getBody());
                String jiraVersion = serverInfo.path("version").asText();
                if (jiraVersion == null || jiraVersion.isEmpty()) {
                    jiraVersion = "Unknown";
                }

                // 선택적으로 프로젝트 접근 권한 테스트
                String projectKey = testConfig.getTestProjectKey();
                if (projectKey != null && !projectKey.isEmpty()) {
                    testProjectAccess(serverUrl, authHeader, projectKey);
                }

                success = true;
                return JiraConfigDto.ConnectionStatusDto.builder()
                        .isConnected(true)
                        .status("SUCCESS")
                        .message("JIRA 연결 성공")
                        .lastTested(LocalDateTime.now())
                        .jiraVersion(jiraVersion)
                        .projectKey(projectKey)
                        .build();
            }

        } catch (HttpClientErrorException e) {
            log.warn("JIRA 연결 실패 - 클라이언트 오류: {}", e.getMessage());
            jiraMonitoringService.ifPresent(service -> service.recordError("JIRA 인증 실패", e));
            return createFailureStatus("인증 실패 또는 권한 부족: " + e.getStatusCode(), e.getMessage());

        } catch (HttpServerErrorException e) {
            log.warn("JIRA 연결 실패 - 서버 오류: {}", e.getMessage());
            jiraMonitoringService.ifPresent(service -> service.recordError("JIRA 서버 오류", e));
            return createFailureStatus("JIRA 서버 오류: " + e.getStatusCode(), e.getMessage());

        } catch (ResourceAccessException e) {
            log.warn("JIRA 연결 실패 - 네트워크 오류: {}", e.getMessage());
            jiraMonitoringService.ifPresent(service -> service.recordError("JIRA 네트워크 오류", e));
            return createFailureStatus("네트워크 연결 실패", "JIRA 서버에 접근할 수 없습니다: " + e.getMessage());

        } catch (Exception e) {
            log.error("JIRA 연결 테스트 중 예외 발생", e);
            jiraMonitoringService.ifPresent(service -> service.recordError("JIRA 연결 테스트 예외", e));
            return createFailureStatus("연결 테스트 실패", e.getMessage());
        } finally {
            // 모니터링 메트릭 기록
            final boolean finalSuccess = success;
            jiraMonitoringService.ifPresent(service -> {
                long responseTime = System.currentTimeMillis() - startTime;
                service.recordApiCall(finalSuccess, responseTime);
            });
        }

        return createFailureStatus("알 수 없는 오류", "연결 테스트 실패");
    }

    /**
     * JIRA 프로젝트 목록 조회
     */
    public List<JiraConfigDto.JiraProjectDto> getProjects(String serverUrl, String username, String apiToken) {
        List<JiraConfigDto.JiraProjectDto> projects = new ArrayList<>();

        try {
            String normalizedUrl = normalizeServerUrl(serverUrl);
            String projectsUrl = normalizedUrl + "/rest/api/3/project";
            String authHeader = createBasicAuthHeader(username, apiToken);

            HttpHeaders headers = createHeaders(authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 연결 풀에서 최적화된 RestTemplate 획득
            RestTemplate optimizedRestTemplate = jiraConnectionManager != null
                    ? jiraConnectionManager.getRestTemplate(normalizedUrl)
                    : restTemplate;

            ResponseEntity<String> response = optimizedRestTemplate.exchange(
                    URI.create(projectsUrl),
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode projectsArray = objectMapper.readTree(response.getBody());

                for (JsonNode project : projectsArray) {
                    projects.add(JiraConfigDto.JiraProjectDto.builder()
                            .id(project.path("id").asText())
                            .key(project.path("key").asText())
                            .name(project.path("name").asText())
                            .description(project.path("description").asText())
                            .projectTypeKey(project.path("projectTypeKey").asText())
                            .leadDisplayName(project.path("lead").path("displayName").asText())
                            .build());
                }
            }

        } catch (Exception e) {
            log.error("JIRA 프로젝트 목록 조회 실패", e);
        }

        return projects;
    }

    /**
     * JIRA 이슈에 코멘트 추가
     */
    public boolean addCommentToIssue(String serverUrl, String username, String apiToken,
            String issueKey, String comment) {
        try {
            String normalizedUrl = normalizeServerUrl(serverUrl);
            String commentUrl = normalizedUrl + "/rest/api/3/issue/" + issueKey + "/comment";
            String authHeader = createBasicAuthHeader(username, apiToken);

            // 코멘트 본문 생성 (Atlassian Document Format)
            String commentBody = createCommentBody(comment);

            HttpHeaders headers = createHeaders(authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(commentBody, headers);

            // 연결 풀에서 최적화된 RestTemplate 획득
            RestTemplate optimizedRestTemplate = jiraConnectionManager != null
                    ? jiraConnectionManager.getRestTemplate(normalizedUrl)
                    : restTemplate;

            ResponseEntity<String> response = optimizedRestTemplate.exchange(
                    URI.create(commentUrl),
                    HttpMethod.POST,
                    entity,
                    String.class);

            return response.getStatusCode() == HttpStatus.CREATED;

        } catch (Exception e) {
            log.error("JIRA 이슈 코멘트 추가 실패: issueKey={}", issueKey, e);
            return false;
        }
    }

    /**
     * JIRA 이슈 정보 조회
     */
    public JsonNode getIssueInfo(String serverUrl, String username, String apiToken, String issueKey) {
        try {
            String normalizedUrl = normalizeServerUrl(serverUrl);
            String issueUrl = normalizedUrl + "/rest/api/3/issue/" + issueKey;
            String authHeader = createBasicAuthHeader(username, apiToken);

            HttpHeaders headers = createHeaders(authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 연결 풀에서 최적화된 RestTemplate 획득
            RestTemplate optimizedRestTemplate = jiraConnectionManager != null
                    ? jiraConnectionManager.getRestTemplate(normalizedUrl)
                    : restTemplate;

            ResponseEntity<String> response = optimizedRestTemplate.exchange(
                    URI.create(issueUrl),
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readTree(response.getBody());
            }

        } catch (Exception e) {
            log.error("JIRA 이슈 정보 조회 실패: issueKey={}", issueKey, e);
        }

        return null;
    }

    /**
     * JIRA 이슈 검색 (JQL 사용)
     * ICT-162: 이슈 검색 기능 추가
     */
    public List<JsonNode> searchIssues(String serverUrl, String username, String apiToken, String jql, int maxResults) {
        List<JsonNode> issues = new ArrayList<>();

        try {
            String normalizedUrl = normalizeServerUrl(serverUrl);
            String searchUrl = normalizedUrl + "/rest/api/3/search/jql";
            String authHeader = createBasicAuthHeader(username, apiToken);

            // 검색 요청 본문 구성
            String requestBody = String.format(
                    "{\"jql\":\"%s\",\"maxResults\":%d,\"fields\":[\"key\",\"summary\",\"status\",\"priority\",\"created\",\"updated\",\"assignee\"]}",
                    jql.replace("\"", "\\\""), maxResults);

            HttpHeaders headers = createHeaders(authHeader);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // 연결 풀에서 최적화된 RestTemplate 획득
            RestTemplate optimizedRestTemplate = jiraConnectionManager != null
                    ? jiraConnectionManager.getRestTemplate(normalizedUrl)
                    : restTemplate;

            ResponseEntity<String> response = optimizedRestTemplate.exchange(
                    URI.create(searchUrl),
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode searchResult = objectMapper.readTree(response.getBody());
                JsonNode issuesNode = searchResult.get("issues");

                if (issuesNode != null && issuesNode.isArray()) {
                    for (JsonNode issue : issuesNode) {
                        issues.add(issue);
                    }
                }
            }

        } catch (Exception e) {
            log.error("JIRA 이슈 검색 실패: jql={}", jql, e);
        }

        return issues;
    }

    /**
     * 테스트 결과를 기반으로 JIRA 코멘트 내용 생성
     * ICT-162: 테스트 결과 기반 자동 코멘트 생성
     */
    public String generateTestResultComment(String testCaseName, String result, String notes,
            String executedBy, LocalDateTime executedAt) {
        StringBuilder comment = new StringBuilder();

        comment.append("🧪 *테스트 실행 결과*\\n\\n");
        comment.append("*테스트 케이스:* ").append(testCaseName).append("\\n");
        comment.append("*실행 결과:* ");

        // 결과에 따른 이모지와 텍스트 추가
        switch (result.toUpperCase()) {
            case "PASS":
                comment.append("✅ 통과");
                break;
            case "FAIL":
                comment.append("❌ 실패");
                break;
            case "BLOCKED":
                comment.append("🚫 차단됨");
                break;
            case "NOT_RUN":
                comment.append("⏸️ 실행되지 않음");
                break;
            default:
                comment.append(result);
        }

        comment.append("\\n");
        comment.append("*실행자:* ").append(executedBy).append("\\n");
        comment.append("*실행 시간:* ").append(executedAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .append("\\n");

        if (notes != null && !notes.trim().isEmpty()) {
            comment.append("\\n*상세 내용:*\\n");
            comment.append(notes.trim()).append("\\n");
        }

        comment.append("\\n---\\n");
        comment.append("_자동 생성된 테스트 결과 리포트_");

        return comment.toString();
    }

    /**
     * JIRA 이슈 URL 생성
     * ICT-162: 이슈 URL 생성 유틸리티
     */
    public String generateIssueUrl(String serverUrl, String issueKey) {
        String normalizedUrl = normalizeServerUrl(serverUrl);
        return normalizedUrl + "/browse/" + issueKey;
    }

    /**
     * JIRA 이슈 존재 여부 확인
     * ICT-184: 이슈 입력 시 존재 여부 검증
     */
    public JiraConfigDto.IssueExistsDto checkIssueExists(String serverUrl, String username, String apiToken,
            String issueKey) {
        long startTime = System.currentTimeMillis();

        try {
            // 1. 이슈 키 형식 유효성 검사
            if (!isValidIssueKey(issueKey)) {
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("잘못된 이슈 키 형식입니다. (예: TEST-123)")
                        .build();
            }

            String normalizedUrl = normalizeServerUrl(serverUrl);
            String issueUrl = normalizedUrl + "/rest/api/3/issue/" + issueKey
                    + "?fields=key,summary,status,priority,issuetype";
            String authHeader = createBasicAuthHeader(username, apiToken);

            HttpHeaders headers = createHeaders(authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 연결 풀에서 최적화된 RestTemplate 획득
            RestTemplate optimizedRestTemplate = jiraConnectionManager != null
                    ? jiraConnectionManager.getRestTemplate(normalizedUrl)
                    : restTemplate;

            ResponseEntity<String> response = optimizedRestTemplate.exchange(
                    URI.create(issueUrl),
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode issueData = objectMapper.readTree(response.getBody());
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(true)
                        .issueKey(issueKey)
                        .summary(issueData.path("fields").path("summary").asText())
                        .status(issueData.path("fields").path("status").path("name").asText())
                        .priority(issueData.path("fields").path("priority").path("name").asText())
                        .issueType(issueData.path("fields").path("issuetype").path("name").asText())
                        .build();
            }

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("이슈를 찾을 수 없습니다.")
                        .build();
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("이슈에 접근할 권한이 없습니다.")
                        .build();
            } else {
                log.warn("JIRA 이슈 확인 실패 - 클라이언트 오류: {}", e.getMessage());
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("인증 실패 또는 권한 부족")
                        .build();
            }
        } catch (HttpServerErrorException e) {
            log.warn("JIRA 이슈 확인 실패 - 서버 오류: {}", e.getMessage());
            return JiraConfigDto.IssueExistsDto.builder()
                    .exists(false)
                    .issueKey(issueKey)
                    .errorMessage("JIRA 서버 오류")
                    .build();
        } catch (ResourceAccessException e) {
            log.warn("JIRA 이슈 확인 실패 - 네트워크 오류: {}", e.getMessage());
            return JiraConfigDto.IssueExistsDto.builder()
                    .exists(false)
                    .issueKey(issueKey)
                    .errorMessage("네트워크 연결 실패")
                    .build();
        } catch (Exception e) {
            log.error("JIRA 이슈 존재 확인 중 예외 발생: issueKey={}", issueKey, e);
            return JiraConfigDto.IssueExistsDto.builder()
                    .exists(false)
                    .issueKey(issueKey)
                    .errorMessage("알 수 없는 오류가 발생했습니다.")
                    .build();
        } finally {
            // 모니터링 메트릭 기록
            jiraMonitoringService.ifPresent(service -> {
                long responseTime = System.currentTimeMillis() - startTime;
                service.recordApiCall(true, responseTime);
            });
        }

        return JiraConfigDto.IssueExistsDto.builder()
                .exists(false)
                .issueKey(issueKey)
                .errorMessage("알 수 없는 오류")
                .build();
    }

    /**
     * 이슈 키 유효성 검증
     * ICT-162: 이슈 키 형식 검증
     */
    public boolean isValidIssueKey(String issueKey) {
        if (issueKey == null || issueKey.trim().isEmpty()) {
            return false;
        }

        // JIRA 이슈 키 패턴: 프로젝트키-숫자 (예: TEST-123)
        return issueKey.trim().matches("^[A-Z]+-\\d+$");
    }

    // Private helper methods

    private String normalizeServerUrl(String serverUrl) {
        if (serverUrl == null || serverUrl.isEmpty()) {
            throw new IllegalArgumentException("서버 URL이 필요합니다");
        }

        serverUrl = serverUrl.trim();
        if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
            serverUrl = "https://" + serverUrl;
        }

        // 마지막 슬래시 제거
        if (serverUrl.endsWith("/")) {
            serverUrl = serverUrl.substring(0, serverUrl.length() - 1);
        }

        return serverUrl;
    }

    private String createBasicAuthHeader(String username, String apiToken) {
        String credentials = username + ":" + apiToken;
        String encodedCredentials = Base64.getEncoder()
                .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encodedCredentials;
    }

    private HttpHeaders createHeaders(String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        headers.set(HttpHeaders.USER_AGENT, "TestCaseManager/1.0");
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }

    private void testProjectAccess(String serverUrl, String authHeader, String projectKey) {
        try {
            String projectUrl = serverUrl + "/rest/api/3/project/" + projectKey;
            HttpHeaders headers = createHeaders(authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            restTemplate.exchange(
                    URI.create(projectUrl),
                    HttpMethod.GET,
                    entity,
                    String.class);

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("프로젝트를 찾을 수 없습니다: " + projectKey);
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new RuntimeException("프로젝트 접근 권한이 없습니다: " + projectKey);
            }
            throw e;
        }
    }

    private String createCommentBody(String comment) {
        try {
            // Atlassian Document Format으로 코멘트 생성
            String commentJson = String.format("""
                    {
                        "body": {
                            "version": 1,
                            "type": "doc",
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": "%s"
                                        }
                                    ]
                                },
                                {
                                    "type": "paragraph",
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": "\\n\\n자동 생성 시각: %s"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                    """,
                    comment.replace("\"", "\\\"").replace("\n", "\\n"),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            return commentJson;

        } catch (Exception e) {
            log.error("코멘트 본문 생성 실패", e);
            // 실패 시 간단한 형태로 폴백
            return String.format("{\"body\":\"%s\"}", comment.replace("\"", "\\\""));
        }
    }

    private JiraConfigDto.ConnectionStatusDto createFailureStatus(String status, String message) {
        return JiraConfigDto.ConnectionStatusDto.builder()
                .isConnected(false)
                .status(status)
                .message(message)
                .lastTested(LocalDateTime.now())
                .build();
    }
}