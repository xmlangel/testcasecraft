// src/types/user.js
/**
 * 사용자 관련 타입 정의
 */

/**
 * 사용자 정보
 * @typedef {Object} User
 * @property {string} id - 사용자 ID
 * @property {string} username - 사용자명
 * @property {string} name - 이름
 * @property {string} email - 이메일
 * @property {import('./common.js').UserRole} role - 역할
 * @property {string} createdAt - 가입일시
 * @property {string} updatedAt - 수정일시
 * @property {boolean} [active] - 활성 상태
 */

/**
 * 로그인 요청
 * @typedef {Object} LoginRequest
 * @property {string} username - 사용자명
 * @property {string} password - 비밀번호
 */

/**
 * 로그인 응답
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - 접근 토큰
 * @property {string} refreshToken - 갱신 토큰
 * @property {User} user - 사용자 정보
 */

/**
 * 회원가입 요청
 * @typedef {Object} RegisterRequest
 * @property {string} username - 사용자명
 * @property {string} password - 비밀번호
 * @property {string} name - 이름
 * @property {string} email - 이메일
 */

/**
 * 사용자 프로필 수정 요청
 * @typedef {Object} UpdateUserProfileRequest
 * @property {string} name - 이름
 * @property {string} email - 이메일
 */

export {};