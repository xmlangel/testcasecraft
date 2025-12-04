package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.llm.LlmTemplateDTO;
import com.testcase.testcasemanagement.service.LlmTemplateService;
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
public class LlmTemplateController {

    private final LlmTemplateService llmTemplateService;

    /**
     * 기본 LLM 템플릿 조회
     * 모든 사용자 접근 가능
     */
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
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LlmTemplateDTO> updateTemplate(@RequestBody LlmTemplateDTO templateDTO) {
        log.info("PUT /api/llm-template - 템플릿 업데이트");
        LlmTemplateDTO updated = llmTemplateService.updateTemplate(templateDTO);
        return ResponseEntity.ok(updated);
    }
}
