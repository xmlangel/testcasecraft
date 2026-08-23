// src/main/java/com/testcase/testcasemanagement/service/LlmConfigService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelCatalogInfo;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelQueryRequest;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.List;
import java.util.Optional;
import reactor.core.publisher.Mono;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeJob;

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
   * 제공자의 모델 목록 조회
   *
   * <p>호출 1회로 끝나고 비용이 없다. 가용성은 확인하지 않으므로 결과의 availability 는 UNKNOWN 이다. 요청의 provider 가 비면
   * OPENROUTER 로 본다.
   */
  List<LlmModelDTO> listSelectableModels(LlmModelQueryRequest request);

  /**
   * 제공자 모델 가용성 확인
   *
   * <p>각 모델에 최소 요청을 보내 지금 쓸 수 있는지 본다. <b>확인 자체가 무료 일일 한도를 태운다</b>(실측: 한도 50건). 그래서 화면은 고른 모델
   * 하나만 확인하는 것을 기본으로 하고, 전체 확인은 소모량을 알린 뒤에만 보낸다.
   *
   * <p>{@code modelIds} 를 비우면 무료 모델 전체를 확인한다. {@code alreadyChecked} 에 담긴 모델은 확인하지 않고 건너뛴다. 같은
   * 회차에서 버튼을 여러 번 눌러도 한도가 다시 쓰이지 않게 하려는 것이다.
   */

  /**
   * 가용성 확인을 백그라운드 작업으로 시작한다.
   *
   * <p>확인은 최악의 경우 몇 분이 걸린다(OpenRouter 2분 30초, NVIDIA 6분). 결과를 기다려 돌려주면 리버스 프록시 타임아웃에 먼저 걸려 응답을
   * 아예 받지 못하고, 그동안 확인은 서버에서 계속 도는데 결과가 버려진다.
   *
   * @return 작업 ID 와 대상 개수를 담은 상태. 결과는 {@link #findProbeJob} 으로 받는다
   */
  LlmModelProbeJob startProbeJob(LlmModelQueryRequest request);

  /** 확인 작업의 진행 상황과 결과를 본다. 없으면 비어 있다. */
  Optional<LlmModelProbeJob> findProbeJob(String jobId);

  /**
   * 채팅 화면에서 고를 수 있는 무료 모델 목록
   *
   * <p>기본 활성 설정이 OpenRouter 일 때만 목록을 낸다. 그 설정에 저장된 키로 서버가 조회하며, 키는 응답에 담지 않는다. 관리자용 목록 조회와 달리 일반
   * 사용자가 호출하므로 가용성 확인은 하지 않는다(무료 한도를 태우는 호출이라 남용 위험이 있다).
   *
   * @return 무료 모델 목록. 기본 설정이 OpenRouter 가 아니거나 조회에 실패하면 빈 목록
   */
  List<LlmModelDTO> listSelectableModelsForChat();

  /**
   * 모델 목록을 내주는 제공자 목록
   *
   * <p>화면이 어느 제공자에서 목록 선택기를 띄울지, 전수 확인을 기본으로 권할지 정하는 데 쓴다. 제공자 목록을 화면에 박아 두면 제공자를 더할 때마다 화면도
   * 고쳐야 하므로 서버가 알려 준다.
   */
  List<LlmModelCatalogInfo> listModelCatalogProviders();

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
