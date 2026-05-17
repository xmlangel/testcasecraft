// src/main/java/com/testcase/testcasemanagement/exception/VersionConflictException.java
package com.testcase.testcasemanagement.exception;

/**
 * 버전 번호 충돌 / 동시성 충돌 예외.
 *
 * <p>JunitVersionControlService의 동시 버전 생성에서 버전 번호가 중복 발급되는 경우 등에 사용된다. {@code @Version} 낙관적 락 충돌과
 * 의미적으로 같은 카테고리.
 */
public class VersionConflictException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public VersionConflictException(String message) {
    super(message);
  }

  public VersionConflictException(String message, Throwable cause) {
    super(message, cause);
  }
}
