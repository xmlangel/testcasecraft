// src/main/java/com/testcase/testcasemanagement/controller/ConfigController.java
package com.testcase.testcasemanagement.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 프론트엔드 설정 정보를 제공하는 컨트롤러
 * 런타임 환경변수를 프론트엔드에 전달
 */
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
     * @return 설정 정보 맵
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        
        // API 기본 URL 설정
        config.put("apiBaseUrl", apiBaseUrl);
        config.put("contextPath", contextPath);
        config.put("environment", activeProfile);
        
        // 추가 설정 정보
        config.put("version", "1.0.0");
        config.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(config);
    }

    /**
     * API 기본 URL만 반환 (간단한 형태)
     * @return API 기본 URL
     */
    @GetMapping("/api-url")
    public ResponseEntity<Map<String, String>> getApiUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("apiUrl", apiBaseUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * 환경 정보 반환
     * @return 환경 정보
     */
    @GetMapping("/environment")
    public ResponseEntity<Map<String, String>> getEnvironment() {
        Map<String, String> env = new HashMap<>();
        env.put("profile", activeProfile);
        env.put("apiBaseUrl", apiBaseUrl);
        
        // 환경변수에서 직접 읽기
        String reactApiUrl = System.getenv("REACT_APP_API_BASE_URL");
        if (reactApiUrl != null) {
            env.put("reactAppApiBaseUrl", reactApiUrl);
        }
        
        return ResponseEntity.ok(env);
    }

    /**
     * 파일 업로드 제한 정보 반환
     * @return 파일 업로드 제한 정보
     */
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
        limits.put("allowedExtensions", new String[]{".xml"});
        limits.put("description", "JUnit XML 파일 업로드 제한");
        
        return ResponseEntity.ok(limits);
    }

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     * @param bytes 바이트 크기
     * @return 포맷된 문자열
     */
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}