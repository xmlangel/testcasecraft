package com.testcase.testcasemanagement.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Pattern;

/**
 * 서비스 API 키를 저장/조회 시 단방향 해시(SHA-256)로 다루기 위한 유틸리티.
 *
 * <p>원본 키는 발급 시점에 1회만 클라이언트에 노출하고, DB에는 해시만 저장한다. 인증 시에는 들어온 키를 같은 방식으로 해시해 비교한다. 저장소가 유출돼도 원본 키를
 * 복원할 수 없다.
 */
public final class ApiKeyHasher {

  /** SHA-256 hex 문자열(소문자 64자) 판별용 — 이미 해시된 값(마이그레이션 멱등)인지 구분한다. */
  private static final Pattern SHA256_HEX = Pattern.compile("^[0-9a-f]{64}$");

  private ApiKeyHasher() {}

  /** 원본 API 키를 SHA-256 hex 문자열(소문자 64자)로 해시한다. */
  public static String sha256Hex(String raw) {
    if (raw == null) {
      throw new IllegalArgumentException("api key must not be null");
    }
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder(hash.length * 2);
      for (byte b : hash) {
        sb.append(Character.forDigit((b >> 4) & 0xF, 16));
        sb.append(Character.forDigit(b & 0xF, 16));
      }
      return sb.toString();
    } catch (NoSuchAlgorithmException e) {
      // SHA-256 은 모든 JVM 에 존재 — 도달 불가
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }

  /** 이미 SHA-256 hex 형식으로 저장된 값인지 여부 (평문→해시 백필의 멱등성 판정용). */
  public static boolean isHashed(String value) {
    return value != null && SHA256_HEX.matcher(value).matches();
  }
}
