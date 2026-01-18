// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanTranslationManagementTranslations.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 한국어 번역 - 번역 관리 페이지 전용
 * translation.* 관련 번역들
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanTranslationManagementTranslations {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    public void initialize() {
        String languageCode = "ko";
        String createdBy = "system";

        createTranslationIfNotExists("translation.keyTab.statusLabel", languageCode, "상태", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "다국어 관리", createdBy);
        createTranslationIfNotExists("translation.management.exportCsv", languageCode, "CSV 내보내기", createdBy);
        createTranslationIfNotExists("translation.management.importCsv", languageCode, "CSV 가져오기", createdBy);
        createTranslationIfNotExists("translation.management.clearCache", languageCode, "캐시 초기화", createdBy);
        createTranslationIfNotExists("translation.tabs.languageManagement", languageCode, "언어 관리", createdBy);
        createTranslationIfNotExists("translation.tabs.keyManagement", languageCode, "번역 키 관리", createdBy);
        createTranslationIfNotExists("translation.tabs.translationManagement", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("translation.tabs.statistics", languageCode, "통계", createdBy);
        createTranslationIfNotExists("translation.csvImport.dialogTitle", languageCode, "CSV 파일 가져오기", createdBy);
        createTranslationIfNotExists("translation.csvImport.formatDescription", languageCode, "CSV 파일 형식: keyName, languageCode, value, context, isActive, updatedBy, updatedAt", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteLabel", languageCode, "기존 번역 덮어쓰기", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteHelper", languageCode, "체크하면 기존 번역이 있는 경우 새 값으로 덮어씁니다. 체크하지 않으면 기존 번역은 그대로 두고 새로운 번역만 추가합니다.", createdBy);
        createTranslationIfNotExists("translation.languageDialog.addTitle", languageCode, "언어 추가", createdBy);
        createTranslationIfNotExists("translation.languageDialog.editTitle", languageCode, "언어 편집", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeLabel", languageCode, "언어 코드", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeHelper", languageCode, "예: ko, en, ja", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderLabel", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderHelper", languageCode, "정렬 순서는 0 이상이어야 합니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameLabel", languageCode, "언어명", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameHelper", languageCode, "예: 한국어, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameLabel", languageCode, "원어명", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameHelper", languageCode, "예: 한국어, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isDefaultLabel", languageCode, "기본 언어로 설정", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.languageDialog.defaultLanguageWarning", languageCode, "기본 언어로 설정하면 다른 언어들의 기본 설정이 해제됩니다.", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeRequired", languageCode, "언어 코드는 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeFormat", languageCode, "언어 코드는 2-3자의 소문자여야 합니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameRequired", languageCode, "언어명은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameRequired", languageCode, "원어명은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderMin", languageCode, "정렬 순서는 0 이상이어야 합니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.addTitle", languageCode, "번역 키 추가", createdBy);
        createTranslationIfNotExists("translation.keyDialog.editTitle", languageCode, "번역 키 편집", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameLabel", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameHelper", languageCode, "예: login.title, button.submit", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameFormat", languageCode, "키 이름은 영문자로 시작하며 영문자, 숫자, 점, 언더스코어만 사용 가능합니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryLabel", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.login", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.register", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "버튼", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "메시지", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.validation", languageCode, "검증", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.navigation", languageCode, "네비게이션", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.form", languageCode, "폼", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "오류", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.common", languageCode, "공통", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "이 키가 어디에 사용되는지 설명해주세요", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueLabel", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueHelper", languageCode, "번역이 없을 때 표시될 기본 텍스트", createdBy);
        createTranslationIfNotExists("translation.keyDialog.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameRequired", languageCode, "키 이름은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryRequired", languageCode, "카테고리를 선택해주세요", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionRequired", languageCode, "설명은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueRequired", languageCode, "기본값은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.translationDialog.addTitle", languageCode, "번역 추가", createdBy);
        createTranslationIfNotExists("translation.translationDialog.editTitle", languageCode, "번역 편집", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyLabel", languageCode, "번역 키", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageLabel", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyDescription", languageCode, "키 설명", createdBy);
        createTranslationIfNotExists("translation.translationDialog.defaultValue", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueLabel", languageCode, "번역값", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueHelper", languageCode, "이 언어로 표시될 텍스트를 입력하세요", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextLabel", languageCode, "컨텍스트", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextHelper", languageCode, "번역의 맥락이나 사용 상황을 설명해주세요 (선택사항)", createdBy);
        createTranslationIfNotExists("translation.translationDialog.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyRequired", languageCode, "번역 키를 선택해주세요", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageRequired", languageCode, "언어를 선택해주세요", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueRequired", languageCode, "번역값은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageTab.listTitle", languageCode, "언어 목록", createdBy);
        createTranslationIfNotExists("translation.languageTab.addLanguage", languageCode, "언어 추가", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.code", languageCode, "언어 코드", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "언어명", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.nativeName", languageCode, "원어명", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isDefault", languageCode, "기본 언어", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.sortOrder", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("translation.languageTab.deleteConfirm", languageCode, "정말로 이 언어를 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("translation.keyTab.listTitle", languageCode, "번역 키 목록", createdBy);
        createTranslationIfNotExists("translation.keyTab.addKey", languageCode, "번역 키 추가", createdBy);
        createTranslationIfNotExists("translation.keyTab.categoryLabel", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.keyTab.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.keyName", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.defaultValue", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.keyTab.deleteConfirm", languageCode, "정말로 이 번역 키를 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("translation.translationTab.listTitle", languageCode, "번역 목록", createdBy);
        createTranslationIfNotExists("translation.translationTab.exportCsvByLanguage", languageCode, "{languageCode} CSV 내보내기", createdBy);
        createTranslationIfNotExists("translation.translationTab.addTranslation", languageCode, "번역 추가", createdBy);
        createTranslationIfNotExists("translation.translationTab.languageLabel", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationTab.keyNameLabel", languageCode, "번역 키 이름", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.keyName", languageCode, "번역 키", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.language", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "번역값", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.context", languageCode, "컨텍스트", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.updatedBy", languageCode, "수정자", createdBy);
        createTranslationIfNotExists("translation.translationTab.deleteConfirm", languageCode, "정말로 이 번역을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "번역 완성도 통계", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.completionRateLabel", languageCode, "완성도", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.translatedCountLabel", languageCode, "번역됨", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.totalCountLabel", languageCode, "전체", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "버튼", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "번역 키에 대한 설명을 입력하세요", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "메시지", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "언어명", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "번역값", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "번역 통계", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "에러", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderLabel", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderHelper", languageCode, "언어 표시 순서를 입력하세요", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.validation", languageCode, "검증", createdBy);
        createTranslationIfNotExists("translation.keyTab.listTitle", languageCode, "번역 키 목록", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.keyName", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.languageTab.listTitle", languageCode, "언어 목록", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.code", languageCode, "언어 코드", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.nativeName", languageCode, "원어명", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isDefault", languageCode, "기본 언어", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.sortOrder", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.defaultValue", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.translationTab.listTitle", languageCode, "번역 목록", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.keyName", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.language", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.context", languageCode, "컨텍스트", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.updatedBy", languageCode, "수정자", createdBy);
    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
        if (translationKeyOpt.isPresent()) {
            TranslationKey translationKey = translationKeyOpt.get();
            Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
            if (languageOpt.isPresent()) {
                Language language = languageOpt.get();
                Optional<Translation> existingTranslationOpt = translationRepository.findByTranslationKeyAndLanguage(translationKey, language);
                if (existingTranslationOpt.isEmpty()) {
                    Translation translation = new Translation();
                    translation.setTranslationKey(translationKey);
                    translation.setLanguage(language);
                    translation.setValue(value);
                    translation.setCreatedBy(createdBy);
                    translation.setUpdatedBy(createdBy);
                    translation.setIsActive(true);
                    translationRepository.save(translation);
                    log.debug("번역 생성: {} - {}", keyName, languageCode);
                } else {
                    Translation existingTranslation = existingTranslationOpt.get();
                    if (!existingTranslation.getValue().equals(value)) {
                        existingTranslation.setValue(value);
                        existingTranslation.setUpdatedBy(createdBy);
                        translationRepository.save(existingTranslation);
                        log.debug("번역 업데이트: {} - {}", keyName, languageCode);
                    } else {
                        log.debug("번역 이미 존재하며 동일함: {} - {}", keyName, languageCode);
                    }
                }
            }
        } else {
            log.warn("번역 키를 찾을 수 없음: {}", keyName);
        }
    }
}
