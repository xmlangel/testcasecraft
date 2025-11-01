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
     * 활성/비활성 토글
     */
    LlmConfigDTO toggleActive(String id);
}
