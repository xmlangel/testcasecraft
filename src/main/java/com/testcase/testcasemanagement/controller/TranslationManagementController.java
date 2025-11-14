// src/main/java/com/testcase/testcasemanagement/controller/TranslationManagementController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.service.TranslationManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Admin - Translation Management", description = "번역 관리 API (관리자용)")
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
     * 모든 번역 키 조회 (페이지네이션 지원)
     */
    @GetMapping("/keys")
    public ResponseEntity<Map<String, Object>> getAllTranslationKeys(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Map<String, Object> result = translationManagementService.searchTranslationKeysWithPagination(
                keyword, category, isActive, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * 모든 카테고리 목록 조회
     */
    @GetMapping("/keys/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = translationManagementService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * 카테고리별 번역 키 통계 조회
     */
    @GetMapping("/keys/categories/stats")
    public ResponseEntity<List<Map<String, Object>>> getCategoryStats() {
        List<Map<String, Object>> stats = translationManagementService.getCategoryStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 카테고리별 언어별 번역 완성도 통계 조회
     */
    @GetMapping("/stats/category-completion")
    public ResponseEntity<List<Map<String, Object>>> getCategoryTranslationCompletionStats() {
        List<Map<String, Object>> stats = translationManagementService.getCategoryTranslationCompletionStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 특정 언어의 카테고리별 번역 완성도 통계 조회
     */
    @GetMapping("/stats/category-completion/{languageCode}")
    public ResponseEntity<List<Map<String, Object>>> getCategoryCompletionStatsByLanguage(@PathVariable String languageCode) {
        List<Map<String, Object>> stats = translationManagementService.getCategoryCompletionStatsByLanguage(languageCode);
        return ResponseEntity.ok(stats);
    }

    /**
     * 특정 카테고리의 언어별 번역 완성도 통계 조회
     */
    @GetMapping("/stats/language-completion/{category}")
    public ResponseEntity<List<Map<String, Object>>> getLanguageCompletionStatsByCategory(@PathVariable String category) {
        List<Map<String, Object>> stats = translationManagementService.getLanguageCompletionStatsByCategory(category);
        return ResponseEntity.ok(stats);
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
     * 페이지네이션을 지원하는 번역 검색
     */
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getTranslationsWithPagination(
            @RequestParam(value = "languageCode", required = false) String languageCode,
            @RequestParam(value = "keyName", required = false) String keyName,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Map<String, Object> result = translationManagementService.searchTranslationsWithPagination(
                languageCode, keyName, isActive, page, size);
        return ResponseEntity.ok(result);
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
    public ResponseEntity<?> createOrUpdateTranslation(
            @Valid @RequestBody CreateTranslationRequest request,
            Authentication authentication) {

        try {
            String updatedBy = authentication.getName();
            Translation translation = translationManagementService.createOrUpdateTranslation(
                    request.keyName,
                    request.languageCode,
                    request.value,
                    request.context,
                    updatedBy
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "번역이 성공적으로 저장되었습니다");
            response.put("data", translation);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("번역 저장 실패: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "번역 저장 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.badRequest().body(errorResponse);
        }
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

    // ==================== CSV Import/Export ====================

    /**
     * 번역 데이터 CSV 내보내기
     */
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportTranslationsAsCsv(
            @RequestParam(required = false) String languageCode) {

        try {
            String csvContent = translationManagementService.exportTranslationsAsCsv(languageCode);

            String filename = languageCode != null ?
                String.format("translations_%s.csv", languageCode) :
                "translations_all.csv";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvContent.getBytes("UTF-8"));

        } catch (Exception e) {
            log.error("CSV 내보내기 실패: {}", e.getMessage(), e);
            throw new RuntimeException("CSV 내보내기 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * CSV 파일을 통한 번역 데이터 가져오기
     */
    @PostMapping("/import/csv")
    public ResponseEntity<Map<String, Object>> importTranslationsFromCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite,
            Authentication authentication) {

        try {
            if (file.isEmpty()) {
                throw new RuntimeException("업로드된 파일이 비어있습니다");
            }

            if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
                throw new RuntimeException("CSV 파일만 업로드 가능합니다");
            }

            String updatedBy = authentication.getName();
            Map<String, Object> result = translationManagementService.importTranslationsFromCsv(
                    file.getInputStream(), overwrite, updatedBy);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("CSV 가져오기 실패: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "CSV 가져오기 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.badRequest().body(errorResponse);
        }
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