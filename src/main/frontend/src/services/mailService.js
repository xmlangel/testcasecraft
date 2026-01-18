// src/services/mailService.js
import { getDynamicApiUrl } from '../utils/apiConstants.js';

// 동적 API URL 가져오기
let API_BASE = null;
let BASE_URL = null;

const initializeUrls = async () => {
  if (!API_BASE) {
    API_BASE = await getDynamicApiUrl();
    BASE_URL = `${API_BASE}/api/admin/mail-settings`;
  }
  return BASE_URL;
};

class MailService {
    constructor() {
        this.baseURL = null;
    }

    async getBaseURL() {
        if (!this.baseURL) {
            this.baseURL = await initializeUrls();
        }
        return this.baseURL;
    }

    // JWT 토큰 가져오기
    getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // API 요청 공통 처리
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const baseURL = await this.getBaseURL();
            const response = await fetch(`${baseURL}${url}`, defaultOptions);
            
            // 401 Unauthorized - 토큰 만료 등
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                throw new Error('인증이 만료되었습니다. 다시 로그인하세요.');
            }

            // 403 Forbidden - 권한 없음
            if (response.status === 403) {
                throw new Error('관리자 권한이 필요합니다.');
            }

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.message || data || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    }

    /**
     * 현재 메일 설정 조회
     */
    async getSettings() {
        try {
            const response = await this.apiRequest('');
            return response;
        } catch (error) {
            throw new Error(`메일 설정 조회 실패: ${error.message}`);
        }
    }

    /**
     * 메일 설정 저장
     * @param {Object} settingsData - 메일 설정 데이터
     */
    async saveSettings(settingsData) {
        try {
            const response = await this.apiRequest('', {
                method: 'POST',
                body: JSON.stringify(settingsData)
            });
            return response;
        } catch (error) {
            throw new Error(`메일 설정 저장 실패: ${error.message}`);
        }
    }

    /**
     * 메일 설정 업데이트
     * @param {Object} settingsData - 메일 설정 데이터
     */
    async updateSettings(settingsData) {
        try {
            const response = await this.apiRequest('', {
                method: 'PUT',
                body: JSON.stringify(settingsData)
            });
            return response;
        } catch (error) {
            throw new Error(`메일 설정 업데이트 실패: ${error.message}`);
        }
    }

    /**
     * 테스트 메일 발송
     * @param {string} testRecipient - 테스트 메일 수신자
     */
    async testSettings(testRecipient) {
        try {
            const encodedRecipient = encodeURIComponent(testRecipient);
            const response = await this.apiRequest(`/test?testRecipient=${encodedRecipient}`, {
                method: 'POST'
            });
            return response;
        } catch (error) {
            throw new Error(`테스트 메일 발송 실패: ${error.message}`);
        }
    }

    /**
     * 메일 기능 비활성화
     */
    async disableSettings() {
        try {
            const response = await this.apiRequest('/disable', {
                method: 'POST'
            });
            return response;
        } catch (error) {
            throw new Error(`메일 기능 비활성화 실패: ${error.message}`);
        }
    }

    /**
     * Gmail 설정 가이드 조회
     */
    async getGmailGuide() {
        try {
            const response = await this.apiRequest('/guide');
            return response;
        } catch (error) {
            throw new Error(`Gmail 설정 가이드 조회 실패: ${error.message}`);
        }
    }

    /**
     * 메일 발송 (일반 용도)
     * @param {Object} mailData - 메일 데이터 {to, subject, text, isHtml}
     */
    async sendMail(mailData) {
        try {
            if (!API_BASE) {
                API_BASE = await getDynamicApiUrl();
            }
            const response = await fetch(`${API_BASE}/api/mail/send`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(mailData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `HTTP error! status: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            throw new Error(`메일 발송 실패: ${error.message}`);
        }
    }
}

// 싱글톤 패턴으로 인스턴스 생성
export const mailService = new MailService();
export default mailService;