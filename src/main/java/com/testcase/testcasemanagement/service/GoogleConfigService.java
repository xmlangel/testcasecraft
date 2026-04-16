// src/main/java/com/testcase/testcasemanagement/service/GoogleConfigService.java
package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.GoogleConfig;
import com.testcase.testcasemanagement.repository.GoogleConfigRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    log.info("Google 설정 조회 시도: identifier={}", usernameOrId);

    // 1. UUID로 직접 조회 시도
    Optional<GoogleConfig> config = googleConfigRepository.findByUserId(usernameOrId);
    if (config.isPresent()) {
      log.info("UUID로 설정 조회 성공: userId={}", usernameOrId);
      return config;
    }

    // 2. username으로 간주하고 실제 UUID 조회
    return userRepository
        .findByUsername(usernameOrId)
        .flatMap(
            user -> {
              log.info("사용자명({})을 UUID({})로 변환하여 재조회", usernameOrId, user.getId());
              return googleConfigRepository.findByUserId(user.getId());
            });
  }

  @Transactional
  public GoogleConfig saveConfig(String usernameOrId, String jsonKeyContent) throws Exception {
    if (jsonKeyContent == null || jsonKeyContent.trim().isEmpty()) {
      throw new IllegalArgumentException("JSON 키 내용은 필수입니다.");
    }

    // 실제 고유 식별자(UUID) 결정
    String actualUserId = usernameOrId;
    if (usernameOrId.length() < 36) {
      actualUserId =
          userRepository
              .findByUsername(usernameOrId)
              .map(com.testcase.testcasemanagement.model.User::getId)
              .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + usernameOrId));
      log.info("저장 시 사용자명({})을 UUID({})로 매핑하여 진행", usernameOrId, actualUserId);
    }

    // 앞뒤 공백 및 줄바꿈 제거
    String trimmedJson = jsonKeyContent.trim();

    // 1. JSON 유효성 검사 및 정보 추출
    JsonNode root;
    try {
      root = objectMapper.readTree(trimmedJson);
      if (!root.has("client_email") || !root.has("project_id") || !root.has("private_key")) {
        throw new IllegalArgumentException(
            "올바른 Google 서비스 계정 JSON 형식이 아닙니다. 필수 필드(client_email, project_id, private_key)가"
                + " 누락되었습니다.");
      }
    } catch (com.fasterxml.jackson.core.JsonParseException e) {
      throw new IllegalArgumentException(
          "JSON 문법 오류: 파일 내용이 올바른 JSON 형식이 아닙니다. (복사가 잘못되었을 수 있습니다)");
    } catch (Exception e) {
      throw new IllegalArgumentException("JSON 파싱 오류: " + e.getMessage());
    }

    String clientEmail = root.get("client_email").asText();
    String projectId = root.get("project_id").asText();

    // 2. 암호화 (원본이 아닌 정리된 JSON 저장)
    String encryptedKey = encryptionUtil.encrypt(trimmedJson);

    // 3. 기존 설정 확인 및 업데이트 또는 생성
    GoogleConfig config =
        googleConfigRepository.findByUserId(actualUserId).orElse(new GoogleConfig());

    config.setUserId(actualUserId);
    config.setClientEmail(clientEmail);
    config.setProjectId(projectId);
    config.setEncryptedJsonKey(encryptedKey);
    config.setIsActive(true);

    return googleConfigRepository.save(config);
  }

  @Transactional
  public void deleteConfig(String usernameOrId) {
    String actualUserId = usernameOrId;
    if (usernameOrId.length() < 36) {
      actualUserId =
          userRepository
              .findByUsername(usernameOrId)
              .map(com.testcase.testcasemanagement.model.User::getId)
              .orElse(usernameOrId);
    }
    googleConfigRepository.deleteByUserId(actualUserId);
  }

  public String getDecryptedKey(GoogleConfig config) throws Exception {
    return encryptionUtil.decrypt(config.getEncryptedJsonKey());
  }
}
