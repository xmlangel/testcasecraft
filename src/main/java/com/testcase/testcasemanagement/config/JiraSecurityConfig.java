package com.testcase.testcasemanagement.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.X509Certificate;

/**
 * JIRA 통신 보안 설정
 * ICT-165: JIRA 통합 시스템 보안 강화
 */
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

    /**
     * JIRA API 통신용 RestTemplate 설정
     */
    @Bean(name = "jiraRestTemplate")
    public RestTemplate jiraRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(jiraClientHttpRequestFactory());
        log.info("JIRA RestTemplate 초기화 완료 - HTTPS 강제: {}, SSL 검증 스킵: {}", 
                httpsEnforce, skipSslVerification);
        return restTemplate;
    }

    /**
     * JIRA 전용 HTTP 클라이언트 팩토리
     */
    @Bean
    public ClientHttpRequestFactory jiraClientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory() {
            @Override
            protected void prepareConnection(HttpURLConnection connection, String httpMethod) throws java.io.IOException {
                super.prepareConnection(connection, httpMethod);
                
                // HTTPS 강제 적용
                if (httpsEnforce && connection instanceof HttpsURLConnection) {
                    HttpsURLConnection httpsConnection = (HttpsURLConnection) connection;
                    
                    if (skipSslVerification) {
                        // 개발/테스트 환경에서만 사용 (운영 환경 권장하지 않음)
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

    /**
     * SSL 검증 우회 설정 (개발/테스트 환경용)
     */
    private void configureSslBypass(HttpsURLConnection connection) {
        try {
            // 모든 인증서를 신뢰하는 TrustManager 생성
            TrustManager[] trustAllCerts = new TrustManager[] {
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

    /**
     * 보안 HTTPS 연결 설정 (운영 환경용)
     */
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

    /**
     * JIRA 서버 URL 검증 및 정규화
     */
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

    /**
     * 보안 설정 상태 정보
     */
    public SecurityConfigStatus getSecurityStatus() {
        return SecurityConfigStatus.builder()
                .httpsEnforce(httpsEnforce)
                .skipSslVerification(skipSslVerification)
                .connectionTimeout(connectionTimeout)
                .readTimeout(readTimeout)
                .build();
    }

    /**
     * 보안 설정 상태 정보 클래스
     */
    public static class SecurityConfigStatus {
        private boolean httpsEnforce;
        private boolean skipSslVerification;
        private int connectionTimeout;
        private int readTimeout;

        public static SecurityConfigStatusBuilder builder() {
            return new SecurityConfigStatusBuilder();
        }

        // Getters
        public boolean isHttpsEnforce() { return httpsEnforce; }
        public boolean isSkipSslVerification() { return skipSslVerification; }
        public int getConnectionTimeout() { return connectionTimeout; }
        public int getReadTimeout() { return readTimeout; }

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