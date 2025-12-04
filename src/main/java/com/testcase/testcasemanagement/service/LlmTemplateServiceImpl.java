package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.llm.LlmTemplateDTO;
import com.testcase.testcasemanagement.model.LlmTemplate;
import com.testcase.testcasemanagement.repository.LlmTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * LLM 템플릿 서비스 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LlmTemplateServiceImpl implements LlmTemplateService {

    private final LlmTemplateRepository llmTemplateRepository;

    @Override
    public LlmTemplateDTO getTemplate() {
        log.info("기본 LLM 템플릿 조회");
        LlmTemplate template = llmTemplateRepository.findById("default")
                .orElseThrow(() -> new RuntimeException("기본 LLM 템플릿이 존재하지 않습니다"));

        return convertToDTO(template);
    }

    @Override
    @Transactional
    public LlmTemplateDTO updateTemplate(LlmTemplateDTO templateDTO) {
        log.info("LLM 템플릿 업데이트 시작");

        LlmTemplate template = llmTemplateRepository.findById("default")
                .orElseThrow(() -> new RuntimeException("기본 LLM 템플릿이 존재하지 않습니다"));

        // 필드 업데이트
        if (templateDTO.getPromptTemplate() != null) {
            template.setPromptTemplate(templateDTO.getPromptTemplate());
        }
        if (templateDTO.getChunkBatchSize() != null) {
            template.setChunkBatchSize(templateDTO.getChunkBatchSize());
        }
        if (templateDTO.getPauseAfterBatch() != null) {
            template.setPauseAfterBatch(templateDTO.getPauseAfterBatch());
        }
        if (templateDTO.getMaxTokens() != null) {
            template.setMaxTokens(templateDTO.getMaxTokens());
        }
        if (templateDTO.getTemperature() != null) {
            template.setTemperature(templateDTO.getTemperature());
        }

        LlmTemplate saved = llmTemplateRepository.save(template);
        log.info("✅ LLM 템플릿 업데이트 완료");

        return convertToDTO(saved);
    }

    private LlmTemplateDTO convertToDTO(LlmTemplate template) {
        return LlmTemplateDTO.builder()
                .id(template.getId())
                .promptTemplate(template.getPromptTemplate())
                .chunkBatchSize(template.getChunkBatchSize())
                .pauseAfterBatch(template.getPauseAfterBatch())
                .maxTokens(template.getMaxTokens())
                .temperature(template.getTemperature())
                .createdBy(template.getCreatedBy())
                .createdDate(template.getCreatedDate())
                .lastModifiedBy(template.getLastModifiedBy())
                .lastModifiedDate(template.getLastModifiedDate())
                .build();
    }
}
