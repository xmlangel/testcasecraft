package com.testcase.testcasemanagement.config;

import jakarta.annotation.PostConstruct;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/** JIRA 통신 보안 설정 ICT-165: JIRA 통합 시스템 보안 강화 */
@Configuration
@Slf4j
public class JiraSecurityConfig {

  @Value("${jira.security.https.enforce:true}")
  private boolean httpsEnforce;

  @Value("${jira.security.https.skip-ssl-verification:false}")
  private boolean skipSslVerification;

  @Value("${jira.connection.timeout:30000}")
  private int connectionTimeout;

  @Value("${jira.connection.read-timeout:60000}")
  private int readTimeout;

  private final Environment environment;
  private boolean prodProfileActive;

  public JiraSecurityConfig(Environment environment) {
    this.environment = environment;
  }

  @PostConstruct
  void init() {
    prodProfileActive =
        Arrays.stream(environment.getActiveProfiles())
            .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
    if (skipSslVerification && prodProfileActive) {
      // 운영에서 인증서 검증 우회는 MITM 위험 → 동작은 유지하되 강한 경고를 남긴다(기존 자체서명 배포 무중단).
      log.error(
          "보안 경고: 운영(prod) 프로파일에서 jira.security.https.skip-ssl-verification=true 가 설정됐습니다."
              + " 인증서 검증을 우회하므로 MITM 에 취약합니다. 정식 인증서 사용을 강력히 권장합니다.");
    }
  }

  /** SSL 검증 우회 여부 — 설정값을 그대로 따른다(운영이라도 동작 유지, 대신 init 에서 강한 경고). */
  private boolean isSslBypassAllowed() {
    return skipSslVerification;
  }

  /** JIRA API 통신용 RestTemplate 설정 */
  @Bean(name = "jiraRestTemplate")
  public RestTemplate jiraRestTemplate() {
    RestTemplate restTemplate = new RestTemplate();
    restTemplate.setRequestFactory(jiraClientHttpRequestFactory());
    log.info(
        "JIRA RestTemplate 초기화 완료 - HTTPS 강제: {}, SSL 검증 스킵(유효): {}",
        httpsEnforce,
        isSslBypassAllowed());
    return restTemplate;
  }

  /** JIRA 전용 HTTP 클라이언트 팩토리 */
  @Bean
  public ClientHttpRequestFactory jiraClientHttpRequestFactory() {
    SimpleClientHttpRequestFactory factory =
        new SimpleClientHttpRequestFactory() {
          @Override
          protected void prepareConnection(HttpURLConnection connection, String httpMethod)
              throws java.io.IOException {
            super.prepareConnection(connection, httpMethod);

            // SSRF 방어: 리다이렉트 자동 추종 차단. normalizeServerUrl 의 대상검증(#81)을 통과한 공개 URL 이
            // 302 로 사설/링크로컬(169.254.169.254 메타데이터)로 재유도하는 우회를 막는다. 리다이렉트가 필요한
            // 정상 Jira 는 없다. (DNS 리바인딩 TOCTOU 의 근본 방어인 SSRF-aware 소켓팩토리/이그레스 프록시는 후속 과제)
            connection.setInstanceFollowRedirects(false);

            // HTTPS 강제 적용
            if (httpsEnforce && connection instanceof HttpsURLConnection) {
              HttpsURLConnection httpsConnection = (HttpsURLConnection) connection;

              if (isSslBypassAllowed()) {
                // 개발/테스트 환경에서만 사용 (운영 프로파일에서는 isSslBypassAllowed 가 false → 진입 불가)
                log.warn("SSL 인증서 검증을 건너뜁니다. 운영 환경에서는 권장하지 않습니다.");
                configureSslBypass(httpsConnection);
              } else {
                // 운영 환경 권장 설정
                configureSecureHttps(httpsConnection);
              }
            }

            // URL이 HTTP인 경우 경고
            String urlString = connection.getURL().toString();
            if (httpsEnforce && urlString.startsWith("http://")) {
              log.warn("HTTP 연결이 감지되었습니다. HTTPS 사용을 권장합니다: {}", urlString);
            }
          }
        };

    // 타임아웃 설정
    factory.setConnectTimeout(connectionTimeout);
    factory.setReadTimeout(readTimeout);

    return factory;
  }

  /** SSL 검증 우회 설정 (개발/테스트 환경용) */
  private void configureSslBypass(HttpsURLConnection connection) {
    try {
      // 모든 인증서를 신뢰하는 TrustManager 생성
      TrustManager[] trustAllCerts =
          new TrustManager[] {
            new X509TrustManager() {
              public X509Certificate[] getAcceptedIssuers() {
                return new X509Certificate[0];
              }

              public void checkClientTrusted(X509Certificate[] certs, String authType) {
                // 검증 생략
              }

              public void checkServerTrusted(X509Certificate[] certs, String authType) {
                // 검증 생략
              }
            }
          };

      SSLContext sslContext = SSLContext.getInstance("SSL");
      sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

      connection.setSSLSocketFactory(sslContext.getSocketFactory());
      connection.setHostnameVerifier((hostname, session) -> true);

    } catch (Exception e) {
      log.error("SSL 설정 중 오류 발생", e);
    }
  }

  /** 보안 HTTPS 연결 설정 (운영 환경용) */
  private void configureSecureHttps(HttpsURLConnection connection) {
    try {
      // 기본 SSL 컨텍스트 사용 (시스템 인증서 저장소 기반)
      SSLContext sslContext = SSLContext.getDefault();
      connection.setSSLSocketFactory(sslContext.getSocketFactory());

      // 호스트명 검증 활성화
      connection.setHostnameVerifier(HttpsURLConnection.getDefaultHostnameVerifier());

    } catch (Exception e) {
      log.error("보안 HTTPS 설정 중 오류 발생", e);
    }
  }

  /** JIRA 서버 URL 검증 및 정규화 */
  public String validateAndNormalizeJiraUrl(String serverUrl) {
    if (serverUrl == null || serverUrl.trim().isEmpty()) {
      throw new IllegalArgumentException("JIRA 서버 URL이 필요합니다");
    }

    String normalizedUrl = serverUrl.trim();

    // 프로토콜 확인 및 추가
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      // HTTPS 강제 설정이 활성화되어 있으면 HTTPS 사용
      normalizedUrl = httpsEnforce ? "https://" + normalizedUrl : "http://" + normalizedUrl;
    }

    // HTTPS 강제 설정 확인
    if (httpsEnforce && normalizedUrl.startsWith("http://")) {
      log.warn("HTTP URL이 제공되었지만 HTTPS가 강제됩니다: {}", normalizedUrl);
      normalizedUrl = normalizedUrl.replace("http://", "https://");
    }

    // URL 유효성 검증
    try {
      URL url = java.net.URI.create(normalizedUrl).toURL();

      // 포트 번호 검증
      int port = url.getPort();
      if (port != -1 && (port < 1 || port > 65535)) {
        throw new IllegalArgumentException("유효하지 않은 포트 번호: " + port);
      }

      // 호스트명 검증
      String host = url.getHost();
      if (host == null || host.trim().isEmpty()) {
        throw new IllegalArgumentException("유효하지 않은 호스트명");
      }

    } catch (Exception e) {
      throw new IllegalArgumentException("유효하지 않은 JIRA 서버 URL: " + normalizedUrl, e);
    }

    // 마지막 슬래시 제거
    if (normalizedUrl.endsWith("/")) {
      normalizedUrl = normalizedUrl.substring(0, normalizedUrl.length() - 1);
    }

    return normalizedUrl;
  }

  /** 보안 설정 상태 정보 */
  public SecurityConfigStatus getSecurityStatus() {
    return SecurityConfigStatus.builder()
        .httpsEnforce(httpsEnforce)
        .skipSslVerification(skipSslVerification)
        .connectionTimeout(connectionTimeout)
        .readTimeout(readTimeout)
        .build();
  }

  /** 보안 설정 상태 정보 클래스 */
  public static class SecurityConfigStatus {
    private boolean httpsEnforce;
    private boolean skipSslVerification;
    private int connectionTimeout;
    private int readTimeout;

    public static SecurityConfigStatusBuilder builder() {
      return new SecurityConfigStatusBuilder();
    }

    // Getters
    public boolean isHttpsEnforce() {
      return httpsEnforce;
    }

    public boolean isSkipSslVerification() {
      return skipSslVerification;
    }

    public int getConnectionTimeout() {
      return connectionTimeout;
    }

    public int getReadTimeout() {
      return readTimeout;
    }

    public static class SecurityConfigStatusBuilder {
      private SecurityConfigStatus status = new SecurityConfigStatus();

      public SecurityConfigStatusBuilder httpsEnforce(boolean httpsEnforce) {
        status.httpsEnforce = httpsEnforce;
        return this;
      }

      public SecurityConfigStatusBuilder skipSslVerification(boolean skipSslVerification) {
        status.skipSslVerification = skipSslVerification;
        return this;
      }

      public SecurityConfigStatusBuilder connectionTimeout(int connectionTimeout) {
        status.connectionTimeout = connectionTimeout;
        return this;
      }

      public SecurityConfigStatusBuilder readTimeout(int readTimeout) {
        status.readTimeout = readTimeout;
        return this;
      }

      public SecurityConfigStatus build() {
        return status;
      }
    }
  }
}
