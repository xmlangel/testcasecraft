package com.testcase.testcasemanagement.i18n;

import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.testng.annotations.Test;

/**
 * 번역값이 있는 키가 실제로 등록되는지 소스에서 확인한다.
 *
 * <p>왜 필요한가 — 시딩은 키를 먼저 만들고 그 키에 언어별 값을 붙인다. 값만 추가하고 키 등록을 빠뜨리면
 * `TranslationDataInitializer` 가 "번역 키를 찾을 수 없음" 을 <b>경고로만</b> 남기고 그 값을 버린다. 부팅은
 * 정상으로 끝나고 화면은 코드에 박힌 기본값으로 뜨므로, 번역이 빠진 것을 아무도 모른다. 실제로 네 건이 그 상태로
 * 남아 있었다(2026-08-20 확인).
 *
 * <p>부팅 로그를 사람이 읽어 잡는 방식은 작동하지 않는다. 시딩 한 회차가 90초 넘고 그 사이 경고가 수천 줄 로그에
 * 섞인다. 그래서 소스에서 두 집합을 뽑아 차집합을 낸다.
 *
 * <p>반대 방향(키만 있고 값이 없는 것)은 검사하지 않는다. 키의 기본값이 화면에 뜨므로 동작이 깨지지 않고, 언어를
 * 늘리는 중간 상태가 정상이다.
 */
public class TranslationKeyRegistrationTest {

  private static final Path I18N = Path.of("src/main/java/com/testcase/testcasemanagement/config/i18n");

  /** 키 등록 호출. 여러 줄로 쓰인 경우가 많아 파일 전체에서 찾는다. */
  private static final Pattern KEY_CALL =
      Pattern.compile("createTranslationKeyIfNotExists\\s*\\(\\s*\"([^\"]+)\"");

  /** 언어별 값 등록 호출. */
  private static final Pattern VALUE_CALL =
      Pattern.compile("createTranslationIfNotExists\\s*\\(\\s*\"([^\"]+)\"");

  @Test
  public void 번역값이_있는_키는_모두_등록되어야_한다() throws IOException {
    Set<String> registered = scan(I18N.resolve("keys"), KEY_CALL);
    Set<String> translated = scan(I18N.resolve("translations"), VALUE_CALL);

    assertTrue(registered.size() > 1000, "키 스캔이 비었다. 경로·정규식을 확인하라: " + registered.size());
    assertTrue(translated.size() > 1000, "값 스캔이 비었다. 경로·정규식을 확인하라: " + translated.size());

    List<String> orphans = new ArrayList<>();
    for (String key : translated) {
      if (!registered.contains(key)) {
        orphans.add(key);
      }
    }

    assertTrue(
        orphans.isEmpty(),
        "번역값은 있는데 키가 등록되지 않았다. 이 값들은 시딩에서 조용히 버려진다.\n"
            + "  해당 키를 config/i18n/keys/ 의 초기화 클래스에 createTranslationKeyIfNotExists 로 추가하라.\n"
            + orphans.stream().map(k -> "  - " + k).reduce("", (a, b) -> a + b + "\n"));
  }

  /** `.backup` 파일은 대상이 아니다 — 컴파일되지 않으므로 시딩에 관여하지 않는다. */
  private Set<String> scan(Path dir, Pattern pattern) throws IOException {
    Set<String> found = new LinkedHashSet<>();
    try (Stream<Path> walk = Files.walk(dir)) {
      List<Path> files =
          walk.filter(Files::isRegularFile)
              .filter(p -> p.getFileName().toString().endsWith(".java"))
              .toList();
      for (Path file : files) {
        String body = Files.readString(file, StandardCharsets.UTF_8);
        Matcher m = pattern.matcher(body);
        while (m.find()) {
          found.add(m.group(1));
        }
      }
    }
    return found;
  }
}
