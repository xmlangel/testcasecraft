// src/main/java/com/testcase/testcasemanagement/repository/UserActivityRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, String> {
    
    // 사용자별 활동 이력 조회
    List<UserActivity> findByUserIdOrderByTimestampDesc(String userId);
    
    Page<UserActivity> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    
    // 활동 타입별 조회
    List<UserActivity> findByActivityType(String activityType);
    
    List<UserActivity> findByActivityCategory(String activityCategory);
    
    // 사용자의 특정 활동 타입 조회
    List<UserActivity> findByUserIdAndActivityType(String userId, String activityType);
    
    // 사용자의 특정 카테고리 활동 조회
    List<UserActivity> findByUserIdAndActivityCategory(String userId, String activityCategory);
    
    // 세션별 활동 조회
    List<UserActivity> findBySessionIdOrderByTimestampAsc(String sessionId);
    
    // 시간 범위별 활동 조회
    List<UserActivity> findByTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    Page<UserActivity> findByTimestampBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    // 사용자별 시간 범위 활동 조회
    List<UserActivity> findByUserIdAndTimestampBetween(String userId, LocalDateTime startTime, LocalDateTime endTime);
    
    Page<UserActivity> findByUserIdAndTimestampBetween(String userId, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    // 성공/실패 활동 조회
    List<UserActivity> findByIsSuccessful(Boolean isSuccessful);
    
    List<UserActivity> findByUserIdAndIsSuccessful(String userId, Boolean isSuccessful);
    
    // 이상 활동 조회
    List<UserActivity> findByAnomalyDetectedTrue();
    
    List<UserActivity> findByUserIdAndAnomalyDetectedTrue(String userId);
    
    // 고위험 활동 조회
    @Query("SELECT ua FROM UserActivity ua WHERE ua.riskScore >= :minRiskScore")
    List<UserActivity> findHighRiskActivities(@Param("minRiskScore") Integer minRiskScore);
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId AND ua.riskScore >= :minRiskScore")
    List<UserActivity> findUserHighRiskActivities(@Param("userId") String userId, @Param("minRiskScore") Integer minRiskScore);
    
    // 특정 엔티티 관련 활동 조회
    List<UserActivity> findByTargetEntityTypeAndTargetEntityId(String targetEntityType, String targetEntityId);
    
    // 최근 로그인 조회
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = 'LOGIN' ORDER BY ua.timestamp DESC")
    List<UserActivity> findRecentLogins(@Param("userId") String userId, Pageable pageable);
    
    // 최근 로그아웃 조회
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = 'LOGOUT' ORDER BY ua.timestamp DESC")
    List<UserActivity> findRecentLogouts(@Param("userId") String userId, Pageable pageable);
    
    // 마지막 로그인 시간 조회
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = 'LOGIN' AND ua.isSuccessful = true ORDER BY ua.timestamp DESC")
    Optional<UserActivity> findLastSuccessfulLogin(@Param("userId") String userId);
    
    // 활동 통계 - 활동 타입별 카운트
    @Query("SELECT ua.activityType, COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId GROUP BY ua.activityType")
    List<Object[]> getUserActivityTypeStatistics(@Param("userId") String userId);
    
    // 활동 통계 - 카테고리별 카운트
    @Query("SELECT ua.activityCategory, COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId GROUP BY ua.activityCategory")
    List<Object[]> getUserActivityCategoryStatistics(@Param("userId") String userId);
    
    // 일별 활동 통계
    @Query("SELECT DATE(ua.timestamp), COUNT(ua) FROM UserActivity ua " +
           "WHERE ua.user.id = :userId AND ua.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(ua.timestamp) ORDER BY DATE(ua.timestamp)")
    List<Object[]> getUserDailyActivityStatistics(@Param("userId") String userId, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);
    
    // 시간대별 활동 통계
    @Query("SELECT HOUR(ua.timestamp), COUNT(ua) FROM UserActivity ua " +
           "WHERE ua.user.id = :userId AND ua.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY HOUR(ua.timestamp) ORDER BY HOUR(ua.timestamp)")
    List<Object[]> getUserHourlyActivityStatistics(@Param("userId") String userId, 
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    // 실패한 활동 통계
    @Query("SELECT ua.activityType, COUNT(ua) FROM UserActivity ua " +
           "WHERE ua.user.id = :userId AND ua.isSuccessful = false " +
           "GROUP BY ua.activityType")
    List<Object[]> getUserFailureStatistics(@Param("userId") String userId);
    
    // IP 주소별 활동 조회
    List<UserActivity> findByUserIdAndIpAddress(String userId, String ipAddress);
    
    // 특정 기간 동안의 세션 수 조회
    @Query("SELECT COUNT(DISTINCT ua.sessionId) FROM UserActivity ua " +
           "WHERE ua.user.id = :userId AND ua.timestamp BETWEEN :startDate AND :endDate")
    long countDistinctSessionsByUserAndPeriod(@Param("userId") String userId, 
                                            @Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    // 활성 세션 조회 (로그인은 있지만 로그아웃이 없는 세션)
    @Query("SELECT DISTINCT ua.sessionId FROM UserActivity ua " +
           "WHERE ua.user.id = :userId AND ua.activityType = 'LOGIN'" +
           "AND ua.sessionId NOT IN (" +
           "   SELECT ua2.sessionId FROM UserActivity ua2 " +
           "   WHERE ua2.user.id = :userId AND ua2.activityType = 'LOGOUT'" +
           ")")
    List<String> findActiveSessionIds(@Param("userId") String userId);
    
    // 평균 세션 지속 시간 계산 (분 단위) - 임시로 주석 처리
    // H2 데이터베이스에서 날짜 함수 호환성 문제로 인해 임시 비활성화
    @Query("SELECT 0.0 FROM UserActivity WHERE 1 = 0")
    Double getAverageSessionDuration(@Param("userId") String userId, 
                                   @Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    // 전체 활동 조회 (관리자용)
    @Query("SELECT ua FROM UserActivity ua ORDER BY ua.timestamp DESC")
    Page<UserActivity> findAllActivities(Pageable pageable);
    
    // 전체 활동 검색
    @Query("SELECT ua FROM UserActivity ua WHERE " +
           "LOWER(ua.activityType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ua.activityCategory) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ua.targetEntityName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ua.details) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ua.user.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<UserActivity> searchActivities(@Param("keyword") String keyword, Pageable pageable);
    
    // 오래된 활동 정리용
    @Query("SELECT ua FROM UserActivity ua WHERE ua.timestamp < :cutoffDate")
    List<UserActivity> findOldActivities(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // 사용자별 활동 수 카운트
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
    
    // 특정 기간 사용자 활동 수 카운트
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId AND ua.timestamp BETWEEN :startDate AND :endDate")
    long countByUserIdAndPeriod(@Param("userId") String userId, 
                               @Param("startDate") LocalDateTime startDate, 
                               @Param("endDate") LocalDateTime endDate);
}