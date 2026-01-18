package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 테스트케이스 결과 추이 데이터 DTO
 * 차트 표시용 날짜별 집계 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestResultsTrendDto {
    private String date; // 날짜 (MM/dd/yyyy 형식)
    private Integer PASS; // PASS 개수
    private Integer FAIL; // FAIL 개수
    private Integer BLOCKED; // BLOCKED 개수
    private Integer SKIPPED; // SKIPPED 개수
    private Integer NOTRUN; // NOTRUN 개수
    private Integer completeRate; // 완료율 (백분율)
    private Integer notRun; // 미실행 개수
}