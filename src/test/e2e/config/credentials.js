// src/test/e2e/config/credentials.js
/**
 * E2E 테스트에서 공통으로 사용되는 인증 정보를 관리합니다.
 * CI/CD 환경에서는 환경 변수를 통해 인증 정보를 주입받을 수 있습니다.
 */
module.exports = {
    ADMIN_USERNAME: process.env.TEST_ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    // 향후 일반 사용자 등 추가 계정이 필요한 경우 여기에 추가
    // USER_USERNAME: process.env.TEST_USER_USERNAME || 'user',
    // USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'user123',
};
