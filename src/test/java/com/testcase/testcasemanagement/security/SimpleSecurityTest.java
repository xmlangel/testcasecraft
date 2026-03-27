package com.testcase.testcasemanagement.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** 간단한 보안 테스트 */
@SpringBootTest
@ActiveProfiles("test")
public class SimpleSecurityTest {

  @Test
  public void testSimple() {
    assertTrue(true, "기본 테스트");
  }
}
