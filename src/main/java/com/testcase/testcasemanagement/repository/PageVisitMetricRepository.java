// src/main/java/com/testcase/testcasemanagement/repository/PageVisitMetricRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.PageVisitMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 페이지 방문 메트릭 Repository
 */
@Repository
public interface PageVisitMetricRepository extends JpaRepository<PageVisitMetric, String> {

    /**
     * 특정 날짜의 모든 페이지 방문 메트릭 조회
     */
    List<PageVisitMetric> findByVisitDate(LocalDate visitDate);

    /**
     * 특정 날짜와 페이지 경로에 대한 메트릭 조회
     */
    Optional<PageVisitMetric> findByVisitDateAndPagePath(LocalDate visitDate, String pagePath);

    /**
     * 특정 기간 내의 모든 페이지 방문 메트릭 조회
     */
    @Query("SELECT pvm FROM PageVisitMetric pvm WHERE pvm.visitDate BETWEEN :startDate AND :endDate ORDER BY pvm.visitDate DESC, pvm.dailyCount DESC")
    List<PageVisitMetric> findByVisitDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 특정 날짜 이전의 모든 메트릭 삭제 (정리용)
     */
    void deleteByVisitDateBefore(LocalDate date);

    /**
     * 특정 페이지 경로의 최근 메트릭 조회
     */
    @Query("SELECT pvm FROM PageVisitMetric pvm WHERE pvm.pagePath = :pagePath ORDER BY pvm.visitDate DESC")
    List<PageVisitMetric> findRecentByPagePath(@Param("pagePath") String pagePath);
}
