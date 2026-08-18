// src/utils/testResultConstants.js
// ICT-194 Phase 2: 테스트 결과 관련 상수 및 유틸리티 통합

import {
  CheckCircle,
  Cancel,
  Block,
  PlayArrow,
  HourglassEmpty,
} from "@mui/icons-material";
import { safeParseDate } from "./dateUtils";

/**
 * 테스트 결과 타입 상수
 */
export const TEST_RESULT_TYPES = {
  PASS: "PASS",
  FAIL: "FAIL",
  BLOCKED: "BLOCKED",
  NOT_RUN: "NOT_RUN",
  SKIPPED: "SKIPPED",
};

/**
 * 통합된 테스트 결과 설정
 * 모든 컴포넌트에서 일관된 색상, 라벨, 아이콘 사용
 */
export const TEST_RESULT_CONFIG = {
  [TEST_RESULT_TYPES.PASS]: {
    label: "성공", // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: "Pass",
    color: "#00C49F",
    muiColor: "success",
    backgroundColor: "#F6FFED",
    borderColor: "#B7EB8F",
    icon: CheckCircle,
    priority: 1,
    translationKey: "testResult.status.pass",
  },
  [TEST_RESULT_TYPES.FAIL]: {
    label: "실패", // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: "Fail",
    color: "#FF4D4F",
    muiColor: "error",
    backgroundColor: "#FFF2F0",
    borderColor: "#FFCCC7",
    icon: Cancel,
    priority: 2,
    translationKey: "testResult.status.fail",
  },
  [TEST_RESULT_TYPES.BLOCKED]: {
    label: "차단됨", // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: "Blocked",
    color: "#FFBB28",
    muiColor: "warning",
    backgroundColor: "#FFFBE6",
    borderColor: "#FFEC3D",
    icon: Block,
    priority: 3,
    translationKey: "testResult.status.blocked",
  },
  [TEST_RESULT_TYPES.NOT_RUN]: {
    label: "미실행", // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: "Not Run",
    color: "#B0BEC5",
    muiColor: "default",
    backgroundColor: "#FAFAFA",
    borderColor: "#E8E8E8",
    icon: PlayArrow,
    priority: 4,
    translationKey: "testResult.status.notRun",
  },
  // API 호환성을 위한 NOTRUN 별칭 추가
  NOTRUN: {
    label: "미실행", // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: "Not Run",
    color: "#B0BEC5",
    muiColor: "default",
    backgroundColor: "#FAFAFA",
    borderColor: "#E8E8E8",
    icon: PlayArrow,
    priority: 4,
    translationKey: "testResult.status.notRun",
  },
  [TEST_RESULT_TYPES.SKIPPED]: {
    label: "건너뜀", // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: "Skipped",
    color: "#D9D9D9",
    muiColor: "default",
    backgroundColor: "#F5F5F5",
    borderColor: "#D9D9D9",
    icon: HourglassEmpty,
    priority: 5,
    translationKey: "testResult.status.skipped",
  },
};

/**
 * 레거시 매핑 (기존 컴포넌트 호환성)
 */
export const LEGACY_RESULT_COLORS = {
  [TEST_RESULT_TYPES.PASS]: "success",
  [TEST_RESULT_TYPES.FAIL]: "error",
  [TEST_RESULT_TYPES.BLOCKED]: "warning",
  [TEST_RESULT_TYPES.NOT_RUN]: "default",
  [TEST_RESULT_TYPES.SKIPPED]: "default",
};

/**
 * 차트용 색상 배열
 */
export const CHART_COLORS = [
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.PASS].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.FAIL].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.BLOCKED].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.SKIPPED].color,
];

/**
 * 테스트 결과 우선순위별 정렬
 */
export const RESULT_PRIORITY_ORDER = [
  TEST_RESULT_TYPES.FAIL, // 실패가 가장 중요
  TEST_RESULT_TYPES.BLOCKED, // 차단됨
  TEST_RESULT_TYPES.PASS, // 성공
  TEST_RESULT_TYPES.NOT_RUN, // 미실행
  TEST_RESULT_TYPES.SKIPPED, // 건너뜀
];

/**
 * 키보드 단축키 매핑
 */
export const KEYBOARD_SHORTCUTS = {
  P: TEST_RESULT_TYPES.PASS,
  F: TEST_RESULT_TYPES.FAIL,
  B: TEST_RESULT_TYPES.BLOCKED,
  N: TEST_RESULT_TYPES.NOT_RUN,
  S: TEST_RESULT_TYPES.SKIPPED,
};

// ========== 유틸리티 함수들 ==========

/**
 * 테스트 결과 설정 가져오기
 * @param {string} resultType
 * @returns {Object} 설정 객체
 */
export const getResultConfig = (resultType) => {
  return (
    TEST_RESULT_CONFIG[resultType] ||
    TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN]
  );
};

/**
 * 테스트 결과 라벨 가져오기
 * @param {string} resultType
 * @param {boolean} useShort 짧은 라벨 사용 여부
 * @returns {string} 라벨
 */
export const getResultLabel = (resultType, useShort = false) => {
  const config = getResultConfig(resultType);
  return useShort ? config.shortLabel : config.label;
};

/**
 * 테스트 결과 색상 가져오기
 * @param {string} resultType
 * @param {string} type 색상 타입 ('color', 'muiColor', 'backgroundColor', 'borderColor')
 * @returns {string} 색상 값
 */
export const getResultColor = (resultType, type = "color") => {
  const config = getResultConfig(resultType);
  return config[type] || config.color;
};

/**
 * 테스트 결과 아이콘 가져오기
 * @param {string} resultType
 * @returns {React.Component} 아이콘 컴포넌트
 */
export const getResultIcon = (resultType) => {
  const config = getResultConfig(resultType);
  return config.icon;
};

/**
 * 테스트 결과 통계 계산
 * @param {Array} results 결과 배열
 * @returns {Object} 통계 객체
 */
export const calculateTestStatistics = (results) => {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      totalTests: 0,
      passCount: 0,
      failCount: 0,
      blockedCount: 0,
      notRunCount: 0,
      skippedCount: 0,
      passRate: 0,
      failRate: 0,
      executionRate: 0,
      successRate: 0,
    };
  }

  const counts = {};

  // 카운트 초기화
  Object.values(TEST_RESULT_TYPES).forEach((type) => {
    counts[type] = 0;
  });

  // 결과별 카운팅
  results.forEach((result) => {
    const resultType =
      result.result || result.status || TEST_RESULT_TYPES.NOT_RUN;
    if (counts.hasOwnProperty(resultType)) {
      counts[resultType]++;
    } else {
      counts[TEST_RESULT_TYPES.NOT_RUN]++; // 알 수 없는 결과는 미실행으로 처리
    }
  });

  const totalTests = results.length;
  const executedTests = totalTests - counts[TEST_RESULT_TYPES.NOT_RUN];

  return {
    totalTests,
    passCount: counts[TEST_RESULT_TYPES.PASS],
    failCount: counts[TEST_RESULT_TYPES.FAIL],
    blockedCount: counts[TEST_RESULT_TYPES.BLOCKED],
    notRunCount: counts[TEST_RESULT_TYPES.NOT_RUN],
    skippedCount: counts[TEST_RESULT_TYPES.SKIPPED],
    passRate:
      totalTests > 0 ? (counts[TEST_RESULT_TYPES.PASS] / totalTests) * 100 : 0,
    failRate:
      totalTests > 0 ? (counts[TEST_RESULT_TYPES.FAIL] / totalTests) * 100 : 0,
    executionRate: totalTests > 0 ? (executedTests / totalTests) * 100 : 0,
    successRate:
      executedTests > 0
        ? (counts[TEST_RESULT_TYPES.PASS] / executedTests) * 100
        : 0,
  };
};

/**
 * 테스트 결과 우선순위별 정렬
 * @param {Array} results 결과 배열
 * @returns {Array} 정렬된 결과 배열
 */
export const sortResultsByPriority = (results) => {
  return results.sort((a, b) => {
    const aType = a.result || a.status || TEST_RESULT_TYPES.NOT_RUN;
    const bType = b.result || b.status || TEST_RESULT_TYPES.NOT_RUN;

    const aPriority = RESULT_PRIORITY_ORDER.indexOf(aType);
    const bPriority = RESULT_PRIORITY_ORDER.indexOf(bType);

    return aPriority - bPriority;
  });
};

/**
 * 테스트 결과를 키보드 단축키로 변환
 * @param {string} key 키보드 키
 * @returns {string|null} 테스트 결과 타입
 */
export const getResultTypeFromKeyboard = (key) => {
  return KEYBOARD_SHORTCUTS[key.toUpperCase()] || null;
};

/**
 * 차트용 데이터 변환
 * @param {Object} statistics 통계 객체
 * @returns {Array} 차트 데이터 배열
 */
export const convertToChartData = (statistics) => {
  if (!statistics) return [];

  return [
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.PASS].label,
      value: statistics.passCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.PASS].color,
    },
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.FAIL].label,
      value: statistics.failCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.FAIL].color,
    },
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.BLOCKED].label,
      value: statistics.blockedCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.BLOCKED].color,
    },
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN].label,
      value: statistics.notRunCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN].color,
    },
  ].filter((item) => item.value > 0); // 0인 항목 제외
};

/**
 * 결과 검증 유틸리티
 * @param {string} resultType
 * @returns {boolean} 유효한 결과 타입 여부
 */
export const isValidResultType = (resultType) => {
  return Object.values(TEST_RESULT_TYPES).includes(resultType);
};

/**
 * 다국어 지원을 위한 로컬라이즈된 결과 설정 가져오기
 * @param {string} resultType
 * @param {Function} t - useI18n hook의 t 함수
 * @returns {Object} 로컬라이즈된 설정 객체
 */
export const getLocalizedResultConfig = (resultType, t) => {
  const baseConfig = getResultConfig(resultType);
  if (!t || !baseConfig.translationKey) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    label: t(baseConfig.translationKey),
  };
};

/**
 * 테스트 실행 결과 배열에서 각 테스트케이스별 최신 결과만 추출
 *
 * 배열 순서에 기대지 않고 executedAt 이 가장 최근인 레코드를 고른다.
 * 서버(TestExecutionService.toDto)가 최신순으로 내려주지만, 저장 응답·부분 갱신 등
 * 다른 경로로 들어온 배열은 순서를 보장하지 않는다. 백엔드 집계(TestResultRepository 의
 * MAX(executed_at) 기준)와 같은 의미라 프론트/백엔드 숫자가 어긋나지 않는다.
 * executedAt 이 같거나 없으면 먼저 나온 레코드를 유지한다.
 *
 * @param {Array} results - 실행 결과 배열
 * @returns {Array} 테스트케이스별 최신 결과 배열
 */
export const getLatestExecutionResults = (results) => {
  if (!Array.isArray(results)) return [];
  const map = new Map();
  results.forEach((r) => {
    const key = r?.testCaseId;
    if (!key) return;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, r);
      return;
    }
    const prevAt = safeParseDate(prev.executedAt);
    const curAt = safeParseDate(r.executedAt);
    const prevTime = prevAt ? prevAt.getTime() : 0;
    const curTime = curAt ? curAt.getTime() : 0;
    if (curTime > prevTime) {
      map.set(key, r);
    }
  });
  return Array.from(map.values());
};

/**
 * 테스트 실행의 종합 요약 정보 계산 (최신 결과 기준)
 *
 * 집계 범위(scopeCaseIds)를 주면 그 목록 안의 테스트케이스만 센다. 분모는 플랜의
 * 케이스 수인데 분자는 실행에 남은 모든 결과를 세던 것이 실행 화면과 결과 입력 화면의
 * 통계가 어긋난 원인이었다 — 플랜에서 빠진 케이스의 과거 결과가 분자에만 들어가
 * 진행률이 부풀고 미실행이 줄어든다.
 *
 * @param {Array} results - 실행 결과 배열
 * @param {number} totalCount - 전체 테스트케이스 수 (scopeCaseIds 를 주면 그 길이가 우선)
 * @param {Array<string>} [scopeCaseIds] - 집계 대상 테스트케이스 ID 목록(보통 플랜의 케이스 목록)
 * @returns {Object} { stats, progressPercent }
 */
export const calculateExecutionSummary = (
  results,
  totalCount,
  scopeCaseIds,
) => {
  const scope = Array.isArray(scopeCaseIds)
    ? new Set(scopeCaseIds.filter(Boolean))
    : null;

  const latestByCase = new Map();
  getLatestExecutionResults(results).forEach((r) => {
    latestByCase.set(r.testCaseId, r);
  });

  const total = scope ? scope.size : Math.max(0, Number(totalCount) || 0);

  const stats = {
    pass: 0,
    fail: 0,
    blocked: 0,
    notRun: 0,
    completedCount: 0,
    total,
  };

  const countedCaseIds = scope ? scope : new Set(latestByCase.keys());
  countedCaseIds.forEach((caseId) => {
    const res = latestByCase.get(caseId)?.result;
    if (res === TEST_RESULT_TYPES.PASS) {
      stats.pass++;
      stats.completedCount++;
    } else if (res === TEST_RESULT_TYPES.FAIL) {
      stats.fail++;
      stats.completedCount++;
    } else if (res === TEST_RESULT_TYPES.BLOCKED) {
      stats.blocked++;
      stats.completedCount++;
    }
    // NOT_RUN·결과 없음은 미실행 — total 에서 빼는 방식으로 한 번만 센다
  });

  stats.notRun = Math.max(0, total - stats.completedCount);

  const progressPercent =
    total > 0
      ? Math.min(100, Math.round((stats.completedCount / total) * 100))
      : 0;

  return { stats, progressPercent };
};

/**
 * 기본 내보내기: 호환성을 위한 메인 설정
 */
export default {
  TYPES: TEST_RESULT_TYPES,
  CONFIG: TEST_RESULT_CONFIG,
  COLORS: LEGACY_RESULT_COLORS,
  CHART_COLORS,
  getResultConfig,
  getResultLabel,
  getResultColor,
  getResultIcon,
  convertToChartData,
  getLocalizedResultConfig,
  getLatestExecutionResults,
  calculateExecutionSummary,
};
