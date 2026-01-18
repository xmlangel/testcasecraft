// src/main/java/com/testcase/testcasemanagement/controller/ConfigController.java
package com.testcase.testcasemanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import java.util.HashMap;
import java.util.Map;

/**
 * 프론트엔드 설정 정보를 제공하는 컨트롤러
 * 런타임 환경변수를 프론트엔드에 전달
 */
@Tag(name = "System - Configuration", description = "시스템 설정 API")
@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final Environment environment;

    @Value("${frontend.api.base-url:#{environment['REACT_APP_API_BASE_URL'] ?: 'http://localhost:8080'}}")
    private String apiBaseUrl;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${spring.profiles.active:development}")
    private String activeProfile;

    public ConfigController(Environment environment) {
        this.environment = environment;
    }

    /**
     * 프론트엔드 설정 정보 반환
     * 요청에서 동적으로 서버 URL을 구성하여 반환
     * 
     * @param request HTTP 요청 객체
     * @return 설정 정보 맵
     */
    @Operation(summary = "프론트엔드 설정 조회", description = "프론트엔드 애플리케이션에 필요한 설정 정보(API URL 등)를 조회합니다.")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig(HttpServletRequest request) {
        Map<String, Object> config = new HashMap<>();

        // API 기본 URL 설정 (동적으로 구성)
        String dynamicUrl = buildDynamicApiUrl(request);
        config.put("apiBaseUrl", dynamicUrl);
        config.put("contextPath", contextPath);
        config.put("environment", activeProfile);

        // 추가 설정 정보
        config.put("version", "1.0.0");
        config.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(config);
    }

    /**
     * API 기본 URL만 반환 (간단한 형태)
     * 요청에서 동적으로 서버 URL을 구성하여 반환
     * 
     * @param request HTTP 요청 객체
     * @return API 기본 URL
     */
    @Operation(summary = "API URL 조회", description = "동적으로 구성된 API 기본 URL을 조회합니다.")
    @GetMapping("/api-url")
    public ResponseEntity<Map<String, String>> getApiUrl(HttpServletRequest request) {
        Map<String, String> response = new HashMap<>();
        String dynamicUrl = buildDynamicApiUrl(request);
        response.put("apiUrl", dynamicUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * 환경 정보 반환
     * 요청에서 동적으로 서버 URL을 구성하여 반환
     * 
     * @param request HTTP 요청 객체
     * @return 환경 정보
     */
    @Operation(summary = "환경 정보 조회", description = "현재 애플리케이션의 실행 환경 정보를 조회합니다.")
    @GetMapping("/environment")
    public ResponseEntity<Map<String, String>> getEnvironment(HttpServletRequest request) {
        Map<String, String> env = new HashMap<>();
        env.put("profile", activeProfile);

        // API 기본 URL 설정 (동적으로 구성)
        String dynamicUrl = buildDynamicApiUrl(request);
        env.put("apiBaseUrl", dynamicUrl);

        // 환경변수에서 직접 읽기
        String reactApiUrl = System.getenv("REACT_APP_API_BASE_URL");
        if (reactApiUrl != null) {
            env.put("reactAppApiBaseUrl", reactApiUrl);
        }

        return ResponseEntity.ok(env);
    }

    /**
     * 파일 업로드 제한 정보 반환
     * 
     * @return 파일 업로드 제한 정보
     */
    @Operation(summary = "업로드 제한 조회", description = "파일 업로드 크기 제한 설정을 조회합니다.")
    @GetMapping("/upload-limits")
    public ResponseEntity<Map<String, Object>> getUploadLimits() {
        Map<String, Object> limits = new HashMap<>();

        // Spring Boot multipart 설정에서 값 가져오기
        String maxFileSize = environment.getProperty("spring.servlet.multipart.max-file-size", "100MB");
        String maxRequestSize = environment.getProperty("spring.servlet.multipart.max-request-size", "100MB");

        // JUnit 관련 설정
        String junitMaxSize = environment.getProperty("junit.file.max-size", "104857600"); // 100MB in bytes

        limits.put("maxFileSize", maxFileSize);
        limits.put("maxRequestSize", maxRequestSize);
        limits.put("junitMaxSize", junitMaxSize);
        limits.put("junitMaxSizeFormatted", formatFileSize(Long.parseLong(junitMaxSize)));
        limits.put("allowedExtensions", new String[] { ".xml" });
        limits.put("description", "JUnit XML 파일 업로드 제한");

        return ResponseEntity.ok(limits);
    }

    /**
     * HTTP 요청에서 동적으로 API 기본 URL을 구성
     * X-Forwarded-* 헤더를 고려하여 프록시 환경에서도 올바른 URL 반환
     * 
     * @param request HTTP 요청 객체
     * @return 동적으로 구성된 API 기본 URL
     */
    private String buildDynamicApiUrl(HttpServletRequest request) {
        // 환경변수에서 명시적으로 설정된 경우 우선 사용
        String envApiUrl = System.getenv("REACT_APP_API_BASE_URL");
        if (envApiUrl != null && !envApiUrl.isEmpty()) {
            return envApiUrl;
        }

        // X-Forwarded-* 헤더 확인 (프록시/로드밸런서 환경)
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        String forwardedPort = request.getHeader("X-Forwarded-Port");

        // 스키마 결정
        String scheme = forwardedProto != null ? forwardedProto : request.getScheme();

        // 호스트 결정
        String host = forwardedHost != null ? forwardedHost : request.getServerName();

        // 포트 결정
        int port;
        if (forwardedPort != null) {
            port = Integer.parseInt(forwardedPort);
        } else {
            port = request.getServerPort();
        }

        // URL 구성
        StringBuilder url = new StringBuilder();
        url.append(scheme).append("://").append(host);

        // 표준 포트가 아닌 경우만 포트 추가
        boolean isStandardPort = (scheme.equals("http") && port == 80) ||
                (scheme.equals("https") && port == 443);
        if (!isStandardPort) {
            url.append(":").append(port);
        }

        // Context Path 추가 (있는 경우)
        if (contextPath != null && !contextPath.isEmpty()) {
            url.append(contextPath);
        }

        return url.toString();
    }

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     * 
     * @param bytes 바이트 크기
     * @return 포맷된 문자열
     */
    private String formatFileSize(long bytes) {
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024)
            return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}