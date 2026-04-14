// src/main/java/com/testcase/testcasemanagement/exception/AccessDeniedException.java
package com.testcase.testcasemanagement.exception;

public class AccessDeniedException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public AccessDeniedException(String message) {
    super(message);
  }

  public AccessDeniedException(String action, String resource) {
    super(String.format("Access denied for action '%s' on resource '%s'", action, resource));
  }

  public AccessDeniedException(String message, Throwable cause) {
    super(message, cause);
  }
}
