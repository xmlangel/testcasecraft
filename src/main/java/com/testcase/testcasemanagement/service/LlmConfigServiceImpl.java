// src/main/java/com/testcase/testcasemanagement/service/LlmConfigServiceImpl.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelDTO;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelQueryRequest;
import com.testcase.testcasemanagement.dto.llm.OpenRouterProbeResponse;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.exception.EncryptionKeyNotConfiguredException;
import com.testcase.testcasemanagement.service.llm.LlmApiUrlNormalizer;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import com.testcase.testcasemanagement.service.llm.LlmClient;
import com.testcase.testcasemanagement.service.llm.LlmClientFactory;
import com.testcase.testcasemanagement.service.llm.OpenRouterModelCatalogService;
import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.List;
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
  private final OpenRouterModelCatalogService openRouterModelCatalogService;

  @PostConstruct
  public void init() {
    log.info("=== LLM 설정 서비스 초기화 ===");

    // 암호화 상태 확인
    if (!encryptionUtil.isEncryptionKeyConfigured()) {
      log.error("❌ LLM 암호화 키가 설정되지 않았습니다!");
      log.error("   환경변수 {} 를 설정해주세요.", EncryptionKeyNotConfiguredException.ENV_VAR_NAME);
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
      throw new EncryptionKeyNotConfiguredException();
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
      // 키가 없으면 encrypt() 가 IllegalStateException 을 던져 원인 코드 없이 500 으로 올라간다.
      // 화면이 해결 안내를 띄울 수 있도록 여기서 먼저 판정해 전용 예외로 거부한다.
      if (!encryptionUtil.isEncryptionKeyConfigured()) {
        throw new EncryptionKeyNotConfiguredException();
      }
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
      throw new EncryptionKeyNotConfiguredException();
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
  public List<OpenRouterModelDTO> listOpenRouterFreeModels(OpenRouterModelQueryRequest request) {
    return openRouterModelCatalogService.listFreeChatModels(resolveOpenRouterApiKey(request));
  }

  @Override
  public OpenRouterProbeResponse probeOpenRouterModels(OpenRouterModelQueryRequest request) {
    String apiKey = resolveOpenRouterApiKey(request);

    List<String> targets = request.getModelIds();
    if (targets == null || targets.isEmpty()) {
      // 대상을 지정하지 않으면 무료 모델 전체를 확인한다.
      targets =
          openRouterModelCatalogService.listFreeChatModels(apiKey).stream()
              .map(OpenRouterModelDTO::getId)
              .collect(Collectors.toList());
    }

    // 이미 판정한 모델은 건너뛴다. 확인 한 번이 한도를 그만큼 쓰므로, 버튼을 다시 눌렀을 때 같은
    // 모델을 또 두드리지 않게 한다. 화면이 판정 결과를 갖고 있으므로 목록은 화면이 보내 준다.
    List<String> skip = request.getAlreadyChecked();
    if (skip != null && !skip.isEmpty()) {
      java.util.Set<String> checked = new java.util.HashSet<>(skip);
      targets = targets.stream().filter(id -> !checked.contains(id)).collect(Collectors.toList());
      log.info("🔁 이미 판정한 {}개를 건너뛴다. 확인 대상 {}개", checked.size(), targets.size());
    }

    return openRouterModelCatalogService.probeAvailability(apiKey, targets);
  }

  /**
   * 요청에서 OpenRouter API Key 를 얻는다.
   *
   * <p>화면이 키를 직접 보내면 그것을 쓰고, 저장된 설정 ID 만 보내면 저장된 키를 복호화해 쓴다. 저장된 설정을 다시 열어 목록을 새로 받을 때 사용자가 키를 다시
   * 타이핑하지 않게 하려는 것이다.
   */
  private String resolveOpenRouterApiKey(OpenRouterModelQueryRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("요청 본문이 필요합니다");
    }

    String apiKey = request.getApiKey();
    if (apiKey != null && !apiKey.isBlank()) {
      return apiKey.trim();
    }

    String configId = request.getConfigId();
    if (configId == null || configId.isBlank()) {
      throw new IllegalArgumentException("API Key 또는 저장된 설정 ID 가 필요합니다");
    }

    if (!encryptionUtil.isEncryptionKeyConfigured()) {
      throw new EncryptionKeyNotConfiguredException();
    }

    LlmConfig config =
        llmConfigRepository
            .findById(configId)
            .orElseThrow(() -> new IllegalArgumentException("LLM 설정을 찾을 수 없습니다: " + configId));

    if (config.getProvider() != LlmProvider.OPENROUTER) {
      throw new IllegalArgumentException(
          "OpenRouter 설정이 아닙니다: " + config.getProvider().getDisplayName());
    }

    try {
      return encryptionUtil.decrypt(config.getEncryptedApiKey());
    } catch (Exception e) {
      log.error("❌ 저장된 API Key 복호화 실패: configId={}", configId, e);
      throw new IllegalStateException("저장된 API Key 를 읽을 수 없습니다. 키를 다시 입력해 주세요.");
    }
  }

  @Override
  public List<OpenRouterModelDTO> listSelectableFreeModelsForChat() {
    LlmConfig config = llmConfigRepository.findByIsDefaultTrueAndIsActiveTrue().orElse(null);
    if (config == null || config.getProvider() != LlmProvider.OPENROUTER) {
      // OpenRouter 가 아니면 고를 목록이 없다. 오류가 아니라 빈 목록으로 답해 화면이 선택기를 감춘다.
      return Collections.emptyList();
    }
    if (!encryptionUtil.isEncryptionKeyConfigured()) {
      return Collections.emptyList();
    }

    try {
      String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());
      return openRouterModelCatalogService.listFreeChatModels(apiKey);
    } catch (Exception e) {
      // 목록을 못 받아도 채팅 자체는 기본 모델로 되어야 한다. 실패를 던지지 않고 빈 목록으로 답한다.
      log.warn("⚠️ 채팅용 무료 모델 목록 조회 실패, 빈 목록으로 응답: {}", e.getMessage());
      return Collections.emptyList();
    }
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

  /**
   * 저장 전에 API URL 을 정규화한다.
   *
   * <p>정규화 규칙 자체는 {@link LlmApiUrlNormalizer} 가 정본이다. 예전에는 이 메서드가 자체 규칙을 갖고 있었는데 OPENWEBUI·OPENAI
   * 두 제공자만, 그것도 호출 경로 전체를 넣은 경우만 처리해서 OpenRouter 에 {@code https://openrouter.ai/api/v1} 을 넣으면 경로가 두 번
   * 붙어 404 가 났다. 규칙을 두 벌로 두면 한쪽만 고치게 되므로 클라이언트와 같은 정의를 쓴다.
   */
  private String normalizeApiUrl(LlmProvider provider, String apiUrl) {
    if (apiUrl == null) {
      return null;
    }
    if (apiUrl.isBlank()) {
      return apiUrl.trim();
    }
    if (provider == null) {
      return apiUrl.trim().replaceAll("/+$", "");
    }
    return LlmApiUrlNormalizer.normalizeBaseUrl(
        apiUrl, LlmApiUrlNormalizer.chatCompletionsPathOf(provider));
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
