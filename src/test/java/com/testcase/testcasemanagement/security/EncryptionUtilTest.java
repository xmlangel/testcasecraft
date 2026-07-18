package com.testcase.testcasemanagement.security;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNotEquals;
import static org.testng.Assert.assertTrue;

import java.lang.reflect.Field;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(하드코딩 암호화 키) 관련 fail-closed 회귀 가드.
 *
 * <p>운영 yml 에서 커밋된 기본 키를 제거(기본값 없음)했으므로, 키 미설정 시 조용히 동작하지 않고 명확히 실패해야 한다. 키가 주어지면 AES-256 라운드트립이 정상
 * 동작함을 함께 확인한다.
 */
public class EncryptionUtilTest {

  private EncryptionUtil util;

  @BeforeMethod
  public void setUp() {
    util = new EncryptionUtil();
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
}
