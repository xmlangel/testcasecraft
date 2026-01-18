// src/services/apiService.js
/**
 * 중앙화된 API 서비스 레이어
 * - 모든 API 호출을 통합 관리
 * - 자동 토큰 갱신 및 인증 처리
 * - 에러 핸들링 표준화
 * - 요청/응답 인터셉터
 */

import { API_CONFIG, getDynamicApiUrl } from '../utils/apiConstants.js';

let API_BASE_URL = null;
let dynamicApiUrlPromise = null;

// 동적 API URL 가져오기 (캐싱 포함)
const getApiBaseUrl = async () => {
  if (!dynamicApiUrlPromise) {
    dynamicApiUrlPromise = getDynamicApiUrl().catch(error => {
      console.warn('동적 API URL 로드 실패, 기본값 사용:', error);
      return window.location.origin || 'http://localhost:8080';
    });
  }
  
  const url = await dynamicApiUrlPromise;
  if (url !== API_BASE_URL) {
    API_BASE_URL = url;
  }
  return url;
};

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

/**
 * API 서비스 클래스
 */
class ApiService {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * HTTP 요청 실행
   */
  async request(endpoint, options = {}) {
    const baseURL = await getApiBaseUrl();
    const url = `${baseURL}${endpoint}`;
    
    // 기본 옵션 설정
    const defaultOptions = {
      headers: {},
    };

    // 헤더 병합: options.headers가 항상 우선권을 가지도록 함
    const mergedHeaders = {};
    
    // 명시적으로 Content-Type이 설정되지 않은 경우에만 기본값 추가
    if (!options.headers || !options.headers['Content-Type']) {
      mergedHeaders['Content-Type'] = 'application/json';
    }
    
    // options의 헤더를 나중에 병합하여 우선권 부여
    Object.assign(mergedHeaders, options.headers || {});

    // 옵션 병합
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: mergedHeaders,
    };

    // 요청 인터셉터 실행
    for (const interceptor of this.requestInterceptors) {
      await interceptor(finalOptions);
    }


    try {
      let response = await fetch(url, finalOptions);

      // 401 에러 처리 (토큰 갱신)
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          this.handleAuthFailure();
          throw new ApiError('인증이 필요합니다. 다시 로그인해주세요.', 401, response);
        }

        try {
          // 토큰 갱신 시도
          const refreshResponse = await fetch(`${baseURL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('토큰 갱신 실패');
          }

          const { accessToken: newAccessToken } = await refreshResponse.json();
          localStorage.setItem('accessToken', newAccessToken);
          
          // 새 토큰으로 원래 요청 재시도
          finalOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(url, finalOptions);

        } catch (error) {
          this.handleAuthFailure();
          throw new ApiError('세션이 만료되었습니다. 다시 로그인해주세요.', 401, response);
        }
      }

      // 응답 인터셉터 실행
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      // 에러 응답 처리
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails = null;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData.details;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }

        throw new ApiError(errorMessage, response.status, response, errorDetails);
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // 네트워크 오류 등 기타 오류
      throw new ApiError(
        error.message || '네트워크 오류가 발생했습니다.',
        0,
        null
      );
    }
  }

  /**
   * 인증 실패 처리
   */
  handleAuthFailure() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 로그아웃 이벤트 발생
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  /**
   * 요청 인터셉터 추가
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 응답 인터셉터 추가
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // HTTP 메서드별 편의 함수들
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

// 기본 요청 인터셉터: 인증 토큰 자동 추가
apiService.addRequestInterceptor(async (options) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    // headers 객체가 이미 존재하는지 확인하고 안전하게 추가
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }
});

// 기본 응답 인터셉터: 로깅
apiService.addResponseInterceptor(async (response) => {
  if (process.env.NODE_ENV === 'development') {
  }
  return response;
});

export default apiService;
export { ApiService };