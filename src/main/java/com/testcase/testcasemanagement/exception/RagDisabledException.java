// src/main/java/com/testcase/testcasemanagement/exception/RagDisabledException.java
package com.testcase.testcasemanagement.exception;

/**
 * 관리자가 RAG(AI) 기능을 통째로 중지해 요청을 수행할 수 없을 때 발생한다.
 *
 * <p>색인만 멈추는 {@link RagVectorWriteDisabledException} 과 다르다. 이 상태에서는 질문·검색·문서 조회까지 모두 막힌다.
 *
 * <p>전에는 IllegalStateException 을 던졌고 컨트롤러의 catch(Exception) 이 그것을 500 으로 만들었다. 서버는 이유를 알면서도 화면에는
 * 아무것도 오지 않아, 사용자가 장애로 오해하고 관리자는 설정 때문임을 알 수 없었다.
 */
public class RagDisabledException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  /** 프런트엔드가 안내 문구를 고를 때 쓰는 식별자. 문구가 바뀌어도 이 값은 유지한다. */
  public static final String ERROR_CODE = "RAG_DISABLED";

  /** 이 동작을 제어하는 시스템 설정 키. */
  public static final String SETTING_KEY = "RAG_ENABLED";

  public RagDisabledException() {
    super("관리자가 AI 기능을 중지했습니다. 질문·검색·문서 조회를 모두 사용할 수 없습니다. 관리자 설정에서 다시 켤 수 있습니다.");
  }

  public RagDisabledException(String message) {
    super(message);
  }
}
