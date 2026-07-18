// src/main/java/com/testcase/testcasemanagement/service/JiraApiService.java
package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class JiraApiService {

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final JiraConnectionManager jiraConnectionManager;
  private final Optional<JiraMonitoringService> jiraMonitoringService;

  /**
   * SSRF 가드 우회 스위치. 기본 false — 루프백/사설/링크로컬(클라우드 메타데이터 169.254.169.254 포함) 대상을 차단한다. 내부 IP 로 운영되는
   * 신뢰된 on-prem Jira 를 쓰는 배포에서만 true 로 켠다.
   */
  @Value("${app.jira.allow-private-targets:false}")
  private boolean allowPrivateTargets;

  public JiraApiService(
      RestTemplate restTemplate,
      ObjectMapper objectMapper,
      @Lazy Optional<JiraConnectionManager> jiraConnectionManager,
      @Lazy Optional<JiraMonitoringService> jiraMonitoringService) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.jiraConnectionManager = jiraConnectionManager.orElse(null);
    this.jiraMonitoringService = jiraMonitoringService;
  }

  /** JIRA 서버 연결 테스트 */
  public JiraConfigDto.ConnectionStatusDto testConnection(
      JiraConfigDto.TestConnectionDto testConfig) {
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
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(serverUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(serverInfoUrl), HttpMethod.GET, entity, String.class);

      if (response.getStatusCode() == HttpStatus.OK) {
        JsonNode serverInfo = objectMapper.readTree(response.getBody());
        String jiraVersion = serverInfo.path("version").asText();
        if (jiraVersion == null || jiraVersion.isEmpty()) {
          jiraVersion = "정보 없음";
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
      jiraMonitoringService.ifPresent(
          service -> {
            long responseTime = System.currentTimeMillis() - startTime;
            service.recordApiCall(finalSuccess, responseTime);
          });
    }

    return createFailureStatus("알 수 없는 오류", "연결 테스트 실패");
  }

  /** JIRA 프로젝트 목록 조회 */
  public List<JiraConfigDto.JiraProjectDto> getProjects(
      String serverUrl, String username, String apiToken) {
    List<JiraConfigDto.JiraProjectDto> projects = new ArrayList<>();

    try {
      String normalizedUrl = normalizeServerUrl(serverUrl);
      String projectsUrl = normalizedUrl + "/rest/api/3/project";
      String authHeader = createBasicAuthHeader(username, apiToken);

      HttpHeaders headers = createHeaders(authHeader);
      HttpEntity<String> entity = new HttpEntity<>(headers);

      // 연결 풀에서 최적화된 RestTemplate 획득
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(projectsUrl), HttpMethod.GET, entity, String.class);

      if (response.getStatusCode() == HttpStatus.OK) {
        JsonNode projectsArray = objectMapper.readTree(response.getBody());

        for (JsonNode project : projectsArray) {
          projects.add(
              JiraConfigDto.JiraProjectDto.builder()
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

  /** JIRA 이슈 생성 */
  public JiraConfigDto.IssueCreateResponseDto createIssue(
      String serverUrl,
      String username,
      String apiToken,
      JiraConfigDto.IssueCreateRequestDto createRequest) {
    long startTime = System.currentTimeMillis();
    boolean success = false;

    try {
      String normalizedUrl = normalizeServerUrl(serverUrl);
      String issueUrl = normalizedUrl + "/rest/api/3/issue";
      String authHeader = createBasicAuthHeader(username, apiToken);

      // 이슈 생성 본문 구성 (Atlassian Document Format)
      String requestBody = createIssueRequestBody(createRequest);

      HttpHeaders headers = createHeaders(authHeader);
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

      // 연결 풀에서 최적화된 RestTemplate 획득
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(issueUrl), HttpMethod.POST, entity, String.class);

      if (response.getStatusCode() == HttpStatus.CREATED) {
        JsonNode result = objectMapper.readTree(response.getBody());
        String issueKey = result.path("key").asText();
        success = true;

        // JIRA 이슈 상세 주소(Browse URL) 생성
        String browseUrl = normalizedUrl + "/browse/" + issueKey;
        log.info("JIRA 이슈 생성 성공: issueKey={}, browseUrl={}", issueKey, browseUrl);

        return JiraConfigDto.IssueCreateResponseDto.builder()
            .success(true)
            .issueKey(issueKey)
            .issueId(result.path("id").asText())
            .self(result.path("self").asText())
            .browseUrl(browseUrl)
            .build();
      }

      return JiraConfigDto.IssueCreateResponseDto.builder()
          .success(false)
          .errorMessage("이슈 생성 실패: " + response.getStatusCode())
          .build();

    } catch (Exception e) {
      log.error("JIRA 이슈 생성 실패", e);
      jiraMonitoringService.ifPresent(service -> service.recordError("JIRA 이슈 생성 오류", e));
      return JiraConfigDto.IssueCreateResponseDto.builder()
          .success(false)
          .errorMessage("이슈 생성 중 오류 발생: " + e.getMessage())
          .build();
    } finally {
      final boolean finalSuccess = success;
      jiraMonitoringService.ifPresent(
          service -> {
            long responseTime = System.currentTimeMillis() - startTime;
            service.recordApiCall(finalSuccess, responseTime);
          });
    }
  }

  /** 프로젝트별 사용 가능한 이슈 유형 조회 */
  public List<JiraConfigDto.IssueTypeDto> getProjectIssueTypes(
      String serverUrl, String username, String apiToken, String projectKey) {
    List<JiraConfigDto.IssueTypeDto> issueTypes = new ArrayList<>();
    try {
      String normalizedUrl = normalizeServerUrl(serverUrl);
      // 프로젝트 정보를 가져오면 이슈 유형 목록이 포함됨
      String projectUrl = normalizedUrl + "/rest/api/3/project/" + projectKey;
      String authHeader = createBasicAuthHeader(username, apiToken);

      HttpHeaders headers = createHeaders(authHeader);
      HttpEntity<String> entity = new HttpEntity<>(headers);

      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(projectUrl), HttpMethod.GET, entity, String.class);

      if (response.getStatusCode() == HttpStatus.OK) {
        JsonNode projectData = objectMapper.readTree(response.getBody());
        JsonNode issueTypesNode = projectData.path("issueTypes");

        if (issueTypesNode.isArray()) {
          for (JsonNode type : issueTypesNode) {
            issueTypes.add(
                JiraConfigDto.IssueTypeDto.builder()
                    .id(type.path("id").asText())
                    .name(type.path("name").asText())
                    .description(type.path("description").asText())
                    .iconUrl(type.path("iconUrl").asText())
                    .subtask(type.path("subtask").asBoolean())
                    .build());
          }
        }
      }
    } catch (Exception e) {
      log.error("JIRA 이슈 유형 조회 실패: projectKey={}", projectKey, e);
    }
    return issueTypes;
  }

  private String createIssueRequestBody(JiraConfigDto.IssueCreateRequestDto request)
      throws Exception {
    // 보안: String.format 로 JSON 을 조립하면 큰따옴표만 이스케이프돼 백슬래시·개행 등으로
    // JSON 구조가 파손되거나 필드가 주입될 수 있다. ObjectMapper 로 구조적으로 빌드해 모든 값을 안전하게 이스케이프한다.
    ObjectNode fields = objectMapper.createObjectNode();

    ObjectNode project = objectMapper.createObjectNode();
    project.put("key", request.getProjectKey());
    fields.set("project", project);

    fields.put("summary", request.getSummary());

    // 설명(ADF) — createAdfDescription 은 JSON 문자열("null" 또는 ADF 객체)을 반환
    String descriptionJson = createAdfDescription(request.getDescription());
    fields.set("description", objectMapper.readTree(descriptionJson));

    ObjectNode issueType = objectMapper.createObjectNode();
    if (request.getIssueTypeId() != null && !request.getIssueTypeId().isEmpty()) {
      issueType.put("id", request.getIssueTypeId());
    } else {
      issueType.put(
          "name", request.getIssueTypeName() != null ? request.getIssueTypeName() : "Bug");
    }
    fields.set("issuetype", issueType);

    ObjectNode root = objectMapper.createObjectNode();
    root.set("fields", fields);
    return objectMapper.writeValueAsString(root);
  }

  private String createAdfDescription(String text) {
    if (text == null || text.trim().isEmpty()) {
      return "null";
    }

    try {
      // ObjectMapper를 사용하여 구조적으로 빌드 (보안 및 안정성 향상)
      Map<String, Object> adf = new HashMap<>();
      adf.put("version", 1);
      adf.put("type", "doc");

      List<Map<String, Object>> content = new ArrayList<>();
      String[] lines = text.split("\n");

      for (String line : lines) {
        line = line.replace("\r", "");

        // 1. 구분선 (Horizontal Rule)
        if (line.trim().equals("---") || line.trim().equals("***")) {
          content.add(Map.of("type", "rule"));
          continue;
        }

        // 2. 헤더 (Headers)
        Matcher headerMatcher = Pattern.compile("^(#{1,6})\\s+(.+)$").matcher(line.trim());
        if (headerMatcher.find()) {
          int level = headerMatcher.group(1).length();
          String headerText = headerMatcher.group(2);

          Map<String, Object> heading = new HashMap<>();
          heading.put("type", "heading");
          heading.put("attrs", Map.of("level", level));
          heading.put("content", parseInlineContent(headerText));
          content.add(heading);
          continue;
        }

        // 3. 불렛 리스트 (Bullet List - 간단히 구현)
        Matcher listMatcher = Pattern.compile("^([\\-*])\\s+(.+)$").matcher(line.trim());
        if (listMatcher.find()) {
          String itemText = listMatcher.group(2);

          Map<String, Object> listItem = new HashMap<>();
          listItem.put("type", "listItem");
          listItem.put(
              "content",
              List.of(Map.of("type", "paragraph", "content", parseInlineContent(itemText))));

          // 이전 노드가 bulletList이면 거기에 추가, 아니면 새로 생성
          if (!content.isEmpty()
              && "bulletList".equals(content.get(content.size() - 1).get("type"))) {
            @SuppressWarnings("unchecked")
            List<Object> items = (List<Object>) content.get(content.size() - 1).get("content");
            items.add(listItem);
          } else {
            Map<String, Object> bulletList = new HashMap<>();
            bulletList.put("type", "bulletList");
            bulletList.put("content", new ArrayList<>(List.of(listItem)));
            content.add(bulletList);
          }
          continue;
        }

        // 4. 일반 단락 (Paragraph)
        if (line.trim().isEmpty()) {
          content.add(Map.of("type", "paragraph"));
        } else {
          Map<String, Object> paragraph = new HashMap<>();
          paragraph.put("type", "paragraph");
          paragraph.put("content", parseInlineContent(line));
          content.add(paragraph);
        }
      }

      adf.put("content", content);
      return objectMapper.writeValueAsString(adf);
    } catch (Exception e) {
      log.error("ADF 변환 실패, 일반 텍스트로 폴백", e);
      // 폴백도 ObjectMapper 로 구성해 text 값을 안전하게 이스케이프
      try {
        ObjectNode textNode = objectMapper.createObjectNode();
        textNode.put("type", "text");
        textNode.put("text", text);
        ObjectNode paragraph = objectMapper.createObjectNode();
        paragraph.put("type", "paragraph");
        paragraph.set("content", objectMapper.createArrayNode().add(textNode));
        ObjectNode doc = objectMapper.createObjectNode();
        doc.put("version", 1);
        doc.put("type", "doc");
        doc.set("content", objectMapper.createArrayNode().add(paragraph));
        return objectMapper.writeValueAsString(doc);
      } catch (Exception ex) {
        return "null";
      }
    }
  }

  /** 인라인 마크다운(굵게) 처리 */
  private List<Map<String, Object>> parseInlineContent(String text) {
    List<Map<String, Object>> content = new ArrayList<>();

    // **bold** 또는 __bold__ 처리 (매우 단순화된 구현)
    Pattern boldPattern = Pattern.compile("(\\*\\*|__)(.*?)\\1");
    Matcher matcher = boldPattern.matcher(text);

    int lastEnd = 0;
    while (matcher.find()) {
      // 이전 일반 텍스트 추가
      if (matcher.start() > lastEnd) {
        content.add(Map.of("type", "text", "text", text.substring(lastEnd, matcher.start())));
      }

      // 굵은 텍스트 추가
      Map<String, Object> boldText = new HashMap<>();
      boldText.put("type", "text");
      boldText.put("text", matcher.group(2));
      boldText.put("marks", List.of(Map.of("type", "strong")));
      content.add(boldText);

      lastEnd = matcher.end();
    }

    // 남은 텍스트 추가
    if (lastEnd < text.length()) {
      content.add(Map.of("type", "text", "text", text.substring(lastEnd)));
    }

    if (content.isEmpty() && !text.isEmpty()) {
      content.add(Map.of("type", "text", "text", text));
    }

    return content;
  }

  /** JIRA 이슈에 파일 업로드 */
  public boolean uploadAttachment(
      String serverUrl,
      String username,
      String apiToken,
      String issueKey,
      String fileName,
      byte[] fileData,
      String mimeType) {
    try {
      String normalizedUrl = normalizeServerUrl(serverUrl);
      String uploadUrl = normalizedUrl + "/rest/api/3/issue/" + issueKey + "/attachments";
      String authHeader = createBasicAuthHeader(username, apiToken);

      HttpHeaders headers = createHeaders(authHeader);
      // JIRA 첨부파일 API 필수 헤더
      headers.set("X-Atlassian-Token", "no-check");
      headers.setContentType(MediaType.MULTIPART_FORM_DATA);

      MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

      // ByteArrayResource를 상속받아 파일명을 제공하는 익명 클래스 사용
      Resource resource =
          new ByteArrayResource(fileData) {
            @Override
            public String getFilename() {
              return fileName;
            }
          };

      body.add("file", resource);

      HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(uploadUrl), HttpMethod.POST, entity, String.class);

      return response.getStatusCode() == HttpStatus.OK;

    } catch (Exception e) {
      log.error("JIRA 이슈 첨부파일 업로드 실패: issueKey={}, fileName={}", issueKey, fileName, e);
      return false;
    }
  }

  /** JIRA 이슈에 코멘트 추가 */
  public boolean addCommentToIssue(
      String serverUrl, String username, String apiToken, String issueKey, String comment) {
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
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(commentUrl), HttpMethod.POST, entity, String.class);

      return response.getStatusCode() == HttpStatus.CREATED;

    } catch (Exception e) {
      log.error("JIRA 이슈 코멘트 추가 실패: issueKey={}", issueKey, e);
      return false;
    }
  }

  /** JIRA 이슈 정보 조회 */
  public JsonNode getIssueInfo(
      String serverUrl, String username, String apiToken, String issueKey) {
    try {
      String normalizedUrl = normalizeServerUrl(serverUrl);
      String issueUrl = normalizedUrl + "/rest/api/3/issue/" + issueKey;
      String authHeader = createBasicAuthHeader(username, apiToken);

      HttpHeaders headers = createHeaders(authHeader);
      HttpEntity<String> entity = new HttpEntity<>(headers);

      // 연결 풀에서 최적화된 RestTemplate 획득
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(issueUrl), HttpMethod.GET, entity, String.class);

      if (response.getStatusCode() == HttpStatus.OK) {
        return objectMapper.readTree(response.getBody());
      }

    } catch (Exception e) {
      log.error("JIRA 이슈 정보 조회 실패: issueKey={}", issueKey, e);
    }

    return null;
  }

  /** JIRA 이슈 검색 (JQL 사용) ICT-162: 이슈 검색 기능 추가 */
  public List<JsonNode> searchIssues(
      String serverUrl, String username, String apiToken, String jql, int maxResults) {
    List<JsonNode> issues = new ArrayList<>();

    try {
      String normalizedUrl = normalizeServerUrl(serverUrl);
      String searchUrl = normalizedUrl + "/rest/api/3/search/jql";
      String authHeader = createBasicAuthHeader(username, apiToken);

      // 검색 요청 본문 구성 (ObjectMapper 로 안전하게 — jql 의 백슬래시/개행 등에 의한 JSON 주입 방지)
      ObjectNode bodyNode = objectMapper.createObjectNode();
      bodyNode.put("jql", jql);
      bodyNode.put("maxResults", maxResults);
      com.fasterxml.jackson.databind.node.ArrayNode fieldsArr = bodyNode.putArray("fields");
      for (String f :
          new String[] {"key", "summary", "status", "priority", "created", "updated", "assignee"}) {
        fieldsArr.add(f);
      }
      String requestBody = objectMapper.writeValueAsString(bodyNode);

      HttpHeaders headers = createHeaders(authHeader);
      HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

      // 연결 풀에서 최적화된 RestTemplate 획득
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(searchUrl), HttpMethod.POST, entity, String.class);

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

  /** 테스트 결과를 기반으로 JIRA 코멘트 내용 생성 ICT-162: 테스트 결과 기반 자동 코멘트 생성 */
  public String generateTestResultComment(
      String testCaseName,
      String result,
      String notes,
      String executedBy,
      LocalDateTime executedAt) {
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
    comment
        .append("*실행 시간:* ")
        .append(executedAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
        .append("\\n");

    if (notes != null && !notes.trim().isEmpty()) {
      comment.append("\\n*상세 내용:*\\n");
      comment.append(notes.trim()).append("\\n");
    }

    comment.append("\\n---\\n");
    comment.append("_자동 생성된 테스트 결과 리포트_");

    return comment.toString();
  }

  /** JIRA 이슈 URL 생성 ICT-162: 이슈 URL 생성 유틸리티 */
  public String generateIssueUrl(String serverUrl, String issueKey) {
    String normalizedUrl = normalizeServerUrl(serverUrl);
    return normalizedUrl + "/browse/" + issueKey;
  }

  /** JIRA 이슈 존재 여부 확인 ICT-184: 이슈 입력 시 존재 여부 검증 */
  public JiraConfigDto.IssueExistsDto checkIssueExists(
      String serverUrl, String username, String apiToken, String issueKey) {
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
      String issueUrl =
          normalizedUrl
              + "/rest/api/3/issue/"
              + issueKey
              + "?fields=key,summary,status,priority,issuetype";
      String authHeader = createBasicAuthHeader(username, apiToken);

      HttpHeaders headers = createHeaders(authHeader);
      HttpEntity<String> entity = new HttpEntity<>(headers);

      // 연결 풀에서 최적화된 RestTemplate 획득
      RestTemplate optimizedRestTemplate =
          jiraConnectionManager != null
              ? jiraConnectionManager.getRestTemplate(normalizedUrl)
              : restTemplate;

      ResponseEntity<String> response =
          optimizedRestTemplate.exchange(
              URI.create(issueUrl), HttpMethod.GET, entity, String.class);

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
      jiraMonitoringService.ifPresent(
          service -> {
            long responseTime = System.currentTimeMillis() - startTime;
            service.recordApiCall(true, responseTime);
          });
    }

    return JiraConfigDto.IssueExistsDto.builder()
        .exists(false)
        .issueKey(issueKey)
        .errorMessage("알 수 없는 오류가 발생했습니다.")
        .build();
  }

  /** 이슈 키 유효성 검증 ICT-162: 이슈 키 형식 검증 */
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

    // SSRF 가드: 모든 아웃바운드 Jira 호출이 이 메서드를 통과하므로 여기서 대상 호스트를 검증한다.
    validateOutboundTarget(serverUrl);

    return serverUrl;
  }

  /**
   * 정규화된 서버 URL 이 안전한 아웃바운드 대상인지 검증한다 (SSRF 방지).
   *
   * <p>http/https 스킴만 허용하고, 호스트를 실제로 해석해 루프백/임의로컬/링크로컬(169.254/fe80)/사설(10·172.16-31·192.168·fc00
   * ULA)/CGNAT(100.64/10)/멀티캐스트 대상을 차단한다. 하나의 이름이 여러 주소로 해석되면 그중 하나라도 차단 대상이면 거부한다(DNS 리바인딩 완화).
   * {@code app.jira.allow-private-targets=true} 로 켜면 내부 대상 차단을 생략한다(신뢰된 on-prem 배포 전용).
   */
  private void validateOutboundTarget(String normalizedUrl) {
    final URI uri;
    try {
      uri = URI.create(normalizedUrl);
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("유효하지 않은 서버 URL 입니다");
    }

    String scheme = uri.getScheme();
    if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
      throw new IllegalArgumentException("서버 URL 은 http/https 스킴만 허용됩니다");
    }

    String host = uri.getHost();
    if (host == null || host.isEmpty()) {
      throw new IllegalArgumentException("서버 URL 의 호스트가 유효하지 않습니다");
    }

    if (allowPrivateTargets) {
      return;
    }

    final InetAddress[] addresses;
    try {
      addresses = InetAddress.getAllByName(host);
    } catch (UnknownHostException e) {
      throw new IllegalArgumentException("서버 호스트를 확인할 수 없습니다: " + host);
    }
    for (InetAddress address : addresses) {
      if (isBlockedTarget(address)) {
        throw new IllegalArgumentException("허용되지 않는 내부/사설 대상입니다: " + host);
      }
    }
  }

  /** 내부/사설/특수용도 주소인지 판정한다. */
  private boolean isBlockedTarget(InetAddress address) {
    if (address.isLoopbackAddress()
        || address.isAnyLocalAddress()
        || address.isLinkLocalAddress()
        || address.isSiteLocalAddress()
        || address.isMulticastAddress()) {
      return true;
    }
    byte[] octets = address.getAddress();
    if (octets.length == 4) {
      int first = octets[0] & 0xff;
      int second = octets[1] & 0xff;
      // CGNAT 100.64.0.0/10 (isSiteLocalAddress 미포함)
      return first == 100 && second >= 64 && second <= 127;
    }
    if (octets.length == 16) {
      // IPv6 Unique Local Address fc00::/7 (isSiteLocalAddress 는 deprecated fec0::/10 만 커버)
      return (octets[0] & 0xfe) == 0xfc;
    }
    return false;
  }

  private String createBasicAuthHeader(String username, String apiToken) {
    String credentials = username + ":" + apiToken;
    String encodedCredentials =
        Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
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

      restTemplate.exchange(URI.create(projectUrl), HttpMethod.GET, entity, String.class);

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
      // createAdfDescription에서 생성하는 'doc' 전체를 'body' 하위에 넣어야 함
      String adfJson =
          createAdfDescription(
              comment
                  + "\n\n자동 생성 시각: "
                  + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

      // createAdfDescription은 {"version":1, "type":"doc", "content": [...]} 형태를 반환함
      // 코멘트 API는 "body": { ... } 형태를 요구함 — ObjectMapper 로 안전하게 감싼다
      ObjectNode body = objectMapper.createObjectNode();
      body.set("body", objectMapper.readTree(adfJson));
      return objectMapper.writeValueAsString(body);

    } catch (Exception e) {
      log.error("코멘트 본문 생성 실패", e);
      // 실패 시 간단한 형태로 폴백 (ObjectMapper 로 안전 이스케이프)
      try {
        ObjectNode fb = objectMapper.createObjectNode();
        fb.put("body", comment);
        return objectMapper.writeValueAsString(fb);
      } catch (Exception ex) {
        return "{\"body\":\"\"}";
      }
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
