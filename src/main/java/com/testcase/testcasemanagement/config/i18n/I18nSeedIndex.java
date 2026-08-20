package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 시딩용 조회 색인. 키 이름·언어 코드·번역값을 처음 한 번만 읽어 메모리에 담고, 그 뒤로는 항목마다 DB 를 묻지 않는다.
 *
 * <p>왜 필요한가 — 시딩 헬퍼는 항목 하나에 조회를 세 번 했다. 키 이름으로 키를 찾고, 언어 코드로 언어를 찾고(회차 안에서 늘 같은 값이다), 그 둘로 기존 번역을
 * 찾는다. 번역 7,351건이면 조회가 2만 번을 넘는다.
 *
 * <p>담는 것은 <b>문자열뿐</b>이다. 엔티티를 담으면 {@code EntityManager.clear()} 뒤에 detach 되어 새 번역의 연관 대상으로 쓸 수 없다.
 * 외래키를 채울 때는 {@code getReference} 로 프록시를 만든다 — 조회가 나가지 않고, 두 연관에 cascade 가 없어 detach 문제도 생기지 않는다.
 *
 * <p>같은 트랜잭션 안에서 새로 만든 것도 색인에 반영한다. 키를 만든 직후 그 키에 값을 붙이는 순서로 시딩이 돌아가므로, 반영하지 않으면 방금 만든 키를 못 찾는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class I18nSeedIndex {

  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  @PersistenceContext private EntityManager entityManager;

  private final Map<String, String> keyIdByName = new HashMap<>();
  private final Map<String, String> languageIdByCode = new HashMap<>();

  /** "keyId|languageId" → 번역 행 id. */
  private final Map<String, String> translationIdByPair = new HashMap<>();

  /** "keyId|languageId" → 현재 값. 값이 같으면 쓰지 않기 위해 들고 있는다. */
  private final Map<String, String> valueByPair = new HashMap<>();

  private boolean loaded = false;

  /** 번역 upsert 결과. 호출한 쪽이 자기 로그 문구를 유지할 수 있게 구분해 돌려준다. */
  public enum UpsertResult {
    CREATED,
    UPDATED,
    UNCHANGED,
    KEY_MISSING,
    LANGUAGE_MISSING
  }

  private void ensureLoaded() {
    if (loaded) {
      return;
    }
    long started = System.currentTimeMillis();

    List<Object[]> keys =
        entityManager
            .createQuery("select k.id, k.keyName from TranslationKey k", Object[].class)
            .getResultList();
    for (Object[] row : keys) {
      keyIdByName.put((String) row[1], (String) row[0]);
    }

    List<Object[]> languages =
        entityManager
            .createQuery("select l.id, l.code from Language l", Object[].class)
            .getResultList();
    for (Object[] row : languages) {
      languageIdByCode.put((String) row[1], (String) row[0]);
    }

    List<Object[]> translations =
        entityManager
            .createQuery(
                "select t.id, t.translationKey.id, t.language.id, t.value from Translation t",
                Object[].class)
            .getResultList();
    for (Object[] row : translations) {
      String pair = row[1] + "|" + row[2];
      translationIdByPair.put(pair, (String) row[0]);
      valueByPair.put(pair, (String) row[3]);
    }

    loaded = true;
    log.info(
        "i18n 시딩 색인 적재: 키 {} · 언어 {} · 번역 {} ({}ms)",
        keyIdByName.size(),
        languageIdByCode.size(),
        translationIdByPair.size(),
        System.currentTimeMillis() - started);
  }

  /** 언어 데이터를 새로 넣은 뒤처럼 색인 밖에서 행이 늘어난 경우에 다시 읽는다. */
  public void reset() {
    keyIdByName.clear();
    languageIdByCode.clear();
    translationIdByPair.clear();
    valueByPair.clear();
    loaded = false;
  }

  /**
   * 키가 없으면 만든다.
   *
   * @return 새로 만들었으면 true, 이미 있었으면 false
   */
  public boolean createKeyIfAbsent(
      String keyName, String category, String description, String defaultValue) {
    ensureLoaded();
    if (keyIdByName.containsKey(keyName)) {
      return false;
    }
    TranslationKey saved =
        translationKeyRepository.save(
            new TranslationKey(keyName, category, description, defaultValue));
    keyIdByName.put(keyName, saved.getId());
    return true;
  }

  /**
   * 번역을 넣거나 값이 달라졌으면 고친다.
   *
   * @param updateExisting 기존 값을 덮어쓸지. i18n gap 계열 초기화는 덮어쓰지 않는 것이 원래 동작이라 false 로 부른다.
   */
  public UpsertResult upsertTranslation(
      String keyName, String languageCode, String value, String createdBy, boolean updateExisting) {
    ensureLoaded();

    String keyId = keyIdByName.get(keyName);
    if (keyId == null) {
      return UpsertResult.KEY_MISSING;
    }
    String languageId = languageIdByCode.get(languageCode);
    if (languageId == null) {
      return UpsertResult.LANGUAGE_MISSING;
    }

    String pair = keyId + "|" + languageId;
    String existingId = translationIdByPair.get(pair);

    if (existingId == null) {
      Translation translation = new Translation();
      translation.setTranslationKey(entityManager.getReference(TranslationKey.class, keyId));
      translation.setLanguage(entityManager.getReference(Language.class, languageId));
      translation.setValue(value);
      translation.setCreatedBy(createdBy);
      translation.setUpdatedBy(createdBy);
      translation.setIsActive(true);
      Translation saved = translationRepository.save(translation);
      translationIdByPair.put(pair, saved.getId());
      valueByPair.put(pair, value);
      return UpsertResult.CREATED;
    }

    if (!updateExisting || Objects.equals(valueByPair.get(pair), value)) {
      return UpsertResult.UNCHANGED;
    }

    Translation existing = translationRepository.findById(existingId).orElse(null);
    if (existing == null) {
      // 색인과 DB 가 어긋난 경우. 색인을 맞추고 다음 회차에 다시 만들게 둔다.
      translationIdByPair.remove(pair);
      valueByPair.remove(pair);
      return UpsertResult.UNCHANGED;
    }
    existing.setValue(value);
    existing.setUpdatedBy(createdBy);
    translationRepository.save(existing);
    valueByPair.put(pair, value);
    return UpsertResult.UPDATED;
  }
}
