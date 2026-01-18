// src/utils/testResultConstants.js
// ICT-194 Phase 2: 테스트 결과 관련 상수 및 유틸리티 통합

import {
  CheckCircle,
  Cancel,
  Block,
  PlayArrow,
  HourglassEmpty
} from '@mui/icons-material';

/**
 * 테스트 결과 타입 상수
 */
export const TEST_RESULT_TYPES = {
  PASS: 'PASS',
  FAIL: 'FAIL', 
  BLOCKED: 'BLOCKED',
  NOT_RUN: 'NOT_RUN',
  SKIPPED: 'SKIPPED'
};

/**
 * 통합된 테스트 결과 설정
 * 모든 컴포넌트에서 일관된 색상, 라벨, 아이콘 사용
 */
export const TEST_RESULT_CONFIG = {
  [TEST_RESULT_TYPES.PASS]: {
    label: '성공', // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: 'Pass',
    color: '#00C49F',
    muiColor: 'success',
    backgroundColor: '#F6FFED',
    borderColor: '#B7EB8F',
    icon: CheckCircle,
    priority: 1,
    translationKey: 'testResult.status.pass'
  },
  [TEST_RESULT_TYPES.FAIL]: {
    label: '실패', // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: 'Fail',
    color: '#FF4D4F',
    muiColor: 'error',
    backgroundColor: '#FFF2F0',
    borderColor: '#FFCCC7',
    icon: Cancel,
    priority: 2,
    translationKey: 'testResult.status.fail'
  },
  [TEST_RESULT_TYPES.BLOCKED]: {
    label: '차단됨', // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: 'Blocked',
    color: '#FFBB28',
    muiColor: 'warning',
    backgroundColor: '#FFFBE6',
    borderColor: '#FFEC3D',
    icon: Block,
    priority: 3,
    translationKey: 'testResult.status.blocked'
  },
  [TEST_RESULT_TYPES.NOT_RUN]: {
    label: '미실행', // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: 'Not Run',
    color: '#B0BEC5',
    muiColor: 'default',
    backgroundColor: '#FAFAFA',
    borderColor: '#E8E8E8',
    icon: PlayArrow,
    priority: 4,
    translationKey: 'testResult.status.notRun'
  },
  // API 호환성을 위한 NOTRUN 별칭 추가
  'NOTRUN': {
    label: '미실행', // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: 'Not Run',
    color: '#B0BEC5',
    muiColor: 'default',
    backgroundColor: '#FAFAFA',
    borderColor: '#E8E8E8',
    icon: PlayArrow,
    priority: 4,
    translationKey: 'testResult.status.notRun'
  },
  [TEST_RESULT_TYPES.SKIPPED]: {
    label: '건너뜀', // 기본값, getLocalizedResultConfig()로 다국어 지원
    shortLabel: 'Skipped',
    color: '#D9D9D9',
    muiColor: 'default',
    backgroundColor: '#F5F5F5',
    borderColor: '#D9D9D9',
    icon: HourglassEmpty,
    priority: 5,
    translationKey: 'testResult.status.skipped'
  }
};

/**
 * 레거시 매핑 (기존 컴포넌트 호환성)
 */
export const LEGACY_RESULT_COLORS = {
  [TEST_RESULT_TYPES.PASS]: 'success',
  [TEST_RESULT_TYPES.FAIL]: 'error', 
  [TEST_RESULT_TYPES.BLOCKED]: 'warning',
  [TEST_RESULT_TYPES.NOT_RUN]: 'default',
  [TEST_RESULT_TYPES.SKIPPED]: 'default'
};

/**
 * 차트용 색상 배열
 */
export const CHART_COLORS = [
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.PASS].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.FAIL].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.BLOCKED].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN].color,
  TEST_RESULT_CONFIG[TEST_RESULT_TYPES.SKIPPED].color
];

/**
 * 테스트 결과 우선순위별 정렬
 */
export const RESULT_PRIORITY_ORDER = [
  TEST_RESULT_TYPES.FAIL,     // 실패가 가장 중요
  TEST_RESULT_TYPES.BLOCKED,  // 차단됨
  TEST_RESULT_TYPES.PASS,     // 성공
  TEST_RESULT_TYPES.NOT_RUN,  // 미실행
  TEST_RESULT_TYPES.SKIPPED   // 건너뜀
];

/**
 * 키보드 단축키 매핑
 */
export const KEYBOARD_SHORTCUTS = {
  'P': TEST_RESULT_TYPES.PASS,
  'F': TEST_RESULT_TYPES.FAIL,
  'B': TEST_RESULT_TYPES.BLOCKED,
  'N': TEST_RESULT_TYPES.NOT_RUN,
  'S': TEST_RESULT_TYPES.SKIPPED
};

// ========== 유틸리티 함수들 ==========

/**
 * 테스트 결과 설정 가져오기
 * @param {string} resultType 
 * @returns {Object} 설정 객체
 */
export const getResultConfig = (resultType) => {
  return TEST_RESULT_CONFIG[resultType] || TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN];
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
export const getResultColor = (resultType, type = 'color') => {
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
      successRate: 0
    };
  }

  const counts = {};
  
  // 카운트 초기화
  Object.values(TEST_RESULT_TYPES).forEach(type => {
    counts[type] = 0;
  });

  // 결과별 카운팅
  results.forEach(result => {
    const resultType = result.result || result.status || TEST_RESULT_TYPES.NOT_RUN;
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
    passRate: totalTests > 0 ? (counts[TEST_RESULT_TYPES.PASS] / totalTests * 100) : 0,
    failRate: totalTests > 0 ? (counts[TEST_RESULT_TYPES.FAIL] / totalTests * 100) : 0,
    executionRate: totalTests > 0 ? (executedTests / totalTests * 100) : 0,
    successRate: executedTests > 0 ? (counts[TEST_RESULT_TYPES.PASS] / executedTests * 100) : 0
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
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.PASS].color
    },
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.FAIL].label,
      value: statistics.failCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.FAIL].color
    },
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.BLOCKED].label,
      value: statistics.blockedCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.BLOCKED].color
    },
    {
      name: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN].label,
      value: statistics.notRunCount || 0,
      color: TEST_RESULT_CONFIG[TEST_RESULT_TYPES.NOT_RUN].color
    }
  ].filter(item => item.value > 0); // 0인 항목 제외
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
    label: t(baseConfig.translationKey)
  };
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
  calculateTestStatistics,
  convertToChartData,
  getLocalizedResultConfig
};