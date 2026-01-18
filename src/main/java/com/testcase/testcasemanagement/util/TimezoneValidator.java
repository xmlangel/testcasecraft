// src/main/java/com/testcase/testcasemanagement/util/TimezoneValidator.java
package com.testcase.testcasemanagement.util;

import java.time.ZoneId;
import java.util.Set;

/**
 * Timezone 유효성 검증 유틸리티 클래스
 */
public class TimezoneValidator {

    /**
     * 주어진 timezone 문자열이 유효한 timezone인지 검증
     *
     * @param timezone 검증할 timezone 문자열
     * @return 유효한 timezone이면 true, 그렇지 않으면 false
     */
    public static boolean isValidTimezone(String timezone) {
        if (timezone == null || timezone.trim().isEmpty()) {
            return false;
        }

        try {
            // ZoneId를 이용하여 유효한 timezone인지 확인
            ZoneId.of(timezone);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 사용 가능한 모든 timezone ID 집합을 반환
     *
     * @return 사용 가능한 timezone ID 집합
     */
    public static Set<String> getAvailableTimezones() {
        return ZoneId.getAvailableZoneIds();
    }

    /**
     * timezone을 정규화 (normalize)
     * 예: "utc" -> "UTC", "asia/seoul" -> "Asia/Seoul"
     *
     * @param timezone 정규화할 timezone 문자열
     * @return 정규화된 timezone 문자열 또는 유효하지 않으면 "UTC"
     */
    public static String normalizeTimezone(String timezone) {
        if (timezone == null || timezone.trim().isEmpty()) {
            return "UTC";
        }

        try {
            // ZoneId로 파싱 후 다시 문자열로 변환하여 정규화
            return ZoneId.of(timezone).getId();
        } catch (Exception e) {
            // 유효하지 않은 timezone인 경우 기본값 UTC 반환
            return "UTC";
        }
    }
}
