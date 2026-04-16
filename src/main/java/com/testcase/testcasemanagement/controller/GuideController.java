// src/main/java/com/testcase/testcasemanagement/controller/GuideController.java
package com.testcase.testcasemanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/guides")
@Tag(name = "Guide", description = "시스템 가이드 문서 조회 API")
public class GuideController {

  private static final String GUIDE_DIR = "docs/guide/";

  @Operation(summary = "가이드 문서 조회", description = "지정된 마크다운 가이드 파일의 내용을 읽어옵니다.")
  @GetMapping(value = "/{fileName:.+}", produces = MediaType.TEXT_MARKDOWN_VALUE + ";charset=UTF-8")
  public ResponseEntity<String> getGuideContent(@PathVariable(name = "fileName") String fileName) {
    try {
      // 보안 검증: 확장자 확인 및 경로 조작 방지
      if (!fileName.endsWith(".md")
          || fileName.contains("..")
          || fileName.contains("/")
          || fileName.contains("\\")) {
        log.warn("보안 위험이 있는 파일 요청 차단: {}", fileName);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid file name");
      }

      // 파일 경로 설정 (프로젝트 루트 기준)
      Path filePath = Paths.get(System.getProperty("user.dir"), GUIDE_DIR, fileName).normalize();
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
