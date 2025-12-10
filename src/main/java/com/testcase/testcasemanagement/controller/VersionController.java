package com.testcase.testcasemanagement.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.VersionDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.info.BuildProperties;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.InputStream;
import java.time.Duration;

/**
 * 애플리케이션 버전 정보 API 컨트롤러
 * Backend, Frontend, RAG Service의 버전 정보를 제공
 * 
 * 버전 정보 소스:
 * - Backend: build.gradle의 version (BuildProperties를 통해 자동 주입)
 * - Frontend: package.json의 version (빌드 시점에 복사된 파일에서 읽음)
 * - RAG Service: /health 엔드포인트에서 실시간 조회
 */
@Slf4j
@RestController
@RequestMapping("/api/version")
@Tag(name = "System - Version", description = "시스템 버전 정보 API")
public class VersionController {

    private final BuildProperties buildProperties;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String ragApiUrl;

    public VersionController(
            BuildProperties buildProperties,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @org.springframework.beans.factory.annotation.Value("${rag.api.url:http://localhost:8001}") String ragApiUrl) {
        this.buildProperties = buildProperties;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.ragApiUrl = ragApiUrl;
    }

    /**
     * 전체 애플리케이션 버전 정보 조회
     * GET /api/version
     *
     * @return 버전 정보 DTO (Backend, Frontend, RAG Service)
     */
    @Operation(summary = "전체 애플리케이션 버전 정보 조회", description = "Backend, Frontend, RAG Service의 버전 정보를 조회합니다.")
    @GetMapping
    public ResponseEntity<VersionDto> getVersionInfo() {
        log.debug("버전 정보 조회 요청");

        // Backend 버전: BuildProperties에서 자동으로 가져옴 (build.gradle의 version)
        String backendVersion = buildProperties.getVersion();

        // Frontend 버전: package.json에서 읽어옴 (빌드 시점에 복사된 파일)
        String frontendVersion = readFrontendVersion();

        // RAG Service 버전 조회 (비동기, 타임아웃 3초)
        String ragVersion = fetchRagServiceVersion();

        VersionDto versionDto = VersionDto.builder()
                .backendVersion(backendVersion)
                .frontendVersion(frontendVersion)
                .ragServiceVersion(ragVersion)
                .build();

        log.debug("버전 정보 응답: {}", versionDto);
        return ResponseEntity.ok(versionDto);
    }

    /**
     * Frontend 버전 정보 읽기
     * package.json 파일에서 version 필드를 추출
     *
     * @return Frontend 버전 (읽기 실패 시 "N/A")
     */
    private String readFrontendVersion() {
        try {
            ClassPathResource resource = new ClassPathResource("static/package.json");
            if (!resource.exists()) {
                log.warn("package.json 파일을 찾을 수 없습니다. 기본값 사용");
                return "N/A";
            }

            try (InputStream inputStream = resource.getInputStream()) {
                JsonNode jsonNode = objectMapper.readTree(inputStream);
                String version = jsonNode.get("version").asText();
                log.debug("Frontend 버전: {}", version);
                return version;
            }
        } catch (Exception e) {
            log.warn("Frontend 버전 읽기 실패: {}", e.getMessage());
            return "N/A";
        }
    }

    /**
     * RAG Service 버전 정보 조회
     * RAG Service의 /health 엔드포인트에서 버전 정보를 가져옴
     *
     * @return RAG Service 버전 (조회 실패 시 "N/A")
     */
    private String fetchRagServiceVersion() {
        try {
            String healthUrl = ragApiUrl + "/health";
            log.debug("RAG Service 버전 조회: {}", healthUrl);

            // WebClient로 RAG Service health 엔드포인트 호출
            String version = webClient.get()
                    .uri(healthUrl)
                    .retrieve()
                    .bodyToMono(RagHealthResponse.class)
                    .timeout(Duration.ofSeconds(3))
                    .map(RagHealthResponse::getVersion)
                    .onErrorResume(e -> {
                        log.warn("RAG Service 버전 조회 실패: {}", e.getMessage());
                        return Mono.just("N/A");
                    })
                    .block();

            log.debug("RAG Service 버전: {}", version);
            return version != null ? version : "N/A";

        } catch (Exception e) {
            log.warn("RAG Service 버전 조회 중 예외 발생: {}", e.getMessage());
            return "N/A";
        }
    }

    /**
     * RAG Service Health Response DTO
     * FastAPI의 /health 엔드포인트 응답 매핑
     */
    @lombok.Data
    private static class RagHealthResponse {
        private String status;
        private String service;
        private String version;
    }
}
