// src/utils/axiosInstance.js
/**
 * Shared axios instance with automatic token refresh interceptors
 * 
 * This module provides a configured axios instance that:
 * - Automatically injects access tokens from localStorage
 * - Handles 401/403 errors by refreshing the token
 * - Prevents duplicate refresh requests using promise caching
 * - Retries failed requests with the new token
 */

import axios from 'axios';
import { API_CONFIG } from './apiConstants.js';

// Promise 캐싱용 전역 변수 (토큰 갱신 중복 호출 방지)
let refreshTokenPromise = null;

// 공통 axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
});

// Request Interceptor: 모든 요청에 access token 자동 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: 401/403 에러 시 토큰 갱신 후 재시도
axiosInstance.interceptors.response.use(
    (response) => response, // 성공 응답은 그대로 반환
    async (error) => {
        const originalRequest = error.config;

        // 403 Forbidden 에러 처리 (권한 없음)
        if (error.response?.status === 403) {
            console.warn('[axiosInstance] 403 Forbidden:', error.response.data);

            // 백엔드에서 보낸 상세 에러 메시지 추출
            const errorData = error.response.data || {};
            const message = errorData.message || '접근 권한이 없습니다. 관리자에게 문의하세요.';
            const detail = errorData.error ? `${errorData.error}: ${message}` : message;

            // 전역 이벤트 발생 (App.jsx에서 수신하여 스낵바 표시)
            window.dispatchEvent(new CustomEvent('api-error', {
                detail: {
                    message: detail,
                    severity: 'error',
                    status: 403
                }
            }));

            return Promise.reject(error);
        }

        // 401 Unauthorized 에러 처리 (토큰 만료 등)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 플래그 설정

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                // Refresh token이 없으면 로그아웃 처리
                console.warn('[axiosInstance] No refresh token available, clearing tokens');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(error);
            }

            try {
                // Promise 캐싱: 동시에 여러 요청이 실패해도 토큰 갱신은 한 번만
                if (!refreshTokenPromise) {
                    console.log('[axiosInstance] Starting token refresh...');
                    refreshTokenPromise = axios.post(
                        `${API_CONFIG.BASE_URL}/api/auth/refresh`,
                        { refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    )
                        .then((response) => {
                            const { accessToken } = response.data;
                            localStorage.setItem('accessToken', accessToken);
                            console.log('[axiosInstance] Token refreshed successfully');
                            return accessToken;
                        })
                        .catch((refreshError) => {
                            console.error('[axiosInstance] Token refresh failed:', refreshError);
                            throw refreshError;
                        })
                        .finally(() => {
                            refreshTokenPromise = null; // 완료 후 캐시 초기화
                        });
                }

                const newAccessToken = await refreshTokenPromise;

                // 원래 요청에 새 토큰 적용 후 재시도
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                console.log('[axiosInstance] Retrying original request with new token');
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh 실패 시 로그아웃
                console.error('[axiosInstance] Token refresh failed, clearing tokens');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }

        // 다른 에러는 그대로 반환
        return Promise.reject(error);
    }
);

export default axiosInstance;
