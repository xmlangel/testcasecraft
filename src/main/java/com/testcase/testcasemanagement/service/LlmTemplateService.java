package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmTemplateDTO;

/**
 * LLM 템플릿 서비스 인터페이스
 */
public interface LlmTemplateService {

    /**
     * 기본 템플릿 조회
     */
    LlmTemplateDTO getTemplate();

    /**
     * 템플릿 업데이트 (Admin only)
     */
    LlmTemplateDTO updateTemplate(LlmTemplateDTO templateDTO);
}
