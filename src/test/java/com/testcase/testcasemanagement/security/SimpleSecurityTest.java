package com.testcase.testcasemanagement.security;

import static org.testng.Assert.*;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/** 간단한 보안 테스트 */
@SpringBootTest
@ActiveProfiles("test")
public class SimpleSecurityTest extends AbstractTestNGSpringContextTests {

  @Test
  public void testSimple() {
    assertTrue(true, "기본 테스트");
  }
}
