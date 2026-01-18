// src/main/java/com/testcase/testcasemanagement/controller/I18nController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.service.I18nService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "System - Internationalization", description = "국제화 및 번역 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/i18n")
@RequiredArgsConstructor
public class I18nController {

    private final I18nService i18nService;

    /**
     * 활성화된 언어 목록 조회
     */
    @Operation(summary = "활성 언어 목록 조회", description = "시스템에서 지원하는 활성화된 언어 목록을 조회합니다.")
    @GetMapping("/languages")
    public ResponseEntity<List<Language>> getActiveLanguages() {
        List<Language> languages = i18nService.getActiveLanguages();
        return ResponseEntity.ok(languages);
    }

    /**
     * 기본 언어 조회
     */
    @Operation(summary = "기본 언어 조회", description = "시스템의 기본 언어 설정을 조회합니다.")
    @GetMapping("/languages/default")
    public ResponseEntity<Language> getDefaultLanguage() {
        Language defaultLanguage = i18nService.getDefaultLanguage();
        return ResponseEntity.ok(defaultLanguage);
    }

    /**
     * 특정 언어의 모든 번역 조회
     */
    @Operation(summary = "전체 번역 조회", description = "특정 언어의 모든 번역 데이터를 조회합니다.")
    @GetMapping("/translations/{languageCode}")
    public ResponseEntity<Map<String, Object>> getTranslations(@PathVariable String languageCode) {
        // 언어 코드 검증
        String validatedLanguageCode = i18nService.validateLanguageCode(languageCode);
        Map<String, String> translations = i18nService.getTranslationsMap(validatedLanguageCode);

        Map<String, Object> response = new HashMap<>();
        response.put("languageCode", validatedLanguageCode);
        response.put("translations", translations);
        response.put("count", translations.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 카테고리별 번역 조회
     */
    @Operation(summary = "카테고리별 번역 조회", description = "특정 언어 및 카테고리에 해당하는 번역 데이터를 조회합니다.")
    @GetMapping("/translations/{languageCode}/category/{category}")
    public ResponseEntity<Map<String, Object>> getTranslationsByCategory(
            @PathVariable String languageCode,
            @PathVariable String category) {

        String validatedLanguageCode = i18nService.validateLanguageCode(languageCode);
        Map<String, String> translations = i18nService.getTranslationsByCategory(validatedLanguageCode, category);

        Map<String, Object> response = new HashMap<>();
        response.put("languageCode", validatedLanguageCode);
        response.put("category", category);
        response.put("translations", translations);
        response.put("count", translations.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 특정 키의 번역 조회 (fallback 지원)
     */
    @Operation(summary = "단일 번역 조회", description = "특정 키에 대한 번역 값을 조회합니다.")
    @GetMapping("/translation/{languageCode}/{keyName}")
    public ResponseEntity<Map<String, Object>> getTranslation(
            @PathVariable String languageCode,
            @PathVariable String keyName,
            @RequestParam(defaultValue = "true") boolean useFallback) {

        String validatedLanguageCode = i18nService.validateLanguageCode(languageCode);
        String translation = i18nService.getTranslation(keyName, validatedLanguageCode, useFallback);

        Map<String, Object> response = new HashMap<>();
        response.put("key", keyName);
        response.put("languageCode", validatedLanguageCode);
        response.put("value", translation);

        return ResponseEntity.ok(response);
    }

    /**
     * 다중 키 번역 조회 (POST 방식)
     */
    @Operation(summary = "다중 번역 조회", description = "여러 키에 대한 번역 값을 한 번에 조회합니다.")
    @PostMapping("/translations/{languageCode}/bulk")
    public ResponseEntity<Map<String, String>> getTranslationsBulk(
            @PathVariable String languageCode,
            @RequestBody List<String> keys,
            @RequestParam(defaultValue = "true") boolean useFallback) {

        String validatedLanguageCode = i18nService.validateLanguageCode(languageCode);
        Map<String, String> translations = new HashMap<>();

        for (String key : keys) {
            String translation = i18nService.getTranslation(key, validatedLanguageCode, useFallback);
            translations.put(key, translation);
        }

        return ResponseEntity.ok(translations);
    }

    /**
     * 언어별 번역 완성도 통계 조회
     */
    @Operation(summary = "번역 완성도 통계", description = "각 언어별 번역 완성도 통계를 조회합니다.")
    @GetMapping("/statistics/completion")
    public ResponseEntity<List<Map<String, Object>>> getTranslationCompletionStats() {
        List<Map<String, Object>> stats = i18nService.getTranslationCompletionStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 특정 언어의 누락된 번역 키들 조회
     */
    @Operation(summary = "누락된 번역 키 조회", description = "특정 언어에서 번역이 누락된 키 목록을 조회합니다.")
    @GetMapping("/missing-keys/{languageCode}")
    public ResponseEntity<Map<String, Object>> getMissingTranslationKeys(@PathVariable String languageCode) {
        String validatedLanguageCode = i18nService.validateLanguageCode(languageCode);
        var missingKeys = i18nService.getMissingTranslationKeys(validatedLanguageCode);

        Map<String, Object> response = new HashMap<>();
        response.put("languageCode", validatedLanguageCode);
        response.put("missingKeys", missingKeys);
        response.put("count", missingKeys.size());

        return ResponseEntity.<Map<String, Object>>ok(response);
    }

    /**
     * 활성화된 카테고리 목록 조회
     */
    @Operation(summary = "활성 카테고리 조회", description = "사용 가능한 모든 번역 카테고리 목록을 조회합니다.")
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getActiveCategories() {
        List<String> categories = i18nService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * 캐시 초기화 (관리자 전용)
     */
    @Operation(summary = "캐시 초기화", description = "모든 다국어 캐시를 초기화합니다. (관리자 전용)")
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, Object>> clearCache() {
        i18nService.clearAllCache();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "모든 다국어 캐시가 초기화되었습니다");
        response.put("status", "success");

        return ResponseEntity.ok(response);
    }

    /**
     * 언어 코드 검증
     */
    @Operation(summary = "언어 코드 검증", description = "입력된 언어 코드의 유효성을 검증합니다.")
    @GetMapping("/validate/{languageCode}")
    public ResponseEntity<Map<String, Object>> validateLanguageCode(@PathVariable String languageCode) {
        String validatedCode = i18nService.validateLanguageCode(languageCode);
        boolean isValid = validatedCode.equals(languageCode);

        Map<String, Object> response = new HashMap<>();
        response.put("inputLanguageCode", languageCode);
        response.put("validatedLanguageCode", validatedCode);
        response.put("isValid", isValid);
        response.put("isDefault", validatedCode.equals(i18nService.getDefaultLanguage().getCode()));

        return ResponseEntity.<Map<String, Object>>ok(response);
    }

    /**
     * 로그인 페이지 전용 번역 조회 (캐시 최적화)
     */
    @Operation(summary = "로그인 화면 번역 조회", description = "로그인 화면 구성에 필요한 번역 데이터를 최적화하여 조회합니다.")
    @GetMapping("/translations/{languageCode}/login")
    public ResponseEntity<Map<String, String>> getLoginTranslations(@PathVariable String languageCode) {
        String validatedLanguageCode = i18nService.validateLanguageCode(languageCode);
        Map<String, String> loginTranslations = i18nService.getTranslationsByCategory(validatedLanguageCode, "login");

        // 버튼 카테고리도 포함 (로그인 버튼용)
        Map<String, String> buttonTranslations = i18nService.getTranslationsByCategory(validatedLanguageCode, "button");

        // 두 맵을 합치기
        Map<String, String> allTranslations = new HashMap<>(loginTranslations);
        allTranslations.putAll(buttonTranslations);

        return ResponseEntity.ok(allTranslations);
    }
}