package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.audit.AuditAction;
import com.testcase.testcasemanagement.audit.AuditService;
import com.testcase.testcasemanagement.dto.AgentConnectionDto;
import com.testcase.testcasemanagement.model.AgentConnection;
import com.testcase.testcasemanagement.repository.AgentConnectionRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 프로젝트별 에이전트 연동 설정.
 *
 * <p>연결 테스트가 이 클래스에서 가장 위험한 부분이다. 사용자가 주소를 직접 넣고 서버가 그 주소를 호출하므로 전형적인 SSRF 구조다. 그런데 에이전트는 내부망에 있는
 * 것이 정상이라 "사설 IP 차단" 이라는 흔한 방어를 쓸 수 없다. 그래서 다르게 좁혔다.
 *
 * <ul>
 *   <li>권한: 프로젝트 관리 권한자만 부를 수 있다 (컨트롤러의 {@code @PreAuthorize})
 *   <li>경로 고정: 사용자가 준 주소에 {@code /health} 만 붙인다. 임의 경로를 못 찍는다
 *   <li>응답 비노출: {@code status} 와 {@code version} 두 필드만 파싱하고 나머지는 버린다
 *   <li>메서드 고정: GET 만
 *   <li>리다이렉트 금지: 3xx 를 따라가지 않는다
 *   <li>타임아웃: 연결·읽기 각 3초. 포트 스캔용 타이밍 채널을 줄인다
 *   <li>스킴 제한: http·https 만
 *   <li>메타데이터 차단: 클라우드 자격증명 엔드포인트는 저장 자체를 막는다
 * </ul>
 *
 * <p>프런트에서 직접 호출하지 않는 이유는 내부망 주소를 브라우저가 못 찾거나 CORS 에 막히기 때문이다. 백엔드 프록시가 맞고, 대신 위 여덟 가지로 좁힌다.
 */
@Slf4j
@Service
public class AgentConnectionService {

  private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

  /** 어떤 설정으로도 저장을 허용하지 않는 호스트. 클라우드 자격증명이 여기서 샌다. */
  private static final Set<String> BLOCKED_HOSTS =
      Set.of(
          "169.254.169.254",
          "metadata.google.internal",
          "metadata.goog",
          "metadata",
          "instance-data",
          "100.100.200.200");

  private static final Duration TIMEOUT = Duration.ofSeconds(3);
  private static final int MAX_BODY_BYTES = 8 * 1024;

  private final AgentConnectionRepository repository;
  private final EncryptionUtil encryptionUtil;
  private final AuditService auditService;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient;

  @Value("${agent.integration.enabled:false}")
  private boolean integrationEnabled;

  public AgentConnectionService(
      AgentConnectionRepository repository,
      EncryptionUtil encryptionUtil,
      AuditService auditService) {
    this.repository = repository;
    this.encryptionUtil = encryptionUtil;
    this.auditService = auditService;
    this.httpClient =
        HttpClient.newBuilder()
            .connectTimeout(TIMEOUT)
            // 리다이렉트를 따라가면 경로 고정이 무의미해진다
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();
  }

  public boolean isIntegrationEnabled() {
    return integrationEnabled;
  }

  // -------------------------------------------------------------------- 조회

  @Transactional(readOnly = true)
  public Optional<AgentConnectionDto> get(String projectId) {
    return repository.findByProjectId(projectId).map(this::toDto);
  }

  /** 자동화 화면이 버튼을 띄울지 판단할 때 쓴다. 실패의 기본값은 "숨김" 이다. */
  @Transactional(readOnly = true)
  public boolean isRunnable(String projectId) {
    return integrationEnabled
        && repository.findByProjectId(projectId).map(AgentConnection::isRunnable).orElse(false);
  }

  // -------------------------------------------------------------------- 저장

  @Transactional
  public AgentConnectionDto save(String projectId, AgentConnectionDto dto, String username) {
    String normalizedUrl = validateAndNormalizeUrl(dto.getServerUrl());

    AgentConnection entity =
        repository.findByProjectId(projectId).orElseGet(() -> newEntity(projectId));

    boolean isNew = entity.getId() == null;
    boolean urlChanged = !normalizedUrl.equals(entity.getServerUrl());

    entity.setName(dto.getName().trim());
    entity.setServerUrl(normalizedUrl);
    entity.setDefaultProfile(trimToNull(dto.getDefaultProfile()));
    entity.setIsActive(Boolean.TRUE.equals(dto.getIsActive()));
    entity.setUpdatedBy(username);

    // 토큰은 세 갈래다. 생략(null)이면 유지, 빈 문자열이면 삭제, 값이 오면 교체
    if (dto.getToken() != null) {
      String token = dto.getToken().trim();
      entity.setEncryptedToken(token.isEmpty() ? null : encryptionUtil.encrypt(token));
    }

    // 주소가 바뀌면 이전 검증 결과를 믿을 수 없다
    if (urlChanged) {
      entity.setConnectionVerified(false);
      entity.setAgentVersion(null);
      entity.setLastConnectionError(null);
      entity.setLastConnectionTest(null);
    }

    AgentConnection saved = repository.save(entity);
    auditService.logProjectAction(
        projectId,
        isNew ? AuditAction.CREATE : AuditAction.UPDATE,
        String.format(
            "에이전트 연동 설정 %s: name=%s, url=%s, active=%s",
            isNew ? "생성" : "수정", saved.getName(), saved.getServerUrl(), saved.getIsActive()));
    return toDto(saved);
  }

  @Transactional
  public boolean delete(String projectId, String username) {
    Optional<AgentConnection> found = repository.findByProjectId(projectId);
    if (found.isEmpty()) {
      return false;
    }
    repository.delete(found.get());
    auditService.logProjectAction(
        projectId, AuditAction.DELETE, "에이전트 연동 설정 삭제 by " + username);
    return true;
  }

  // ---------------------------------------------------------------- 연결 테스트

  @Transactional
  public AgentConnectionDto.ConnectionTestResult test(String projectId, String username) {
    AgentConnection entity =
        repository
            .findByProjectId(projectId)
            .orElseThrow(() -> new IllegalStateException("에이전트 연동 설정이 없습니다"));

    long started = System.currentTimeMillis();
    AgentConnectionDto.ConnectionTestResult result = probe(entity);
    result.setLatencyMs(System.currentTimeMillis() - started);

    entity.setLastConnectionTest(LocalDateTime.now());
    entity.setConnectionVerified(result.isOk());
    entity.setLastConnectionError(result.isOk() ? null : result.getError());
    if (result.isOk()) {
      entity.setAgentVersion(result.getVersion());
    }
    entity.setUpdatedBy(username);
    repository.save(entity);

    auditService.logProjectAction(
        projectId,
        AuditAction.READ,
        String.format(
            "에이전트 연결 테스트: ok=%s, version=%s, latency=%sms",
            result.isOk(), result.getVersion(), result.getLatencyMs()));
    return result;
  }

  /**
   * {@code /health} 만 GET 으로 찍고 두 필드만 꺼낸다. 응답 본문을 그대로 돌려주지 않으므로 이걸로 내부 서비스를 훑어도 얻을 것이 없다.
   */
  private AgentConnectionDto.ConnectionTestResult probe(AgentConnection entity) {
    URI target;
    try {
      target = new URI(entity.getServerUrl() + "/health");
    } catch (URISyntaxException e) {
      return fail("주소 형태가 잘못됐습니다");
    }

    HttpRequest.Builder builder =
        HttpRequest.newBuilder(target)
            .GET()
            .timeout(TIMEOUT)
            .header("Accept", "application/json");
    if (entity.getEncryptedToken() != null) {
      String token = encryptionUtil.decrypt(entity.getEncryptedToken());
      if (token != null && !token.isBlank()) {
        builder.header("X-Agent-Token", token);
      }
    }

    try {
      HttpResponse<String> response =
          httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
      int code = response.statusCode();
      if (code >= 300 && code < 400) {
        // 리다이렉트를 따라가지 않는다. 따라가면 경로 고정이 뚫린다
        return fail("에이전트가 리다이렉트를 돌려줍니다 (" + code + ")");
      }
      if (code != HttpURLConnection.HTTP_OK) {
        return fail("에이전트가 " + code + " 를 돌려줍니다");
      }
      String body = response.body();
      if (body == null || body.length() > MAX_BODY_BYTES) {
        return fail("에이전트 응답이 예상 형태가 아닙니다");
      }
      JsonNode node = objectMapper.readTree(body);
      String status = text(node, "status");
      String version = text(node, "version");
      if (!"ok".equalsIgnoreCase(status)) {
        return fail("에이전트가 준비되지 않았습니다");
      }
      return AgentConnectionDto.ConnectionTestResult.builder()
          .ok(true)
          .version(version == null ? "" : version)
          .build();
    } catch (java.net.http.HttpTimeoutException e) {
      return fail("연결할 수 없습니다 (제한 시간 초과)");
    } catch (java.io.IOException e) {
      return fail("연결할 수 없습니다");
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return fail("연결 확인이 중단됐습니다");
    } catch (RuntimeException e) {
      // 응답이 JSON 이 아닌 경우 등. 원문을 화면에 내보내지 않는다
      log.debug("에이전트 연결 테스트 실패: {}", e.getMessage());
      return fail("에이전트 응답을 읽을 수 없습니다");
    }
  }

  // -------------------------------------------------------------------- 검증

  /** 저장 시점에 주소를 좁힌다. 여기서 막는 것이 연결 테스트에서 막는 것보다 낫다. */
  String validateAndNormalizeUrl(String raw) {
    if (raw == null || raw.isBlank()) {
      throw new IllegalArgumentException("에이전트 주소는 필수입니다");
    }
    String trimmed = raw.trim();
    URI uri;
    try {
      uri = new URI(trimmed);
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException("에이전트 주소 형태가 잘못됐습니다");
    }
    String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
    if (!ALLOWED_SCHEMES.contains(scheme)) {
      throw new IllegalArgumentException("에이전트 주소는 http 또는 https 로 시작해야 합니다");
    }
    String host = uri.getHost();
    if (host == null || host.isBlank()) {
      throw new IllegalArgumentException("에이전트 주소에서 호스트를 읽을 수 없습니다");
    }
    if (BLOCKED_HOSTS.contains(host.toLowerCase(Locale.ROOT))) {
      throw new IllegalArgumentException("이 주소는 등록할 수 없습니다");
    }
    if (uri.getUserInfo() != null) {
      throw new IllegalArgumentException("에이전트 주소에 계정 정보를 넣을 수 없습니다");
    }
    if (uri.getQuery() != null || uri.getFragment() != null) {
      throw new IllegalArgumentException("에이전트 주소에 질의 문자열을 넣을 수 없습니다");
    }
    String path = uri.getRawPath() == null ? "" : uri.getRawPath();
    // 경로 뒤 슬래시를 떼서 /health 를 붙일 때 이중 슬래시가 나지 않게 한다
    while (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    String port = uri.getPort() == -1 ? "" : ":" + uri.getPort();
    return scheme + "://" + host + port + path;
  }

  // -------------------------------------------------------------------- 보조

  private AgentConnection newEntity(String projectId) {
    AgentConnection entity = new AgentConnection();
    entity.setProjectId(projectId);
    entity.setIsActive(false);
    entity.setConnectionVerified(false);
    return entity;
  }

  private AgentConnectionDto toDto(AgentConnection e) {
    return AgentConnectionDto.builder()
        .id(e.getId())
        .name(e.getName())
        .serverUrl(e.getServerUrl())
        .defaultProfile(e.getDefaultProfile())
        .isActive(e.getIsActive())
        .hasToken(e.getEncryptedToken() != null && !e.getEncryptedToken().isBlank())
        .connectionVerified(e.getConnectionVerified())
        .lastConnectionTest(e.getLastConnectionTest())
        .lastConnectionError(e.getLastConnectionError())
        .agentVersion(e.getAgentVersion())
        .runnable(e.isRunnable())
        .updatedAt(e.getUpdatedAt())
        .updatedBy(e.getUpdatedBy())
        .build();
  }

  private static AgentConnectionDto.ConnectionTestResult fail(String message) {
    return AgentConnectionDto.ConnectionTestResult.builder().ok(false).error(message).build();
  }

  private static String text(JsonNode node, String field) {
    JsonNode value = node == null ? null : node.get(field);
    return value == null || value.isNull() ? null : value.asText();
  }

  /** 화면에서 빈 문자열이 오면 null 로 눕힌다. */
  private static String trimToNull(String raw) {
    if (raw == null) {
      return null;
    }
    String trimmed = raw.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  /** 딥링크 URL 을 만든다. 케이스 목록은 화면이 붙인다. */
  public String buildDeepLink(AgentConnection entity, String productBaseUrl, List<String> caseIds) {
    StringBuilder sb = new StringBuilder(entity.getServerUrl());
    sb.append("/runs/new?tms=testcasecraft");
    if (productBaseUrl != null && !productBaseUrl.isBlank()) {
      sb.append("&base=").append(java.net.URLEncoder.encode(productBaseUrl,
          java.nio.charset.StandardCharsets.UTF_8));
    }
    sb.append("&projectId=").append(entity.getProjectId());
    if (caseIds != null && !caseIds.isEmpty()) {
      sb.append("&cases=").append(String.join(",", caseIds));
    }
    return sb.toString();
  }
}
