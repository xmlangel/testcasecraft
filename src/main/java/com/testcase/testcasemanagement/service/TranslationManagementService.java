// src/main/java/com/testcase/testcasemanagement/service/TranslationManagementService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TranslationManagementService {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;
    private final I18nService i18nService;

    // ==================== 언어 관리 ====================

    @Transactional
    public Language createLanguage(String code, String name, String nativeName, Boolean isDefault, Integer sortOrder) {
        if (languageRepository.existsByCode(code)) {
            throw new RuntimeException("이미 존재하는 언어 코드입니다: " + code);
        }

        if (isDefault != null && isDefault) {
            // 기존 기본 언어를 일반 언어로 변경
            languageRepository.findByIsDefaultTrue().ifPresent(defaultLang -> {
                defaultLang.setIsDefault(false);
                languageRepository.save(defaultLang);
            });
        }

        if (sortOrder == null) {
            sortOrder = languageRepository.findMaxSortOrder() + 1;
        }

        Language language = new Language(code, name, nativeName, isDefault != null && isDefault, sortOrder);
        Language savedLanguage = languageRepository.save(language);

        // 언어 캐시 초기화
        i18nService.clearLanguageCache();

        log.info("언어 생성됨: {} ({})", name, code);
        return savedLanguage;
    }

    @Transactional
    public Language updateLanguage(String languageId, String name, String nativeName, Boolean isActive, Boolean isDefault, Integer sortOrder) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new RuntimeException("언어를 찾을 수 없습니다: " + languageId));

        if (name != null) language.setName(name);
        if (nativeName != null) language.setNativeName(nativeName);
        if (isActive != null) language.setIsActive(isActive);
        if (sortOrder != null) language.setSortOrder(sortOrder);

        if (isDefault != null && isDefault && !language.getIsDefault()) {
            // 기존 기본 언어를 일반 언어로 변경
            languageRepository.findByIsDefaultTrue().ifPresent(defaultLang -> {
                defaultLang.setIsDefault(false);
                languageRepository.save(defaultLang);
            });
            language.setIsDefault(true);
        }

        Language updatedLanguage = languageRepository.save(language);

        // 캐시 초기화
        i18nService.clearLanguageCache();
        if (isActive != null && !isActive) {
            i18nService.clearTranslationCache();
        }

        log.info("언어 업데이트됨: {} ({})", language.getName(), language.getCode());
        return updatedLanguage;
    }

    @Transactional
    public void deleteLanguage(String languageId) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new RuntimeException("언어를 찾을 수 없습니다: " + languageId));

        if (language.getIsDefault()) {
            throw new RuntimeException("기본 언어는 삭제할 수 없습니다");
        }

        languageRepository.delete(language);

        // 캐시 초기화
        i18nService.clearAllCache();

        log.info("언어 삭제됨: {} ({})", language.getName(), language.getCode());
    }

    // ==================== 번역 키 관리 ====================

    @Transactional
    public TranslationKey createTranslationKey(String keyName, String category, String description, String defaultValue) {
        if (translationKeyRepository.existsByKeyName(keyName)) {
            throw new RuntimeException("이미 존재하는 번역 키입니다: " + keyName);
        }

        TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
        TranslationKey savedKey = translationKeyRepository.save(translationKey);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        log.info("번역 키 생성됨: {}", keyName);
        return savedKey;
    }

    @Transactional
    public TranslationKey updateTranslationKey(String keyId, String category, String description, String defaultValue, Boolean isActive) {
        TranslationKey translationKey = translationKeyRepository.findById(keyId)
                .orElseThrow(() -> new RuntimeException("번역 키를 찾을 수 없습니다: " + keyId));

        if (category != null) translationKey.setCategory(category);
        if (description != null) translationKey.setDescription(description);
        if (defaultValue != null) translationKey.setDefaultValue(defaultValue);
        if (isActive != null) translationKey.setIsActive(isActive);

        TranslationKey updatedKey = translationKeyRepository.save(translationKey);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        log.info("번역 키 업데이트됨: {}", translationKey.getKeyName());
        return updatedKey;
    }

    @Transactional
    public void deleteTranslationKey(String keyId) {
        TranslationKey translationKey = translationKeyRepository.findById(keyId)
                .orElseThrow(() -> new RuntimeException("번역 키를 찾을 수 없습니다: " + keyId));

        translationKeyRepository.delete(translationKey);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        log.info("번역 키 삭제됨: {}", translationKey.getKeyName());
    }

    @Transactional(readOnly = true)
    public List<TranslationKey> searchTranslationKeys(String keyword, String category, Boolean isActive) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            String searchKeyword = "%" + keyword.trim().toLowerCase() + "%";
            if (category != null && !category.isEmpty()) {
                if (isActive != null) {
                    return translationKeyRepository.findByKeyNameContainingIgnoreCaseAndCategoryAndIsActive(keyword, category, isActive);
                } else {
                    return translationKeyRepository.findByKeyNameContainingIgnoreCaseAndCategory(keyword, category);
                }
            } else {
                if (isActive != null) {
                    return translationKeyRepository.findByKeyNameContainingIgnoreCaseAndIsActive(keyword, isActive);
                } else {
                    return translationKeyRepository.findByKeyNameContainingIgnoreCase(keyword);
                }
            }
        } else {
            if (category != null && !category.isEmpty()) {
                if (isActive != null) {
                    return translationKeyRepository.findByCategoryAndIsActive(category, isActive);
                } else {
                    return translationKeyRepository.findByCategory(category);
                }
            } else {
                if (isActive != null) {
                    return translationKeyRepository.findByIsActive(isActive);
                } else {
                    return translationKeyRepository.findAll();
                }
            }
        }
    }

    // ==================== 번역 관리 ====================

    @Transactional
    public Translation createOrUpdateTranslation(String keyName, String languageCode, String value, String context, String updatedBy) {
        TranslationKey translationKey = translationKeyRepository.findByKeyName(keyName)
                .orElseThrow(() -> new RuntimeException("번역 키를 찾을 수 없습니다: " + keyName));

        Language language = languageRepository.findByCode(languageCode)
                .orElseThrow(() -> new RuntimeException("언어를 찾을 수 없습니다: " + languageCode));

        // 기존 번역 검색
        Optional<Translation> existingTranslation = translationRepository.findByTranslationKeyAndLanguage(translationKey, language);

        Translation translation;
        if (existingTranslation.isPresent()) {
            // 업데이트
            translation = existingTranslation.get();
            translation.setValue(value);
            if (context != null) translation.setContext(context);
            translation.setUpdatedBy(updatedBy);
            log.info("번역 업데이트됨: {} - {} = {}", keyName, languageCode, value);
        } else {
            // 새로 생성
            translation = new Translation(translationKey, language, value, updatedBy);
            if (context != null) translation.setContext(context);
            log.info("번역 생성됨: {} - {} = {}", keyName, languageCode, value);
        }

        Translation savedTranslation = translationRepository.save(translation);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        return savedTranslation;
    }

    @Transactional
    public void deleteTranslation(String translationId) {
        Translation translation = translationRepository.findById(translationId)
                .orElseThrow(() -> new RuntimeException("번역을 찾을 수 없습니다: " + translationId));

        translationRepository.delete(translation);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        log.info("번역 삭제됨: {} - {}", translation.getTranslationKey().getKeyName(), translation.getLanguage().getCode());
    }

    // ==================== 대량 작업 ====================

    @Transactional
    public Map<String, Object> batchCreateTranslations(List<Map<String, String>> translations, String updatedBy) {
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        for (Map<String, String> translationData : translations) {
            try {
                String keyName = translationData.get("keyName");
                String languageCode = translationData.get("languageCode");
                String value = translationData.get("value");
                String context = translationData.get("context");

                if (keyName == null || languageCode == null || value == null) {
                    errors.add("필수 필드 누락: keyName, languageCode, value");
                    failureCount++;
                    continue;
                }

                createOrUpdateTranslation(keyName, languageCode, value, context, updatedBy);
                successCount++;

            } catch (Exception e) {
                errors.add("번역 생성 실패: " + e.getMessage());
                failureCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("errors", errors);
        result.put("total", translations.size());

        log.info("대량 번역 생성 완료 - 성공: {}, 실패: {}", successCount, failureCount);
        return result;
    }

    @Transactional
    public void deactivateTranslation(String translationId) {
        Translation translation = translationRepository.findById(translationId)
                .orElseThrow(() -> new RuntimeException("번역을 찾을 수 없습니다: " + translationId));

        translation.setIsActive(false);
        translationRepository.save(translation);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        log.info("번역 비활성화됨: {} - {}", translation.getTranslationKey().getKeyName(), translation.getLanguage().getCode());
    }

    @Transactional
    public void activateTranslation(String translationId) {
        Translation translation = translationRepository.findById(translationId)
                .orElseThrow(() -> new RuntimeException("번역을 찾을 수 없습니다: " + translationId));

        translation.setIsActive(true);
        translationRepository.save(translation);

        // 캐시 초기화
        i18nService.clearTranslationCache();

        log.info("번역 활성화됨: {} - {}", translation.getTranslationKey().getKeyName(), translation.getLanguage().getCode());
    }

    // ==================== 조회 메서드 ====================

    public List<Language> getAllLanguages() {
        return languageRepository.findAll();
    }

    public List<TranslationKey> getAllTranslationKeys() {
        return translationKeyRepository.findAll();
    }

    public List<Translation> getAllTranslations() {
        return translationRepository.findAll();
    }

    public List<Translation> getTranslationsByLanguage(String languageCode) {
        return translationRepository.findByLanguageCode(languageCode);
    }

    public List<Translation> getTranslationsByKey(String keyName) {
        return translationRepository.findByKeyName(keyName);
    }

    public Optional<Translation> getTranslation(String keyName, String languageCode) {
        return translationRepository.findByKeyNameAndLanguageCode(keyName, languageCode);
    }

    // ==================== 번역 완성도 관리 ====================

    public Map<String, Object> getTranslationProgress(String languageCode) {
        List<TranslationKey> allKeys = translationKeyRepository.findByIsActiveTrue();
        List<TranslationKey> missingKeys = translationRepository.findMissingTranslationKeys(languageCode);

        int totalKeys = allKeys.size();
        int translatedKeys = totalKeys - missingKeys.size();
        double completionRate = totalKeys > 0 ? (double) translatedKeys / totalKeys * 100 : 0;

        Map<String, Object> progress = new HashMap<>();
        progress.put("languageCode", languageCode);
        progress.put("totalKeys", totalKeys);
        progress.put("translatedKeys", translatedKeys);
        progress.put("missingKeys", missingKeys.size());
        progress.put("completionRate", Math.round(completionRate * 100) / 100.0);
        progress.put("missingKeyList", missingKeys.stream().map(TranslationKey::getKeyName).toList());

        return progress;
    }
}