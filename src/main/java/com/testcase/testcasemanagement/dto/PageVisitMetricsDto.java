// src/main/java/com/testcase/testcasemanagement/dto/PageVisitMetricsDto.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * 페이지 방문 메트릭 요약 DTO
 * Spring Actuator에서 수집한 메트릭을 대시보드에 전달하기 위한 응답 모델입니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageVisitMetricsDto {

    private LocalDate currentDate;
    private Instant generatedAt;
    private long totalDailyVisits;
    private long totalUniqueVisitors;
    private long activeVisitors;
    private long rollingDayWindowMinutes;
    private List<PageVisitCountDto> pages;
    private List<DailyVisitSummaryDto> dailySummaries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageVisitCountDto {
        private String pagePath;
        private long dailyCount;
        private long totalCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyVisitSummaryDto {
        private LocalDate date;
        private long totalVisits;
        private long uniqueVisitors;
    }
}
