// src/utils/apiConstants.js
// ICT-194 Phase 2: API 호출 관련 상수 및 유틸리티 통합
// ICT-340: 프론트엔드 환경변수 기반 API 엔드포인트 관리 시스템 구축

const LOCAL_API_FALLBACK = 'http://localhost:8080';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);
const LOCAL_DEV_PORTS = new Set(['3000', '5173']);
const isBrowserEnv = typeof window !== 'undefined' && typeof window.location !== 'undefined';

const sanitizeUrl = (value) => (typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '');

const ensureAbsoluteUrl = (value) => {
  const sanitized = sanitizeUrl(value);
  if (!sanitized) return '';

  if (sanitized.startsWith('/')) {
    const origin = resolveBrowserOrigin() || LOCAL_API_FALLBACK;
    return `${origin}${sanitized}`;
  }

  return /^https?:\/\//i.test(sanitized) ? sanitized : `http://${sanitized}`;
};

const isFrontendDevServer = () => {
  if (!isBrowserEnv) return false;
  const { hostname, port, protocol } = window.location;
  const normalizedPort = port || (protocol === 'https:' ? '443' : '80');
  return LOCAL_HOSTNAMES.has(hostname) && LOCAL_DEV_PORTS.has(normalizedPort);
};

const resolveBrowserOrigin = () => {
  if (!isBrowserEnv) return '';
  if (isFrontendDevServer()) {
    return LOCAL_API_FALLBACK;
  }
  return sanitizeUrl(window.location.origin);
};

const normalizeApiUrl = (candidate) => {
  let url = sanitizeUrl(candidate);

  if (!url) {
    url = resolveBrowserOrigin();
  }

  if (!url) {
    url = LOCAL_API_FALLBACK;
  }

  let parsed;
  try {
    parsed = new URL(ensureAbsoluteUrl(url));
  } catch {
    return LOCAL_API_FALLBACK;
  }

  const normalizedPort = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');

  if (isFrontendDevServer() && LOCAL_HOSTNAMES.has(parsed.hostname) && LOCAL_DEV_PORTS.has(normalizedPort)) {
    return LOCAL_API_FALLBACK;
  }

  const normalizedPath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
  return sanitizeUrl(`${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${normalizedPath}`);
};

/**
 * 환경 감지 및 설정
 */
const getEnvironment = () => {
  // NODE_ENV는 React 빌드 시 자동 설정됨
  const nodeEnv = process.env.NODE_ENV;
  // 사용자 정의 환경 변수
  const reactAppEnv = import.meta.env.VITE_ENV;

  // 우선순위: VITE_ENV > NODE_ENV  return reactAppEnv || nodeEnv || 'development';
};

/**
 * 환경별 기본 API URL 설정
 */
const getDefaultApiUrl = () => {
  const env = getEnvironment();

  if (env === 'production') {
    return normalizeApiUrl('https://your-production-domain.com');
  }

  const browserOrigin = resolveBrowserOrigin();
  if (browserOrigin) {
    return browserOrigin;
  }

  return LOCAL_API_FALLBACK;
};

/**
 * 런타임 설정 저장소
 */
let runtimeConfig = null;
let runtimeConfigPromise = null; // 중복 호출 방지용 Promise 캐시

/**
 * 런타임 설정 캐시 초기화
 * 로그인 시 설정을 강제로 다시 로드하기 위해 사용
 */
export const resetRuntimeConfig = () => {
  runtimeConfig = null;
  runtimeConfigPromise = null;
};

/**
 * 서버에서 런타임 설정 가져오기
 * @returns {Promise<Object>} 런타임 설정
 */
const fetchRuntimeConfig = async () => {
  try {
    // 런타임 설정 로드 시에는 현재 페이지 origin을 우선 사용
    const baseCandidate = import.meta.env.VITE_API_BASE_URL || resolveBrowserOrigin() || getDefaultApiUrl();
    const baseUrl = normalizeApiUrl(baseCandidate);
    const configUrl = `${baseUrl}/api/config/api-url`;

    const response = await fetch(configUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5초 타임아웃
    });

    if (response.ok) {
      const config = await response.json();
      return config;
    } else {
      console.warn('⚠️ 설정 응답 오류:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ 런타임 설정 로드 실패:', error.message);
    const fallback = resolveBrowserOrigin() || LOCAL_API_FALLBACK;
    if (fallback) {
      console.warn('🔧 기본값 사용:', fallback);
    }
  }

  return null;
};

/**
 * 동적 API URL 반환
 * @returns {Promise<string>} API 기본 URL
 */
export const getDynamicApiUrl = async () => {
  // 이미 설정 로드 완료된 경우
  if (!runtimeConfig) {
    // 진행 중인 요청이 없으면 새로 요청
    if (!runtimeConfigPromise) {
      runtimeConfigPromise = fetchRuntimeConfig().then(config => {
        // 설정 로드 완료 후 저장
        runtimeConfig = config;
        return config;
      });
    }
    // 진행 중이거나 방금 시작한 요청 기다림
    await runtimeConfigPromise;
  }

  const candidate = runtimeConfig?.apiUrl
    || import.meta.env.VITE_API_BASE_URL
    || resolveBrowserOrigin()
    || getDefaultApiUrl();

  return normalizeApiUrl(candidate);
};

/**
 * API 기본 설정
 * ICT-340: 환경변수 기반 동적 설정
 */
export const API_CONFIG = {
  // 환경변수 우선, 없으면 런타임에 현재 origin 사용
  get BASE_URL() {
    return normalizeApiUrl(
      import.meta.env.VITE_API_BASE_URL
      || resolveBrowserOrigin()
      || getDefaultApiUrl()
    );
  },
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30초
  RETRY_COUNT: parseInt(import.meta.env.VITE_API_RETRY_COUNT) || 3,
  RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000, // 1초
  ENVIRONMENT: getEnvironment(),
  DEBUG: import.meta.env.VITE_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development'
};

/**
 * 동적 API 설정 (런타임에 업데이트됨)
 */
export const DYNAMIC_API_CONFIG = {
  ...API_CONFIG,
  // 런타임에 BASE_URL이 업데이트됨
  async getBaseUrl() {
    return await getDynamicApiUrl();
  }
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
  },

  // ICT-200: JUnit 테스트 결과
  JUNIT: {
    UPLOAD: '/api/junit-results/upload',
    BY_PROJECT: (projectId) => `/api/junit-results/projects/${projectId}`,
    BY_ID: (id) => `/api/junit-results/${id}`,
    STATISTICS: '/api/junit-results/statistics',
    SUITES: (testResultId) => `/api/junit-results/${testResultId}/suites`,
    CASES: (testSuiteId) => `/api/junit-results/suites/${testSuiteId}/cases`,
    FAILED_CASES: (testResultId) => `/api/junit-results/${testResultId}/failed-cases`,
    SLOWEST_CASES: (testResultId) => `/api/junit-results/${testResultId}/slowest-cases`,
    TREND: '/api/junit-results/trend',
    TOP_FAILING: '/api/junit-results/top-failing',
    SEARCH: '/api/junit-results/search',
    DELETE: (id) => `/api/junit-results/${id}`,
    STATUS: (id) => `/api/junit-results/${id}/status`,
    UPDATE_CASE: (caseId) => `/api/junit-results/cases/${caseId}`
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
