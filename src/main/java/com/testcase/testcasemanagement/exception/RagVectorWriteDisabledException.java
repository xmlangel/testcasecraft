// src/main/java/com/testcase/testcasemanagement/exception/RagVectorWriteDisabledException.java
package com.testcase.testcasemanagement.exception;

/**
 * 벡터 쓰기(색인·임베딩 생성)가 꺼져 있어 요청을 수행할 수 없을 때 발생한다.
 *
 * <p>RAG 를 통째로 끄는 RAG_ENABLED 와 다르다. 이 설정은 이미 색인된 자료로 질의하는 것은 그대로 두고, 새 벡터를 만드는 작업만 막는다. 임베딩 비용을 묶어
 * 두거나 색인을 잠시 멈출 때 쓴다.
 *
 * <p>사용자가 직접 누른 작업에서만 던진다. 배경에서 도는 색인(테스트케이스 저장·대화 저장)은 이 예외 대신 건너뛴다. 그쪽에서 예외가 나면 본래 작업까지 실패로 기록되기
 * 때문이다.
 */
public class RagVectorWriteDisabledException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  /** 프런트엔드가 안내 문구를 고를 때 쓰는 식별자. 문구가 바뀌어도 이 값은 유지한다. */
  public static final String ERROR_CODE = "RAG_VECTOR_WRITE_DISABLED";

  /** 이 동작을 제어하는 시스템 설정 키. */
  public static final String SETTING_KEY = "RAG_VECTOR_WRITE_ENABLED";

  public RagVectorWriteDisabledException() {
    super("벡터 색인이 중지되어 있습니다. 이미 색인된 자료로 질문하는 것은 그대로 됩니다. 관리자 설정에서 다시 켤 수 있습니다.");
  }

  public RagVectorWriteDisabledException(String message) {
    super(message);
  }
}
