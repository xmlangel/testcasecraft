// src/main/java/com/testcase/testcasemanagement/exception/EncryptionKeyNotConfiguredException.java
package com.testcase.testcasemanagement.exception;

/**
 * 서버에 API 키 암호화용 대칭키(jira.security.encryption.key)가 주입되지 않아 저장·연결 테스트를 수행할 수 없을 때 발생한다.
 *
 * <p>prod 프로파일은 저장소에 커밋된 기본 키를 두지 않으므로(application-prod.yml), 환경변수 JIRA_ENCRYPTION_KEY 를 주입하지 않으면
 * LLM 설정 생성·연결 테스트가 이 예외로 거부된다. 클라이언트가 문구 대신 {@link #ERROR_CODE} 로 원인을 식별해 해결 안내를 띄울 수 있도록 별도 타입으로
 * 둔다.
 */
public class EncryptionKeyNotConfiguredException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  /** 프런트엔드가 해결 가이드를 띄울 때 사용하는 식별자. 문구가 바뀌어도 이 값은 유지한다. */
  public static final String ERROR_CODE = "ENCRYPTION_KEY_NOT_CONFIGURED";

  /** 키를 주입하는 환경변수 이름. 안내 문구와 로그에서 함께 쓴다. */
  public static final String ENV_VAR_NAME = "JIRA_ENCRYPTION_KEY";

  public EncryptionKeyNotConfiguredException() {
    super("암호화 키가 설정되지 않았습니다. 서버 환경변수 " + ENV_VAR_NAME + " 를 설정한 뒤 애플리케이션을 다시 시작하세요.");
  }

  public EncryptionKeyNotConfiguredException(String message) {
    super(message);
  }
}
