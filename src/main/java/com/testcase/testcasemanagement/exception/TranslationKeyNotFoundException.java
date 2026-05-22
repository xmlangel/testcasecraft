// src/main/java/com/testcase/testcasemanagement/exception/TranslationKeyNotFoundException.java
package com.testcase.testcasemanagement.exception;

/** i18n 번역 키 조회 실패 예외. */
public class TranslationKeyNotFoundException extends ResourceNotFoundException {
  private static final long serialVersionUID = 1L;

  public TranslationKeyNotFoundException(String keyName) {
    super("TranslationKey", keyName);
  }

  public TranslationKeyNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
