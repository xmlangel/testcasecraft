// src/services/passwordService.js
import axiosInstance from '../utils/axiosInstance.js';
import { getDynamicApiUrl } from '../utils/apiConstants.js';

/**
 * 비밀번호 관리 서비스
 * ICT-270: 사용자 비밀번호 변경 기능
 */
class PasswordService {
  constructor() {
    this.baseURL = null;
  }

  async getBaseURL() {
    if (!this.baseURL) {
      this.baseURL = await getDynamicApiUrl();
    }
    return this.baseURL;
  }

  /**
   * getAuthHeaders 제거 - axiosInstance의 interceptor가 자동으로 토큰 추가
   */

  /**
   * 본인 비밀번호 변경
   * @param {Object} passwordData - 비밀번호 변경 데이터
   * @param {string} passwordData.currentPassword - 현재 비밀번호
   * @param {string} passwordData.newPassword - 새 비밀번호
   * @returns {Promise<Object>} 변경 결과
   */
  async changeMyPassword(passwordData) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await axiosInstance.put(
        `${baseURL}/api/auth/change-password`,
        passwordData
        // Authorization 헤더는 interceptor가 자동으로 추가
        // Content-Type은 axiosInstance가 자동으로 application/json 설정
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      // 에러 처리
      if (error.response) {
        const errorData = error.response.data;

        // 서버에서 온 에러 메시지 처리
        switch (errorData.errorCode) {
          case 'AUTHENTICATION_REQUIRED':
            throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
          case 'CURRENT_PASSWORD_REQUIRED':
            throw new Error('현재 비밀번호를 입력해주세요.');
          case 'NEW_PASSWORD_REQUIRED':
            throw new Error('새 비밀번호를 입력해주세요.');
          case 'VALIDATION_ERROR':
            throw new Error(errorData.message || '비밀번호 형식이 올바르지 않습니다.');
          case 'USER_NOT_FOUND':
            throw new Error('사용자를 찾을 수 없습니다.');
          case 'INTERNAL_SERVER_ERROR':
            throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(errorData.message || '비밀번호 변경 중 오류가 발생했습니다.');
        }
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        throw new Error('요청 처리 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * 관리자용 사용자 비밀번호 변경
   * @param {string} userId - 대상 사용자 ID
   * @param {Object} passwordData - 비밀번호 변경 데이터
   * @param {string} passwordData.currentPassword - 현재 비밀번호 (선택사항)
   * @param {string} passwordData.newPassword - 새 비밀번호
   * @returns {Promise<Object>} 변경 결과
   */
  async changeUserPassword(userId, passwordData) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await axiosInstance.put(
        `${baseURL}/api/admin/users/${userId}/password`,
        passwordData
        // Authorization 헤더는 interceptor가 자동으로 추가
        // Content-Type은 axiosInstance가 자동으로 application/json 설정
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      // 에러 처리 (changeMyPassword와 동일한 로직)
      if (error.response) {
        const errorData = error.response.data;

        switch (errorData.errorCode) {
          case 'AUTHENTICATION_REQUIRED':
            throw new Error('관리자 로그인이 필요합니다.');
          case 'ACCESS_DENIED':
            throw new Error('관리자 권한이 필요합니다.');
          case 'USER_NOT_FOUND':
            throw new Error('대상 사용자를 찾을 수 없습니다.');
          case 'VALIDATION_ERROR':
            throw new Error(errorData.message || '비밀번호 형식이 올바르지 않습니다.');
          default:
            throw new Error(errorData.message || '비밀번호 변경 중 오류가 발생했습니다.');
        }
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        throw new Error('요청 처리 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * 비밀번호 복잡도 검증
   * @param {string} password - 검증할 비밀번호
   * @returns {Object} 검증 결과
   */
  validatePasswordComplexity(password) {
    const result = {
      isValid: true,
      errors: []
    };

    // 길이 검증
    if (!password || password.length < 8) {
      result.errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
      result.isValid = false;
    }

    if (password && password.length > 100) {
      result.errors.push('비밀번호는 최대 100자까지 입력 가능합니다.');
      result.isValid = false;
    }

    if (password) {
      // 복잡도 검증
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasDigit = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      const complexity = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length;

      if (complexity < 2) {
        result.errors.push('영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다.');
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * 비밀번호 강도 계산
   * @param {string} password - 검증할 비밀번호
   * @returns {Object} 강도 정보
   */
  calculatePasswordStrength(password) {
    if (!password) {
      return { score: 0, level: 'none', message: '비밀번호를 입력해주세요.' };
    }

    let score = 0;

    // 길이 점수
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // 복잡도 점수
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    // 다양성 점수
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;

    // 레벨 결정
    let level, message;
    if (score <= 2) {
      level = 'weak';
      message = '약함 - 더 복잡한 비밀번호를 사용하세요.';
    } else if (score <= 4) {
      level = 'medium';
      message = '보통 - 더 안전한 비밀번호를 권장합니다.';
    } else if (score <= 6) {
      level = 'strong';
      message = '강함 - 좋은 비밀번호입니다.';
    } else {
      level = 'very-strong';
      message = '매우 강함 - 훌륭한 비밀번호입니다.';
    }

    return { score, level, message };
  }
}

// 싱글톤 인스턴스 생성
export const passwordService = new PasswordService();
export default passwordService;