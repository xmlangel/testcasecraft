// src/main/java/com/testcase/testcasemanagement/model/PageVisitMetric.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import org.hibernate.annotations.Comment;

/** 페이지 방문 메트릭 엔티티 일별 페이지 방문 통계를 데이터베이스에 영속화합니다. */
@Entity
@Comment("페이지 방문 지표: 화면 경로별 일별 방문 수와 누적 방문 수 | Page Visit Metric: daily visit count and cumulative visit count per screen path")
@Table(
    name = "page_visit_metrics",
    indexes = {
      @Index(name = "idx_page_visit_date", columnList = "visit_date"),
      @Index(name = "idx_page_visit_page_path", columnList = "page_path"),
      @Index(name = "idx_page_visit_date_page", columnList = "visit_date,page_path", unique = true)
    })
public class PageVisitMetric {

  @Comment("식별자: 페이지 방문 메트릭을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a page visit metric (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  /** 방문 날짜 (일 단위) */
  @Comment("방문 일자: 방문이 발생한 날짜 (값 영역: 일 단위 날짜) | Visit Date: date on which the visit occurred (Value domain: date at day granularity)")
  @Column(name = "visit_date", nullable = false)
  private LocalDate visitDate;

  /** 페이지 경로 (예: /dashboard, /projects) */
  @Comment("페이지 경로: 방문한 웹 페이지의 경로 | Page Path: path of the visited web page")
  @Column(name = "page_path", nullable = false, length = 255)
  private String pagePath;

  /** 당일 방문 횟수 */
  @Comment("당일 방문 수: 해당 날짜에 이 페이지를 방문한 횟수 (값 영역: 0 이상) | Daily Visit Count: number of visits to this page on the given date (Value domain: 0 or greater)")
  @Column(name = "daily_count", nullable = false)
  private Long dailyCount = 0L;

  /** 누적 총 방문 횟수 */
  @Comment("누적 방문 수: 이 페이지의 누적 총 방문 횟수 (값 영역: 0 이상) | Cumulative Visit Count: cumulative total number of visits to this page (Value domain: 0 or greater)")
  @Column(name = "total_count", nullable = false)
  private Long totalCount = 0L;

  // Constructors
  public PageVisitMetric() {}

  public PageVisitMetric(LocalDate visitDate, String pagePath, Long dailyCount, Long totalCount) {
    this.visitDate = visitDate;
    this.pagePath = pagePath;
    this.dailyCount = dailyCount;
    this.totalCount = totalCount;
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public LocalDate getVisitDate() {
    return visitDate;
  }

  public void setVisitDate(LocalDate visitDate) {
    this.visitDate = visitDate;
  }

  public String getPagePath() {
    return pagePath;
  }

  public void setPagePath(String pagePath) {
    this.pagePath = pagePath;
  }

  public Long getDailyCount() {
    return dailyCount;
  }

  public void setDailyCount(Long dailyCount) {
    this.dailyCount = dailyCount;
  }

  public Long getTotalCount() {
    return totalCount;
  }

  public void setTotalCount(Long totalCount) {
    this.totalCount = totalCount;
  }

  @Override
  public String toString() {
    return "PageVisitMetric{"
        + "id='"
        + id
        + '\''
        + ", visitDate="
        + visitDate
        + ", pagePath='"
        + pagePath
        + '\''
        + ", dailyCount="
        + dailyCount
        + ", totalCount="
        + totalCount
        + '}';
  }
}
