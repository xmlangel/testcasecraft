package com.testcase.testcasemanagement.util;

import java.util.Arrays;
import org.springframework.core.env.Environment;

/**
 * 활성 Spring 프로파일 판정 헬퍼(단일 정본).
 *
 * <p>이전에는 "prod|production" 판정이 EncryptionUtil·JiraSecurityConfig 두 곳에 복제돼 있어, 프로파일 명명 규칙이 바뀌면 한쪽만
 * 고쳐지는 drift(=보안 게이트가 조용히 뚫리는 위험)가 있었다. 한 곳으로 모은다.
 */
public final class ProfileUtils {

  private ProfileUtils() {}

  /** 운영 프로파일(prod 또는 production)이 활성인지. */
  public static boolean isProdActive(Environment environment) {
    return Arrays.stream(environment.getActiveProfiles())
        .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
  }
}
