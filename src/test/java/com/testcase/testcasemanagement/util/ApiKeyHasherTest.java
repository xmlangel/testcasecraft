package com.testcase.testcasemanagement.util;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNotEquals;
import static org.testng.Assert.assertThrows;
import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

/** ApiKeyHasher 단위 테스트 — dev-code-review P0(API 키 평문 저장) 수정 검증. */
public class ApiKeyHasherTest {

  @Test
  public void sha256Hex_isDeterministicAndMatchesKnownVector() {
    // SHA-256("test") 표준 벡터
    assertEquals(
        ApiKeyHasher.sha256Hex("test"),
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
    // 같은 입력 → 같은 출력
    assertEquals(ApiKeyHasher.sha256Hex("some-api-key"), ApiKeyHasher.sha256Hex("some-api-key"));
  }

  @Test
  public void sha256Hex_outputIsLowercase64HexAndDetectedAsHashed() {
    String hash = ApiKeyHasher.sha256Hex("any-raw-key-value");
    assertTrue(hash.matches("^[0-9a-f]{64}$"), "출력은 소문자 hex 64자여야 한다");
    assertTrue(ApiKeyHasher.isHashed(hash));
  }

  @Test
  public void sha256Hex_differentInputsProduceDifferentHashes() {
    assertNotEquals(ApiKeyHasher.sha256Hex("key-a"), ApiKeyHasher.sha256Hex("key-b"));
  }

  @Test
  public void isHashed_returnsFalseForRawBase64UrlKeyAndNull() {
    // 실제 발급 키 형식: Base64url(32바이트) — 대문자/'-'/'_' 포함, 64자 아님 → 해시로 오인되면 안 됨
    String rawKey = "Ab-Cd_1234567890ABCDEFghijklmnopqrstuvwxyz12";
    assertFalse(ApiKeyHasher.isHashed(rawKey));
    assertFalse(ApiKeyHasher.isHashed(null));
    assertFalse(ApiKeyHasher.isHashed("SHORT"));
  }

  @Test
  public void sha256Hex_nullThrows() {
    assertThrows(IllegalArgumentException.class, () -> ApiKeyHasher.sha256Hex(null));
  }
}
