package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 기본 LLM 템플릿 강제 업데이트
 * 개발 중 템플릿 변경사항이 DB에 반영되지 않는 문제를 해결하기 위함
 */
@Component
@Order(999) // 마지막에 실행
@RequiredArgsConstructor
@Slf4j
public class LlmConfigTemplateUpdater implements CommandLineRunner {

    private final LlmConfigRepository llmConfigRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("=== 기본 LLM 템플릿 업데이트 검사 ===");

        // 모든 설정 조회
        List<LlmConfig> allConfigs = llmConfigRepository.findAll();

        int updatedCount = 0;
        for (LlmConfig config : allConfigs) {
            // 기본 설정(isDefault=true)인 경우 템플릿 강제 업데이트
            if (Boolean.TRUE.equals(config.getIsDefault())) {
                log.info("♻️ 기본 LLM 설정 '{}'의 템플릿을 코드 최신값으로 업데이트합니다.", config.getName());
                config.setTestCaseTemplate(LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE);
                llmConfigRepository.save(config);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            log.info("✅ 총 {}개의 기본 LLM 설정 템플릿이 업데이트되었습니다.", updatedCount);
        } else {
            log.info("ℹ️ 업데이트할 기본 LLM 설정이 없습니다.");
        }
    }
}
