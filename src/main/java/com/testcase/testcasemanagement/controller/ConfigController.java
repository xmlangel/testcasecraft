// src/main/java/com/testcase/testcasemanagement/controller/ConfigController.java
package com.testcase.testcasemanagement.controller;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${frontend.api.base-url:#{environment['REACT_APP_API_BASE_URL'] ?: 'http://localhost:8080'}}")
    private String apiBaseUrl;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${spring.profiles.active:development}")
    private String activeProfile;

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
}