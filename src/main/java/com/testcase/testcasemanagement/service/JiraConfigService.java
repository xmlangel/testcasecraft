// src/main/java/com/testcase/testcasemanagement/service/JiraConfigService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.JiraConfig;
import com.testcase.testcasemanagement.repository.JiraConfigRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JiraConfigService {
    
    private final JiraConfigRepository jiraConfigRepository;
    private final EncryptionUtil encryptionUtil;
    private final JiraApiService jiraApiService;
    
    @PostConstruct
    public void init() {
        // 암호화 상태 확인
        if (!encryptionUtil.isEncryptionKeyConfigured()) {
            log.warn("암호화 키가 설정되지 않았습니다. jira.security.encryption.key 환경변수를 확인하세요.");
        }
        log.info("JIRA 설정 서비스 초기화 완료 - 암호화: {}", encryptionUtil.isEncryptionEnabled());
    }
    
    /**
     * 사용자의 활성화된 JIRA 설정 조회
     */
    public Optional<JiraConfigDto> getActiveConfigByUserId(String userId) {
        return jiraConfigRepository.findByUserIdAndIsActiveTrue(userId)
            .map(this::convertToDto);
    }
    
    /**
     * 사용자의 모든 JIRA 설정 조회
     */
    public List<JiraConfigDto> getAllConfigsByUserId(String userId) {
        return jiraConfigRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * JIRA 설정 생성 또는 업데이트
     */
    @Transactional
    public JiraConfigDto saveOrUpdateConfig(String userId, JiraConfigDto configDto) {
        try {
            // 기존 활성화된 설정이 있으면 비활성화
            jiraConfigRepository.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(existingConfig -> {
                    existingConfig.setIsActive(false);
                    jiraConfigRepository.save(existingConfig);
                    log.info("기존 JIRA 설정 비활성화: userId={}, configId={}", userId, existingConfig.getId());
                });
            
            // 새로운 설정 생성
            JiraConfig config = new JiraConfig();
            config.setUserId(userId);
            config.setServerUrl(configDto.getServerUrl());
            config.setUsername(configDto.getUsername());
            config.setEncryptedApiToken(encryptionUtil.encrypt(configDto.getApiToken()));
            config.setTestProjectKey(configDto.getTestProjectKey()); // 테스트 프로젝트 키 설정
            config.setIsActive(true);
            config.setConnectionVerified(false);
            
            JiraConfig savedConfig = jiraConfigRepository.save(config);
            log.info("새 JIRA 설정 저장: userId={}, configId={}", userId, savedConfig.getId());
            
            return convertToDto(savedConfig);
            
        } catch (Exception e) {
            log.error("JIRA 설정 저장 실패: userId={}", userId, e);
            throw new RuntimeException("JIRA 설정 저장 실패", e);
        }
    }
    
    /**
     * 사용자의 JIRA 설정 수정
     */
    @Transactional
    public JiraConfigDto updateConfig(String userId, String configId, JiraConfigDto configDto) {
        try {
            // 기존 설정 조회 및 소유권 확인
            Optional<JiraConfig> configOpt = jiraConfigRepository.findById(configId);
            
            if (configOpt.isEmpty()) {
                log.warn("수정할 JIRA 설정을 찾을 수 없음: configId={}", configId);
                return null;
            }
            
            JiraConfig existingConfig = configOpt.get();
            
            // 소유권 확인
            if (!existingConfig.getUserId().equals(userId)) {
                log.warn("JIRA 설정 수정 권한 없음: userId={}, configId={}, owner={}", 
                    userId, configId, existingConfig.getUserId());
                return null;
            }
            
            // 새로운 API 토큰이 제공된 경우만 암호화하여 업데이트
            if (configDto.getApiToken() != null && !configDto.getApiToken().trim().isEmpty()) {
                existingConfig.setEncryptedApiToken(encryptionUtil.encrypt(configDto.getApiToken()));
            }
            
            // 기타 필드 업데이트
            existingConfig.setServerUrl(configDto.getServerUrl().trim());
            existingConfig.setUsername(configDto.getUsername().trim());
            existingConfig.setTestProjectKey(configDto.getTestProjectKey()); // 테스트 프로젝트 키 업데이트
            
            // 설정이 변경되면 연결 검증 상태 초기화
            existingConfig.setConnectionVerified(false);
            existingConfig.setLastConnectionTest(null);
            existingConfig.setLastConnectionError(null);
            
            JiraConfig savedConfig = jiraConfigRepository.save(existingConfig);
            
            log.info("JIRA 설정 수정 성공: userId={}, configId={}", userId, configId);
            return convertToDto(savedConfig);
            
        } catch (Exception e) {
            log.error("JIRA 설정 수정 실패: userId={}, configId={}", userId, configId, e);
            throw new RuntimeException("JIRA 설정 수정 실패", e);
        }
    }
    
    /**
     * JIRA 연결 테스트 및 설정 업데이트
     */
    @Transactional
    public JiraConfigDto.ConnectionStatusDto testAndUpdateConnection(String userId, JiraConfigDto.TestConnectionDto testConfig) {
        try {
            // jiraApiService null 체크
            if (jiraApiService == null) {
                log.error("JiraApiService가 주입되지 않았습니다.");
                return JiraConfigDto.ConnectionStatusDto.builder()
                    .isConnected(false)
                    .status("ERROR")
                    .message("JIRA API 서비스가 초기화되지 않았습니다.")
                    .lastTested(LocalDateTime.now())
                    .build();
            }
            
            // 연결 테스트 수행
            JiraConfigDto.ConnectionStatusDto status = jiraApiService.testConnection(testConfig);
            
            // 결과 null 체크
            if (status == null) {
                log.error("JiraApiService.testConnection이 null을 반환했습니다.");
                return JiraConfigDto.ConnectionStatusDto.builder()
                    .isConnected(false)
                    .status("ERROR")
                    .message("연결 테스트 결과를 받을 수 없습니다.")
                    .lastTested(LocalDateTime.now())
                    .build();
            }
            
            // 사용자의 활성화된 설정 업데이트 (설정이 있는 경우)
            Optional<JiraConfig> configOpt = jiraConfigRepository.findByUserIdAndIsActiveTrue(userId);
            if (configOpt.isPresent()) {
                JiraConfig config = configOpt.get();
                
                if (status.getIsConnected()) {
                    config.markConnectionSuccess();
                } else {
                    config.markConnectionFailure(status.getMessage());
                }
                
                jiraConfigRepository.save(config);
                log.info("JIRA 설정 연결 상태 업데이트: userId={}, success={}", userId, status.getIsConnected());
            }
            
            return status;
            
        } catch (Exception e) {
            log.error("JIRA 연결 테스트 실패: userId={}", userId, e);
            return JiraConfigDto.ConnectionStatusDto.builder()
                .isConnected(false)
                .status("ERROR")
                .message("연결 테스트 중 오류 발생: " + e.getMessage())
                .lastTested(LocalDateTime.now())
                .build();
        }
    }
    
    /**
     * 사용자의 JIRA 설정 삭제
     */
    @Transactional
    public boolean deleteConfig(String userId, String configId) {
        try {
            Optional<JiraConfig> configOpt = jiraConfigRepository.findById(configId);
            
            if (configOpt.isPresent()) {
                JiraConfig config = configOpt.get();
                
                // 권한 확인 - 본인의 설정만 삭제 가능
                if (!config.getUserId().equals(userId)) {
                    log.warn("JIRA 설정 삭제 권한 없음: userId={}, configId={}", userId, configId);
                    return false;
                }
                
                jiraConfigRepository.delete(config);
                log.info("JIRA 설정 삭제 완료: userId={}, configId={}", userId, configId);
                return true;
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("JIRA 설정 삭제 실패: userId={}, configId={}", userId, configId, e);
            return false;
        }
    }
    
    /**
     * JIRA 프로젝트 목록 조회
     */
    public List<JiraConfigDto.JiraProjectDto> getJiraProjects(String userId) {
        try {
            Optional<JiraConfig> configOpt = jiraConfigRepository.findByUserIdAndIsActiveTrue(userId);
            
            if (configOpt.isEmpty()) {
                log.warn("활성화된 JIRA 설정 없음: userId={}", userId);
                return List.of();
            }
            
            JiraConfig config = configOpt.get();
            String decryptedApiToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
            
            return jiraApiService.getProjects(
                config.getServerUrl(),
                config.getUsername(),
                decryptedApiToken
            );
            
        } catch (Exception e) {
            log.error("JIRA 프로젝트 목록 조회 실패: userId={}", userId, e);
            return List.of();
        }
    }
    
    /**
     * JIRA 이슈에 코멘트 추가 (테스트 결과 연동용)
     */
    public boolean addTestResultComment(String userId, String issueKey, String comment) {
        try {
            Optional<JiraConfig> configOpt = jiraConfigRepository.findByUserIdAndIsActiveTrue(userId);
            
            if (configOpt.isEmpty()) {
                log.warn("활성화된 JIRA 설정 없음: userId={}", userId);
                return false;
            }
            
            JiraConfig config = configOpt.get();
            
            // 연결 상태 확인
            if (!config.isConnectionHealthy()) {
                log.warn("JIRA 연결 상태 불량: userId={}, configId={}", userId, config.getId());
                return false;
            }
            
            String decryptedApiToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
            
            boolean success = jiraApiService.addCommentToIssue(
                config.getServerUrl(),
                config.getUsername(),
                decryptedApiToken,
                issueKey,
                comment
            );
            
            if (success) {
                log.info("JIRA 코멘트 추가 성공: userId={}, issueKey={}", userId, issueKey);
            } else {
                log.warn("JIRA 코멘트 추가 실패: userId={}, issueKey={}", userId, issueKey);
                
                // 실패 시 연결 상태 재확인
                config.markConnectionFailure("코멘트 추가 실패");
                jiraConfigRepository.save(config);
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("JIRA 코멘트 추가 중 오류: userId={}, issueKey={}", userId, issueKey, e);
            return false;
        }
    }
    
    /**
     * JIRA 이슈 검색 (JQL 사용)
     * ICT-177: 테스트 결과 입력 JIRA 이슈 검색 기능 구현
     */
    public List<Object> searchIssues(String userId, String query, int maxResults) {
        try {
            Optional<JiraConfig> configOpt = jiraConfigRepository.findByUserIdAndIsActiveTrue(userId);
            
            if (configOpt.isEmpty()) {
                log.warn("활성화된 JIRA 설정 없음: userId={}", userId);
                return List.of();
            }
            
            JiraConfig config = configOpt.get();
            
            // 연결 상태 확인
            if (!config.isConnectionHealthy()) {
                log.warn("JIRA 연결 상태 불량: userId={}, configId={}", userId, config.getId());
                return List.of();
            }
            
            String decryptedApiToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
            
            // JQL 변환 - 간단한 텍스트 검색을 JQL로 변환
            String jql = buildJqlFromQuery(query, config.getTestProjectKey());
            
            List<com.fasterxml.jackson.databind.JsonNode> jsonNodes = jiraApiService.searchIssues(
                config.getServerUrl(),
                config.getUsername(),
                decryptedApiToken,
                jql,
                maxResults
            );
            
            // JsonNode를 Map으로 변환하여 반환
            List<Object> issues = jsonNodes.stream()
                .map(this::convertJsonNodeToMap)
                .collect(Collectors.toList());
            
            log.info("JIRA 이슈 검색 성공: userId={}, query={}, results={}", userId, query, issues.size());
            return issues;
            
        } catch (Exception e) {
            log.error("JIRA 이슈 검색 중 오류: userId={}, query={}", userId, query, e);
            return List.of();
        }
    }
    
    /**
     * 연결 상태가 오래된 설정들을 정리하는 배치 작업
     */
    @Transactional
    public void refreshStaleConnections() {
        try {
            LocalDateTime threshold = LocalDateTime.now().minusHours(24);
            List<JiraConfig> staleConfigs = jiraConfigRepository.findConfigsNeedingConnectionTest(threshold);
            
            log.info("연결 상태 갱신 대상 설정 수: {}", staleConfigs.size());
            
            for (JiraConfig config : staleConfigs) {
                try {
                    String decryptedApiToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
                    
                    JiraConfigDto.TestConnectionDto testConfig = JiraConfigDto.TestConnectionDto.builder()
                        .serverUrl(config.getServerUrl())
                        .username(config.getUsername())
                        .apiToken(decryptedApiToken)
                        .build();
                    
                    JiraConfigDto.ConnectionStatusDto status = jiraApiService.testConnection(testConfig);
                    
                    if (status.getIsConnected()) {
                        config.markConnectionSuccess();
                    } else {
                        config.markConnectionFailure(status.getMessage());
                    }
                    
                    jiraConfigRepository.save(config);
                    
                } catch (Exception e) {
                    log.warn("개별 설정 연결 테스트 실패: configId={}", config.getId(), e);
                    config.markConnectionFailure("배치 테스트 실패: " + e.getMessage());
                    jiraConfigRepository.save(config);
                }
            }
            
        } catch (Exception e) {
            log.error("연결 상태 갱신 배치 작업 실패", e);
        }
    }
    
    /**
     * JIRA 설정 활성화/비활성화
     */
    @Transactional
    public boolean activateConfig(String userId, String configId) {
        try {
            // 설정 조회 및 권한 확인
            Optional<JiraConfig> configOpt = jiraConfigRepository.findById(configId);
            
            if (configOpt.isEmpty()) {
                log.warn("활성화할 JIRA 설정을 찾을 수 없음: configId={}", configId);
                return false;
            }
            
            JiraConfig config = configOpt.get();
            
            // 권한 확인
            if (!config.getUserId().equals(userId)) {
                log.warn("JIRA 설정 활성화 권한 없음: userId={}, configId={}", userId, configId);
                return false;
            }
            
            // 기존 활성화된 설정 비활성화
            jiraConfigRepository.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(existingConfig -> {
                    existingConfig.setIsActive(false);
                    jiraConfigRepository.save(existingConfig);
                    log.info("기존 JIRA 설정 비활성화: userId={}, configId={}", userId, existingConfig.getId());
                });
            
            // 해당 설정 활성화
            config.setIsActive(true);
            config.setUpdatedAt(LocalDateTime.now());
            jiraConfigRepository.save(config);
            
            log.info("JIRA 설정 활성화 완료: userId={}, configId={}", userId, configId);
            return true;
            
        } catch (Exception e) {
            log.error("JIRA 설정 활성화 실패: userId={}, configId={}", userId, configId, e);
            return false;
        }
    }
    
    // Helper methods
    
    /**
     * 간단한 텍스트 쿼리를 JQL로 변환
     */
    private String buildJqlFromQuery(String query, String projectKey) {
        if (query == null || query.trim().isEmpty()) {
            // 빈 쿼리인 경우 최근 이슈들을 기본으로 반환
            return "created >= -30d ORDER BY created DESC";
        }
        
        String trimmedQuery = query.trim();
        
        // 이미 JQL인 경우 그대로 사용
        if (trimmedQuery.toLowerCase().contains("project") || 
            trimmedQuery.toLowerCase().contains("and") ||
            trimmedQuery.toLowerCase().contains("order by")) {
            return trimmedQuery;
        }
        
        // 이슈 키 패턴인지 확인
        if (trimmedQuery.matches("^[A-Z]+-\\d+$")) {
            return "key = \"" + trimmedQuery + "\"";
        }
        
        // 일반 텍스트 검색 - summary와 description에서 검색
        StringBuilder jql = new StringBuilder();
        
        // 프로젝트 키가 있으면 해당 프로젝트로 제한
        if (projectKey != null && !projectKey.trim().isEmpty()) {
            jql.append("project = \"").append(projectKey).append("\" AND ");
        }
        
        // 텍스트 검색
        jql.append("(summary ~ \"").append(trimmedQuery.replace("\"", "\\\"")).append("\"");
        jql.append(" OR description ~ \"").append(trimmedQuery.replace("\"", "\\\"")).append("\")");
        jql.append(" ORDER BY created DESC");
        
        return jql.toString();
    }
    
    /**
     * JsonNode를 Map으로 변환 (프론트엔드 호환성)
     */
    private Object convertJsonNodeToMap(com.fasterxml.jackson.databind.JsonNode jsonNode) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.convertValue(jsonNode, java.util.Map.class);
        } catch (Exception e) {
            log.warn("JsonNode를 Map으로 변환 실패", e);
            return java.util.Map.of(
                "key", jsonNode.path("key").asText(""),
                "summary", jsonNode.path("fields").path("summary").asText(""),
                "error", "변환 실패"
            );
        }
    }
    
    private JiraConfigDto convertToDto(JiraConfig config) {
        // API 토큰 복호화 (마스킹된 형태로 제공)
        String maskedApiToken = null;
        if (config.getEncryptedApiToken() != null) {
            try {
                String decryptedToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
                // 보안을 위해 마스킹 처리 (앞 4자리만 표시)
                if (decryptedToken.length() > 4) {
                    maskedApiToken = decryptedToken.substring(0, 4) + "****" + 
                                   "*".repeat(Math.max(0, decryptedToken.length() - 8)) +
                                   (decryptedToken.length() > 8 ? decryptedToken.substring(decryptedToken.length() - 4) : "");
                } else {
                    maskedApiToken = "****";
                }
            } catch (Exception e) {
                log.warn("API 토큰 복호화 실패: configId={}", config.getId(), e);
                maskedApiToken = "****";
            }
        }
        
        return JiraConfigDto.builder()
            .id(config.getId())
            .userId(config.getUserId())
            .serverUrl(config.getServerUrl())
            .username(config.getUsername())
            .apiToken(maskedApiToken)  // 마스킹된 API 토큰 추가
            .testProjectKey(config.getTestProjectKey()) // 테스트 프로젝트 키 추가
            .isActive(config.getIsActive())
            .connectionVerified(config.getConnectionVerified())
            .lastConnectionTest(config.getLastConnectionTest())
            .lastConnectionError(config.getLastConnectionError())
            .createdAt(config.getCreatedAt())
            .updatedAt(config.getUpdatedAt())
            .build();
    }
}