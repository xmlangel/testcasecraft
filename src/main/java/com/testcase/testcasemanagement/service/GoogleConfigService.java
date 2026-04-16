// src/main/java/com/testcase/testcasemanagement/service/GoogleConfigService.java
package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.GoogleConfig;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.GoogleConfigRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleConfigService {
  private final GoogleConfigRepository googleConfigRepository;
  private final UserRepository userRepository;
  private final EncryptionUtil encryptionUtil;
  private final ObjectMapper objectMapper;

  @Transactional(readOnly = true)
  public Optional<GoogleConfig> getConfigByUserId(String usernameOrId) {
    log.info("Google 설정 조회 요청: ID/Username='{}'", usernameOrId);

    return findUserByIdentifier(usernameOrId)
        .flatMap(user -> googleConfigRepository.findByUser(user));
  }

  @Transactional
  public GoogleConfig saveConfig(String usernameOrId, String jsonKeyContent) throws Exception {
    if (jsonKeyContent == null || jsonKeyContent.trim().isEmpty()) {
      throw new IllegalArgumentException("JSON 키 내용은 필수입니다.");
    }

    // 1. 사용자 확보
    User user =
        findUserByIdentifier(usernameOrId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + usernameOrId));

    log.info("저장 프로세스 시작: User={}, ID={}", user.getUsername(), user.getId());

    // 2. 데이터 유효성 검사
    String trimmedJson = jsonKeyContent.trim();
    JsonNode root;
    try {
      root = objectMapper.readTree(trimmedJson);
      if (!root.has("client_email") || !root.has("project_id") || !root.has("private_key")) {
        throw new IllegalArgumentException("올바른 Google 서비스 계정 형식이 아닙니다.");
      }
    } catch (Exception e) {
      throw new IllegalArgumentException("지원되지 않는 JSON 형식입니다: " + e.getMessage());
    }

    String clientEmail = root.get("client_email").asText();
    String projectId = root.get("project_id").asText();
    String encryptedKey = encryptionUtil.encrypt(trimmedJson);

    // 3. 기존 데이터 존재 여부 확인 및 병합
    GoogleConfig config =
        googleConfigRepository
            .findByUser(user)
            .orElseGet(
                () -> {
                  log.info("신규 설정을 생성합니다.");
                  GoogleConfig newConfig = new GoogleConfig();
                  newConfig.setUser(user);
                  return newConfig;
                });

    config.setClientEmail(clientEmail);
    config.setProjectId(projectId);
    config.setEncryptedJsonKey(encryptedKey);
    config.setIsActive(true);

    return googleConfigRepository.save(config);
  }

  @Transactional
  public void deleteConfig(String usernameOrId) {
    findUserByIdentifier(usernameOrId).ifPresent(googleConfigRepository::deleteByUser);
  }

  private Optional<User> findUserByIdentifier(String identifier) {
    if (identifier == null || identifier.trim().isEmpty()) return Optional.empty();

    String trimmedId = identifier.trim();

    // 1. 사용자명으로 조회 (대소문자 구분 없이 처리할 시스템일 경우 대비)
    Optional<User> userByUsername = userRepository.findByUsername(trimmedId);
    if (userByUsername.isPresent()) return userByUsername;

    // 2. ID(UUID) 형식인 경우 직접 조회
    if (trimmedId.length() >= 32) {
      return userRepository.findById(trimmedId);
    }

    return Optional.empty();
  }

  public String getDecryptedKey(GoogleConfig config) throws Exception {
    return encryptionUtil.decrypt(config.getEncryptedJsonKey());
  }

  @Transactional(readOnly = true)
  public Optional<GoogleConfig> getCurrentUserConfig() {
    try {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication != null
          && authentication.isAuthenticated()
          && !"anonymousUser".equals(authentication.getPrincipal())) {
        String username = authentication.getName();
        return getConfigByUserId(username);
      }
    } catch (Exception e) {
      log.warn("현재 사용자 정보를 가져오는데 실패했습니다: {}", e.getMessage());
    }
    // 최후의 수단으로 admin 유저 설정 시도 (백그라운드 작업 등 대비)
    return getConfigByUserId("admin");
  }

  @Transactional
  public void updateLastUsedSheet(
      String usernameOrId, String type, String spreadsheetId, String sheetName) {
    findUserByIdentifier(usernameOrId)
        .flatMap(googleConfigRepository::findByUser)
        .ifPresent(
            config -> {
              if ("import".equalsIgnoreCase(type)) {
                config.setLastImportSpreadsheetId(spreadsheetId);
                config.setLastImportSheetName(sheetName);
              } else if ("export".equalsIgnoreCase(type)) {
                config.setLastExportSpreadsheetId(spreadsheetId);
                config.setLastExportSheetName(sheetName);
              }
              googleConfigRepository.save(config);
              log.info(
                  "마지막 사용 Google Sheets 정보 업데이트 완료 ({}): userId={}, spreadsheetId={}, sheetName={}",
                  type,
                  usernameOrId,
                  spreadsheetId,
                  sheetName);
            });
  }
}
