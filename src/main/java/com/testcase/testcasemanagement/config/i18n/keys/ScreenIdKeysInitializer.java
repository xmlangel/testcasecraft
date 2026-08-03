// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ScreenIdKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 화면 ID 배지 번역 키 초기화.
 *
 * <p>화면 우측 하단에 뜨는 화면 ID(S0~S11)의 이름이다. 기획 문서 {@code docs/screen_spec/} 의 화면 구분과 같으므로, 문서에서 화면 이름을
 * 바꾸면 여기와 프런트엔드 {@code constants/screenIds.js} 를 함께 고친다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScreenIdKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    createKey("screenId.tooltip", "화면 ID 배지 툴팁 형식", "화면 {id} · {name}");
    createKey("screenId.S0", "S0 화면 이름", "로그인·계정");
    createKey("screenId.S1", "S1 화면 이름", "프로젝트");
    createKey("screenId.S2", "S2 화면 이름", "공통 레이아웃");
    createKey("screenId.S3", "S3 화면 이름", "대시보드");
    createKey("screenId.S4", "S4 화면 이름", "테스트케이스");
    createKey("screenId.S5", "S5 화면 이름", "테스트 플랜");
    createKey("screenId.S6", "S6 화면 이름", "테스트 실행");
    createKey("screenId.S7", "S7 화면 이름", "테스트 결과");
    createKey("screenId.S8", "S8 화면 이름", "자동화 테스트");
    createKey("screenId.S9", "S9 화면 이름", "RAG 문서");
    createKey("screenId.S10", "S10 화면 이름", "탐색 세션");
    createKey("screenId.S11", "S11 화면 이름", "관리자 설정");

    log.info("화면 ID 배지 번역 키 초기화 완료");
  }

  private void createKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "screenId", description, defaultValue));
      log.debug("번역 키 생성: {}", keyName);
    }
  }
}
