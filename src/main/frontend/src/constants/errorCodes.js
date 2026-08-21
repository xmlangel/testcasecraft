// src/constants/errorCodes.js
/**
 * 서버가 ApiResponse.errorCode 로 내려주는 식별자.
 *
 * 화면이 에러 문구를 매칭해 분기하면 문구를 다듬거나 번역할 때마다 깨지므로,
 * 원인 구분은 이 코드로 한다. 정본은 백엔드의 예외 클래스 상수다.
 * (예: EncryptionKeyNotConfiguredException.ERROR_CODE)
 */
export const ERROR_CODES = {
  ENCRYPTION_KEY_NOT_CONFIGURED: "ENCRYPTION_KEY_NOT_CONFIGURED",
};

/** 암호화 키를 주입하는 서버 환경변수 이름 (백엔드 EncryptionKeyNotConfiguredException.ENV_VAR_NAME 과 같은 값) */
export const ENCRYPTION_KEY_ENV_VAR = "JIRA_ENCRYPTION_KEY";

/** AES-256 키 생성 명령. EncryptionUtil 의 KEY_LENGTH=256 이므로 32바이트를 만든다. */
export const ENCRYPTION_KEY_GENERATE_COMMAND = "openssl rand -base64 32";

/**
 * 암호화 키 미설정으로 실패했는지 판정한다.
 *
 * 서버가 내려준 errorCode 만 본다. 에러 문구로 판정하면 문구를 다듬거나 번역할 때 깨지므로,
 * 새로운 실패 경로가 생기면 그 경로가 errorCode 를 싣도록 백엔드를 고치는 쪽이 맞다.
 * 현재 이 코드를 싣는 경로는 LLM 설정 생성·수정·연결 테스트 세 가지다.
 *
 * @param {Error|null|undefined} error 잡은 에러
 * @returns {boolean}
 */
export const isEncryptionKeyError = (error) =>
  error?.errorCode === ERROR_CODES.ENCRYPTION_KEY_NOT_CONFIGURED;
