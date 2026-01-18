// src/main/frontend/src/utils/timezoneUtils.js

/**
 * 서버 시간(UTC)을 사용자 timezone으로 변환하는 유틸리티
 */

/**
 * ISO 8601 형식의 날짜 문자열을 사용자 시간대로 변환
 *
 * @param {string} isoDateString - ISO 8601 형식의 날짜 문자열 (예: "2025-01-01T12:00:00")
 * @param {string} timezone - 사용자 시간대 (예: "Asia/Seoul", "UTC")
 * @param {object} options - Intl.DateTimeFormat 옵션
 * @returns {string} 변환된 날짜 문자열
 */
export function convertToUserTimezone(isoDateString, timezone = 'UTC', options = {}) {
  if (!isoDateString) return '';

  try {
    const date = new Date(isoDateString);

    // 기본 옵션
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Intl.DateTimeFormat을 사용하여 시간대 변환
    const formatter = new Intl.DateTimeFormat('ko-KR', finalOptions);
    return formatter.format(date);
  } catch (error) {
    console.error('Timezone conversion error:', error);
    return isoDateString; // 오류 시 원본 반환
  }
}

/**
 * ISO 8601 형식의 날짜 문자열을 사용자 시간대로 변환 (날짜만)
 *
 * @param {string} isoDateString - ISO 8601 형식의 날짜 문자열
 * @param {string} timezone - 사용자 시간대
 * @returns {string} 변환된 날짜 문자열 (YYYY-MM-DD)
 */
export function convertToUserDate(isoDateString, timezone = 'UTC') {
  return convertToUserTimezone(isoDateString, timezone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false
  });
}

/**
 * ISO 8601 형식의 날짜 문자열을 사용자 시간대로 변환 (시간만)
 *
 * @param {string} isoDateString - ISO 8601 형식의 날짜 문자열
 * @param {string} timezone - 사용자 시간대
 * @returns {string} 변환된 시간 문자열 (HH:MM:SS)
 */
export function convertToUserTime(isoDateString, timezone = 'UTC') {
  return convertToUserTimezone(isoDateString, timezone, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * ISO 8601 형식의 날짜 문자열을 사용자 시간대로 변환 (커스텀 포맷)
 *
 * @param {string} isoDateString - ISO 8601 형식의 날짜 문자열
 * @param {string} timezone - 사용자 시간대
 * @param {string} format - 포맷 문자열 ('datetime', 'date', 'time', 'long')
 * @returns {string} 변환된 날짜 문자열
 */
export function formatDateTime(isoDateString, timezone = 'UTC', format = 'datetime') {
  if (!isoDateString) return '';

  const formats = {
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    date: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    }
  };

  return convertToUserTimezone(isoDateString, timezone, formats[format] || formats.datetime);
}

/**
 * 현재 시간을 사용자 시간대로 반환
 *
 * @param {string} timezone - 사용자 시간대
 * @param {string} format - 포맷 문자열
 * @returns {string} 현재 시간 문자열
 */
export function getCurrentTimeInTimezone(timezone = 'UTC', format = 'datetime') {
  const now = new Date().toISOString();
  return formatDateTime(now, timezone, format);
}

/**
 * 시간대 오프셋을 문자열로 반환
 *
 * @param {string} timezone - 시간대
 * @returns {string} 오프셋 문자열 (예: "+09:00", "-05:00")
 */
export function getTimezoneOffset(timezone = 'UTC') {
  try {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));

    const offsetMs = tzDate.getTime() - utcDate.getTime();
    const offsetHours = Math.floor(offsetMs / (1000 * 60 * 60));
    const offsetMinutes = Math.abs(Math.floor((offsetMs % (1000 * 60 * 60)) / (1000 * 60)));

    const sign = offsetHours >= 0 ? '+' : '-';
    const hours = Math.abs(offsetHours).toString().padStart(2, '0');
    const minutes = offsetMinutes.toString().padStart(2, '0');

    return `${sign}${hours}:${minutes}`;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return '+00:00';
  }
}

/**
 * 사용자 Context에서 timezone 가져오기
 * (AppContext와 통합하여 사용)
 *
 * @param {object} user - 사용자 객체
 * @returns {string} 사용자 시간대
 */
export function getUserTimezone(user) {
  return user?.timezone || 'UTC';
}
