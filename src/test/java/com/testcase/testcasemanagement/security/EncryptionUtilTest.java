package com.testcase.testcasemanagement.security;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNotEquals;
import static org.testng.Assert.assertTrue;

import java.lang.reflect.Field;
import org.mockito.Mockito;
import org.springframework.core.env.Environment;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(하드코딩 암호화 키) 회귀 가드.
 *
 * <p>운영은 커밋된 기본 키로도 기동은 되지만(무마찰) 그 사용을 감지·경고하는 것이 정책. (1) 유효 키 AES-256 라운드트립, (2) null/blank 키
 * fail-closed(암호화 시 예외), (3) 커밋된 기본 키 감지를 검증한다.
 */
public class EncryptionUtilTest {

  private EncryptionUtil util;

  @BeforeMethod
  public void setUp() {
    Environment env = Mockito.mock(Environment.class);
    Mockito.when(env.getActiveProfiles()).thenReturn(new String[] {"test"});
    util = new EncryptionUtil(env);
  }

  private void setKey(String key) throws Exception {
    Field f = EncryptionUtil.class.getDeclaredField("encryptionKeyBase64");
    f.setAccessible(true);
    f.set(util, key);
  }

  private void setEnabled(boolean enabled) throws Exception {
    Field f = EncryptionUtil.class.getDeclaredField("encryptionEnabled");
    f.setAccessible(true);
    f.setBoolean(util, enabled);
  }

  @Test
  public void roundTrip_withValidKey() throws Exception {
    setEnabled(true);
    setKey(EncryptionUtil.generateEncryptionKey());
    String plain = "jira-api-token-🔐-\"weird\"\\value";
    String enc = util.encrypt(plain);
    assertNotEquals(enc, plain, "암호문은 평문과 달라야 함");
    assertEquals(util.decrypt(enc), plain, "복호화 라운드트립 일치");
  }

  @Test(expectedExceptions = RuntimeException.class)
  public void nullKey_encryptFailsClosed() throws Exception {
    setEnabled(true);
    setKey(null);
    util.encrypt("secret"); // 키 미설정 → 조용히 평문 저장이 아니라 예외
  }

  @Test(expectedExceptions = RuntimeException.class)
  public void blankKey_encryptFailsClosed() throws Exception {
    setEnabled(true);
    setKey("   ");
    util.encrypt("secret");
  }

  @Test
  public void keyConfiguredReport() throws Exception {
    setEnabled(true);
    setKey(null);
    assertFalse(util.isEncryptionKeyConfigured());
    setKey(EncryptionUtil.generateEncryptionKey());
    assertTrue(util.isEncryptionKeyConfigured());
  }

  @Test
  public void detectsCommittedDefaultKey() throws Exception {
    // 운영 경고 판정의 근거 — 커밋된 기본 키를 정확히 식별해야 한다.
    setKey("5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=");
    assertTrue(util.isUsingCommittedDefaultKey());
    setKey(EncryptionUtil.generateEncryptionKey());
    assertFalse(util.isUsingCommittedDefaultKey());
  }

  // ===== dev-review R2(P2): decrypt 손상 입력 fail-closed 특성화 =====

  /**
   * IV 길이(16바이트) 미만의 Base64 는 내부에서 음수 크기 배열(NegativeArraySizeException)을 유발한다. 조용한 성공이나 부분 평문 반환이
   * 아니라 예외로 fail-closed 돼야 한다(현재 동작 고정 — 미래에 예외를 삼키는 변경을 가드).
   */
  @Test(expectedExceptions = RuntimeException.class)
  public void decrypt_shortInput_failsClosed() throws Exception {
    setEnabled(true);
    setKey(EncryptionUtil.generateEncryptionKey());
    util.decrypt("QQ=="); // 1바이트 → IV 분리 불가
  }

  /** IV 는 있으나 암호문이 손상된 경우도 조용히 통과하지 않고 예외여야 한다. */
  @Test(expectedExceptions = RuntimeException.class)
  public void decrypt_corruptCiphertext_failsClosed() throws Exception {
    setEnabled(true);
    setKey(EncryptionUtil.generateEncryptionKey());
    // 20바이트 임의 데이터(IV 16 + 잘못된 4바이트) → 복호화 실패
    byte[] junk = new byte[20];
    for (int i = 0; i < junk.length; i++) {
      junk[i] = (byte) i;
    }
    util.decrypt(java.util.Base64.getEncoder().encodeToString(junk));
  }

  /** null/빈 입력은 그대로 반환(암호화 안 된 값 통과 — 기존 계약 유지). */
  @Test
  public void decrypt_nullOrEmpty_passthrough() throws Exception {
    setEnabled(true);
    setKey(EncryptionUtil.generateEncryptionKey());
    assertEquals(util.decrypt(null), null);
    assertEquals(util.decrypt(""), "");
  }

  // ===== dev-review R2(P1): 커밋 기본키 운영 fail-closed (수정 완료 — 활성) =====

  /**
   * 운영(prod) 프로파일에서 저장소에 커밋된 기본 암호화 키가 그대로 쓰이면, 공개 키로 토큰을 암호화하는 것은 실질 평문 저장이다. getEncryptionKey 가 이
   * 경우를 fail-closed 로 거부한다(암호화 시도가 예외). 비-운영에서는 warnOnInsecureKey 가 경고만 하고 계속 진행한다.
   */
  @Test
  public void prod_committedDefaultKey_encryptFailsClosed() throws Exception {
    Environment prodEnv = Mockito.mock(Environment.class);
    Mockito.when(prodEnv.getActiveProfiles()).thenReturn(new String[] {"prod"});
    EncryptionUtil prodUtil = new EncryptionUtil(prodEnv);

    Field enabled = EncryptionUtil.class.getDeclaredField("encryptionEnabled");
    enabled.setAccessible(true);
    enabled.setBoolean(prodUtil, true);
    Field key = EncryptionUtil.class.getDeclaredField("encryptionKeyBase64");
    key.setAccessible(true);
    key.set(prodUtil, "5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y="); // 커밋된 기본 키

    org.testng.Assert.expectThrows(RuntimeException.class, () -> prodUtil.encrypt("jira-token"));
  }

  /** fail-closed 는 운영 전용 — 비-운영(test/dev)에서는 커밋 기본 키로도 암호화가 계속 동작해야 한다(무마찰 유지). */
  @Test
  public void nonProd_committedDefaultKey_stillEncrypts() throws Exception {
    setEnabled(true);
    setKey("5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y="); // 커밋된 기본 키, 프로파일=test
    String enc = util.encrypt("jira-token");
    assertEquals(util.decrypt(enc), "jira-token", "비-운영에서는 커밋 기본 키로도 라운드트립 성공");
  }

  /** 운영이라도 고유(비-커밋) 키면 정상 동작해야 한다(과도차단 방지). */
  @Test
  public void prod_uniqueKey_encryptsNormally() throws Exception {
    Environment prodEnv = Mockito.mock(Environment.class);
    Mockito.when(prodEnv.getActiveProfiles()).thenReturn(new String[] {"prod"});
    EncryptionUtil prodUtil = new EncryptionUtil(prodEnv);

    Field enabled = EncryptionUtil.class.getDeclaredField("encryptionEnabled");
    enabled.setAccessible(true);
    enabled.setBoolean(prodUtil, true);
    Field key = EncryptionUtil.class.getDeclaredField("encryptionKeyBase64");
    key.setAccessible(true);
    key.set(prodUtil, EncryptionUtil.generateEncryptionKey()); // 고유 키

    String enc = prodUtil.encrypt("jira-token");
    assertEquals(prodUtil.decrypt(enc), "jira-token", "운영에서 고유 키는 정상 동작");
  }
}
