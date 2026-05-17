// src/main/java/com/testcase/testcasemanagement/exception/RagApiException.java
package com.testcase.testcasemanagement.exception;

/**
 * FastAPI RAG 서비스 호출 실패 예외.
 *
 * <p>WebClient 4xx/5xx 응답, 타임아웃, 폴링 실패 등 RAG API 통신 관련 오류를 도메인 수준에서 표현한다. 메시지 문자열 매칭(예: {@code
 * e.getMessage().contains("Document not found")})으로 흐름을 분기하는 대신 본 예외 + 상태 코드 기반으로 처리한다.
 */
public class RagApiException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  private final Integer statusCode;

  public RagApiException(String message) {
    this(message, null, null);
  }

  public RagApiException(String message, Throwable cause) {
    this(message, null, cause);
  }

  public RagApiException(String message, Integer statusCode, Throwable cause) {
    super(message, cause);
    this.statusCode = statusCode;
  }

  /** HTTP 상태 코드. RAG API 응답에서 받은 경우만 값이 채워진다. */
  public Integer getStatusCode() {
    return statusCode;
  }

  public boolean isNotFound() {
    return statusCode != null && statusCode == 404;
  }
}
