// src/main/java/com/testcase/testcasemanagement/service/I18nService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class I18nService {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    /**
     * 활성화된 언어 목록 조회
     */
    @Cacheable(value = "activeLanguages")
    public List<Language> getActiveLanguages() {
        return languageRepository.findActiveLanguagesOrderBySortOrder();
    }

    /**
     * 기본 언어 조회
     */
    @Cacheable(value = "defaultLanguage")
    public Language getDefaultLanguage() {
        return languageRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new RuntimeException("기본 언어가 설정되지 않았습니다"));
    }

    /**
     * 언어 코드로 언어 조회
     */
    @Cacheable(value = "languages", key = "#languageCode")
    public Optional<Language> getLanguageByCode(String languageCode) {
        return languageRepository.findByCode(languageCode);
    }

    /**
     * 특정 언어의 모든 번역을 키-값 맵으로 조회 (캐시됨)
     */
    @Cacheable(value = "translations", key = "#languageCode")
    public Map<String, String> getTranslationsMap(String languageCode) {
        try {
            List<Translation> translations = translationRepository.findByLanguageCode(languageCode);
            Map<String, String> translationMap = new HashMap<>();

            for (Translation translation : translations) {
                translationMap.put(translation.getTranslationKey().getKeyName(), translation.getValue());
            }

            log.debug("언어 {}에 대한 {}개 번역 로드됨", languageCode, translationMap.size());
            return translationMap;
        } catch (Exception e) {
            log.error("번역 맵 로딩 실패 - 언어: {}", languageCode, e);
            return new HashMap<>();
        }
    }

    /**
     * 특정 키와 언어의 번역 조회 (fallback 지원)
     */
    public String getTranslation(String keyName, String languageCode) {
        return getTranslation(keyName, languageCode, true);
    }

    /**
     * 특정 키와 언어의 번역 조회
     * @param keyName 번역 키
     * @param languageCode 언어 코드
     * @param useFallback fallback 사용 여부 (기본 언어 또는 기본값 사용)
     */
    public String getTranslation(String keyName, String languageCode, boolean useFallback) {
        Optional<Translation> translation = translationRepository.findByKeyNameAndLanguageCode(keyName, languageCode);

        if (translation.isPresent()) {
            return translation.get().getValue();
        }

        if (!useFallback) {
            return null;
        }

        // Fallback 1: 기본 언어로 시도
        Language defaultLanguage = getDefaultLanguage();
        if (!defaultLanguage.getCode().equals(languageCode)) {
            Optional<Translation> defaultTranslation = translationRepository.findByKeyNameAndLanguageCode(keyName, defaultLanguage.getCode());
            if (defaultTranslation.isPresent()) {
                log.debug("기본 언어 fallback 사용: {} -> {}", keyName, defaultLanguage.getCode());
                return defaultTranslation.get().getValue();
            }
        }

        // Fallback 2: 키의 기본값 사용
        Optional<TranslationKey> translationKey = translationKeyRepository.findByKeyName(keyName);
        if (translationKey.isPresent() && translationKey.get().getDefaultValue() != null) {
            log.debug("기본값 fallback 사용: {} -> {}", keyName, translationKey.get().getDefaultValue());
            return translationKey.get().getDefaultValue();
        }

        // Fallback 3: 키 이름 자체 반환
        log.warn("번역 없음, 키 이름 반환: {} ({})", keyName, languageCode);
        return keyName;
    }

    /**
     * 카테고리별 번역 조회
     */
    @Cacheable(value = "translationsByCategory", key = "#languageCode + '_' + #category")
    public Map<String, String> getTranslationsByCategory(String languageCode, String category) {
        List<Translation> translations = translationRepository.findByLanguageCodeAndCategory(languageCode, category);
        Map<String, String> translationMap = new HashMap<>();

        for (Translation translation : translations) {
            translationMap.put(translation.getTranslationKey().getKeyName(), translation.getValue());
        }

        return translationMap;
    }

    /**
     * 언어별 번역 완성도 통계 조회
     */
    @Cacheable(value = "translationStats")
    public List<Map<String, Object>> getTranslationCompletionStats() {
        List<Object[]> stats = translationRepository.getTranslationCompletionStats();
        return stats.stream().map(stat -> {
            Map<String, Object> statMap = new HashMap<>();
            statMap.put("languageCode", stat[0]);
            statMap.put("languageName", stat[1]);
            statMap.put("translatedCount", stat[2]);
            statMap.put("totalCount", stat[3]);

            Long translated = (Long) stat[2];
            Long total = (Long) stat[3];
            double completionRate = total > 0 ? (double) translated / total * 100 : 0;
            statMap.put("completionRate", Math.round(completionRate * 100) / 100.0);

            return statMap;
        }).toList();
    }

    /**
     * 특정 언어의 누락된 번역 키들 조회
     */
    public List<TranslationKey> getMissingTranslationKeys(String languageCode) {
        return translationRepository.findMissingTranslationKeys(languageCode);
    }

    /**
     * 캐시 초기화 (번역 데이터 변경 시 호출)
     */
    @CacheEvict(value = {"translations", "translationsByCategory", "translationStats"}, allEntries = true)
    public void clearTranslationCache() {
        log.info("번역 캐시 초기화됨");
    }

    /**
     * 언어 캐시 초기화 (언어 데이터 변경 시 호출)
     */
    @CacheEvict(value = {"activeLanguages", "defaultLanguage", "languages"}, allEntries = true)
    public void clearLanguageCache() {
        log.info("언어 캐시 초기화됨");
    }

    /**
     * 모든 캐시 초기화
     */
    @CacheEvict(value = {"activeLanguages", "defaultLanguage", "languages", "translations", "translationsByCategory", "translationStats"}, allEntries = true)
    public void clearAllCache() {
        log.info("모든 다국어 캐시 초기화됨");
    }

    /**
     * 사용자 선호 언어 검증 및 fallback
     */
    public String validateLanguageCode(String languageCode) {
        if (languageCode == null) {
            return getDefaultLanguage().getCode();
        }

        Optional<Language> language = getLanguageByCode(languageCode);
        if (language.isPresent() && language.get().getIsActive()) {
            return languageCode;
        }

        return getDefaultLanguage().getCode();
    }

    /**
     * 번역 키 검색
     */
    public List<TranslationKey> searchTranslationKeys(String keyword, String category, Boolean isActive) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return translationKeyRepository.findAll();
        }
        return translationKeyRepository.searchByKeywordAndFilters(keyword.trim(), category, isActive);
    }

    /**
     * 활성화된 카테고리 목록 조회
     */
    @Cacheable(value = "translationCategories")
    public List<String> getActiveCategories() {
        return translationKeyRepository.findAllCategories();
    }
}