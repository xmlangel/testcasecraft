// src/main/java/com/testcase/testcasemanagement/controller/GuideController.java
package com.testcase.testcasemanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/guides")
@Tag(name = "Guide", description = "시스템 가이드 문서 조회 API")
public class GuideController {

  private static final String GUIDE_DIR = "docs/guide/";

  @Operation(summary = "가이드 문서 조회", description = "지정된 마크다운 가이드 파일의 내용을 읽어옵니다.")
  @GetMapping(value = "/{fileName:.+}", produces = MediaType.TEXT_MARKDOWN_VALUE + ";charset=UTF-8")
  public ResponseEntity<String> getGuideContent(
      @PathVariable(name = "fileName") String fileName, Locale locale) {
    try {
      // 보안 검증: 확장자 확인 및 경로 조작 방지
      if (!fileName.endsWith(".md")
          || fileName.contains("..")
          || fileName.contains("/")
          || fileName.contains("\\")) {
        log.warn("보안 위험이 있는 파일 요청 차단: {}", fileName);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid file name");
      }

      String language = locale.getLanguage();
      String localizedFileName = fileName;

      // 언어 정보가 있고 한국어(ko)가 아닌 경우, 접미사 붙은 파일 시도
      if (language != null && !language.isEmpty() && !"ko".equalsIgnoreCase(language)) {
        localizedFileName = fileName.replace(".md", "_" + language.toLowerCase() + ".md");
      }

      // 파일 경로 설정 (프로젝트 루트 기준)
      Path filePath =
          Paths.get(System.getProperty("user.dir"), GUIDE_DIR, localizedFileName).normalize();

      // 요청된 언어 버전 파일이 없으면 기본 파일로 폴백
      if (!Files.exists(filePath) && !localizedFileName.equals(fileName)) {
        log.debug("언어별 가이드 파일 없음({}), 기본 파일 사용 시도: {}", localizedFileName, fileName);
        filePath = Paths.get(System.getProperty("user.dir"), GUIDE_DIR, fileName).normalize();
      }

      log.debug("가이드 파일 조회 시도: {}", filePath.toAbsolutePath());

      if (!Files.exists(filePath)) {
        log.warn(
            "요청한 가이드 파일이 존재하지 않음: {}. 현재 작업 디렉토리: {}",
            filePath.toAbsolutePath(),
            System.getProperty("user.dir"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Guide file not found");
      }

      // 파일 읽기
      String content = Files.readString(filePath, StandardCharsets.UTF_8);
      return ResponseEntity.ok(content);

    } catch (IOException e) {
      log.error("가이드 파일 읽기 실패: {}", fileName, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error reading guide file");
    }
  }
}
