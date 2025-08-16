// src/main/frontend/src/services/jiraStatusService.js

/**
 * ICT-189: JIRA 상태 집계 서비스
 * 백엔드의 JIRA 상태 집계 API와 통신하는 프론트엔드 서비스
 */

const API_BASE_URL = '/api/jira-status';

/**
 * API 요청을 위한 공통 헤더 생성
 */
const getHeaders = () => {
    // AppContext에서 accessToken으로 저장하므로 accessToken을 먼저 확인
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

/**
 * API 응답 처리 헬퍼
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.text();
    }
};

/**
 * 에러 로깅 및 처리
 */
const handleError = (error, context) => {
    console.error(`JIRA Status Service Error [${context}]:`, error);
    throw error;
};

/**
 * JIRA 상태 서비스 클래스
 */
class JiraStatusService {
    
    /**
     * 프로젝트의 JIRA 상태 요약 조회
     * @param {string} projectId - 프로젝트 ID
     * @returns {Promise<Array>} JIRA 상태 요약 배열
     */
    async getProjectJiraStatusSummary(projectId) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/summary`, {
                method: 'GET',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            handleError(error, 'getProjectJiraStatusSummary');
        }
    }

    /**
     * 특정 JIRA 이슈의 상세 상태 조회
     * @param {string} jiraId - JIRA 이슈 키 (예: PRJ-123)
     * @returns {Promise<Object>} JIRA 상태 상세 정보
     */
    async getJiraStatusDetail(jiraId) {
        try {
            const response = await fetch(`${API_BASE_URL}/issues/${jiraId}`, {
                method: 'GET',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            handleError(error, 'getJiraStatusDetail');
        }
    }

    /**
     * 프로젝트의 JIRA 상태 강제 새로고침
     * @param {string} projectId - 프로젝트 ID
     * @returns {Promise<Array>} 새로고침된 JIRA 상태 요약 배열
     */
    async refreshProjectJiraStatus(projectId) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/refresh`, {
                method: 'POST',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            handleError(error, 'refreshProjectJiraStatus');
        }
    }

    /**
     * 여러 프로젝트의 JIRA 상태 요약 배치 조회
     * @param {Array<string>} projectIds - 프로젝트 ID 배열
     * @returns {Promise<Object>} 프로젝트별 JIRA 상태 요약 맵
     */
    async getBatchProjectJiraStatusSummary(projectIds) {
        try {
            if (!Array.isArray(projectIds) || projectIds.length === 0) {
                throw new Error('프로젝트 ID 배열이 필요합니다');
            }

            if (projectIds.length > 20) {
                throw new Error('한 번에 최대 20개 프로젝트까지만 조회 가능합니다');
            }

            const response = await fetch(`${API_BASE_URL}/projects/batch-summary`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(projectIds)
            });
            
            return await handleResponse(response);
        } catch (error) {
            handleError(error, 'getBatchProjectJiraStatusSummary');
        }
    }

    /**
     * JIRA 상태 통계 조회
     * @param {string} [projectId] - 프로젝트 ID (선택적)
     * @returns {Promise<Object>} JIRA 상태 통계 정보
     */
    async getJiraStatusStatistics(projectId = null) {
        try {
            const url = projectId 
                ? `${API_BASE_URL}/statistics?projectId=${encodeURIComponent(projectId)}`
                : `${API_BASE_URL}/statistics`;

            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            handleError(error, 'getJiraStatusStatistics');
        }
    }
}

/**
 * JIRA 상태 캐시 관리 클래스
 */
class JiraStatusCache {
    constructor(defaultTtl = 5 * 60 * 1000) { // 5분 기본 TTL
        this.cache = new Map();
        this.defaultTtl = defaultTtl;
    }

    /**
     * 캐시 키 생성
     */
    generateKey(method, ...params) {
        return `${method}_${params.join('_')}`;
    }

    /**
     * 캐시에서 데이터 조회
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // TTL 확인
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        console.log(`JIRA Status Cache Hit: ${key}`);
        return item.data;
    }

    /**
     * 캐시에 데이터 저장
     */
    set(key, data, ttl = this.defaultTtl) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
        
        console.log(`JIRA Status Cache Set: ${key} (TTL: ${ttl}ms)`);
    }

    /**
     * 캐시 항목 삭제
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            console.log(`JIRA Status Cache Delete: ${key}`);
        }
        return deleted;
    }

    /**
     * 프로젝트 관련 캐시 무효화
     */
    evictProject(projectId) {
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (key.includes(`_${projectId}_`) || key.endsWith(`_${projectId}`)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        console.log(`JIRA Status Cache Evicted ${keysToDelete.length} items for project: ${projectId}`);
    }

    /**
     * 전체 캐시 클리어
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`JIRA Status Cache Cleared: ${size} items`);
    }

    /**
     * 캐시 통계 조회
     */
    getStats() {
        const now = Date.now();
        let validItems = 0;
        let expiredItems = 0;

        for (const item of this.cache.values()) {
            if (now > item.expiry) {
                expiredItems++;
            } else {
                validItems++;
            }
        }

        return {
            totalItems: this.cache.size,
            validItems,
            expiredItems,
            hitRatio: this.hitCount / (this.hitCount + this.missCount) || 0
        };
    }
}

/**
 * 캐시가 적용된 JIRA 상태 서비스
 */
class CachedJiraStatusService extends JiraStatusService {
    constructor() {
        super();
        this.cache = new JiraStatusCache();
        this.hitCount = 0;
        this.missCount = 0;
    }

    async getProjectJiraStatusSummary(projectId, useCache = true) {
        const cacheKey = this.cache.generateKey('getProjectJiraStatusSummary', projectId);
        
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.hitCount++;
                return cached;
            }
        }

        this.missCount++;
        const result = await super.getProjectJiraStatusSummary(projectId);
        
        if (useCache && result) {
            this.cache.set(cacheKey, result);
        }
        
        return result;
    }

    async getJiraStatusDetail(jiraId, useCache = true) {
        const cacheKey = this.cache.generateKey('getJiraStatusDetail', jiraId);
        
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.hitCount++;
                return cached;
            }
        }

        this.missCount++;
        const result = await super.getJiraStatusDetail(jiraId);
        
        if (useCache && result) {
            this.cache.set(cacheKey, result);
        }
        
        return result;
    }

    async refreshProjectJiraStatus(projectId) {
        // 새로고침 시 관련 캐시 무효화
        this.cache.evictProject(projectId);
        
        const result = await super.refreshProjectJiraStatus(projectId);
        
        // 새로운 데이터를 캐시에 저장
        if (result) {
            const cacheKey = this.cache.generateKey('getProjectJiraStatusSummary', projectId);
            this.cache.set(cacheKey, result);
        }
        
        return result;
    }

    async getJiraStatusStatistics(projectId = null, useCache = true) {
        const cacheKey = this.cache.generateKey('getJiraStatusStatistics', projectId || 'all');
        
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.hitCount++;
                return cached;
            }
        }

        this.missCount++;
        const result = await super.getJiraStatusStatistics(projectId);
        
        if (useCache && result) {
            // 통계는 더 짧은 TTL 적용 (1분)
            this.cache.set(cacheKey, result, 1 * 60 * 1000);
        }
        
        return result;
    }

    /**
     * 캐시 통계 조회
     */
    getCacheStats() {
        return {
            ...this.cache.getStats(),
            hitCount: this.hitCount,
            missCount: this.missCount
        };
    }

    /**
     * 캐시 클리어
     */
    clearCache() {
        this.cache.clear();
        this.hitCount = 0;
        this.missCount = 0;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const jiraStatusService = new CachedJiraStatusService();

export default jiraStatusService;

// 개별 클래스들도 내보내기 (테스트 등에서 사용 가능)
export { JiraStatusService, JiraStatusCache, CachedJiraStatusService };