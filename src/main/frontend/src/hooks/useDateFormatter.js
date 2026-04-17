// src/hooks/useDateFormatter.js
import { useCallback } from "react";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import { formatDateSafe, formatDateOnlySafe } from "../utils/dateUtils";

/**
 * 전역 설정(언어, 시간대)을 반영한 날짜 포맷팅 훅
 */
export function useDateFormatter() {
  const { currentLanguage } = useI18n();
  const { user } = useAuth();

  // 사용자 프로필에 설정된 시간대 (기본값: UTC)
  const userTimeZone = user?.timezone || "UTC";

  /**
   * 날짜와 시간을 포맷팅
   */
  const formatDate = useCallback(
    (date, options = {}) => {
      return formatDateSafe(date, currentLanguage, {
        timeZone: userTimeZone,
        ...options,
      });
    },
    [currentLanguage, userTimeZone],
  );

  /**
   * 날짜만 포맷팅 (시간 제외)
   */
  const formatDateOnly = useCallback(
    (date) => {
      return formatDateOnlySafe(date, currentLanguage);
    },
    [currentLanguage],
  );

  return {
    formatDate,
    formatDateOnly,
    currentLanguage,
    userTimeZone,
  };
}

export default useDateFormatter;
