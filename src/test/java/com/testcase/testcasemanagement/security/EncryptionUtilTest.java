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
}
