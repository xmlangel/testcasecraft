// src/main/java/com/testcase/testcasemanagement/util/LabelTable.java
package com.testcase.testcasemanagement.util;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * ICT-473·474: 서버가 만드는 문구(내보내기 파일, Jira 댓글)의 번역 키 표.
 *
 * <p>키 접두사 하나와 항목 목록을 묶는다. 번역 키 등록과 한국어·영어 시드, 문구를 쓰는 서비스가 모두 같은 표를 읽으므로 문구를 고칠 때 표만 고치면 된다. 번역 DB
 * 를 쓸 수 없거나 값이 비어 있으면 표에 적힌 값을 쓴다.
 */
public final class LabelTable {

  /** 번역 키 하나. {@code key} 는 접두사를 뺀 이름이다. */
  public record Entry(String key, String description, String ko, String en) {}

  private final String prefix;
  private final List<Entry> entries;
  private final Map<String, Entry> byKey;

  public LabelTable(String prefix, List<Entry> entries) {
    this.prefix = prefix;
    this.entries = List.copyOf(entries);
    Map<String, Entry> map = new LinkedHashMap<>();
    for (Entry e : entries) {
      if (map.put(e.key(), e) != null) {
        throw new IllegalStateException("Duplicate label: " + prefix + e.key());
      }
    }
    this.byKey = Collections.unmodifiableMap(map);
  }

  public String prefix() {
    return prefix;
  }

  public List<Entry> entries() {
    return entries;
  }

  public String fullKey(Entry e) {
    return prefix + e.key();
  }

  /** 번역을 찾지 못했을 때 쓸 값. 영어면 영어, 그 밖에는 한국어. 표에 없는 키는 키 이름을 돌려준다. */
  public String fallback(String key, String languageCode) {
    Entry e = byKey.get(key);
    if (e == null) return key;
    return "en".equalsIgnoreCase(languageCode) ? e.en() : e.ko();
  }

  /** 언어를 정해 문구 묶음을 만든다. {@code translations} 는 전체 키 → 번역 값이다. */
  public Labels labels(String languageCode, Map<String, String> translations) {
    return new Labels(languageCode, translations);
  }

  /** 번역 DB 없이 표의 값만 쓰는 묶음. */
  public Labels defaults(String languageCode) {
    return new Labels(languageCode, Map.of());
  }

  /** 한 번의 작업(파일 하나, 댓글 하나)에서 쓸 문구 묶음. */
  public final class Labels {
    private final String languageCode;
    private final Map<String, String> translations;

    private Labels(String languageCode, Map<String, String> translations) {
      this.languageCode = languageCode;
      this.translations = translations != null ? translations : Map.of();
    }

    public String get(String key) {
      String value = translations.get(prefix + key);
      return value != null && !value.isBlank() ? value : fallback(key, languageCode);
    }

    /** {@code {name}} 자리를 값으로 바꾼다. */
    public String format(String key, Map<String, ?> params) {
      String out = get(key);
      for (Map.Entry<String, ?> p : params.entrySet()) {
        out = out.replace("{" + p.getKey() + "}", String.valueOf(p.getValue()));
      }
      return out;
    }
  }
}
