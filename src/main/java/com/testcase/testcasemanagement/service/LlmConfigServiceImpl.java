// src/main/java/com/testcase/testcasemanagement/service/LlmConfigServiceImpl.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** LLM 설정 서비스 구현 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LlmConfigServiceImpl implements LlmConfigService {

  private final LlmConfigRepository llmConfigRepository;
  private final EncryptionUtil encryptionUtil;
  private final LlmClientFactory llmClientFactory;

  @PostConstruct
  public void init() {
    log.info("=== LLM 설정 서비스 초기화 ===");

    // 암호화 상태 확인
    if (!encryptionUtil.isEncryptionKeyConfigured()) {
      log.error("❌ LLM 암호화 키가 설정되지 않았습니다!");
      log.error("   환경변수 JIRA_ENCRYPTION_KEY를 설정해주세요.");
      log.error("   ⚠️  LLM 설정 저장이 불가능합니다!");
    } else {
      log.info("✅ LLM 암호화 키 설정 완료");
    }

    log.info("LLM 설정 서비스 초기화 완료");
    log.info("=====================================");
  }

  @Override
  public List<LlmConfigDTO> getAllActiveConfigs() {
    log.info("📋 모든 활성화된 LLM 설정 조회");
    return llmConfigRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  @Override
  public List<LlmConfigDTO> getActiveConfigsForUsers() {
    log.info("📋 일반 사용자용 활성 LLM 설정 조회 (기본값만)");
    return llmConfigRepository
        .findByIsDefaultTrueAndIsActiveTrue()
        .map(config -> Collections.singletonList(convertToDTO(config)))
        .orElse(Collections.emptyList());
  }

  @Override
  public List<LlmConfigDTO> getAllConfigs() {
    log.info("📋 모든 LLM 설정 조회 (활성화 여부 무관)");
    return llmConfigRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  @Override
  public Optional<LlmConfigDTO> getConfigById(String id) {
    log.info("🔍 LLM 설정 조회: id={}", id);
    return llmConfigRepository.findById(id).map(this::convertToDTO);
  }

  @Override
  public Optional<LlmConfigDTO> getDefaultConfig() {
    log.info("⭐ 기본 LLM 설정 조회");
    return llmConfigRepository.findByIsDefaultTrueAndIsActiveTrue().map(this::convertToDTO);
  }

  @Override
  public List<LlmConfigDTO> getConfigsByProvider(LlmProvider provider) {
    log.info("📋 제공자별 LLM 설정 조회: provider={}", provider);
    return llmConfigRepository.findByProviderAndIsActiveTrueOrderByCreatedAtDesc(provider).stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public LlmConfigDTO createConfig(LlmConfigDTO configDTO) {
    log.info("➕ LLM 설정 생성 시작: name={}", configDTO.getName());

    // 입력 데이터 검증
    validateConfigDTO(configDTO);

    // 이름 중복 체크
    if (llmConfigRepository.existsByName(configDTO.getName())) {
      throw new IllegalArgumentException("이미 존재하는 설정 이름입니다: " + configDTO.getName());
    }

    // 암호화 키 확인
    if (!encryptionUtil.isEncryptionKeyConfigured()) {
      throw new RuntimeException("암호화 키가 설정되지 않았습니다. 관리자에게 문의하세요.");
    }

    // Entity 생성
    LlmConfig config = new LlmConfig();
    config.setName(configDTO.getName());
    config.setProvider(configDTO.getProvider());

    String normalizedApiUrl = normalizeApiUrl(configDTO.getProvider(), configDTO.getApiUrl());
    if (normalizedApiUrl == null || normalizedApiUrl.isEmpty()) {
      throw new IllegalArgumentException("API URL이 필요합니다");
    }
    config.setApiUrl(normalizedApiUrl);
    config.setModelName(configDTO.getModelName());
    config.setIsDefault(configDTO.getIsDefault() != null ? configDTO.getIsDefault() : false);
    config.setIsActive(true);

    // 테스트 케이스 템플릿 설정 (없으면 기본값 사용)
    config.setTestCaseTemplate(
        configDTO.getTestCaseTemplate() != null && !configDTO.getTestCaseTemplate().isEmpty()
            ? configDTO.getTestCaseTemplate()
            : LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE);

    // API Key 암호화
    try {
      String encryptedApiKey = encryptionUtil.encrypt(configDTO.getApiKey());
      config.setEncryptedApiKey(encryptedApiKey);
    } catch (Exception e) {
      log.error("❌ API Key 암호화 실패", e);
      throw new RuntimeException("API Key 암호화 실패: " + e.getMessage());
    }

    // 기본 설정으로 지정 시 다른 설정들의 기본 플래그 제거
    if (config.getIsDefault()) {
      llmConfigRepository.clearDefaultFlag();
    }

    // 저장
    LlmConfig savedConfig = llmConfigRepository.save(config);
    log.info("✅ LLM 설정 생성 완료: id={}, name={}", savedConfig.getId(), savedConfig.getName());

    return convertToDTO(savedConfig);
  }

  @Override
  @Transactional
  public LlmConfigDTO updateConfig(String id, LlmConfigDTO configDTO) {
    log.info("✏️ LLM 설정 수정 시작: id={}", id);

    LlmConfig config =
        llmConfigRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + id));

    // 이름 중복 체크 (자신 제외)
    if (configDTO.getName() != null && !configDTO.getName().equals(config.getName())) {
      if (llmConfigRepository.existsByNameAndIdNot(configDTO.getName(), id)) {
        throw new IllegalArgumentException("이미 존재하는 설정 이름입니다: " + configDTO.getName());
      }
      config.setName(configDTO.getName());
    }

    // 필드 업데이트
    if (configDTO.getProvider() != null) {
      config.setProvider(configDTO.getProvider());
    }
    if (configDTO.getApiUrl() != null) {
      LlmProvider targetProvider =
          configDTO.getProvider() != null ? configDTO.getProvider() : config.getProvider();
      String normalizedApiUrl = normalizeApiUrl(targetProvider, configDTO.getApiUrl());
      if (normalizedApiUrl == null || normalizedApiUrl.isEmpty()) {
        throw new IllegalArgumentException("API URL이 필요합니다");
      }
      config.setApiUrl(normalizedApiUrl);
    }
    if (configDTO.getModelName() != null) {
      config.setModelName(configDTO.getModelName());
    }

    // 테스트 케이스 템플릿 업데이트
    if (configDTO.getTestCaseTemplate() != null) {
      config.setTestCaseTemplate(configDTO.getTestCaseTemplate());
    } else if (config.getTestCaseTemplate() == null || config.getTestCaseTemplate().isEmpty()) {
      // 기존 설정에 템플릿이 없으면 기본 템플릿 자동 적용
      log.info("📋 기존 LLM 설정에 기본 템플릿 자동 적용: id={}", id);
      config.setTestCaseTemplate(LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE);
    }

    // API Key 업데이트 (제공된 경우에만)
    if (configDTO.getApiKey() != null && !configDTO.getApiKey().trim().isEmpty()) {
      try {
        String encryptedApiKey = encryptionUtil.encrypt(configDTO.getApiKey());
        config.setEncryptedApiKey(encryptedApiKey);
      } catch (Exception e) {
        log.error("❌ API Key 암호화 실패", e);
        throw new RuntimeException("API Key 암호화 실패: " + e.getMessage());
      }
    }

    // 기본 설정으로 지정 시 다른 설정들의 기본 플래그 제거
    if (configDTO.getIsDefault() != null && configDTO.getIsDefault() && !config.getIsDefault()) {
      llmConfigRepository.clearDefaultFlag();
      config.setIsDefault(true);
    }

    LlmConfig updatedConfig = llmConfigRepository.save(config);
    log.info("✅ LLM 설정 수정 완료: id={}", id);

    return convertToDTO(updatedConfig);
  }

  @Override
  @Transactional
  public void deleteConfig(String id) {
    log.info("🗑️ LLM 설정 삭제 시작: id={}", id);

    LlmConfig config =
        llmConfigRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + id));

    // 기본 설정이면서 유일한 설정인 경우 삭제 불가
    if (config.getIsDefault()) {
      long activeCount = llmConfigRepository.countByIsActiveTrue();
      if (activeCount <= 1) {
        throw new IllegalStateException("기본 설정이면서 유일한 설정은 삭제할 수 없습니다.");
      }
    }

    llmConfigRepository.delete(config);
    log.info("✅ LLM 설정 삭제 완료: id={}", id);
  }

  @Override
  @Transactional
  public LlmConfigDTO setDefaultConfig(String id) {
    log.info("⭐ 기본 설정 지정: id={}", id);

    LlmConfig config =
        llmConfigRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + id));

    if (!config.getIsActive()) {
      throw new IllegalStateException("비활성 설정은 기본 설정으로 지정할 수 없습니다.");
    }

    // 다른 설정들의 기본 플래그 제거
    llmConfigRepository.clearDefaultFlag();
    config.setIsDefault(true);

    LlmConfig updatedConfig = llmConfigRepository.save(config);
    log.info("✅ 기본 설정 지정 완료: id={}", id);

    return convertToDTO(updatedConfig);
  }

  @Override
  @Transactional
  public LlmConfigDTO testConnection(String id) {
    log.info("🔌 연결 테스트 시작: id={}", id);

    LlmConfig config =
        llmConfigRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + id));

    try {
      // 간단한 테스트 요청 (모델 목록 조회 또는 간단한 질의)
      testLlmConnection(config);

      // 연결 성공 처리
      config.markConnectionSuccess();
      llmConfigRepository.save(config);

      log.info("✅ 연결 테스트 성공: id={}", id);
    } catch (Exception e) {
      log.error("❌ 연결 테스트 실패: id={}", id, e);
      config.markConnectionFailure(e.getMessage());
      llmConfigRepository.save(config);
      throw new RuntimeException("연결 테스트 실패: " + e.getMessage());
    }

    return convertToDTO(config);
  }

  @Override
  public void testUnsavedSettings(LlmConfigDTO configDTO) {
    log.info("🔌 저장하지 않고 설정 테스트 시작: name={}", configDTO.getName());

    // 입력 데이터 검증
    validateConfigDTO(configDTO);

    // 암호화 키 확인
    if (!encryptionUtil.isEncryptionKeyConfigured()) {
      throw new RuntimeException("암호화 키가 설정되지 않았습니다. 관리자에게 문의하세요.");
    }

    // 임시 LlmConfig 객체 생성 (DB에 저장하지 않음)
    LlmConfig tempConfig = new LlmConfig();
    tempConfig.setProvider(configDTO.getProvider());

    String normalizedApiUrl = normalizeApiUrl(configDTO.getProvider(), configDTO.getApiUrl());
    if (normalizedApiUrl == null || normalizedApiUrl.isEmpty()) {
      throw new IllegalArgumentException("유효한 API URL이 필요합니다");
    }
    tempConfig.setApiUrl(normalizedApiUrl);
    tempConfig.setModelName(configDTO.getModelName());

    // API Key 암호화 (테스트용 임시 암호화)
    try {
      String encryptedApiKey = encryptionUtil.encrypt(configDTO.getApiKey());
      tempConfig.setEncryptedApiKey(encryptedApiKey);
    } catch (Exception e) {
      log.error("❌ API Key 암호화 실패", e);
      throw new RuntimeException("API Key 암호화 실패: " + e.getMessage());
    }

    // 연결 테스트 수행 (예외 발생 시 자동으로 전파됨)
    testLlmConnection(tempConfig);

    log.info(
        "✅ 저장하지 않고 설정 테스트 성공: provider={}, model={}",
        configDTO.getProvider(),
        configDTO.getModelName());
  }

  @Override
  @Transactional
  public LlmConfigDTO toggleActive(String id) {
    log.info("🔄 활성/비활성 토글: id={}", id);

    LlmConfig config =
        llmConfigRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + id));

    // 기본 설정이면서 유일한 활성 설정인 경우 비활성화 불가
    if (config.getIsDefault() && config.getIsActive()) {
      long activeCount = llmConfigRepository.countByIsActiveTrue();
      if (activeCount <= 1) {
        throw new IllegalStateException("기본 설정이면서 유일한 설정은 비활성화할 수 없습니다.");
      }
    }

    config.setIsActive(!config.getIsActive());

    // 비활성화하는 경우 기본 플래그 제거
    if (!config.getIsActive() && config.getIsDefault()) {
      config.setIsDefault(false);
    }

    LlmConfig updatedConfig = llmConfigRepository.save(config);
    log.info("✅ 활성/비활성 토글 완료: id={}, isActive={}", id, updatedConfig.getIsActive());

    return convertToDTO(updatedConfig);
  }

  /** LLM API 연결 테스트 */
  private void testLlmConnection(LlmConfig config) {
    LlmClient client = llmClientFactory.getClient(config);

    List<RagChatMessage> messages =
        List.of(
            RagChatMessage.system("LLM connection health check"),
            RagChatMessage.user("Health check ping"));

    String normalizedApiUrl = normalizeApiUrl(config.getProvider(), config.getApiUrl());
    if (normalizedApiUrl == null || normalizedApiUrl.isEmpty()) {
      throw new IllegalStateException("유효한 LLM API URL이 설정되지 않았습니다.");
    }
    config.setApiUrl(normalizedApiUrl);

    try {
      client.chat(config, messages, 0.0, 16);
      log.info(
          "✅ LLM API 연결 테스트 성공: provider={}, model={}",
          config.getProvider(),
          config.getModelName());
    } catch (Exception e) {
      log.error(
          "❌ LLM API 연결 테스트 실패 (provider={}, model={})",
          config.getProvider(),
          config.getModelName(),
          e);
      throw new RuntimeException("LLM API 연결 실패: " + e.getMessage(), e);
    }
  }

  private String normalizeApiUrl(LlmProvider provider, String apiUrl) {
    if (apiUrl == null) {
      return null;
    }

    String normalized = apiUrl.trim();
    if (normalized.isEmpty()) {
      return normalized;
    }

    normalized = normalized.replaceAll("/+$", "");

    if (provider == null) {
      return normalized;
    }

    String lower = normalized.toLowerCase(Locale.ROOT);

    if (provider == LlmProvider.OPENWEBUI) {
      String suffix = "/api/chat/completions";
      if (lower.endsWith(suffix)) {
        normalized = normalized.substring(0, normalized.length() - suffix.length());
      }
    } else if (provider == LlmProvider.OPENAI) {
      String suffix = "/v1/chat/completions";
      if (lower.endsWith(suffix)) {
        normalized = normalized.substring(0, normalized.length() - suffix.length());
      }
    }

    return normalized.replaceAll("/+$", "");
  }

  /** Entity를 DTO로 변환 */
  private LlmConfigDTO convertToDTO(LlmConfig config) {
    // 템플릿이 없는 기존 설정에 기본 템플릿 적용 (하위 호환성)
    String template = config.getTestCaseTemplate();
    if (template == null || template.isEmpty()) {
      template = LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE;
      log.debug("📋 LLM 설정 {}에 기본 템플릿 적용 (조회 시)", config.getName());
    }

    return LlmConfigDTO.builder()
        .id(config.getId())
        .name(config.getName())
        .provider(config.getProvider())
        .apiUrl(config.getApiUrl())
        .maskedApiKey(maskApiKey(config.getEncryptedApiKey()))
        .modelName(config.getModelName())
        .isDefault(config.getIsDefault())
        .isActive(config.getIsActive())
        .testCaseTemplate(template) // 기본 템플릿 보장
        .connectionVerified(config.getConnectionVerified())
        .lastConnectionTest(config.getLastConnectionTest())
        .lastConnectionError(config.getLastConnectionError())
        .createdAt(config.getCreatedAt())
        .updatedAt(config.getUpdatedAt())
        .build();
  }

  /** API Key 마스킹 */
  private String maskApiKey(String encryptedApiKey) {
    if (encryptedApiKey == null || encryptedApiKey.length() < 8) {
      return "****";
    }
    return encryptedApiKey.substring(0, 4)
        + "..."
        + encryptedApiKey.substring(encryptedApiKey.length() - 4);
  }

  @Override
  public boolean hasActiveConfig() {
    log.info("🔍 기본 LLM 설정 존재 여부 확인 (기본값으로 설정된 활성 LLM)");

    // 기본값(isDefault=true)으로 설정되고 활성화된 LLM이 있는지 확인
    Optional<LlmConfig> defaultConfig = llmConfigRepository.findByIsDefaultTrueAndIsActiveTrue();
    boolean hasDefaultConfig = defaultConfig.isPresent();

    if (hasDefaultConfig) {
      LlmConfig config = defaultConfig.get();
      log.info(
          "✅ 기본 LLM 설정 존재: id={}, name={}, provider={}, model={}",
          config.getId(),
          config.getName(),
          config.getProvider(),
          config.getModelName());
    } else {
      log.warn("⚠️ 기본 LLM 설정 없음 - AI 질의응답 사용 불가");
      long activeCount = llmConfigRepository.countByIsActiveTrue();
      if (activeCount > 0) {
        log.warn("   참고: 활성화된 LLM 설정은 {}개 있으나, 기본값으로 지정된 설정이 없습니다.", activeCount);
      }
    }

    return hasDefaultConfig;
  }

  /** Config DTO 검증 */
  private void validateConfigDTO(LlmConfigDTO configDTO) {
    if (configDTO.getName() == null || configDTO.getName().trim().isEmpty()) {
      throw new IllegalArgumentException("설정 이름이 필요합니다");
    }
    if (configDTO.getProvider() == null) {
      throw new IllegalArgumentException("제공자가 필요합니다");
    }
    if (configDTO.getApiUrl() == null || configDTO.getApiUrl().trim().isEmpty()) {
      throw new IllegalArgumentException("API URL이 필요합니다");
    }
    if (configDTO.getApiKey() == null || configDTO.getApiKey().trim().isEmpty()) {
      throw new IllegalArgumentException("API Key가 필요합니다");
    }
    if (configDTO.getModelName() == null || configDTO.getModelName().trim().isEmpty()) {
      throw new IllegalArgumentException("모델 이름이 필요합니다");
    }
  }
}
