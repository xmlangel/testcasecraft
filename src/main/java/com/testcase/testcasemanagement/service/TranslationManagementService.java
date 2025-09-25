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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
        // 입력 값 유효성 검사
        if (keyName == null || keyName.trim().isEmpty()) {
            throw new IllegalArgumentException("번역 키 이름은 필수입니다");
        }
        if (languageCode == null || languageCode.trim().isEmpty()) {
            throw new IllegalArgumentException("언어 코드는 필수입니다");
        }
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("번역 값은 필수입니다");
        }
        if (updatedBy == null || updatedBy.trim().isEmpty()) {
            throw new IllegalArgumentException("수정자 정보는 필수입니다");
        }

        TranslationKey translationKey = translationKeyRepository.findByKeyName(keyName.trim())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 번역 키입니다: " + keyName));

        if (!translationKey.getIsActive()) {
            throw new IllegalStateException("비활성화된 번역 키입니다: " + keyName);
        }

        Language language = languageRepository.findByCode(languageCode.trim())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 언어 코드입니다: " + languageCode));

        if (!language.getIsActive()) {
            throw new IllegalStateException("비활성화된 언어입니다: " + languageCode);
        }

        // 기존 번역 검색
        Optional<Translation> existingTranslation = translationRepository.findByTranslationKeyAndLanguage(translationKey, language);

        Translation translation;
        boolean isUpdate = existingTranslation.isPresent();

        if (isUpdate) {
            // 업데이트
            translation = existingTranslation.get();

            // 기존 값과 동일한지 확인 (불필요한 업데이트 방지)
            if (value.equals(translation.getValue()) &&
                Objects.equals(context, translation.getContext())) {
                log.debug("번역 값이 기존과 동일함. 업데이트 건너뜀: {} - {}", keyName, languageCode);
                return translation;
            }

            translation.setValue(value.trim());
            if (context != null && !context.trim().isEmpty()) {
                translation.setContext(context.trim());
            } else {
                translation.setContext(null);
            }
            translation.setUpdatedBy(updatedBy);
            translation.setUpdatedAt(LocalDateTime.now());

            log.info("번역 업데이트됨: {} - {} = '{}'", keyName, languageCode, value);
        } else {
            // 새로 생성
            translation = new Translation(translationKey, language, value.trim(), updatedBy);
            if (context != null && !context.trim().isEmpty()) {
                translation.setContext(context.trim());
            }

            log.info("번역 생성됨: {} - {} = '{}'", keyName, languageCode, value);
        }

        try {
            Translation savedTranslation = translationRepository.save(translation);

            // 캐시 초기화
            i18nService.clearTranslationCache();

            log.debug("번역 저장 완료: ID={}, Key={}, Lang={}",
                     savedTranslation.getId(), keyName, languageCode);
            return savedTranslation;

        } catch (Exception e) {
            log.error("번역 저장 중 데이터베이스 오류: {} - {} = '{}', Error: {}",
                     keyName, languageCode, value, e.getMessage());

            if (e.getMessage() != null && e.getMessage().contains("constraint")) {
                throw new IllegalStateException("데이터베이스 제약조건 위반: 이미 동일한 번역이 존재할 수 있습니다");
            }

            throw new RuntimeException("번역 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
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

    // ==================== CSV Import/Export ====================

    /**
     * 번역 데이터를 CSV 형태로 내보내기
     */
    public String exportTranslationsAsCsv(String languageCode) {
        List<Translation> translations;

        if (languageCode != null) {
            translations = translationRepository.findByLanguageCode(languageCode);
        } else {
            translations = translationRepository.findAll();
        }

        StringBuilder csv = new StringBuilder();
        csv.append("keyName,languageCode,value,context,isActive,updatedBy,updatedAt\n");

        for (Translation translation : translations) {
            csv.append(escapeCsv(translation.getTranslationKey().getKeyName()))
               .append(",")
               .append(escapeCsv(translation.getLanguage().getCode()))
               .append(",")
               .append(escapeCsv(translation.getValue()))
               .append(",")
               .append(escapeCsv(translation.getContext()))
               .append(",")
               .append(translation.getIsActive())
               .append(",")
               .append(escapeCsv(translation.getUpdatedBy()))
               .append(",")
               .append(translation.getUpdatedAt())
               .append("\n");
        }

        return csv.toString();
    }

    /**
     * CSV 파일에서 번역 데이터 가져오기
     */
    @Transactional
    public Map<String, Object> importTranslationsFromCsv(InputStream csvInputStream, boolean overwrite, String updatedBy) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int skippedCount = 0;
        int errorCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvInputStream, "UTF-8"))) {
            String line;
            boolean isFirstLine = true;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                // 헤더 라인 스킵
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                // 빈 라인 스킵
                if (line.trim().isEmpty()) {
                    continue;
                }

                try {
                    String[] fields = parseCsvLine(line);
                    if (fields.length < 3) {
                        errors.add("라인 " + lineNumber + ": 필수 필드가 부족합니다 (keyName, languageCode, value)");
                        errorCount++;
                        continue;
                    }

                    String keyName = fields[0].trim();
                    String languageCode = fields[1].trim();
                    String value = fields[2].trim();
                    String context = fields.length > 3 ? fields[3].trim() : null;
                    Boolean isActive = fields.length > 4 ? Boolean.parseBoolean(fields[4].trim()) : true;

                    // 필수 필드 검증
                    if (keyName.isEmpty() || languageCode.isEmpty() || value.isEmpty()) {
                        errors.add("라인 " + lineNumber + ": 필수 필드가 비어있습니다");
                        errorCount++;
                        continue;
                    }

                    // 언어 코드 존재 확인
                    if (!languageRepository.existsByCode(languageCode)) {
                        errors.add("라인 " + lineNumber + ": 존재하지 않는 언어 코드입니다: " + languageCode);
                        errorCount++;
                        continue;
                    }

                    // 번역 키 존재 확인 및 생성
                    TranslationKey translationKey = translationKeyRepository.findByKeyName(keyName)
                            .orElseGet(() -> {
                                TranslationKey newKey = new TranslationKey(keyName, null, "CSV에서 가져온 키", null);
                                return translationKeyRepository.save(newKey);
                            });

                    // 기존 번역 확인
                    Optional<Translation> existingTranslation = translationRepository.findByKeyNameAndLanguageCode(keyName, languageCode);

                    if (existingTranslation.isPresent()) {
                        if (overwrite) {
                            Translation translation = existingTranslation.get();
                            translation.setValue(value);
                            translation.setContext(context);
                            translation.setIsActive(isActive);
                            translation.setUpdatedBy(updatedBy);
                            translation.setUpdatedAt(LocalDateTime.now());
                            translationRepository.save(translation);
                            successCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        // Find Language
                        Language language = languageRepository.findByCode(languageCode)
                            .orElseThrow(() -> new RuntimeException("언어를 찾을 수 없습니다: " + languageCode));

                        Translation newTranslation = new Translation();
                        newTranslation.setTranslationKey(translationKey);
                        newTranslation.setLanguage(language);
                        newTranslation.setValue(value);
                        newTranslation.setContext(context);
                        newTranslation.setIsActive(isActive);
                        newTranslation.setUpdatedBy(updatedBy);
                        newTranslation.setUpdatedAt(LocalDateTime.now());
                        translationRepository.save(newTranslation);
                        successCount++;
                    }

                } catch (Exception e) {
                    errors.add("라인 " + lineNumber + ": " + e.getMessage());
                    errorCount++;
                }
            }

            // 결과 반환
            result.put("success", errorCount == 0);
            result.put("successCount", successCount);
            result.put("skippedCount", skippedCount);
            result.put("errorCount", errorCount);
            result.put("errors", errors);
            result.put("message", String.format(
                "처리 완료: %d개 성공, %d개 스킵, %d개 오류",
                successCount, skippedCount, errorCount
            ));

            // 성공적으로 처리된 경우 캐시 초기화
            if (successCount > 0) {
                i18nService.clearAllCache();
            }

        } catch (IOException e) {
            result.put("success", false);
            result.put("message", "CSV 파일 읽기 중 오류가 발생했습니다: " + e.getMessage());
        }

        return result;
    }

    /**
     * CSV 필드 값 이스케이프 처리
     */
    private String escapeCsv(String field) {
        if (field == null) {
            return "";
        }

        // 쌍따옴표, 쉼표, 줄바꿈이 포함된 경우 쌍따옴표로 감싸고 내부 쌍따옴표는 두 번 연속으로 표시
        if (field.contains("\"") || field.contains(",") || field.contains("\n") || field.contains("\r")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }

        return field;
    }

    /**
     * CSV 라인 파싱 (쌍따옴표로 감싸진 필드 지원)
     */
    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder currentField = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    // 연속된 쌍따옴표는 하나의 쌍따옴표로 처리
                    currentField.append('"');
                    i++; // 다음 쌍따옴표도 건너뛰기
                } else {
                    // 쌍따옴표 토글
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                // 쌍따옴표 밖의 쉼표는 필드 구분자
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }

        // 마지막 필드 추가
        fields.add(currentField.toString());

        return fields.toArray(new String[0]);
    }
}