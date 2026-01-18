package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 테스트케이스 상태별 통계 데이터 DTO
 * 대시보드 차트용 통계 정보
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseStatisticsDto {
    private Integer totalCases; // 전체 테스트케이스 개수
    private Integer PASS; // PASS 개수
    private Integer FAIL; // FAIL 개수
    private Integer BLOCKED; // BLOCKED 개수
    private Integer SKIPPED; // SKIPPED 개수
    private Integer NOTRUN; // NOTRUN 개수
}