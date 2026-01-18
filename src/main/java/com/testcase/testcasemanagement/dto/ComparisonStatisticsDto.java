// src/main/java/com/testcase/testcasemanagement/dto/ComparisonStatisticsDto.java

package com.testcase.testcasemanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 비교 통계 DTO (플랜별/실행자별)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "비교 통계 데이터")
public class ComparisonStatisticsDto {

    @Schema(description = "이름 (플랜명 또는 실행자명)", example = "로그인 테스트")
    private String name;

    @Schema(description = "성공 개수", example = "15")
    private Integer passCount;

    @Schema(description = "실패 개수", example = "2")
    private Integer failCount;

    @Schema(description = "차단 개수", example = "1")
    private Integer blockedCount;

    @Schema(description = "미실행 개수", example = "0")
    private Integer notRunCount;

    @Schema(description = "전체 테스트 개수", example = "18")
    private Integer totalTests;

    @Schema(description = "성공률 (%)", example = "83.3")
    private Double successRate;
}
