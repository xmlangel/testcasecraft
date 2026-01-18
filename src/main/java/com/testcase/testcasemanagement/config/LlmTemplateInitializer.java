package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.LlmTemplate;
import com.testcase.testcasemanagement.repository.LlmTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * LLM 템플릿 초기화
 * 애플리케이션 시작 시 기본 템플릿을 DB에 저장
 */
@Component
@Order(1) // 다른 Initializer보다 먼저 실행
@RequiredArgsConstructor
@Slf4j
public class LlmTemplateInitializer implements CommandLineRunner {

    private final LlmTemplateRepository llmTemplateRepository;

    @Override
    public void run(String... args) {
        log.info("=== LLM 템플릿 초기화 시작 ===");

        if (llmTemplateRepository.existsById("default")) {
            log.debug("기본 LLM 템플릿이 이미 존재합니다");
            return;
        }

        // UI 기본값 (DocumentAnalysis.jsx와 동일)
        LlmTemplate defaultTemplate = LlmTemplate.builder()
                .id("default")
                .promptTemplate("다음 텍스트를 요약하세요:\n\n{chunk_text}")
                .chunkBatchSize(10)
                .pauseAfterBatch(false)
                .maxTokens(500)
                .temperature(0.7)
                .createdBy("system")
                .build();

        llmTemplateRepository.save(defaultTemplate);
        log.info("✅ 기본 LLM 템플릿 생성 완료");
        log.info("=== LLM 템플릿 초기화 완료 ===");
    }
}
