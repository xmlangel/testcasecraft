package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * ICT-185: 테스트 결과 통계 데이터 DTO
 * Pass/Fail/NotRun/Blocked 통계를 위한 데이터 구조
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResultStatisticsDto {
    
    // 기본 통계 정보
    private Long totalTests;
    private Long passCount;
    private Long failCount;
    private Long notRunCount;
    private Long blockedCount;
    
    // 비율 계산 (백분율)
    private BigDecimal passRate;
    private BigDecimal failRate;
    private BigDecimal notRunRate;
    private BigDecimal blockedRate;
    
    // 실행률 (NOT_RUN 제외)
    private BigDecimal executionRate;
    
    // 성공률 (실행된 것 중에서)
    private BigDecimal successRate;
    
    // 필터 조건 정보
    private String filterType; // "PROJECT", "TEST_PLAN", "TEST_EXECUTION"
    private String filterId;
    private String filterName;
    
    // 기간 정보
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime periodStart;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime periodEnd;
    
    // JIRA 연동 통계
    private Long jiraLinkedCount; // JIRA와 연결된 테스트 수
    private Long jiraSyncedCount; // JIRA 동기화 완료된 테스트 수
    private Map<String, Long> jiraStatusDistribution; // JIRA 상태별 분포
    
    // 실행자별 통계 (선택적)
    private Map<String, Long> executorDistribution;
    
    // 생성 시간
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime calculatedAt;
    
    // 헬퍼 메서드들
    
    /**
     * 통계를 계산하여 비율 필드들을 설정
     */
    public void calculateRates() {
        if (totalTests == null || totalTests == 0) {
            setAllRatesToZero();
            return;
        }
        
        BigDecimal total = new BigDecimal(totalTests);
        
        this.passRate = calculatePercentage(passCount, total);
        this.failRate = calculatePercentage(failCount, total);
        this.notRunRate = calculatePercentage(notRunCount, total);
        this.blockedRate = calculatePercentage(blockedCount, total);
        
        // 실행률 계산 (NOT_RUN 제외)
        Long executedCount = totalTests - (notRunCount != null ? notRunCount : 0);
        this.executionRate = calculatePercentage(executedCount, total);
        
        // 성공률 계산 (실행된 것 중에서 PASS 비율)
        if (executedCount > 0) {
            this.successRate = calculatePercentage(passCount, new BigDecimal(executedCount));
        } else {
            this.successRate = BigDecimal.ZERO;
        }
        
        this.calculatedAt = LocalDateTime.now();
    }
    
    private BigDecimal calculatePercentage(Long count, BigDecimal total) {
        if (count == null || total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(count)
            .divide(total, 4, java.math.RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));
    }
    
    private void setAllRatesToZero() {
        this.passRate = BigDecimal.ZERO;
        this.failRate = BigDecimal.ZERO;
        this.notRunRate = BigDecimal.ZERO;
        this.blockedRate = BigDecimal.ZERO;
        this.executionRate = BigDecimal.ZERO;
        this.successRate = BigDecimal.ZERO;
    }
    
    /**
     * 기본 카운트 값들을 0으로 초기화
     */
    public void initializeCounts() {
        this.passCount = 0L;
        this.failCount = 0L;
        this.notRunCount = 0L;
        this.blockedCount = 0L;
        this.totalTests = 0L;
        this.jiraLinkedCount = 0L;
        this.jiraSyncedCount = 0L;
    }
}