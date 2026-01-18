// src/services/authService.js
/**
 * 인증 관련 API 서비스
 */

import apiService from './apiService.js';

class AuthService {
  /**
   * 로그인
   */
  async login(credentials) {
    const response = await apiService.post('/api/auth/login', credentials);
    return response.json();
  }

  /**
   * 회원가입
   */
  async register(userData) {
    const response = await apiService.post('/api/auth/register', userData);
    return response.json();
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken) {
    const response = await apiService.post('/api/auth/refresh', { refreshToken });
    return response.json();
  }

  /**
   * 사용자 정보 조회
   */
  async getUserInfo() {
    const response = await apiService.get('/api/auth/me');
    return response.json();
  }

  /**
   * 사용자 정보 수정
   */
  async updateUserProfile(userData) {
    const response = await apiService.put('/api/auth/me', userData);
    return response.json();
  }

  /**
   * 버전 정보 조회
   * Backend, Frontend, RAG Service 버전 정보를 가져옴
   */
  async getVersionInfo() {
    const response = await apiService.get('/api/version');
    return response.json();
  }

  /**
   * 로그아웃
   */
  async logout() {
    // 서버에 로그아웃 요청이 있다면 여기서 처리
    // 현재는 클라이언트 측에서만 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export default new AuthService();