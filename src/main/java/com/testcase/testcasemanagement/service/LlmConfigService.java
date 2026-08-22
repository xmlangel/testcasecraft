// src/main/java/com/testcase/testcasemanagement/service/LlmConfigService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelDTO;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelQueryRequest;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.List;
import java.util.Optional;

/** LLM 설정 서비스 인터페이스 */
public interface LlmConfigService {

  /** 모든 활성화된 LLM 설정 조회 */
  List<LlmConfigDTO> getAllActiveConfigs();

  /** 일반 사용자가 조회 가능한 활성 설정 (기본값만) */
  List<LlmConfigDTO> getActiveConfigsForUsers();

  /** 모든 LLM 설정 조회 (활성화 여부 무관) */
  List<LlmConfigDTO> getAllConfigs();

  /** 특정 ID의 LLM 설정 조회 */
  Optional<LlmConfigDTO> getConfigById(String id);

  /** 기본 LLM 설정 조회 */
  Optional<LlmConfigDTO> getDefaultConfig();

  /** 제공자별 활성화된 설정 조회 */
  List<LlmConfigDTO> getConfigsByProvider(LlmProvider provider);

  /** LLM 설정 생성 */
  LlmConfigDTO createConfig(LlmConfigDTO configDTO);

  /** LLM 설정 수정 */
  LlmConfigDTO updateConfig(String id, LlmConfigDTO configDTO);

  /** LLM 설정 삭제 기본 설정이면서 유일한 설정인 경우 삭제 불가 */
  void deleteConfig(String id);

  /** 기본 설정으로 지정 */
  LlmConfigDTO setDefaultConfig(String id);

  /** 연결 테스트 실제 LLM API를 호출하여 연결 상태 확인 */
  LlmConfigDTO testConnection(String id);

  /** 저장하지 않고 설정 테스트 다이얼로그에서 저장 전에 설정이 올바른지 테스트 */
  void testUnsavedSettings(LlmConfigDTO configDTO);

  /**
   * OpenRouter 무료 모델 목록 조회
   *
   * <p>호출 1회로 끝나고 비용이 없다. 가용성은 확인하지 않으므로 결과의 availability 는 UNKNOWN 이다.
   */
  List<OpenRouterModelDTO> listOpenRouterFreeModels(OpenRouterModelQueryRequest request);

  /**
   * OpenRouter 모델 가용성 확인
   *
   * <p>각 모델에 최소 요청을 보내 지금 쓸 수 있는지 본다. 무료 한도를 조금 쓰므로 사용자가 명시적으로 요청할 때만 호출한다. modelIds 를 비우면 무료 모델
   * 전체를 확인한다.
   */
  List<OpenRouterModelDTO> probeOpenRouterModels(OpenRouterModelQueryRequest request);

  /**
   * 채팅 화면에서 고를 수 있는 무료 모델 목록
   *
   * <p>기본 활성 설정이 OpenRouter 일 때만 목록을 낸다. 그 설정에 저장된 키로 서버가 조회하며, 키는 응답에 담지 않는다. 관리자용 목록 조회와 달리 일반
   * 사용자가 호출하므로 가용성 확인은 하지 않는다(무료 한도를 태우는 호출이라 남용 위험이 있다).
   *
   * @return 무료 모델 목록. 기본 설정이 OpenRouter 가 아니거나 조회에 실패하면 빈 목록
   */
  List<OpenRouterModelDTO> listSelectableFreeModelsForChat();

  /** 활성/비활성 토글 */
  LlmConfigDTO toggleActive(String id);

  /**
   * 기본 LLM 설정 존재 여부 확인 기본값(isDefault=true)으로 설정되고 활성화된 LLM이 있는지 확인합니다. AI 질의응답 기능을 사용하려면 기본 LLM 설정이
   * 필요합니다.
   *
   * <p>모든 인증된 사용자가 접근 가능
   */
  boolean hasActiveConfig();
}
