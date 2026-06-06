// src/main/java/com/testcase/testcasemanagement/controller/GuideController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.util.DocsResourceLoader;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 시스템 가이드 문서 조회 API.
 *
 * <p>문서는 {@link DocsResourceLoader} 를 통해 파일시스템(개발) → 클래스패스(jar/도커) 순으로 읽는다.
 */
@Slf4j
@RestController
@RequestMapping("/api/guides")
@RequiredArgsConstructor
@Tag(name = "Guide", description = "시스템 가이드 문서 조회 API")
public class GuideController {

  // 가이드 검색 디렉토리 — 순서대로 탐색 (운영 문서 DOCKER_SETUP.md 는 deployment 에 위치)
  private static final String[] GUIDE_DIRS = {"docs/guide/", "docs/deployment/"};

  private final DocsResourceLoader docsResourceLoader;

  @Operation(summary = "가이드 문서 조회", description = "지정된 마크다운 가이드 파일의 내용을 읽어옵니다.")
  @GetMapping(value = "/{fileName:.+}", produces = MediaType.TEXT_MARKDOWN_VALUE + ";charset=UTF-8")
  public ResponseEntity<String> getGuideContent(
      @PathVariable(name = "fileName") String fileName, Locale locale) {
    // 보안 검증: 확장자 확인 및 경로 조작 방지
    if (!fileName.endsWith(".md")
        || fileName.contains("..")
        || fileName.contains("/")
        || fileName.contains("\\")) {
      log.warn("보안 위험이 있는 파일 요청 차단: {}", fileName);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid file name");
    }

    String language = locale != null ? locale.getLanguage() : null;
    String localizedFileName = fileName;

    // 언어 정보가 있고 한국어(ko)가 아닌 경우, 접미사 붙은 파일 시도
    if (language != null && !language.isEmpty() && !"ko".equalsIgnoreCase(language)) {
      localizedFileName = fileName.replace(".md", "_" + language.toLowerCase() + ".md");
    }

    // 디렉토리 순서대로, 언어판 우선 탐색 (파일시스템 → 클래스패스)
    Optional<String> loaded = Optional.empty();
    for (String dir : GUIDE_DIRS) {
      loaded = docsResourceLoader.readString(dir + localizedFileName);
      if (loaded.isPresent()) break;
      loaded = docsResourceLoader.readString(dir + fileName);
      if (loaded.isPresent()) break;
    }
    if (loaded.isEmpty()) {
      log.warn("요청한 가이드 파일이 존재하지 않음 (파일시스템·클래스패스 모두): {}", fileName);
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Guide file not found");
    }

    // 저장소 상대 md 링크 → 인앱 뷰어 경로로 재작성 (ManualController 와 동일 정책)
    String content =
        loaded
            .get()
            .replace("](../manual/new/USER_MANUAL_EN.md)", "](/manual?l=en)")
            .replace("](../manual/new/USER_MANUAL.md)", "](/manual?l=ko)")
            .replace("](../guide/", "](/guides/")
            .replace("](../deployment/", "](/guides/")
            .replace("](./", "](/guides/");
    return ResponseEntity.ok(content);
  }
}
