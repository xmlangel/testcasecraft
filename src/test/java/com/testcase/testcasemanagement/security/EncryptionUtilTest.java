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

  // ===== dev-review R2(P1): 커밋 기본키 운영 fail-closed — 목표 스펙(수정 前) =====

  /**
   * <b>목표 스펙(TDD, 아직 RED)</b>: 운영(prod) 프로파일에서 저장소에 커밋된 기본 암호화 키가 그대로 쓰이면, 공개 키로 토큰을 암호화하는 것은 실질 평문
   * 저장이다. 현재는 warnOnInsecureKey 가 경고만 하고 암호화는 계속 성공한다(warn-only). 목표는 이 경우 fail-closed — 암호화 시도가
   * 예외로 거부돼야 한다.
   *
   * <p>이 테스트는 수정(예: prod + 커밋기본키 → getEncryptionKey 예외, 또는 prod yml 기본값 제거) 전에는 실패하므로 {@code
   * enabled=false} 로 둔다. 수정 PR 에서 활성화하고 초록으로 만든다.
   */
  @Test(enabled = false)
  public void prod_committedDefaultKey_encryptShouldFailClosed_TODO_enableWithFix()
      throws Exception {
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
}
