// src/utils/logger.js
// 환경별 로깅 제어 유틸리티

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// 로그 레벨 정의
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// 환경변수에서 로그 레벨 읽기
const getLogLevelFromEnv = () => {
  const logLevelEnv = import.meta.env.VITE_LOG_LEVEL;

  if (logLevelEnv) {
    const upperLevel = logLevelEnv.toUpperCase();
    if (LOG_LEVELS.hasOwnProperty(upperLevel)) {
      return LOG_LEVELS[upperLevel];
    }
  }

  // 환경변수가 없거나 유효하지 않은 경우 기본값
  return isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
};

// 현재 로그 레벨 설정 (환경변수 우선, 기본값: ERROR만 출력, 개발환경에서만 모든 레벨)
const CURRENT_LOG_LEVEL = getLogLevelFromEnv();

class Logger {
  constructor(context = '') {
    this.context = context;
  }

  _shouldLog(level) {
    return level <= CURRENT_LOG_LEVEL;
  }

  _formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const levelStr = Object.keys(LOG_LEVELS)[level];
    const contextStr = this.context ? `[${this.context}] ` : '';
    return [`${timestamp} ${levelStr} ${contextStr}${message}`, ...args];
  }

  error(message, ...args) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(...this._formatMessage(LOG_LEVELS.ERROR, message, ...args));
    }
  }

  warn(message, ...args) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(...this._formatMessage(LOG_LEVELS.WARN, message, ...args));
    }
  }

  info(message, ...args) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.info(...this._formatMessage(LOG_LEVELS.INFO, message, ...args));
    }
  }

  log(message, ...args) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.log(...this._formatMessage(LOG_LEVELS.INFO, message, ...args));
    }
  }

  debug(message, ...args) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(...this._formatMessage(LOG_LEVELS.DEBUG, message, ...args));
    }
  }

  // 그룹 로깅 (개발환경에서만)
  group(label) {
    if (isDevelopment) {
      console.group(label);
    }
  }

  groupEnd() {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  // 테이블 로깅 (개발환경에서만)
  table(data) {
    if (isDevelopment && console.table) {
      console.table(data);
    }
  }

  // 시간 측정 (개발환경에서만)
  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// 기본 로거 인스턴스
const logger = new Logger();

// 컨텍스트별 로거 생성 함수
export const createLogger = (context) => new Logger(context);

// 기본 로거 export
export default logger;

// 편의 함수들 (기존 console.log를 쉽게 대체할 수 있도록)
export const logError = (message, ...args) => logger.error(message, ...args);
export const logWarn = (message, ...args) => logger.warn(message, ...args);
export const logInfo = (message, ...args) => logger.info(message, ...args);
export const logDebug = (message, ...args) => logger.debug(message, ...args);

// ICT-344 전용 로거
export const validationLogger = createLogger('ICT-344-Validation');

// ============================================
// localStorage 기반 디버그 로깅
// ============================================
/**
 * 디버그 로깅 제어
 * 
 * 사용법:
 * - 전체 활성화: localStorage.setItem('debug', 'true')
 * - 특정 모듈만: localStorage.setItem('debug', 'Spreadsheet,HybridForm,DatasheetGrid')
 * - 비활성화: localStorage.removeItem('debug')
 */

const isDebugEnabled = (module = '') => {
  try {
    const debugValue = localStorage.getItem('debug');
    if (!debugValue) return false;

    // 'true'면 모든 디버그 로그 활성화
    if (debugValue === 'true') return true;

    // 특정 모듈만 활성화 (쉼표로 구분)
    if (module) {
      const enabledModules = debugValue.split(',').map(m => m.trim());
      return enabledModules.includes(module);
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const debugLog = (module, ...args) => {
  if (isDebugEnabled(module)) {
    console.log(`[${module}]`, ...args);
  }
};

export const debugWarn = (module, ...args) => {
  if (isDebugEnabled(module)) {
    console.warn(`[${module}]`, ...args);
  }
};

export const debugError = (module, ...args) => {
  if (isDebugEnabled(module)) {
    console.error(`[${module}]`, ...args);
  }
};

// isDebugEnabled도 export
export { isDebugEnabled };