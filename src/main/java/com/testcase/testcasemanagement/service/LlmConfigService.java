// src/main/java/com/testcase/testcasemanagement/service/LlmConfigService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;

import java.util.List;
import java.util.Optional;

/**
 * LLM 설정 서비스 인터페이스
 */
public interface LlmConfigService {

    /**
     * 모든 활성화된 LLM 설정 조회
     */
    List<LlmConfigDTO> getAllActiveConfigs();

    /**
     * 일반 사용자가 조회 가능한 활성 설정 (기본값만)
     */
    List<LlmConfigDTO> getActiveConfigsForUsers();

    /**
     * 모든 LLM 설정 조회 (활성화 여부 무관)
     */
    List<LlmConfigDTO> getAllConfigs();

    /**
     * 특정 ID의 LLM 설정 조회
     */
    Optional<LlmConfigDTO> getConfigById(String id);

    /**
     * 기본 LLM 설정 조회
     */
    Optional<LlmConfigDTO> getDefaultConfig();

    /**
     * 제공자별 활성화된 설정 조회
     */
    List<LlmConfigDTO> getConfigsByProvider(LlmProvider provider);

    /**
     * LLM 설정 생성
     */
    LlmConfigDTO createConfig(LlmConfigDTO configDTO);

    /**
     * LLM 설정 수정
     */
    LlmConfigDTO updateConfig(String id, LlmConfigDTO configDTO);

    /**
     * LLM 설정 삭제
     * 기본 설정이면서 유일한 설정인 경우 삭제 불가
     */
    void deleteConfig(String id);

    /**
     * 기본 설정으로 지정
     */
    LlmConfigDTO setDefaultConfig(String id);

    /**
     * 연결 테스트
     * 실제 LLM API를 호출하여 연결 상태 확인
     */
    LlmConfigDTO testConnection(String id);

    /**
     * 저장하지 않고 설정 테스트
     * 다이얼로그에서 저장 전에 설정이 올바른지 테스트
     */
    void testUnsavedSettings(LlmConfigDTO configDTO);

    /**
     * 활성/비활성 토글
     */
    LlmConfigDTO toggleActive(String id);

    /**
     * 기본 LLM 설정 존재 여부 확인
     * 기본값(isDefault=true)으로 설정되고 활성화된 LLM이 있는지 확인합니다.
     * AI 질의응답 기능을 사용하려면 기본 LLM 설정이 필요합니다.
     *
     * 모든 인증된 사용자가 접근 가능
     */
    boolean hasActiveConfig();
}
