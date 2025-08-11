// src/services/testResultService.js

/**
 * ICT-187: 테스트 결과 통계 API 연동 서비스
 * ICT-186에서 구현된 백엔드 API와 연동
 */

// AppContext.jsx와 동일한 방식으로 백엔드 서버 URL 설정
const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BACKEND_BASE_URL}/api/test-results`;

// 캐시 저장소 (간단한 메모리 캐시)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 진행 중인 요청 추적 (중복 호출 방지)
const pendingRequests = new Map();

/**
 * 토큰을 헤더에 포함하는 fetch 래퍼
 */
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // 401 에러 시 토큰 만료 처리
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }

  return response;
}

/**
 * 캐시 키 생성
 */
function getCacheKey(endpoint, params = {}) {
  const paramStr = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${endpoint}?${paramStr}`;
}

/**
 * 캐시에서 데이터 조회
 */
function getFromCache(cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

/**
 * 캐시에 데이터 저장
 */
function setCache(cacheKey, data) {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * ICT-186 API: 테스트 결과 통계 조회
 */
export async function getTestResultStatistics(params = {}) {
  const { projectId, testPlanId, testExecutionId, useCache = true } = params;
  
  // 캐시 키 생성
  const cacheKey = getCacheKey('statistics', { projectId, testPlanId, testExecutionId });
  
  // 캐시 확인
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // 진행 중인 요청 확인 (중복 호출 방지)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  try {
    // URL과 파라미터 구성
    const searchParams = new URLSearchParams();
    if (projectId) searchParams.append('projectId', projectId);
    if (testPlanId) searchParams.append('testPlanId', testPlanId);
    if (testExecutionId) searchParams.append('testExecutionId', testExecutionId);
    
    const url = `${API_BASE_URL}/statistics?${searchParams.toString()}`;
    
    // API 호출
    const request = fetchWithAuth(url)
      .then(response => response.json())
      .then(data => {
        // 캐시 저장
        if (useCache) {
          setCache(cacheKey, data);
        }
        return data;
      })
      .finally(() => {
        // 진행 중인 요청에서 제거
        pendingRequests.delete(cacheKey);
      });
    
    // 진행 중인 요청에 추가
    pendingRequests.set(cacheKey, request);
    
    return await request;
    
  } catch (error) {
    pendingRequests.delete(cacheKey);
    console.error('Failed to fetch test result statistics:', error);
    throw error;
  }
}

/**
 * ICT-186 API: 상세 테스트 결과 리포트 조회 (POST 버전)
 */
export async function getDetailedTestResultReport(filter = {}, useCache = false) {
  const cacheKey = getCacheKey('detailed-report', filter);
  
  // 상세 리포트는 필터가 복잡하므로 기본적으로 캐시 비활성화
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  try {
    const url = `${API_BASE_URL}/report`;
    
    const request = fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(filter)
    })
      .then(response => response.json())
      .then(data => {
        if (useCache) {
          setCache(cacheKey, data);
        }
        return data;
      })
      .finally(() => {
        pendingRequests.delete(cacheKey);
      });
    
    pendingRequests.set(cacheKey, request);
    return await request;
    
  } catch (error) {
    pendingRequests.delete(cacheKey);
    console.error('Failed to fetch detailed test result report:', error);
    throw error;
  }
}

/**
 * ICT-186 API: 간단한 상세 테스트 결과 리포트 조회 (GET 버전)
 */
export async function getSimpleTestResultReport(params = {}) {
  const { projectId, testPlanId, testExecutionId, page = 0, size = 50, useCache = true } = params;
  
  const cacheKey = getCacheKey('simple-report', { projectId, testPlanId, testExecutionId, page, size });
  
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  try {
    const searchParams = new URLSearchParams();
    if (projectId) searchParams.append('projectId', projectId);
    if (testPlanId) searchParams.append('testPlanId', testPlanId);
    if (testExecutionId) searchParams.append('testExecutionId', testExecutionId);
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    
    const url = `${API_BASE_URL}/report?${searchParams.toString()}`;
    
    const request = fetchWithAuth(url)
      .then(response => response.json())
      .then(data => {
        if (useCache) {
          setCache(cacheKey, data);
        }
        return data;
      })
      .finally(() => {
        pendingRequests.delete(cacheKey);
      });
    
    pendingRequests.set(cacheKey, request);
    return await request;
    
  } catch (error) {
    pendingRequests.delete(cacheKey);
    console.error('Failed to fetch simple test result report:', error);
    throw error;
  }
}

/**
 * ICT-186 API: JIRA 상태 통합 리스트 조회
 */
export async function getJiraStatusSummary(params = {}) {
  const { projectId, testPlanId, activeOnly, refreshCache = false, useCache = true } = params;
  
  const cacheKey = getCacheKey('jira-status', { projectId, testPlanId, activeOnly });
  
  if (useCache && !refreshCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  try {
    const searchParams = new URLSearchParams();
    if (projectId) searchParams.append('projectId', projectId);
    if (testPlanId) searchParams.append('testPlanId', testPlanId);
    if (activeOnly !== undefined) searchParams.append('activeOnly', activeOnly.toString());
    if (refreshCache) searchParams.append('refreshCache', 'true');
    
    const url = `${API_BASE_URL}/jira-status?${searchParams.toString()}`;
    
    const request = fetchWithAuth(url)
      .then(response => response.json())
      .then(data => {
        if (useCache) {
          setCache(cacheKey, data);
        }
        return data;
      })
      .finally(() => {
        pendingRequests.delete(cacheKey);
      });
    
    pendingRequests.set(cacheKey, request);
    return await request;
    
  } catch (error) {
    pendingRequests.delete(cacheKey);
    console.error('Failed to fetch JIRA status summary:', error);
    throw error;
  }
}

/**
 * 비교용 통계 데이터 생성 (테스트 플랜별 또는 실행자별)
 */
export async function getComparisonStatistics(type = 'by-plan', params = {}) {
  const { projectId } = params;
  
  try {
    if (type === 'by-plan') {
      // 프로젝트의 모든 테스트 플랜별 통계 조회
      // TODO: 실제로는 백엔드에서 제공하는 비교 API 사용
      // 현재는 mock 데이터 반환
      return [
        { name: '로그인 테스트', passCount: 15, failCount: 2, blockedCount: 1, notRunCount: 0 },
        { name: 'API 테스트', passCount: 12, failCount: 5, blockedCount: 0, notRunCount: 3 },
        { name: 'UI 테스트', passCount: 8, failCount: 3, blockedCount: 2, notRunCount: 2 }
      ];
    } else if (type === 'by-executor') {
      // 실행자별 통계
      return [
        { name: '김개발', passCount: 20, failCount: 3, blockedCount: 1, notRunCount: 1 },
        { name: '이테스트', passCount: 15, failCount: 7, blockedCount: 2, notRunCount: 4 }
      ];
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch comparison statistics:', error);
    throw error;
  }
}

/**
 * 캐시 초기화
 */
export function clearCache() {
  cache.clear();
}

/**
 * 에러 처리 헬퍼
 */
export function handleTestResultError(error, context = 'test result operation') {
  console.error(`Error during ${context}:`, error);
  
  if (error.message?.includes('Authentication failed')) {
    return {
      type: 'auth_error',
      message: '로그인이 필요합니다.',
      action: 'redirect_login'
    };
  }
  
  if (error.message?.includes('Network')) {
    return {
      type: 'network_error',
      message: '네트워크 연결을 확인해주세요.',
      action: 'retry'
    };
  }
  
  return {
    type: 'api_error',
    message: error.message || '데이터를 불러오는 중 오류가 발생했습니다.',
    action: 'refresh'
  };
}

// 기본 내보내기
const testResultService = {
  getTestResultStatistics,
  getDetailedTestResultReport,
  getSimpleTestResultReport,
  getJiraStatusSummary,
  getComparisonStatistics,
  clearCache,
  handleTestResultError
};

export default testResultService;