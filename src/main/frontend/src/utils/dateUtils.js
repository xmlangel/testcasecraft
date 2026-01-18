// src/utils/dateUtils.js
/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 날짜를 로케일 문자열로 변환
 * @param {string|Date} date - 변환할 날짜
 * @param {string} locale - 로케일 (기본: 'ko-KR')
 * @param {object} options - 포맷 옵션
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDate(date, locale = 'ko-KR', options = {}) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return dateObj.toLocaleString(locale, defaultOptions);
}

/**
 * 날짜만 포맷 (시간 제외)
 * @param {string|Date} date - 변환할 날짜
 * @param {string} locale - 로케일 (기본: 'ko-KR')
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDateOnly(date, locale = 'ko-KR') {
  return formatDate(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 시간만 포맷 (날짜 제외)
 * @param {string|Date} date - 변환할 날짜
 * @param {string} locale - 로케일 (기본: 'ko-KR')
 * @returns {string} 포맷된 시간 문자열
 */
export function formatTimeOnly(date, locale = 'ko-KR') {
  return formatDate(date, locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 상대적 시간 표시 (몇 분 전, 몇 시간 전 등)
 * @param {string|Date} date - 기준 날짜
 * @param {string|Date} baseDate - 비교 기준 날짜 (기본: 현재)
 * @returns {string} 상대적 시간 문자열
 */
export function formatRelativeTime(date, baseDate = new Date()) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const baseDateObj = typeof baseDate === 'string' ? new Date(baseDate) : baseDate;
  
  if (isNaN(dateObj.getTime()) || isNaN(baseDateObj.getTime())) return '-';
  
  const diffMs = baseDateObj.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  // 일주일 이상은 실제 날짜 표시
  return formatDateOnly(date);
}

/**
 * 두 날짜 사이의 기간 계산
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {string} 기간 문자열
 */
export function formatDuration(startDate, endDate) {
  if (!startDate || !endDate) return '-';
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
  
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 0) return '0초';
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}일 ${remainingHours}시간` : `${days}일`;
  }
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  }
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}분 ${remainingSeconds}초` : `${minutes}분`;
  }
  
  return `${seconds}초`;
}

/**
 * 날짜가 유효한지 확인
 * @param {any} date - 확인할 날짜
 * @returns {boolean} 유효성 여부
 */
export function isValidDate(date) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * ISO 날짜 문자열을 로컬 날짜 문자열로 변환
 * @param {string} isoString - ISO 날짜 문자열
 * @returns {string} 로컬 날짜 문자열 (YYYY-MM-DD)
 */
export function isoToLocalDateString(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 로컬 날짜 문자열을 ISO 문자열로 변환
 * @param {string} localDateString - 로컬 날짜 문자열 (YYYY-MM-DD)
 * @returns {string} ISO 날짜 문자열
 */
export function localDateStringToISO(localDateString) {
  if (!localDateString) return '';
  const date = new Date(localDateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString();
}

/**
 * LocalDateTime 배열 형식을 JavaScript Date 객체로 변환
 * 백엔드에서 받은 날짜 배열 [년, 월, 일, 시, 분, 초, 나노초]를 변환
 * @param {Array} dateArray - LocalDateTime 배열 [year, month, day, hour, minute, second, nanosecond]
 * @returns {Date|null} JavaScript Date 객체 또는 null
 */
export function convertLocalDateTimeArrayToDate(dateArray) {
  if (!Array.isArray(dateArray) || dateArray.length < 6) {
    return null;
  }
  
  try {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    // JavaScript Date의 월은 0-based (0 = 1월)이므로 1을 빼야 함
    const date = new Date(year, month - 1, day, hour, minute, second);
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('날짜 배열 변환 오류:', error, dateArray);
    return null;
  }
}

/**
 * 다양한 날짜 형식을 안전하게 JavaScript Date로 변환
 * @param {any} date - 변환할 날짜 (문자열, Date 객체, 배열)
 * @returns {Date|null} JavaScript Date 객체 또는 null
 */
export function safeParseDate(date) {
  if (!date) return null;
  
  // 이미 Date 객체인 경우
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  // 배열 형식인 경우 (LocalDateTime)
  if (Array.isArray(date)) {
    return convertLocalDateTimeArrayToDate(date);
  }
  
  // 문자열인 경우
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  
  return null;
}

/**
 * 안전한 날짜 포맷팅 (LocalDateTime 배열 지원)
 * @param {any} date - 변환할 날짜 (문자열, Date 객체, 배열)
 * @param {string} locale - 로케일 (기본: 'ko-KR')
 * @param {object} options - 포맷 옵션
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDateSafe(date, locale = 'ko-KR', options = {}) {
  const dateObj = safeParseDate(date);
  if (!dateObj) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return dateObj.toLocaleString(locale, defaultOptions);
}

/**
 * 안전한 날짜만 포맷팅 (시간 제외, LocalDateTime 배열 지원)
 * @param {any} date - 변환할 날짜 (문자열, Date 객체, 배열)
 * @param {string} locale - 로케일 (기본: 'ko-KR')
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDateOnlySafe(date, locale = 'ko-KR') {
  return formatDateSafe(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}