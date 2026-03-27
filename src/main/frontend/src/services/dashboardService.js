// src/services/dashboardService.js

/**
 * ICT-135: 대시보드 API 연동 서비스
 * fake 데이터 제거 후 실제 백엔드 API와 연동하는 서비스
 *
 * 기능:
 * - 프로젝트별 대시보드 데이터 조회
 * - 로딩 상태 관리
 * - 에러 처리
 * - API 호출 최적화 (중복 호출 방지)
 * - 캐싱 전략 구현
 */

// apiService와 동일한 방식으로 동적 URL 사용
import { getDynamicApiUrl } from "../utils/apiConstants.js";

let API_BASE_URL = null;
let dynamicApiUrlPromise = null;

/**
 * 동적 API URL 가져오기
 */
const getApiBaseUrl = async () => {
  if (!dynamicApiUrlPromise) {
    dynamicApiUrlPromise = getDynamicApiUrl()
      .then((url) => `${url}/api/dashboard`)
      .catch((error) => {
        console.warn("동적 API URL 로드 실패, 기본값 사용:", error);
        return `${window.location.origin}/api/dashboard`;
      });
  }

  if (!API_BASE_URL) {
    API_BASE_URL = await dynamicApiUrlPromise;
  }

  return API_BASE_URL;
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
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // 응답 본문을 로그에 출력
    const responseText = await response.text();
    console.error("🚨 [Dashboard API Error Response]", {
      status: response.status,
      statusText: response.statusText,
      responseBody: responseText,
    });

    if (response.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    if (response.status === 403) {
      // 권한 부족 또는 만료된 토큰으로 인한 접근 거부
      console.warn(
        "🚨 [Dashboard API] 403 Forbidden - 토큰 갱신 필요할 수 있음",
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Access forbidden - please login again");
    }

    let errorData = {};
    try {
      errorData = JSON.parse(responseText);
    } catch (e) {
      console.warn("응답이 JSON 형식이 아님:", responseText);
    }

    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response;
}

/**
 * 캐시 키 생성
 */
function getCacheKey(endpoint, params = {}) {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return `${endpoint}${paramString ? "?" + paramString : ""}`;
}

/**
 * 캐시에서 데이터 조회
 */
function getCachedData(cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // 만료된 캐시 제거
  if (cached) {
    cache.delete(cacheKey);
  }

  return null;
}

/**
 * 캐시에 데이터 저장
 */
function setCachedData(cacheKey, data) {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * 중복 요청 방지를 위한 요청 래퍼
 */
async function makeRequest(cacheKey, requestFn) {
  // 캐시된 데이터 확인
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // 진행 중인 요청 확인
  if (pendingRequests.has(cacheKey)) {
    return await pendingRequests.get(cacheKey);
  }

  // 새로운 요청 시작
  const requestPromise = requestFn();

  pendingRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    setCachedData(cacheKey, result);
    return result;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * 프로젝트별 테스트케이스 결과 요약 조회 (파이차트용)
 */
export async function getProjectTestResultsSummary(projectId) {
  const cacheKey = getCacheKey(`/projects/${projectId}/test-results-summary`);

  return await makeRequest(cacheKey, async () => {
    const baseUrl = await getApiBaseUrl();
    const response = await fetchWithAuth(
      `${baseUrl}/projects/${projectId}/test-results-summary`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * 프로젝트별 테스트 결과 추이 조회 (라인차트용)
 */
export async function getProjectTestResultsTrend(projectId, days = 15) {
  const cacheKey = getCacheKey(`/projects/${projectId}/test-results-trend`, {
    days,
  });

  return await makeRequest(cacheKey, async () => {
    const baseUrl = await getApiBaseUrl();
    const response = await fetchWithAuth(
      `${baseUrl}/projects/${projectId}/test-results-trend?days=${days}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-250: 테스트 플랜별 통계 조회
 */
export async function getTestPlanStatistics(projectId, testPlanId) {
  const cacheKey = getCacheKey(
    `/projects/${projectId}/test-plans/${testPlanId}/statistics`,
  );

  return await makeRequest(cacheKey, async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/projects/${projectId}/test-plans/${testPlanId}/statistics`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-250: 테스트 플랜-실행별 통계 조회
 */
export async function getPlanExecutionStatistics(
  projectId,
  testPlanId,
  executionId,
) {
  const cacheKey = getCacheKey(
    `/projects/${projectId}/test-plans/${testPlanId}/executions/${executionId}/statistics`,
  );

  return await makeRequest(cacheKey, async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/projects/${projectId}/test-plans/${testPlanId}/executions/${executionId}/statistics`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-250: 다차원 통계 조회
 */
export async function getMultiDimensionalStatistics(
  projectId,
  includeDetails = true,
) {
  const cacheKey = getCacheKey(
    `/projects/${projectId}/multidimensional-statistics`,
    { includeDetails },
  );

  return await makeRequest(cacheKey, async () => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/projects/${projectId}/multidimensional-statistics?includeDetails=${includeDetails}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-250: 프로젝트에서 사용 가능한 테스트 플랜 목록 조회
 * AppContext에서 가져오지만 대시보드에서도 필요한 경우 사용
 */
export async function getProjectTestPlans(projectId) {
  const cacheKey = getCacheKey(`/projects/${projectId}/test-plans`);

  return await makeRequest(cacheKey, async () => {
    const backendUrl = await getDynamicApiUrl();
    const response = await fetchWithAuth(
      `${backendUrl}/api/test-plans/project/${projectId}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-250: 테스트 플랜의 테스트 실행 목록 조회
 */
export async function getTestPlanExecutions(testPlanId) {
  const cacheKey = getCacheKey(`/test-plans/${testPlanId}/executions`);

  return await makeRequest(cacheKey, async () => {
    const backendUrl = await getDynamicApiUrl();
    const response = await fetchWithAuth(
      `${backendUrl}/api/testexecutions/testplan/${testPlanId}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * 오픈 테스트런 결과 조회 (바차트용)
 */
export async function getOpenTestRunResults(projectId, limit = 10) {
  const cacheKey = getCacheKey(`/projects/${projectId}/open-testrun-results`, {
    limit,
  });

  return await makeRequest(cacheKey, async () => {
    const baseUrl = await getApiBaseUrl();
    const response = await fetchWithAuth(
      `${baseUrl}/projects/${projectId}/open-testrun-results?limit=${limit}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * 프로젝트 대시보드 종합 정보 조회
 */
export async function getProjectDashboardOverview(projectId) {
  const cacheKey = getCacheKey(`/projects/${projectId}/overview`);

  return await makeRequest(cacheKey, async () => {
    const baseUrl = await getApiBaseUrl();
    const response = await fetchWithAuth(
      `${baseUrl}/projects/${projectId}/overview`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * 전체 대시보드 데이터를 한 번에 로드 (성능 최적화)
 */
export async function loadDashboardData(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  try {
    // 병렬로 모든 대시보드 데이터 로드
    const [summary, trend, openTestRuns, overview] = await Promise.all([
      getProjectTestResultsSummary(projectId),
      getProjectTestResultsTrend(projectId, 15),
      getOpenTestRunResults(projectId, 10),
      getProjectDashboardOverview(projectId),
    ]);

    const dashboardData = {
      summary,
      trend,
      openTestRuns,
      overview,
      loadedAt: new Date().toISOString(),
      projectId,
    };

    return dashboardData;
  } catch (error) {
    console.error("❌ Dashboard API - Failed to load dashboard data:", error);
    throw error;
  }
}

/**
 * 캐시 무효화 (데이터 새로고침 시 사용)
 */
export function invalidateDashboardCache(projectId = null) {
  if (projectId) {
    // 특정 프로젝트의 캐시만 무효화
    const keysToDelete = [...cache.keys()].filter((key) =>
      key.includes(`/projects/${projectId}/`),
    );

    keysToDelete.forEach((key) => cache.delete(key));
  } else {
    // 모든 캐시 무효화
    cache.clear();
  }
}

/**
 * 대시보드 데이터 새로고침
 */
export async function refreshDashboardData(projectId) {
  // 캐시 무효화
  invalidateDashboardCache(projectId);

  // 새로운 데이터 로드
  return await loadDashboardData(projectId);
}

/**
 * 에러 처리 유틸리티 (ICT-136: 개선됨)
 */
export function handleDashboardError(error) {
  console.error("Dashboard API Error:", error);

  // 네트워크 에러
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return {
      type: "NETWORK_ERROR",
      message: "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.",
      canRetry: true,
      userAction: "네트워크 연결 후 새로고침 버튼을 클릭하세요.",
    };
  }

  // 인증 에러
  if (error.message.includes("Authentication failed")) {
    return {
      type: "AUTH_ERROR",
      message: "로그인 세션이 만료되었습니다.",
      canRetry: false,
      userAction: "로그인 페이지로 이동하여 다시 로그인하세요.",
    };
  }

  // HTTP 상태 코드별 상세 에러 처리
  if (error.message.includes("HTTP")) {
    if (error.message.includes("HTTP 404")) {
      return {
        type: "NOT_FOUND_ERROR",
        message: "요청한 데이터를 찾을 수 없습니다.",
        canRetry: true,
        userAction: "프로젝트를 다시 선택하거나 페이지를 새로고침하세요.",
        details: error.message,
      };
    }

    if (error.message.includes("HTTP 500")) {
      return {
        type: "SERVER_ERROR",
        message: "서버에서 오류가 발생했습니다.",
        canRetry: true,
        userAction: "잠시 후 다시 시도하거나 관리자에게 문의하세요.",
        details: error.message,
      };
    }

    if (error.message.includes("HTTP 403")) {
      return {
        type: "PERMISSION_ERROR",
        message: "데이터에 접근할 권한이 없습니다.",
        canRetry: false,
        userAction: "프로젝트 권한을 확인하거나 관리자에게 문의하세요.",
        details: error.message,
      };
    }

    // 기타 HTTP 에러
    return {
      type: "API_ERROR",
      message: "서버 요청 처리 중 오류가 발생했습니다.",
      canRetry: true,
      userAction: "새로고침 버튼을 클릭하거나 잠시 후 다시 시도하세요.",
      details: error.message,
    };
  }

  // 데이터 파싱 에러
  if (error.message.includes("JSON") || error.message.includes("parse")) {
    return {
      type: "DATA_ERROR",
      message: "서버 응답 데이터 형식에 오류가 있습니다.",
      canRetry: true,
      userAction: "페이지를 새로고침하거나 관리자에게 문의하세요.",
      details: error.message,
    };
  }

  // 일반 에러
  return {
    type: "UNKNOWN_ERROR",
    message: "예상하지 못한 오류가 발생했습니다.",
    canRetry: true,
    userAction:
      "페이지를 새로고침하거나 잠시 후 다시 시도하세요. 문제가 계속되면 관리자에게 문의하세요.",
    details: error.message,
  };
}

/**
 * 캐시 통계 조회 (디버깅용)
 */
export function getCacheStats() {
  const entries = [...cache.entries()];
  const now = Date.now();

  const stats = {
    totalEntries: entries.length,
    validEntries: 0,
    expiredEntries: 0,
    cacheHitRate: 0,
  };

  entries.forEach(([key, value]) => {
    if (now - value.timestamp < CACHE_DURATION) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }
  });

  return stats;
}

/**
 * ICT-202: 특정 테스트 플랜의 최근 결과 조회
 */
export async function getTestPlanRecentResults(testPlanId, limit = 10) {
  const cacheKey = getCacheKey(
    `/test-plans/${testPlanId}/recent-test-results`,
    { limit },
  );

  return await makeRequest(cacheKey, async () => {
    const baseUrl = await getApiBaseUrl();
    const response = await fetchWithAuth(
      `${baseUrl}/test-plans/${testPlanId}/recent-test-results?limit=${limit}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-202: 프로젝트별 실행자(담당자)별 결과 조회
 */
export async function getProjectAssigneeResults(projectId, limit = 20) {
  const cacheKey = getCacheKey(
    `/projects/${projectId}/open-test-runs/assignee-results`,
    { limit },
  );

  return await makeRequest(cacheKey, async () => {
    const baseUrl = await getApiBaseUrl();
    const response = await fetchWithAuth(
      `${baseUrl}/projects/${projectId}/open-testrun-results?limit=${limit}`,
    );
    const data = await response.json();

    return data;
  });
}

/**
 * ICT-202: 여러 테스트 플랜의 비교 데이터 조회 (병렬 호출)
 */
export async function getTestPlansComparison(testPlanIds, limit = 10) {
  try {
    const requests = testPlanIds.map((planId) =>
      getTestPlanRecentResults(planId, limit),
    );

    const results = await Promise.all(requests);

    // 플랜별 결과를 비교하기 쉬운 형태로 변환
    const comparisonData = testPlanIds.map((planId, index) => ({
      testPlanId: planId,
      results: results[index],
    }));

    return comparisonData;
  } catch (error) {
    console.error("❌ Dashboard API - Test plans comparison failed:", error);
    throw error;
  }
}

// 기본 export
const dashboardService = {
  getProjectTestResultsSummary,
  getProjectTestResultsTrend,
  getOpenTestRunResults,
  getProjectDashboardOverview,
  loadDashboardData,
  refreshDashboardData,
  invalidateDashboardCache,
  handleDashboardError,
  getCacheStats,
  // ICT-202: 새로운 비교 기능 함수들
  getProjectTestPlans,
  getTestPlanRecentResults,
  getProjectAssigneeResults,
  getTestPlansComparison,
};

export default dashboardService;
