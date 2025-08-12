// src/utils/apiConstants.js
// ICT-194 Phase 2: API 호출 관련 상수 및 유틸리티 통합

/**
 * API 기본 설정
 */
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 30000, // 30초
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000 // 1초
};

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout'
  },
  
  // 프로젝트
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id) => `/api/projects/${id}`,
  
  // 테스트 케이스
  TESTCASES: '/api/testcases',
  TESTCASE_BY_ID: (id) => `/api/testcases/${id}`,
  TESTCASES_BY_PROJECT: (projectId) => `/api/testcases?projectId=${projectId}`,
  
  // 테스트 플랜
  TESTPLANS: '/api/testplans',
  TESTPLAN_BY_ID: (id) => `/api/testplans/${id}`,
  TESTPLANS_BY_PROJECT: (projectId) => `/api/testplans?projectId=${projectId}`,
  
  // 테스트 실행
  EXECUTIONS: '/api/test-executions',
  EXECUTION_BY_ID: (id) => `/api/test-executions/${id}`,
  EXECUTIONS_BY_PROJECT: (projectId) => `/api/test-executions?projectId=${projectId}`,
  
  // ICT-185: 테스트 결과 리포트 API
  TEST_RESULTS: {
    STATISTICS: '/api/test-results/statistics',
    REPORT: '/api/test-results/report',
    EXPORT: '/api/test-results/export',
    JIRA_STATUS: '/api/test-results/jira-status',
    FILTER_PRESETS: '/api/test-results/filter-presets'
  },
  
  // JIRA 통합
  JIRA: {
    CONFIG: '/api/jira/config',
    STATUS: '/api/jira/status',
    SYNC: '/api/jira/sync',
    ISSUES: '/api/jira/issues'
  }
};

/**
 * HTTP 메서드
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

/**
 * HTTP 상태 코드
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * 컨텐츠 타입
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PDF: 'application/pdf'
};

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  NETWORK: '네트워크 연결을 확인해주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
  INVALID_RESPONSE: '잘못된 응답 형식입니다.',
  PARSE_ERROR: '데이터 파싱 중 오류가 발생했습니다.'
};

/**
 * API 요청 옵션 기본값
 */
export const DEFAULT_REQUEST_OPTIONS = {
  method: HTTP_METHODS.GET,
  headers: {
    'Content-Type': CONTENT_TYPES.JSON,
    'Accept': CONTENT_TYPES.JSON
  },
  timeout: API_CONFIG.TIMEOUT
};

// ========== 유틸리티 함수들 ==========

/**
 * 전체 URL 생성
 * @param {string} endpoint 엔드포인트 경로
 * @param {string} baseUrl 기본 URL (선택사항)
 * @returns {string} 전체 URL
 */
export const buildUrl = (endpoint, baseUrl = API_CONFIG.BASE_URL) => {
  // 이미 전체 URL인 경우
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // 슬래시 정규화
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${normalizedBaseUrl}${normalizedEndpoint}`;
};

/**
 * 쿼리 파라미터 추가
 * @param {string} url 기본 URL
 * @param {Object} params 쿼리 파라미터 객체
 * @returns {string} 쿼리 파라미터가 추가된 URL
 */
export const addQueryParams = (url, params = {}) => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  
  const urlObj = new URL(url);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => urlObj.searchParams.append(key, v));
      } else {
        urlObj.searchParams.set(key, value);
      }
    }
  });
  
  return urlObj.toString();
};

/**
 * HTTP 상태 코드 검사
 * @param {number} status HTTP 상태 코드
 * @returns {boolean} 성공 여부
 */
export const isSuccessStatus = (status) => {
  return status >= 200 && status < 300;
};

/**
 * 에러 응답 파싱
 * @param {Response} response Fetch API 응답 객체
 * @returns {Promise<string>} 에러 메시지
 */
export const parseErrorResponse = async (response) => {
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data.message || data.error || ERROR_MESSAGES.UNKNOWN;
    } else {
      const text = await response.text();
      return text || getErrorMessageByStatus(response.status);
    }
  } catch (error) {
    return getErrorMessageByStatus(response.status);
  }
};

/**
 * 상태 코드별 에러 메시지 반환
 * @param {number} status HTTP 상태 코드
 * @returns {string} 에러 메시지
 */
export const getErrorMessageByStatus = (status) => {
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      if (status >= 400 && status < 500) {
        return ERROR_MESSAGES.BAD_REQUEST;
      } else if (status >= 500) {
        return ERROR_MESSAGES.SERVER_ERROR;
      }
      return ERROR_MESSAGES.UNKNOWN;
  }
};

/**
 * 인증 헤더 생성
 * @param {string} token JWT 토큰
 * @returns {Object} Authorization 헤더
 */
export const createAuthHeaders = (token) => {
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * 파일 다운로드용 헤더 생성
 * @param {string} contentType 컨텐츠 타입
 * @param {string} filename 파일명
 * @returns {Object} 다운로드 헤더
 */
export const createDownloadHeaders = (contentType = CONTENT_TYPES.JSON, filename = null) => {
  const headers = {
    'Content-Type': contentType
  };
  
  if (filename) {
    headers['Content-Disposition'] = `attachment; filename="${filename}"`;
  }
  
  return headers;
};

/**
 * FormData 생성 유틸리티
 * @param {Object} data 데이터 객체
 * @returns {FormData} FormData 객체
 */
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });
  
  return formData;
};

/**
 * 기본 내보내기
 */
export default {
  CONFIG: API_CONFIG,
  ENDPOINTS: API_ENDPOINTS,
  METHODS: HTTP_METHODS,
  STATUS: HTTP_STATUS,
  CONTENT_TYPES,
  ERROR_MESSAGES,
  buildUrl,
  addQueryParams,
  isSuccessStatus,
  parseErrorResponse,
  createAuthHeaders,
  createDownloadHeaders
};