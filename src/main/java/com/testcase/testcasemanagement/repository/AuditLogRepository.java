// src/main/java/com/testcase/testcasemanagement/repository/AuditLogRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    
    // 엔티티 타입별 로그 조회
    List<AuditLog> findByEntityType(String entityType);
    
    // 특정 엔티티의 로그 조회
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);
    
    // 특정 액션의 로그 조회
    List<AuditLog> findByAction(String action);
    
    // 특정 사용자가 수행한 로그 조회
    List<AuditLog> findByPerformedById(String userId);
    
    // 엔티티 타입과 액션으로 로그 조회
    List<AuditLog> findByEntityTypeAndAction(String entityType, String action);
    
    // 시간 범위별 로그 조회
    List<AuditLog> findByTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // 최근 로그들 조회 (시간 역순)
    @Query("SELECT al FROM AuditLog al ORDER BY al.timestamp DESC")
    List<AuditLog> findRecentLogs(org.springframework.data.domain.Pageable pageable);
    
    // 특정 엔티티의 최근 로그들 조회
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId ORDER BY al.timestamp DESC")
    List<AuditLog> findRecentLogsByEntity(@Param("entityType") String entityType, 
                                        @Param("entityId") String entityId,
                                        org.springframework.data.domain.Pageable pageable);
    
    // 특정 사용자의 최근 활동 로그 조회
    @Query("SELECT al FROM AuditLog al WHERE al.performedBy.id = :userId ORDER BY al.timestamp DESC")
    List<AuditLog> findRecentLogsByUser(@Param("userId") String userId,
                                      org.springframework.data.domain.Pageable pageable);
    
    // 조직 관련 로그들 조회
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = 'ORGANIZATION' OR " +
           "(al.entityType = 'ORGANIZATION_USER' AND al.details LIKE CONCAT('%organizationId:', :organizationId, '%'))")
    List<AuditLog> findOrganizationLogs(@Param("organizationId") String organizationId);
    
    // 프로젝트 관련 로그들 조회
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = 'PROJECT' OR " +
           "(al.entityType = 'PROJECT_USER' AND al.details LIKE CONCAT('%projectId:', :projectId, '%'))")
    List<AuditLog> findProjectLogs(@Param("projectId") String projectId);
    
    // 그룹 관련 로그들 조회
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = 'GROUP' OR " +
           "(al.entityType = 'GROUP_MEMBER' AND al.details LIKE CONCAT('%groupId:', :groupId, '%'))")
    List<AuditLog> findGroupLogs(@Param("groupId") String groupId);
    
    // 사용자 관련 모든 로그들 조회 (사용자가 수행한 것 + 사용자에 대한 것)
    @Query("SELECT al FROM AuditLog al WHERE al.performedBy.id = :userId OR " +
           "(al.entityType = 'USER' AND al.entityId = :userId) OR " +
           "al.details LIKE CONCAT('%userId:', :userId, '%')")
    List<AuditLog> findUserRelatedLogs(@Param("userId") String userId);
    
    // 액션별 통계 조회
    @Query("SELECT al.action, COUNT(al) FROM AuditLog al GROUP BY al.action")
    List<Object[]> getActionStatistics();
    
    // 엔티티 타입별 통계 조회
    @Query("SELECT al.entityType, COUNT(al) FROM AuditLog al GROUP BY al.entityType")
    List<Object[]> getEntityTypeStatistics();
    
    // 사용자별 활동 통계 조회
    @Query("SELECT al.performedBy.username, COUNT(al) FROM AuditLog al GROUP BY al.performedBy.username ORDER BY COUNT(al) DESC")
    List<Object[]> getUserActivityStatistics();
    
    // 일별 활동 통계 조회
    @Query("SELECT DATE(al.timestamp), COUNT(al) FROM AuditLog al " +
           "WHERE al.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(al.timestamp) ORDER BY DATE(al.timestamp)")
    List<Object[]> getDailyActivityStatistics(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    // 특정 기간 동안의 특정 액션 수 조회
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.action = :action AND al.timestamp BETWEEN :startDate AND :endDate")
    long countByActionAndPeriod(@Param("action") String action, 
                              @Param("startDate") LocalDateTime startDate, 
                              @Param("endDate") LocalDateTime endDate);
    
    // 특정 사용자의 특정 액션 수 조회
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.performedBy.id = :userId AND al.action = :action")
    long countByUserAndAction(@Param("userId") String userId, @Param("action") String action);
    
    // 키워드로 로그 검색
    @Query("SELECT al FROM AuditLog al WHERE " +
           "LOWER(al.details) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(al.action) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(al.entityType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<AuditLog> searchByKeyword(@Param("keyword") String keyword);
    
    // 오래된 로그 삭제용 (데이터 정리)
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp < :cutoffDate")
    List<AuditLog> findOldLogs(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // 특정 엔티티의 로그를 시간 역순으로 조회 (UserPermissionService에서 사용)
    List<AuditLog> findByEntityIdOrderByTimestampDesc(String entityId);
}