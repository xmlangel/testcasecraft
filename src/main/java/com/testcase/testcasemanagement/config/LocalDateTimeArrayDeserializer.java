package com.testcase.testcasemanagement.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * FastAPI의 배열 형태 datetime을 LocalDateTime으로 변환하는 커스텀 Deserializer
 *
 * FastAPI는 datetime을 [year, month, day, hour, minute, second, microsecond] 형태로 전송
 * 예: [2025, 10, 28, 12, 53, 37, 637732000]
 */
public class LocalDateTimeArrayDeserializer extends JsonDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);

        // null 체크
        if (node.isNull()) {
            return null;
        }

        // 문자열 형태 (ISO 8601) 처리
        if (node.isTextual()) {
            String dateStr = node.asText();
            try {
                // ISO 8601 with Z (UTC) - ZonedDateTime으로 파싱 후 LocalDateTime으로 변환
                if (dateStr.endsWith("Z") || dateStr.contains("+") || dateStr.matches(".*[+-]\\d{2}:\\d{2}$")) {
                    return java.time.ZonedDateTime.parse(dateStr).toLocalDateTime();
                }
                // ISO 8601 without timezone
                return LocalDateTime.parse(dateStr);
            } catch (Exception e) {
                // 파싱 실패 시 null 반환
                return null;
            }
        }

        // 배열 형태 처리
        if (node.isArray() && node.size() >= 6) {
            int year = node.get(0).asInt();
            int month = node.get(1).asInt();
            int day = node.get(2).asInt();
            int hour = node.get(3).asInt();
            int minute = node.get(4).asInt();
            int second = node.get(5).asInt();
            int nano = node.size() > 6 ? node.get(6).asInt() : 0;

            return LocalDateTime.of(year, month, day, hour, minute, second, nano);
        }

        // 숫자 형태 (timestamp) 처리
        if (node.isNumber()) {
            long timestamp = node.asLong();
            return LocalDateTime.ofEpochSecond(timestamp / 1000, (int) (timestamp % 1000) * 1000000,
                    java.time.ZoneOffset.UTC);
        }

        return null;
    }
}
