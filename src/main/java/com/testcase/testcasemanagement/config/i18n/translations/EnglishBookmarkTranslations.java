// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishBookmarkTranslations.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** English translations - Bookmark / Favorites */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishBookmarkTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "en";
    String by = "system";

    create("bookmark.nav", lang, "Bookmarks", by);
    create("bookmark.title", lang, "My Bookmarks", by);
    create(
        "bookmark.readonly.hint",
        lang,
        "The bookmark view is read-only. Edit test cases from the test case management screen.",
        by);
    create("bookmark.empty.collections", lang, "No bookmark collections yet.", by);
    create("bookmark.empty.items", lang, "No test cases in this collection.", by);
    create("bookmark.back", lang, "Back", by);
    create("bookmark.itemCount", lang, "{count}", by);

    create("bookmark.favorite.add", lang, "Add to favorites", by);
    create("bookmark.favorite.remove", lang, "Remove from favorites", by);

    create("bookmark.collection.default", lang, "Favorites", by);
    create("bookmark.collection.create", lang, "New Collection", by);
    create("bookmark.collection.name", lang, "Collection Name", by);
    create("bookmark.collection.description", lang, "Description", by);
    create("bookmark.collection.rename", lang, "Rename", by);
    create("bookmark.collection.delete", lang, "Delete Collection", by);
    create(
        "bookmark.collection.deleteConfirm",
        lang,
        "Delete this bookmark collection? Its items will also be removed.",
        by);
    create(
        "bookmark.collection.defaultCannotDelete",
        lang,
        "The default favorites collection cannot be deleted.",
        by);
    create(
        "bookmark.collection.duplicateName",
        lang,
        "A bookmark collection with this name already exists.",
        by);

    create("bookmark.item.addToCollection", lang, "Add to collection", by);
    create("bookmark.item.remove", lang, "Remove from collection", by);
    create("bookmark.item.note", lang, "Note", by);
    create("bookmark.item.notePlaceholder", lang, "Enter a personal note", by);
    create("bookmark.item.duplicate", lang, "This test case is already in the collection.", by);

    create("bookmark.column.name", lang, "Test Case", by);
    create("bookmark.column.priority", lang, "Priority", by);
    create("bookmark.column.note", lang, "Note", by);
    create("bookmark.column.actions", lang, "Actions", by);
  }

  private void create(String keyName, String languageCode, String value, String createdBy) {
    Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
    if (translationKeyOpt.isPresent()) {
      TranslationKey translationKey = translationKeyOpt.get();
      Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
      if (languageOpt.isPresent()) {
        Language language = languageOpt.get();
        Optional<Translation> existing =
            translationRepository.findByTranslationKeyAndLanguage(translationKey, language);
        if (existing.isEmpty()) {
          Translation translation = new Translation();
          translation.setTranslationKey(translationKey);
          translation.setLanguage(language);
          translation.setValue(value);
          translation.setCreatedBy(createdBy);
          translation.setUpdatedBy(createdBy);
          translation.setIsActive(true);
          translationRepository.save(translation);
        }
      }
    }
  }
}
