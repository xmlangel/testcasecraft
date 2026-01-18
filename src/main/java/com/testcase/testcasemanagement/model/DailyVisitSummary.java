// src/main/java/com/testcase/testcasemanagement/model/DailyVisitSummary.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * 일별 방문 요약 엔티티
 * 일별 총 방문 수와 고유 방문자 수를 데이터베이스에 영속화합니다.
 */
@Entity
@Table(name = "daily_visit_summaries", indexes = {
    @Index(name = "idx_daily_summary_date", columnList = "visit_date", unique = true)
})
public class DailyVisitSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * 방문 날짜 (일 단위)
     */
    @Column(name = "visit_date", nullable = false, unique = true)
    private LocalDate visitDate;

    /**
     * 총 방문 횟수
     */
    @Column(name = "total_visits", nullable = false)
    private Long totalVisits = 0L;

    /**
     * 고유 방문자 수
     */
    @Column(name = "unique_visitors", nullable = false)
    private Long uniqueVisitors = 0L;

    // Constructors
    public DailyVisitSummary() {
    }

    public DailyVisitSummary(LocalDate visitDate, Long totalVisits, Long uniqueVisitors) {
        this.visitDate = visitDate;
        this.totalVisits = totalVisits;
        this.uniqueVisitors = uniqueVisitors;
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

    public Long getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(Long totalVisits) {
        this.totalVisits = totalVisits;
    }

    public Long getUniqueVisitors() {
        return uniqueVisitors;
    }

    public void setUniqueVisitors(Long uniqueVisitors) {
        this.uniqueVisitors = uniqueVisitors;
    }

    @Override
    public String toString() {
        return "DailyVisitSummary{" +
                "id='" + id + '\'' +
                ", visitDate=" + visitDate +
                ", totalVisits=" + totalVisits +
                ", uniqueVisitors=" + uniqueVisitors +
                '}';
    }
}
