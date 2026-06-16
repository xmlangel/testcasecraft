// src/main/java/com/testcase/testcasemanagement/util/DocsResourceLoader.java
package com.testcase.testcasemanagement.util;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * 저장소 docs/ 문서 로더 — 파일시스템 우선, 클래스패스 폴백.
 *
 * <p>개발 환경(bootRun)에서는 작업 디렉토리의 docs/ 를 직접 읽어 문서 수정이 즉시 반영되고, 도커/jar 배포에서는 processResources 가 jar 에
 * 동봉한 classpath:docs/** 를 읽는다. 경로 검증(파일명 화이트리스트 등)은 호출 측(컨트롤러)의 책임이다.
 */
@Slf4j
@Component
public class DocsResourceLoader {

  /** 상대 경로(예: {@code docs/manual/new/USER_MANUAL.md})의 바이트를 읽는다. 없으면 empty. */
  public Optional<byte[]> readBytes(String relativePath) {
    // 1) 파일시스템 (개발 환경)
    Path filePath = Paths.get(System.getProperty("user.dir"), relativePath).normalize();
    if (Files.exists(filePath)) {
      try {
        return Optional.of(Files.readAllBytes(filePath));
      } catch (IOException e) {
        log.error("문서 파일 읽기 실패: {}", filePath.toAbsolutePath(), e);
        return Optional.empty();
      }
    }
    // 2) 클래스패스 (jar 배포 환경)
    ClassPathResource resource = new ClassPathResource(relativePath);
    if (resource.exists()) {
      try (InputStream in = resource.getInputStream()) {
        return Optional.of(in.readAllBytes());
      } catch (IOException e) {
        log.error("클래스패스 문서 읽기 실패: {}", relativePath, e);
        return Optional.empty();
      }
    }
    return Optional.empty();
  }

  /** 상대 경로의 텍스트(UTF-8)를 읽는다. 없으면 empty. */
  public Optional<String> readString(String relativePath) {
    return readBytes(relativePath).map(bytes -> new String(bytes, StandardCharsets.UTF_8));
  }

  /** 파일시스템 또는 클래스패스에 해당 문서가 존재하는지 확인한다. */
  public boolean exists(String relativePath) {
    Path filePath = Paths.get(System.getProperty("user.dir"), relativePath).normalize();
    return Files.exists(filePath) || new ClassPathResource(relativePath).exists();
  }
}
