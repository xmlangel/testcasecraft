package com.testcase.testcasemanagement.dto;

import java.time.LocalDateTime;

/** 케이스 하나의 가장 최근 실행 결과. 케이스 목록의 「최근 결과」 열이 쓴다(ICT-491). */
public record TestCaseLatestResultDto(String result, LocalDateTime executedAt) {}
