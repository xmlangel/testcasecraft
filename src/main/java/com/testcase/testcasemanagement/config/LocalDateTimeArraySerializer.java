package com.testcase.testcasemanagement.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * LocalDateTime을 ISO 8601 문자열 형태로 직렬화하는 커스텀 Serializer
 *
 * Frontend에서 new Date()로 파싱 가능한 ISO 8601 형식으로 전송
 * 예: "2025-10-28T12:53:37.637732"
 */
public class LocalDateTimeArraySerializer extends JsonSerializer<LocalDateTime> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value == null) {
            gen.writeNull();
        } else {
            // ISO 8601 형식으로 직렬화 (예: "2025-10-28T12:53:37.637732")
            gen.writeString(value.format(FORMATTER));
        }
    }
}
