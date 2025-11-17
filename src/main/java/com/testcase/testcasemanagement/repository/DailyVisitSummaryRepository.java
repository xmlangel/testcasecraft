// src/main/java/com/testcase/testcasemanagement/repository/DailyVisitSummaryRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.DailyVisitSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 일별 방문 요약 Repository
 */
@Repository
public interface DailyVisitSummaryRepository extends JpaRepository<DailyVisitSummary, String> {

    /**
     * 특정 날짜의 방문 요약 조회
     */
    Optional<DailyVisitSummary> findByVisitDate(LocalDate visitDate);

    /**
     * 특정 기간 내의 방문 요약 조회
     */
    @Query("SELECT dvs FROM DailyVisitSummary dvs WHERE dvs.visitDate BETWEEN :startDate AND :endDate ORDER BY dvs.visitDate DESC")
    List<DailyVisitSummary> findByVisitDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 최근 N일간의 방문 요약 조회
     */
    @Query("SELECT dvs FROM DailyVisitSummary dvs ORDER BY dvs.visitDate DESC")
    List<DailyVisitSummary> findRecentDays();

    /**
     * 특정 날짜 이전의 모든 요약 삭제 (정리용)
     */
    void deleteByVisitDateBefore(LocalDate date);
}
