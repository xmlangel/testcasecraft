// src/main/java/com/testcase/testcasemanagement/model/PageVisitMetric.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * 페이지 방문 메트릭 엔티티
 * 일별 페이지 방문 통계를 데이터베이스에 영속화합니다.
 */
@Entity
@Table(name = "page_visit_metrics", indexes = {
    @Index(name = "idx_page_visit_date", columnList = "visit_date"),
    @Index(name = "idx_page_visit_page_path", columnList = "page_path"),
    @Index(name = "idx_page_visit_date_page", columnList = "visit_date,page_path", unique = true)
})
public class PageVisitMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * 방문 날짜 (일 단위)
     */
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    /**
     * 페이지 경로 (예: /dashboard, /projects)
     */
    @Column(name = "page_path", nullable = false, length = 255)
    private String pagePath;

    /**
     * 당일 방문 횟수
     */
    @Column(name = "daily_count", nullable = false)
    private Long dailyCount = 0L;

    /**
     * 누적 총 방문 횟수
     */
    @Column(name = "total_count", nullable = false)
    private Long totalCount = 0L;

    // Constructors
    public PageVisitMetric() {
    }

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
        return "PageVisitMetric{" +
                "id='" + id + '\'' +
                ", visitDate=" + visitDate +
                ", pagePath='" + pagePath + '\'' +
                ", dailyCount=" + dailyCount +
                ", totalCount=" + totalCount +
                '}';
    }
}
