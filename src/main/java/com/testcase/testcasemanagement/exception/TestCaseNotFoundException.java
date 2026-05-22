// src/main/java/com/testcase/testcasemanagement/exception/TestCaseNotFoundException.java
package com.testcase.testcasemanagement.exception;

/** TestCase 도메인 전용 NotFound 예외. */
public class TestCaseNotFoundException extends ResourceNotFoundException {
  private static final long serialVersionUID = 1L;

  public TestCaseNotFoundException(String testCaseId) {
    super("TestCase", testCaseId);
  }

  public TestCaseNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
