// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/BookmarkKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 즐겨찾기/개인 북마크 기능 번역 키 초기화. */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookmarkKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // 진입점/공통
    createKey("bookmark.nav", "북마크 네비게이션 라벨", "북마크");
    createKey("bookmark.title", "내 북마크 페이지 제목", "내 북마크");
    createKey("bookmark.readonly.hint", "읽기 전용 안내", "북마크 화면은 읽기 전용입니다. 케이스 편집은 케이스 관리 화면에서 하세요.");
    createKey("bookmark.empty.collections", "모음 없음 메시지", "북마크 모음이 없습니다.");
    createKey("bookmark.empty.items", "항목 없음 메시지", "이 모음에 담긴 케이스가 없습니다.");
    createKey("bookmark.back", "뒤로 버튼", "뒤로");
    createKey("bookmark.itemCount", "항목 수 표시", "{count}개");

    // 별 버튼(즐겨찾기 토글)
    createKey("bookmark.favorite.add", "즐겨찾기 추가 툴팁", "즐겨찾기 추가");
    createKey("bookmark.favorite.remove", "즐겨찾기 제거 툴팁", "즐겨찾기 제거");

    // 모음(Collection)
    createKey("bookmark.collection.default", "기본 모음 라벨", "즐겨찾기");
    createKey("bookmark.collection.create", "모음 만들기", "모음 만들기");
    createKey("bookmark.collection.name", "모음 이름 라벨", "모음 이름");
    createKey("bookmark.collection.description", "모음 설명 라벨", "설명");
    createKey("bookmark.collection.rename", "모음 이름 변경", "이름 변경");
    createKey("bookmark.collection.delete", "모음 삭제", "모음 삭제");
    createKey(
        "bookmark.collection.deleteConfirm", "모음 삭제 확인", "이 북마크 모음을 삭제하시겠습니까? 담긴 항목도 함께 삭제됩니다.");
    createKey("bookmark.collection.defaultCannotDelete", "기본 모음 삭제 불가", "기본 즐겨찾기 모음은 삭제할 수 없습니다.");
    createKey("bookmark.collection.duplicateName", "이름 중복", "이미 같은 이름의 북마크 모음이 있습니다.");

    // 항목(Item)
    createKey("bookmark.item.addToCollection", "모음에 담기", "모음에 담기");
    createKey("bookmark.item.remove", "모음에서 제거", "모음에서 제거");
    createKey("bookmark.item.note", "메모 라벨", "메모");
    createKey("bookmark.item.notePlaceholder", "메모 입력 안내", "개인 메모를 입력하세요");
    createKey("bookmark.item.duplicate", "케이스 중복", "이미 이 모음에 담긴 케이스입니다.");

    // 컬럼
    createKey("bookmark.column.name", "케이스명 컬럼", "케이스명");
    createKey("bookmark.column.priority", "우선순위 컬럼", "우선순위");
    createKey("bookmark.column.note", "메모 컬럼", "메모");
    createKey("bookmark.column.actions", "동작 컬럼", "동작");
  }

  private void createKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "bookmark", description, defaultValue));
      log.debug("번역 키 생성: {}", keyName);
    }
  }
}
