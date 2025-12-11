// src/services/testResultService.js

/**
 * ICT-187: 테스트 결과 통계 API 연동 서비스
 * ICT-186에서 구현된 백엔드 API와 연동
 */

import { getDynamicApiUrl } from '../utils/apiConstants.js';

// 동적 API URL 관리
let API_BASE_URL = null;
let API_V2_BASE_URL = null;

const initializeUrls = async () => {
  if (!API_BASE_URL) {
    const baseUrl = await getDynamicApiUrl();
    API_BASE_URL = `${baseUrl}/api/test-results`;
    API_V2_BASE_URL = `${baseUrl}/api/test-results-v2`;
  }
  return { API_BASE_URL, API_V2_BASE_URL };
};

// 캐시 저장소 (간단한 메모리 캐시)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 진행 중인 요청 추적 (중복 호출 방지)
const pendingRequests = new Map();

/**
 * 토큰을 헤더에 포함하는 fetch 래퍼
 */
async function fetchWithAuth(url, options = {}) {
  await initializeUrls(); // URL 초기화 보장
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

    const request = (async () => {
      try {
        const { API_BASE_URL } = await initializeUrls();
        const url = `${API_BASE_URL}/statistics?${searchParams.toString()}`;

        // API 호출
        const data = await fetchWithAuth(url).then(res => res.json());

        // 캐시 저장
        if (useCache) {
          setCache(cacheKey, data);
        }
        return data;
      } finally {
        // 진행 중인 요청에서 제거
        pendingRequests.delete(cacheKey);
      }
    })();

    // 진행 중인 요청에 추가 (동기적 실행 보장)
    pendingRequests.set(cacheKey, request);

    return request;

  } catch (error) {
    // 동기적 에러 발생 시 (위의 async IIFE 밖에서는 거의 발생 안함)
    console.error('Failed to setup test result statistics fetch:', error);
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
    const { API_BASE_URL } = await initializeUrls();
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

    const { API_BASE_URL } = await initializeUrls();
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

    const { API_BASE_URL } = await initializeUrls();
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
 * @param {string} type - 'by-plan' 또는 'by-executor'
 * @param {object} params - { projectId, source }
 */
export async function getComparisonStatistics(type = 'by-plan', params = {}) {
  const { projectId, source = 'manual' } = params;

  if (!projectId) {
    console.warn('프로젝트 ID가 없습니다. 빈 배열 반환');
    return [];
  }

  try {
    const endpoint = type === 'by-plan' ? 'by-plan' : 'by-executor';
    const baseUrl = await getDynamicApiUrl();

    // Source에 따라 다른 API 호출
    const apiPath = source === 'automated'
      ? `/api/junit-results/comparison/${endpoint}`  // 자동화 테스트
      : `/api/test-results-v2/comparison/${endpoint}`; // 수동 테스트 또는 TOTAL

    const response = await fetchWithAuth(
      `${baseUrl}${apiPath}?projectId=${projectId}`
    );

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch comparison statistics:', error);

    // 에러 발생 시 기본 안내 데이터 반환
    return [
      { name: '데이터 로드 실패', passCount: 0, failCount: 0, blockedCount: 0, notRunCount: 0, totalTests: 0, successRate: 0 }
    ];
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

// ICT-263: 테스트결과 상세테이블 필터링 관련 함수들

/**
 * 프로젝트의 테스트 플랜 목록 조회 (필터링용)
 */
export async function getTestPlansForFilter(projectId, useCache = true) {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const cacheKey = getCacheKey('filter-test-plans', { projectId });

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
    const url = `${API_V2_BASE_URL}/filter/test-plans?projectId=${encodeURIComponent(projectId)}`;

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
    console.error('Failed to fetch test plans for filter:', error);
    throw error;
  }
}

/**
 * 테스트 플랜의 테스트 실행 목록 조회 (필터링용)
 */
export async function getTestExecutionsForFilter(projectId, testPlanId = null, useCache = true) {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const cacheKey = getCacheKey('filter-test-executions', { projectId, testPlanId });

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
    searchParams.append('projectId', projectId);
    if (testPlanId) {
      searchParams.append('testPlanId', testPlanId);
    }

    const url = `${API_V2_BASE_URL}/filter/test-executions?${searchParams.toString()}`;

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
    console.error('Failed to fetch test executions for filter:', error);
    throw error;
  }
}

/**
 * 필터링된 테스트 결과 조회
 */
export async function getFilteredTestResults(filters = {}, useCache = false) {
  const { projectId, testPlanId, testExecutionId, page = 0, size = 1000 } = filters;

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const cacheKey = getCacheKey('filtered-results', filters);

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
    searchParams.append('projectId', projectId);
    if (testPlanId) searchParams.append('testPlanId', testPlanId);
    if (testExecutionId) searchParams.append('testExecutionId', testExecutionId);
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());

    const url = `${API_V2_BASE_URL}/filter/results?${searchParams.toString()}`;

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
    console.error('Failed to fetch filtered test results:', error);
    throw error;
  }
}

// ICT-283: 계층적 상세 리포트 API 함수들

/**
 * ICT-283: 계층적 테스트 결과 상세 리포트 조회
 * 테스트플랜 > 실행 > 케이스 3단계 계층 구조로 반환
 */
export async function getHierarchicalTestResultReport(filter = {}, useCache = false) {
  const cacheKey = getCacheKey('hierarchical-report', filter);

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
    const { API_BASE_URL } = await initializeUrls();
    const url = `${API_BASE_URL}/detailed-report`;

    const request = fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({
        ...filter,
        hierarchicalStructure: true,
        includeNotExecuted: filter.includeNotExecuted !== false, // 기본값 true
        includeTestPlanInfo: true,
        includeTestExecutionInfo: true
      })
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
    console.error('Failed to fetch hierarchical test result report:', error);
    throw error;
  }
}

/**
 * ICT-283: 계층적 테스트 결과 상세 리포트 조회 (GET 버전) 
 */
export async function getHierarchicalTestResultReportSimple(params = {}) {
  const {
    projectId,
    testPlanId,
    testExecutionId,
    includeNotExecuted = true,
    page = 0,
    size = 50,
    useCache = true
  } = params;

  if (!projectId) {
    throw new Error('Project ID is required for hierarchical report');
  }

  const cacheKey = getCacheKey('hierarchical-simple', {
    projectId, testPlanId, testExecutionId, includeNotExecuted, page, size
  });

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
    if (testPlanId) searchParams.append('testPlanId', testPlanId);
    if (testExecutionId) searchParams.append('testExecutionId', testExecutionId);
    searchParams.append('includeNotExecuted', includeNotExecuted.toString());
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());

    const { API_BASE_URL } = await initializeUrls();
    const url = `${API_BASE_URL}/detailed-report/${projectId}?${searchParams.toString()}`;

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
    console.error('Failed to fetch simple hierarchical test result report:', error);
    throw error;
  }
}

/**
 * ICT-283: 계층적 리포트 내보내기
 */
export async function exportHierarchicalTestResultReport(filter = {}) {
  try {
    const { API_BASE_URL } = await initializeUrls();
    const url = `${API_BASE_URL}/export-hierarchical`;

    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({
        ...filter,
        hierarchicalStructure: true,
        includeNotExecuted: filter.includeNotExecuted !== false,
        includeTestPlanInfo: true,
        includeTestExecutionInfo: true,
        exportFormat: filter.exportFormat || 'EXCEL'
      })
    });

    return response;

  } catch (error) {
    console.error('Failed to export hierarchical test result report:', error);
    throw error;
  }
}

/**
 * ICT-283: 완전한 테스트 케이스 목록 조회 (미실행 포함)
 */
export async function getCompleteTestCasesList(params = {}) {
  const {
    projectId,
    testPlanId,
    folderPath,
    page = 0,
    size = 100,
    sortBy = 'testCaseName',
    sortDirection = 'asc',
    useCache = true
  } = params;

  if (!projectId) {
    throw new Error('Project ID is required for complete test cases list');
  }

  const cacheKey = getCacheKey('complete-cases', {
    projectId, testPlanId, folderPath, page, size, sortBy, sortDirection
  });

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
    if (testPlanId) searchParams.append('testPlanId', testPlanId);
    if (folderPath) searchParams.append('folderPath', folderPath);
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    searchParams.append('sortBy', sortBy);
    searchParams.append('sortDirection', sortDirection);

    const { API_BASE_URL } = await initializeUrls();
    const url = `${API_BASE_URL}/complete-cases/${projectId}?${searchParams.toString()}`;

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
    console.error('Failed to fetch complete test cases list:', error);
    throw error;
  }
}

// 기본 내보내기
const testResultService = {
  getTestResultStatistics,
  getDetailedTestResultReport,
  getSimpleTestResultReport,
  getJiraStatusSummary,
  getComparisonStatistics,
  clearCache,
  handleTestResultError,
  // ICT-263: 필터링 관련 함수들
  getTestPlansForFilter,
  getTestExecutionsForFilter,
  getFilteredTestResults,
  // ICT-283: 계층적 상세 리포트 함수들
  getHierarchicalTestResultReport,
  getHierarchicalTestResultReportSimple,
  exportHierarchicalTestResultReport,
  getCompleteTestCasesList
};

export default testResultService;