// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTranslationManagementTranslations.java
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
 * English translations - Translation Management Page
 * translation.* related translations
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishTranslationManagementTranslations {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    public void initialize() {
        String languageCode = "en";
        String createdBy = "system";

        createTranslationIfNotExists("translation.keyTab.statusLabel", languageCode, "Status", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.management.exportCsv", languageCode, "Export CSV", createdBy);
        createTranslationIfNotExists("translation.management.importCsv", languageCode, "Import CSV", createdBy);
        createTranslationIfNotExists("translation.management.clearCache", languageCode, "Clear Cache", createdBy);
        createTranslationIfNotExists("translation.tabs.languageManagement", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.tabs.keyManagement", languageCode, "Translation Key Management", createdBy);
        createTranslationIfNotExists("translation.tabs.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("translation.tabs.statistics", languageCode, "Statistics", createdBy);
        createTranslationIfNotExists("translation.csvImport.dialogTitle", languageCode, "Import CSV File", createdBy);
        createTranslationIfNotExists("translation.csvImport.formatDescription", languageCode, "CSV File Format: keyName, languageCode, value, context, isActive, updatedBy, updatedAt", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteLabel", languageCode, "Overwrite Existing Translations", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteHelper", languageCode, "If checked, existing translations will be overwritten with new values. If unchecked, existing translations will be kept and only new translations will be added.", createdBy);
        createTranslationIfNotExists("translation.languageDialog.addTitle", languageCode, "Add Language", createdBy);
        createTranslationIfNotExists("translation.languageDialog.editTitle", languageCode, "Edit Language", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeLabel", languageCode, "Language Code", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeHelper", languageCode, "e.g., ko, en, ja", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderLabel", languageCode, "Sort Order", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderHelper", languageCode, "Sort order must be 0 or greater", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameLabel", languageCode, "Language Name", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameHelper", languageCode, "e.g., Korean, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameLabel", languageCode, "Native Name", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameHelper", languageCode, "e.g., 한국어, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isDefaultLabel", languageCode, "Set as Default Language", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.languageDialog.defaultLanguageWarning", languageCode, "Setting as default language will unset default for other languages.", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeRequired", languageCode, "Language code is required", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeFormat", languageCode, "Language code must be 2-3 lowercase letters", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameRequired", languageCode, "Language name is required", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameRequired", languageCode, "Native name is required", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderMin", languageCode, "Sort order must be 0 or greater", createdBy);
        createTranslationIfNotExists("translation.keyDialog.addTitle", languageCode, "Add Translation Key", createdBy);
        createTranslationIfNotExists("translation.keyDialog.editTitle", languageCode, "Edit Translation Key", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameLabel", languageCode, "Key Name", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameHelper", languageCode, "e.g., login.title, button.submit", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameFormat", languageCode, "Key name must start with a letter and contain only letters, numbers, dots, or underscores", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryLabel", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.login", languageCode, "Login", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.register", languageCode, "Register", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "Button", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "Message", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.validation", languageCode, "Validation", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.navigation", languageCode, "Navigation", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.form", languageCode, "Form", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "Success", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.common", languageCode, "Common", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "Describe where this key is used", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueLabel", languageCode, "Default Value", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueHelper", languageCode, "Default text to display if no translation exists", createdBy);
        createTranslationIfNotExists("translation.keyDialog.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameRequired", languageCode, "Key name is required", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryRequired", languageCode, "Please select a category", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionRequired", languageCode, "Description is required", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueRequired", languageCode, "Default value is required", createdBy);
        createTranslationIfNotExists("translation.translationDialog.addTitle", languageCode, "Add Translation", createdBy);
        createTranslationIfNotExists("translation.translationDialog.editTitle", languageCode, "Edit Translation", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyLabel", languageCode, "Translation Key", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageLabel", languageCode, "Language", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyDescription", languageCode, "Key Description", createdBy);
        createTranslationIfNotExists("translation.translationDialog.defaultValue", languageCode, "Default Value", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueLabel", languageCode, "Translation Value", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueHelper", languageCode, "Enter the text to display in this language", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextLabel", languageCode, "Context", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextHelper", languageCode, "Describe the context or usage of the translation (optional)", createdBy);
        createTranslationIfNotExists("translation.translationDialog.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyRequired", languageCode, "Please select a translation key", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageRequired", languageCode, "Please select a language", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueRequired", languageCode, "Translation value is required", createdBy);
        createTranslationIfNotExists("translation.languageTab.listTitle", languageCode, "Language List", createdBy);
        createTranslationIfNotExists("translation.languageTab.addLanguage", languageCode, "Add Language", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.code", languageCode, "Language Code", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "Language Name", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.nativeName", languageCode, "Native Name", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isDefault", languageCode, "Default Language", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isActive", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.sortOrder", languageCode, "Sort Order", createdBy);
        createTranslationIfNotExists("translation.languageTab.deleteConfirm", languageCode, "Are you sure you want to delete this language?", createdBy);
        createTranslationIfNotExists("translation.keyTab.listTitle", languageCode, "Translation Key List", createdBy);
        createTranslationIfNotExists("translation.keyTab.addKey", languageCode, "Add Translation Key", createdBy);
        createTranslationIfNotExists("translation.keyTab.categoryLabel", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.keyTab.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.keyName", languageCode, "Key Name", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.defaultValue", languageCode, "Default Value", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.isActive", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.keyTab.deleteConfirm", languageCode, "Are you sure you want to delete this translation key?", createdBy);
        createTranslationIfNotExists("translation.translationTab.listTitle", languageCode, "Translation List", createdBy);
        createTranslationIfNotExists("translation.translationTab.exportCsvByLanguage", languageCode, "{languageCode} Export CSV", createdBy);
        createTranslationIfNotExists("translation.translationTab.addTranslation", languageCode, "Add Translation", createdBy);
        createTranslationIfNotExists("translation.translationTab.languageLabel", languageCode, "Language", createdBy);
        createTranslationIfNotExists("translation.translationTab.keyNameLabel", languageCode, "Translation Key Name", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.keyName", languageCode, "Translation Key", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.language", languageCode, "Language", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "Translation Value", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.context", languageCode, "Context", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.isActive", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.updatedBy", languageCode, "Updated By", createdBy);
        createTranslationIfNotExists("translation.translationTab.deleteConfirm", languageCode, "Are you sure you want to delete this translation?", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "Translation Completion Statistics", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.completionRateLabel", languageCode, "Completion Rate", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.translatedCountLabel", languageCode, "Translated", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.totalCountLabel", languageCode, "Total", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.management.exportCsv", languageCode, "Export CSV", createdBy);
        createTranslationIfNotExists("translation.management.importCsv", languageCode, "Import CSV", createdBy);
        createTranslationIfNotExists("translation.management.clearCache", languageCode, "Clear Cache", createdBy);
        createTranslationIfNotExists("translation.tabs.languageManagement", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.tabs.keyManagement", languageCode, "Translation Key Management", createdBy);
        createTranslationIfNotExists("translation.tabs.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("translation.tabs.statistics", languageCode, "Statistics", createdBy);
        createTranslationIfNotExists("translation.csvImport.dialogTitle", languageCode, "Import CSV File", createdBy);
        createTranslationIfNotExists("translation.csvImport.formatDescription", languageCode, "CSV File Format: keyName, languageCode, value, context, isActive, updatedBy, updatedAt", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteLabel", languageCode, "Overwrite Existing Translations", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteHelper", languageCode, "If checked, existing translations will be overwritten with new values. If unchecked, existing translations will be kept and only new translations will be added.", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "Button", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "Enter description for the translation key", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "Message", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "Language Name", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "Translation Value", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "Translation Statistics", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "Success", createdBy);
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
                    log.debug("Translation created: {} - {}", keyName, languageCode);
                } else {
                    Translation existingTranslation = existingTranslationOpt.get();
                    if (!existingTranslation.getValue().equals(value)) {
                        existingTranslation.setValue(value);
                        existingTranslation.setUpdatedBy(createdBy);
                        translationRepository.save(existingTranslation);
                        log.debug("Translation updated: {} - {}", keyName, languageCode);
                    } else {
                        log.debug("Translation exists and is identical: {} - {}", keyName, languageCode);
                    }
                }
            }
        } else {
            log.warn("Translation key not found: {}", keyName);
        }
    }
}
