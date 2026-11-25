package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * 케이스 하나의 가장 최근 실행 결과. 케이스 목록의 「최근 결과」 열이 쓴다(ICT-491).
 *
 * <p>executedAt 은 ISO 문자열로 내보낸다. 기본 직렬화는 배열이라 화면 툴팁이 깨졌다(ICT-493).
 */
public record TestCaseLatestResultDto(
    String result,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime executedAt) {}
