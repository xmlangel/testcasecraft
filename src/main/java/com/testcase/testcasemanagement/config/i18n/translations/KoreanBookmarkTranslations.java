// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanBookmarkTranslations.java
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

/** Korean translations - Bookmark / Favorites */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanBookmarkTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("bookmark.nav", lang, "북마크", by);
    create("bookmark.title", lang, "내 북마크", by);
    create("bookmark.readonly.hint", lang, "북마크 화면은 읽기 전용입니다. 케이스 편집은 케이스 관리 화면에서 하세요.", by);
    create("bookmark.empty.collections", lang, "북마크 모음이 없습니다.", by);
    create("bookmark.empty.items", lang, "이 모음에 담긴 케이스가 없습니다.", by);
    create("bookmark.back", lang, "뒤로", by);
    create("bookmark.itemCount", lang, "{count}개", by);

    create("bookmark.favorite.add", lang, "즐겨찾기 추가", by);
    create("bookmark.favorite.remove", lang, "즐겨찾기 제거", by);

    create("bookmark.collection.default", lang, "즐겨찾기", by);
    create("bookmark.collection.create", lang, "모음 만들기", by);
    create("bookmark.collection.name", lang, "모음 이름", by);
    create("bookmark.collection.description", lang, "설명", by);
    create("bookmark.collection.rename", lang, "이름 변경", by);
    create("bookmark.collection.delete", lang, "모음 삭제", by);
    create("bookmark.collection.deleteConfirm", lang, "이 북마크 모음을 삭제하시겠습니까? 담긴 항목도 함께 삭제됩니다.", by);
    create("bookmark.collection.defaultCannotDelete", lang, "기본 즐겨찾기 모음은 삭제할 수 없습니다.", by);
    create("bookmark.collection.duplicateName", lang, "이미 같은 이름의 북마크 모음이 있습니다.", by);

    create("bookmark.item.addToCollection", lang, "모음에 담기", by);
    create("bookmark.item.remove", lang, "모음에서 제거", by);
    create("bookmark.item.note", lang, "메모", by);
    create("bookmark.item.notePlaceholder", lang, "개인 메모를 입력하세요", by);
    create("bookmark.item.duplicate", lang, "이미 이 모음에 담긴 케이스입니다.", by);

    create("bookmark.column.name", lang, "케이스명", by);
    create("bookmark.column.priority", lang, "우선순위", by);
    create("bookmark.column.note", lang, "메모", by);
    create("bookmark.column.actions", lang, "동작", by);
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
