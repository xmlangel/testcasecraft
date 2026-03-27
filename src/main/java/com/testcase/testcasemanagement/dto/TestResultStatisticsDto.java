package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** ICT-185: 테스트 결과 통계 데이터 DTO Pass/Fail/NotRun/Blocked 통계를 위한 데이터 구조 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResultStatisticsDto {

  // 기본 통계 정보 (전체 수행 이력 합계)
  private Long totalTests;
  private Long passCount;
  private Long failCount;
  private Long notRunCount;
  private Long blockedCount;
  private Long skippedCount;

  // 최종 결과 요약 정보 (테스트케이스별 최신 상태 합계)
  private Long totalCaseCount;
  private Long latestPassCount;
  private Long latestFailCount;
  private Long latestNotRunCount;
  private Long latestBlockedCount;

  // 비율 계산 (백분율 - 전체 수행 기준)
  private BigDecimal passRate;
  private BigDecimal failRate;
  private BigDecimal notRunRate;
  private BigDecimal blockedRate;

  // 최종 결과 비율 (백분율 - 테스트케이스별 최신 기준)
  private BigDecimal latestPassRate;
  private BigDecimal latestFailRate;
  private BigDecimal latestNotRunRate;
  private BigDecimal latestBlockedRate;

  // 실행률 (NOT_RUN 제외)
  private BigDecimal executionRate;

  // 성공률 (실행된 것 중에서)
  private BigDecimal successRate;
  private BigDecimal latestSuccessRate;

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
  private Long latestJiraLinkedCount; // JIRA와 연결된 테스트케이스 수 (최신 기준)
  private Long jiraSyncedCount; // JIRA 동기화 완료된 테스트 수
  private Map<String, Long> jiraStatusDistribution; // JIRA 상태별 분포

  // JIRA 연동률 (백분율)
  private BigDecimal jiraLinkRate; // 전체 실행 대비 연동률 (기존)
  private BigDecimal latestJiraLinkRate; // 테스트케이스 대비 연동률 (권장)

  // 실행자별 통계 (선택적)
  private Map<String, Long> executorDistribution;

  // 생성 시간
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
  private LocalDateTime calculatedAt;

  // 헬퍼 메서드들

  /** 통계를 계산하여 비율 필드들을 설정 */
  public void calculateRates() {
    if (totalTests == null || totalTests == 0) {
      setAllRatesToZero();
    } else {
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

      // JIRA 연동률 (실행 기준)
      this.jiraLinkRate = calculatePercentage(jiraLinkedCount, total);
    }

    // 최신 결과 기반 비율 계산
    if (totalCaseCount != null && totalCaseCount > 0) {
      BigDecimal totalCases = new BigDecimal(totalCaseCount);
      this.latestPassRate = calculatePercentage(latestPassCount, totalCases);
      this.latestFailRate = calculatePercentage(latestFailCount, totalCases);
      this.latestNotRunRate = calculatePercentage(latestNotRunCount, totalCases);
      this.latestBlockedRate = calculatePercentage(latestBlockedCount, totalCases);

      Long latestExecutedCount =
          totalCaseCount - (latestNotRunCount != null ? latestNotRunCount : 0);
      if (latestExecutedCount > 0) {
        this.latestSuccessRate =
            calculatePercentage(latestPassCount, new BigDecimal(latestExecutedCount));
      } else {
        this.latestSuccessRate = BigDecimal.ZERO;
      }

      // JIRA 연동률 (케이스 기준)
      this.latestJiraLinkRate = calculatePercentage(latestJiraLinkedCount, totalCases);
    } else {
      this.latestPassRate = BigDecimal.ZERO;
      this.latestFailRate = BigDecimal.ZERO;
      this.latestNotRunRate = BigDecimal.ZERO;
      this.latestBlockedRate = BigDecimal.ZERO;
      this.latestSuccessRate = BigDecimal.ZERO;
      this.latestJiraLinkRate = BigDecimal.ZERO;
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
    this.latestPassRate = BigDecimal.ZERO;
    this.latestFailRate = BigDecimal.ZERO;
    this.latestNotRunRate = BigDecimal.ZERO;
    this.latestBlockedRate = BigDecimal.ZERO;
    this.latestSuccessRate = BigDecimal.ZERO;
  }

  /** 기본 카운트 값들을 0으로 초기화 */
  public void initializeCounts() {
    this.passCount = 0L;
    this.failCount = 0L;
    this.notRunCount = 0L;
    this.blockedCount = 0L;
    this.skippedCount = 0L;
    this.totalTests = 0L;
    this.totalCaseCount = 0L;
    this.latestPassCount = 0L;
    this.latestFailCount = 0L;
    this.latestNotRunCount = 0L;
    this.latestBlockedCount = 0L;
    this.jiraLinkedCount = 0L;
    this.latestJiraLinkedCount = 0L;
    this.jiraSyncedCount = 0L;
  }
}
