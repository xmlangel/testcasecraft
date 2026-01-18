// src/services/jiraService.js
import { getDynamicApiUrl } from '../utils/apiConstants.js';

class JiraService {
    constructor() {
        this.baseURL = null;
        this.pendingRequests = new Map();
    }

    async getBaseURL() {
        if (!this.baseURL) {
            const apiUrl = await getDynamicApiUrl();
            this.baseURL = `${apiUrl}/api/jira`;
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
                // 토큰 갱신 시도 또는 로그인 페이지로 리다이렉트
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                throw new Error('인증이 필요합니다');
            }

            // 404 Not Found
            if (response.status === 404) {
                return null;
            }

            // 기타 HTTP 에러
            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    // JSON 파싱 실패 시 기본 에러 메시지
                    errorData = { message: `HTTP Error: ${response.status}` };
                }

                // 에러 메시지 구성
                let errorMessage = errorData.error || errorData.message || `HTTP Error: ${response.status}`;

                // 상세 정보가 있으면 추가
                if (errorData.detail && errorData.detail !== errorMessage) {
                    errorMessage += ` (${errorData.detail})`;
                }

                console.error('❌ API 요청 실패:', {
                    status: response.status,
                    error: errorMessage,
                    url: `${this.baseURL}${url}`
                });

                throw new Error(errorMessage);
            }

            // 빈 응답 처리
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return {};
            }

            return await response.json();
        } catch (error) {
            console.error(`JIRA API 요청 실패 [${options.method || 'GET'}] ${url}:`, error);
            throw error;
        }
    }

    /**
     * 사용자의 활성화된 JIRA 설정 조회
     */
    async getActiveConfig() {
        try {
            const config = await this.apiRequest('/config');
            return config;
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * 사용자의 모든 JIRA 설정 조회
     */
    async getAllConfigs() {
        try {
            const configs = await this.apiRequest('/configs');
            // 응답이 배열인지 확인하고, 아니면 빈 배열 반환
            return Array.isArray(configs) ? configs : [];
        } catch (error) {
            console.error('JIRA 설정 목록 조회 실패:', error);
            // 에러 발생 시 빈 배열 반환
            return [];
        }
    }

    /**
     * JIRA 설정 저장
     */
    async saveConfig(configData) {
        try {
            const result = await this.apiRequest('/config', {
                method: 'POST',
                body: JSON.stringify(configData)
            });

            return result;

        } catch (error) {
            console.error('❌ JIRA 설정 저장 실패:', error);

            // 에러 메시지 개선
            let enhancedError = error;

            if (error.message) {
                if (error.message.includes('400')) {
                    enhancedError = new Error('입력 데이터를 확인해주세요. 필수 필드가 누락되었거나 형식이 올바르지 않습니다.');
                } else if (error.message.includes('401')) {
                    enhancedError = new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                } else if (error.message.includes('403')) {
                    enhancedError = new Error('JIRA 설정 저장 권한이 없습니다.');
                } else if (error.message.includes('500')) {
                    enhancedError = new Error('서버 오류가 발생했습니다. 관리자에게 문의하세요.');
                } else if (error.message.includes('암호화')) {
                    enhancedError = new Error('서버 암호화 설정에 문제가 있습니다. 관리자에게 문의하세요.');
                } else if (error.message.includes('네트워크') || error.message.includes('fetch')) {
                    enhancedError = new Error('네트워크 연결을 확인해주세요.');
                }
            }

            throw enhancedError;
        }
    }

    /**
     * JIRA 연결 테스트
     */
    async testConnection(testConfig) {
        const result = await this.apiRequest('/test-connection', {
            method: 'POST',
            body: JSON.stringify(testConfig)
        });

        // null 또는 undefined 응답 처리
        if (!result) {
            return {
                isConnected: false,
                status: 'ERROR',
                message: '서버로부터 응답을 받지 못했습니다.'
            };
        }

        // isConnected 필드가 없는 경우 기본값 설정
        if (typeof result.isConnected === 'undefined') {
            result.isConnected = false;
        }

        return result;
    }

    /**
     * JIRA 설정 삭제
     */
    async deleteConfig(configId) {
        const result = await this.apiRequest(`/config/${configId}`, {
            method: 'DELETE'
        });

        if (!result.success) {
            throw new Error(result.message || '설정 삭제 실패');
        }

        return result;
    }

    /**
     * JIRA 프로젝트 목록 조회
     */
    async getProjects() {
        return await this.apiRequest('/projects');
    }

    /**
     * JIRA 연결 상태 확인
     */
    async getConnectionStatus() {
        const cacheKey = 'connection-status';

        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        const request = (async () => {
            try {
                const result = await this.apiRequest('/connection-status');
                return result;
            } catch (error) {
                console.error('❌ JIRA 연결 상태 조회 실패:', error);
                return { hasConfig: false, error: '연결 상태 확인 실패' };
            } finally {
                this.pendingRequests.delete(cacheKey);
            }
        })();

        this.pendingRequests.set(cacheKey, request);
        return request;
    }

    /**
     * 테스트 결과 JIRA 코멘트 추가
     */
    async addTestResultComment(issueKey, comment) {
        const result = await this.apiRequest('/add-comment', {
            method: 'POST',
            body: JSON.stringify({ issueKey, comment })
        });

        if (!result.success) {
            throw new Error(result.message || '코멘트 추가 실패');
        }

        return result;
    }

    /**
     * JIRA 이슈 키 유효성 검증 (클라이언트 사이드)
     */
    isValidIssueKey(issueKey) {
        if (!issueKey || typeof issueKey !== 'string') {
            return false;
        }

        // JIRA 이슈 키 패턴: 프로젝트키-숫자 (예: TEST-123, PROJECT-1)
        // 이미 입력 시 대문자로 변환되므로 원본 그대로 검증
        const pattern = /^[A-Z]+-\d+$/;
        return pattern.test(issueKey.trim());
    }

    /**
     * 텍스트에서 JIRA 이슈 키 추출
     */
    extractIssueKeys(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const pattern = /[A-Z]+-\d+/g;
        const matches = text.match(pattern);

        return matches ? [...new Set(matches)] : [];
    }

    /**
     * JIRA 서버 URL 정규화
     */
    normalizeServerUrl(url) {
        if (!url) return '';

        let normalized = url.trim();

        // 프로토콜 추가
        if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
            normalized = 'https://' + normalized;
        }

        // 마지막 슬래시 제거
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }

        return normalized;
    }

    /**
     * 에러 메시지 사용자 친화적으로 변환
     */
    getUserFriendlyErrorMessage(error) {
        if (!error) return '알 수 없는 오류가 발생했습니다';

        const message = error.message || error.toString();

        // 네트워크 오류
        if (message.includes('fetch') || message.includes('network')) {
            return '네트워크 연결을 확인해주세요';
        }

        // 인증 오류
        if (message.includes('401') || message.includes('Unauthorized')) {
            return '인증 정보를 확인해주세요';
        }

        // 권한 오류
        if (message.includes('403') || message.includes('Forbidden')) {
            return '접근 권한이 없습니다';
        }

        // 서버 오류
        if (message.includes('500') || message.includes('Internal Server Error')) {
            return 'JIRA 서버 오류가 발생했습니다';
        }

        // 연결 오류
        if (message.includes('Connection') || message.includes('timeout')) {
            return 'JIRA 서버에 연결할 수 없습니다';
        }

        return message;
    }

    /**
     * JIRA 이슈 검색
     */
    async searchIssues(query) {
        return await this.apiRequest('/search', {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    /**
     * JIRA 이슈 상세 정보 조회
     */
    async getIssueDetails(issueKey) {
        return await this.apiRequest(`/issue/${issueKey}`);
    }

    /**
     * JIRA 이슈 존재 여부 확인
     * ICT-184: 이슈 입력 시 존재 여부 검증
     */
    async checkIssueExists(issueKey) {
        try {
            if (!issueKey || !issueKey.trim()) {
                return {
                    exists: false,
                    issueKey: issueKey,
                    errorMessage: '이슈 키가 입력되지 않았습니다.'
                };
            }

            // 클라이언트 사이드 형식 검증
            if (!this.isValidIssueKey(issueKey)) {
                return {
                    exists: false,
                    issueKey: issueKey,
                    errorMessage: '잘못된 이슈 키 형식입니다. (예: TEST-123)'
                };
            }

            // 백엔드 API 호출
            const apiUrl = await getDynamicApiUrl();
            const url = `${apiUrl}/api/jira-integration/check-issue-exists?issueKey=${encodeURIComponent(issueKey)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                throw new Error('인증이 필요합니다');
            }

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('JIRA 이슈 존재 확인 실패:', error);
            return {
                exists: false,
                issueKey: issueKey,
                errorMessage: this.getUserFriendlyErrorMessage(error)
            };
        }
    }

    /**
     * 배치 작업: 여러 이슈에 동일한 코멘트 추가
     */
    async addBatchComments(issueKeys, comment) {
        if (!Array.isArray(issueKeys) || issueKeys.length === 0) {
            throw new Error('이슈 키 목록이 필요합니다');
        }

        const results = [];
        const batchSize = 5; // 동시 요청 제한

        for (let i = 0; i < issueKeys.length; i += batchSize) {
            const batch = issueKeys.slice(i, i + batchSize);

            const batchPromises = batch.map(async (issueKey) => {
                try {
                    await this.addTestResultComment(issueKey, comment);
                    return { issueKey, success: true };
                } catch (error) {
                    console.error(`코멘트 추가 실패: ${issueKey}`, error);
                    return {
                        issueKey,
                        success: false,
                        error: this.getUserFriendlyErrorMessage(error)
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // 다음 배치 전에 잠시 대기 (API 제한 방지)
            if (i + batchSize < issueKeys.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }
}

export const jiraService = new JiraService();
export default jiraService;