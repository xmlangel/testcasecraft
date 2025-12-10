package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.llm.LlmTemplateDTO;
import com.testcase.testcasemanagement.service.LlmTemplateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * LLM 템플릿 관리 Controller
 */
@RestController
@RequestMapping("/api/llm-template")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "LLM - Template", description = "LLM 템플릿 관리 API")
public class LlmTemplateController {

    private final LlmTemplateService llmTemplateService;

    /**
     * 기본 LLM 템플릿 조회
     * 모든 사용자 접근 가능
     */
    @Operation(summary = "기본 템플릿 조회", description = "시스템에 설정된 기본 LLM 프롬프트 템플릿을 조회합니다.")
    @GetMapping
    public ResponseEntity<LlmTemplateDTO> getTemplate() {
        log.info("GET /api/llm-template - 기본 템플릿 조회");
        LlmTemplateDTO template = llmTemplateService.getTemplate();
        return ResponseEntity.ok(template);
    }

    /**
     * LLM 템플릿 업데이트
     * Admin only
     */
    @Operation(summary = "템플릿 업데이트", description = "LLM 프롬프트 템플릿을 수정합니다. (관리자 전용)")
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LlmTemplateDTO> updateTemplate(@RequestBody LlmTemplateDTO templateDTO) {
        log.info("PUT /api/llm-template - 템플릿 업데이트");
        LlmTemplateDTO updated = llmTemplateService.updateTemplate(templateDTO);
        return ResponseEntity.ok(updated);
    }
}
