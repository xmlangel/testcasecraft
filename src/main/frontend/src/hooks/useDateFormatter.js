// src/hooks/useDateFormatter.js
import { useCallback } from "react";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import {
  formatDateSafe,
  formatYmd,
  resolveDisplayTimeZone,
} from "../utils/dateUtils";

/**
 * 전역 설정(언어, 시간대)을 반영한 날짜 포맷팅 훅
 *
 * ICT-511: 화면 공통 표기를 `YYYY-MM-DD HH:mm`(날짜만이면 `YYYY-MM-DD`)로 맞추고,
 * 시간대는 프로필에서 고른 값, 없으면(서버 기본값 UTC 포함) 브라우저 시간대를 쓴다.
 * 표기 옵션을 따로 넘기는 호출은 예전처럼 Intl 로케일 표기를 쓴다.
 */
export function useDateFormatter() {
  const { currentLanguage } = useI18n();
  const { user } = useAuth();

  const userTimeZone = resolveDisplayTimeZone(user?.timezone);

  /**
   * 날짜와 시간을 포맷팅
   */
  const formatDate = useCallback(
    (date, options = {}) => {
      const { timeZone, ...formatOptions } = options || {};
      if (Object.keys(formatOptions).length > 0) {
        return formatDateSafe(date, currentLanguage, {
          timeZone: timeZone || userTimeZone,
          ...formatOptions,
        });
      }
      return formatYmd(date, {
        withTime: true,
        timeZone: timeZone || userTimeZone,
      });
    },
    [currentLanguage, userTimeZone],
  );

  /**
   * 날짜만 포맷팅 (시간 제외)
   */
  const formatDateOnly = useCallback(
    (date) => formatYmd(date, { timeZone: userTimeZone }),
    [userTimeZone],
  );

  return {
    formatDate,
    formatDateOnly,
    currentLanguage,
    userTimeZone,
  };
}

export default useDateFormatter;
