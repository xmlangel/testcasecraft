// src/main/java/com/testcase/testcasemanagement/controller/ManualController.java
package com.testcase.testcasemanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자 매뉴얼(한국어/영어) 조회 API.
 *
 * <p>GuideController 와 달리 매뉴얼은 스크린샷 이미지(images/, images_en/)를 함께 서빙해야 하므로 별도
 * 컨트롤러로 분리한다. 마크다운 서빙 시 상대 이미지 경로를 본 API 의 이미지 엔드포인트로 재작성한다.
 */
@Slf4j
@RestController
@RequestMapping("/api/manual")
@Tag(name = "Manual", description = "사용자 매뉴얼 조회 API")
public class ManualController {

  private static final String MANUAL_DIR = "docs/manual/new/";
  private static final Pattern IMAGE_NAME = Pattern.compile("^[A-Za-z0-9_\\-]+\\.(png|jpg|jpeg)$");

  @Operation(summary = "매뉴얼 본문 조회", description = "지정 언어(ko/en)의 사용자 매뉴얼 마크다운을 반환합니다.")
  @GetMapping(value = "/{lang}", produces = MediaType.TEXT_MARKDOWN_VALUE + ";charset=UTF-8")
  public ResponseEntity<String> getManual(@PathVariable(name = "lang") String lang) {
    boolean isEn = "en".equalsIgnoreCase(lang);
    if (!isEn && !"ko".equalsIgnoreCase(lang)) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unsupported language");
    }
    String fileName = isEn ? "USER_MANUAL_EN.md" : "USER_MANUAL.md";
    Path filePath = Paths.get(System.getProperty("user.dir"), MANUAL_DIR, fileName).normalize();
    if (!Files.exists(filePath)) {
      log.warn("매뉴얼 파일 없음: {}", filePath.toAbsolutePath());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Manual not found");
    }
    try {
      String content = Files.readString(filePath, StandardCharsets.UTF_8);
      // 상대 이미지 경로 → 이미지 서빙 API 로 재작성
      content =
          content
              .replace("](images_en/", "](/api/manual/images/en/")
              .replace("](images/", "](/api/manual/images/ko/");
      // 저장소 상대 md 링크 → 인앱 뷰어 경로로 재작성
      //  - 한↔영 상호 링크 → /manual?l={lang}
      //  - docs/guide, docs/deployment 문서 → /guides/{file} (GuideViewer 가 렌더)
      content =
          content
              .replace("](USER_MANUAL_EN.md)", "](/manual?l=en)")
              .replace("](USER_MANUAL.md)", "](/manual?l=ko)")
              .replace("](../../guide/", "](/guides/")
              .replace("](../../deployment/", "](/guides/");
      return ResponseEntity.ok(content);
    } catch (IOException e) {
      log.error("매뉴얼 읽기 실패: {}", fileName, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reading manual");
    }
  }

  @Operation(summary = "매뉴얼 이미지 조회", description = "매뉴얼 스크린샷 이미지를 반환합니다.")
  @GetMapping("/images/{lang}/{fileName:.+}")
  public ResponseEntity<byte[]> getManualImage(
      @PathVariable(name = "lang") String lang, @PathVariable(name = "fileName") String fileName) {
    boolean isEn = "en".equalsIgnoreCase(lang);
    if (!isEn && !"ko".equalsIgnoreCase(lang)) {
      return ResponseEntity.badRequest().build();
    }
    // 경로 조작 방지: 화이트리스트 파일명만 허용
    if (!IMAGE_NAME.matcher(fileName).matches()) {
      log.warn("보안 위험이 있는 매뉴얼 이미지 요청 차단: {}", fileName);
      return ResponseEntity.badRequest().build();
    }
    String imageDir = isEn ? "images_en" : "images";
    Path filePath =
        Paths.get(System.getProperty("user.dir"), MANUAL_DIR, imageDir, fileName).normalize();
    if (!Files.exists(filePath)) {
      return ResponseEntity.notFound().build();
    }
    try {
      byte[] bytes = Files.readAllBytes(filePath);
      MediaType type =
          fileName.endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;
      return ResponseEntity.ok().contentType(type).body(bytes);
    } catch (IOException e) {
      log.error("매뉴얼 이미지 읽기 실패: {}", fileName, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
