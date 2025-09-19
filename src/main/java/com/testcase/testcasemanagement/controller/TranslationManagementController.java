// src/main/java/com/testcase/testcasemanagement/controller/TranslationManagementController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.service.TranslationManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/translations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // 관리자 권한 필요
public class TranslationManagementController {

    private final TranslationManagementService translationManagementService;

    // ==================== 언어 관리 ====================

    /**
     * 모든 언어 조회
     */
    @GetMapping("/languages")
    public ResponseEntity<List<Language>> getAllLanguages() {
        List<Language> languages = translationManagementService.getAllLanguages();
        return ResponseEntity.ok(languages);
    }

    /**
     * 언어 생성
     */
    @PostMapping("/languages")
    public ResponseEntity<Language> createLanguage(@Valid @RequestBody CreateLanguageRequest request) {
        Language language = translationManagementService.createLanguage(
                request.code,
                request.name,
                request.nativeName,
                request.isDefault,
                request.sortOrder
        );
        return ResponseEntity.ok(language);
    }

    /**
     * 언어 수정
     */
    @PutMapping("/languages/{languageId}")
    public ResponseEntity<Language> updateLanguage(
            @PathVariable String languageId,
            @Valid @RequestBody UpdateLanguageRequest request) {

        Language language = translationManagementService.updateLanguage(
                languageId,
                request.name,
                request.nativeName,
                request.isActive,
                request.isDefault,
                request.sortOrder
        );
        return ResponseEntity.ok(language);
    }

    /**
     * 언어 삭제
     */
    @DeleteMapping("/languages/{languageId}")
    public ResponseEntity<Map<String, String>> deleteLanguage(@PathVariable String languageId) {
        translationManagementService.deleteLanguage(languageId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "언어가 성공적으로 삭제되었습니다");
        response.put("languageId", languageId);

        return ResponseEntity.ok(response);
    }

    // ==================== 번역 키 관리 ====================

    /**
     * 모든 번역 키 조회
     */
    @GetMapping("/keys")
    public ResponseEntity<List<TranslationKey>> getAllTranslationKeys(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isActive) {

        List<TranslationKey> keys;
        if (keyword != null || category != null || isActive != null) {
            keys = translationManagementService.searchTranslationKeys(keyword, category, isActive);
        } else {
            keys = translationManagementService.getAllTranslationKeys();
        }

        return ResponseEntity.ok(keys);
    }

    /**
     * 번역 키 생성
     */
    @PostMapping("/keys")
    public ResponseEntity<TranslationKey> createTranslationKey(@Valid @RequestBody CreateTranslationKeyRequest request) {
        TranslationKey translationKey = translationManagementService.createTranslationKey(
                request.keyName,
                request.category,
                request.description,
                request.defaultValue
        );
        return ResponseEntity.ok(translationKey);
    }

    /**
     * 번역 키 수정
     */
    @PutMapping("/keys/{keyId}")
    public ResponseEntity<TranslationKey> updateTranslationKey(
            @PathVariable String keyId,
            @Valid @RequestBody UpdateTranslationKeyRequest request) {

        TranslationKey translationKey = translationManagementService.updateTranslationKey(
                keyId,
                request.category,
                request.description,
                request.defaultValue,
                request.isActive
        );
        return ResponseEntity.ok(translationKey);
    }

    /**
     * 번역 키 삭제
     */
    @DeleteMapping("/keys/{keyId}")
    public ResponseEntity<Map<String, String>> deleteTranslationKey(@PathVariable String keyId) {
        translationManagementService.deleteTranslationKey(keyId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "번역 키가 성공적으로 삭제되었습니다");
        response.put("keyId", keyId);

        return ResponseEntity.ok(response);
    }

    // ==================== 번역 관리 ====================

    /**
     * 모든 번역 조회
     */
    @GetMapping
    public ResponseEntity<List<Translation>> getAllTranslations() {
        List<Translation> translations = translationManagementService.getAllTranslations();
        return ResponseEntity.ok(translations);
    }

    /**
     * 특정 언어의 번역들 조회
     */
    @GetMapping("/language/{languageCode}")
    public ResponseEntity<List<Translation>> getTranslationsByLanguage(@PathVariable String languageCode) {
        List<Translation> translations = translationManagementService.getTranslationsByLanguage(languageCode);
        return ResponseEntity.ok(translations);
    }

    /**
     * 특정 키의 번역들 조회
     */
    @GetMapping("/key/{keyName}")
    public ResponseEntity<List<Translation>> getTranslationsByKey(@PathVariable String keyName) {
        List<Translation> translations = translationManagementService.getTranslationsByKey(keyName);
        return ResponseEntity.ok(translations);
    }

    /**
     * 번역 생성 또는 업데이트
     */
    @PostMapping
    public ResponseEntity<Translation> createOrUpdateTranslation(
            @Valid @RequestBody CreateTranslationRequest request,
            Authentication authentication) {

        String updatedBy = authentication.getName();
        Translation translation = translationManagementService.createOrUpdateTranslation(
                request.keyName,
                request.languageCode,
                request.value,
                request.context,
                updatedBy
        );
        return ResponseEntity.ok(translation);
    }

    /**
     * 번역 삭제
     */
    @DeleteMapping("/{translationId}")
    public ResponseEntity<Map<String, String>> deleteTranslation(@PathVariable String translationId) {
        translationManagementService.deleteTranslation(translationId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "번역이 성공적으로 삭제되었습니다");
        response.put("translationId", translationId);

        return ResponseEntity.ok(response);
    }

    /**
     * 번역 활성화/비활성화
     */
    @PutMapping("/{translationId}/status")
    public ResponseEntity<Map<String, String>> updateTranslationStatus(
            @PathVariable String translationId,
            @RequestBody Map<String, Boolean> request) {

        Boolean isActive = request.get("isActive");
        if (isActive == null) {
            throw new RuntimeException("isActive 필드가 필요합니다");
        }

        if (isActive) {
            translationManagementService.activateTranslation(translationId);
        } else {
            translationManagementService.deactivateTranslation(translationId);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "번역 상태가 성공적으로 업데이트되었습니다");
        response.put("translationId", translationId);
        response.put("status", isActive ? "활성화됨" : "비활성화됨");

        return ResponseEntity.ok(response);
    }

    // ==================== 대량 작업 ====================

    /**
     * 번역 대량 생성
     */
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> batchCreateTranslations(
            @Valid @RequestBody List<CreateTranslationRequest> requests,
            Authentication authentication) {

        String updatedBy = authentication.getName();
        List<Map<String, String>> translationData = requests.stream()
                .map(req -> {
                    Map<String, String> data = new HashMap<>();
                    data.put("keyName", req.keyName);
                    data.put("languageCode", req.languageCode);
                    data.put("value", req.value);
                    data.put("context", req.context);
                    return data;
                })
                .toList();

        Map<String, Object> result = translationManagementService.batchCreateTranslations(translationData, updatedBy);
        return ResponseEntity.ok(result);
    }

    /**
     * 번역 완성도 조회
     */
    @GetMapping("/progress/{languageCode}")
    public ResponseEntity<Map<String, Object>> getTranslationProgress(@PathVariable String languageCode) {
        Map<String, Object> progress = translationManagementService.getTranslationProgress(languageCode);
        return ResponseEntity.ok(progress);
    }

    // ==================== Request DTOs ====================

    public static class CreateLanguageRequest {
        @NotBlank
        public String code;

        @NotBlank
        public String name;

        @NotBlank
        public String nativeName;

        public Boolean isDefault;
        public Integer sortOrder;
    }

    public static class UpdateLanguageRequest {
        public String name;
        public String nativeName;
        public Boolean isActive;
        public Boolean isDefault;
        public Integer sortOrder;
    }

    public static class CreateTranslationKeyRequest {
        @NotBlank
        public String keyName;

        public String category;
        public String description;
        public String defaultValue;
    }

    public static class UpdateTranslationKeyRequest {
        public String category;
        public String description;
        public String defaultValue;
        public Boolean isActive;
    }

    public static class CreateTranslationRequest {
        @NotBlank
        public String keyName;

        @NotBlank
        public String languageCode;

        @NotBlank
        public String value;

        public String context;
    }
}