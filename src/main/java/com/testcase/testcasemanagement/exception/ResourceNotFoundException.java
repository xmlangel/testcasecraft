// src/main/java/com/testcase/testcasemanagement/exception/ResourceNotFoundException.java
package com.testcase.testcasemanagement.exception;

public class ResourceNotFoundException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public ResourceNotFoundException(String message) {
    super(message);
  }

  public ResourceNotFoundException(String resourceType, String resourceId) {
    super(String.format("%s with id '%s' not found", resourceType, resourceId));
  }

  public ResourceNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
