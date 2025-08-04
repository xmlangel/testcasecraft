// src/main/java/com/testcase/testcasemanagement/service/UserActivityService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.model.UserActivity;
import com.testcase.testcasemanagement.repository.UserActivityRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 사용자 활동 이력 추적 서비스
 */
@Service
@Transactional
public class UserActivityService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserActivityService.class);
    
    @Autowired
    private UserActivityRepository userActivityRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SecurityContextUtil securityContextUtil;
    
    // 활동 타입 상수
    public static class ActivityType {
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String LOGIN_FAILED = "LOGIN_FAILED";
        public static final String PASSWORD_CHANGE = "PASSWORD_CHANGE";
        public static final String PROFILE_UPDATE = "PROFILE_UPDATE";
        
        public static final String PROJECT_CREATE = "PROJECT_CREATE";
        public static final String PROJECT_ACCESS = "PROJECT_ACCESS";
        public static final String PROJECT_UPDATE = "PROJECT_UPDATE"; 
        public static final String PROJECT_DELETE = "PROJECT_DELETE";
        
        public static final String TESTCASE_CREATE = "TESTCASE_CREATE";
        public static final String TESTCASE_VIEW = "TESTCASE_VIEW";
        public static final String TESTCASE_UPDATE = "TESTCASE_UPDATE";
        public static final String TESTCASE_DELETE = "TESTCASE_DELETE";
        
        public static final String ORGANIZATION_CREATE = "ORGANIZATION_CREATE";
        public static final String ORGANIZATION_ACCESS = "ORGANIZATION_ACCESS";
        public static final String ORGANIZATION_UPDATE = "ORGANIZATION_UPDATE";
        
        public static final String ADMIN_ACCESS = "ADMIN_ACCESS";
        public static final String SYSTEM_CONFIG = "SYSTEM_CONFIG";
    }
    
    // 활동 카테고리 상수
    public static class ActivityCategory {
        public static final String AUTHENTICATION = "AUTHENTICATION";
        public static final String PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT";
        public static final String TEST_MANAGEMENT = "TEST_MANAGEMENT";
        public static final String ORGANIZATION_MANAGEMENT = "ORGANIZATION_MANAGEMENT";
        public static final String SYSTEM_ADMINISTRATION = "SYSTEM_ADMINISTRATION";
        public static final String USER_PROFILE = "USER_PROFILE";
    }
    
    /**
     * 사용자 활동 기록 (기본 메서드)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public UserActivity logActivity(String userId, String activityType, String activityCategory) {
        return logActivity(userId, activityType, activityCategory, null, null, null, null, null, null, null, true, null);
    }
    
    /**
     * 사용자 활동 기록 (상세 정보 포함)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public UserActivity logActivity(String userId, String activityType, String activityCategory,
                                  String targetEntityType, String targetEntityId, String targetEntityName,
                                  String sessionId, String ipAddress, String userAgent, 
                                  String details, Boolean isSuccessful, String errorMessage) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
            
            UserActivity activity = UserActivity.builder()
                .user(user)
                .activityType(activityType)
                .activityCategory(activityCategory)
                .targetEntityType(targetEntityType)
                .targetEntityId(targetEntityId)
                .targetEntityName(targetEntityName)
                .sessionId(sessionId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .details(details)
                .isSuccessful(isSuccessful != null ? isSuccessful : true)
                .errorMessage(errorMessage)
                .riskScore(calculateRiskScore(activityType, ipAddress, userAgent))
                .anomalyDetected(false)
                .build();
            
            UserActivity savedActivity = userActivityRepository.save(activity);
            
            // 이상 활동 감지
            detectAnomalies(savedActivity);
            
            logger.debug("사용자 활동 기록됨: {} - {} ({})", user.getUsername(), activityType, activityCategory);
            return savedActivity;
            
        } catch (Exception e) {
            logger.error("사용자 활동 기록 실패: userId={}, activityType={}", userId, activityType, e);
            throw e;
        }
    }
    
    /**
     * HTTP 요청 정보를 포함한 활동 기록
     */
    public UserActivity logActivityFromRequest(String userId, String activityType, String activityCategory,
                                             String targetEntityType, String targetEntityId, String targetEntityName,
                                             HttpServletRequest request, Boolean isSuccessful, String errorMessage) {
        String sessionId = request.getSession().getId();
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        
        return logActivity(userId, activityType, activityCategory, targetEntityType, targetEntityId, 
                         targetEntityName, sessionId, ipAddress, userAgent, null, isSuccessful, errorMessage);
    }
    
    /**
     * 현재 인증된 사용자의 활동 기록
     */
    public UserActivity logCurrentUserActivity(String activityType, String activityCategory) {
        String currentUserId = securityContextUtil.getCurrentUserId();
        return logActivity(currentUserId, activityType, activityCategory);
    }
    
    /**
     * 로그인 활동 기록
     */
    public UserActivity logLogin(String userId, String sessionId, String ipAddress, String userAgent, boolean isSuccessful, String errorMessage) {
        return logActivity(userId, ActivityType.LOGIN, ActivityCategory.AUTHENTICATION, 
                         null, null, null, sessionId, ipAddress, userAgent, null, isSuccessful, errorMessage);
    }
    
    /**
     * 로그아웃 활동 기록
     */
    public UserActivity logLogout(String userId, String sessionId, String ipAddress, String userAgent) {
        return logActivity(userId, ActivityType.LOGOUT, ActivityCategory.AUTHENTICATION, 
                         null, null, null, sessionId, ipAddress, userAgent, null, true, null);
    }
    
    /**
     * 사용자 활동 이력 조회
     */
    @Transactional(readOnly = true)
    public Page<UserActivity> getUserActivities(String userId, int page, int size) {
        // 권한 확인: 본인 또는 시스템 관리자만 조회 가능
        if (!securityContextUtil.isSystemAdmin() && !securityContextUtil.getCurrentUserId().equals(userId)) {
            throw new SecurityException("해당 사용자의 활동 이력을 조회할 권한이 없습니다.");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        return userActivityRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }
    
    /**
     * 사용자 활동 통계 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivityStatistics(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        // 권한 확인
        if (!securityContextUtil.isSystemAdmin() && !securityContextUtil.getCurrentUserId().equals(userId)) {
            throw new SecurityException("해당 사용자의 활동 통계를 조회할 권한이 없습니다.");
        }
        
        Map<String, Object> statistics = new HashMap<>();
        
        // 기본 통계
        statistics.put("totalActivities", userActivityRepository.countByUserIdAndPeriod(userId, startDate, endDate));
        statistics.put("distinctSessions", userActivityRepository.countDistinctSessionsByUserAndPeriod(userId, startDate, endDate));
        
        // 활동 타입별 통계
        List<Object[]> typeStats = userActivityRepository.getUserActivityTypeStatistics(userId);
        Map<String, Long> typeStatistics = typeStats.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
            ));
        statistics.put("activityTypeStatistics", typeStatistics);
        
        // 카테고리별 통계
        List<Object[]> categoryStats = userActivityRepository.getUserActivityCategoryStatistics(userId);
        Map<String, Long> categoryStatistics = categoryStats.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],  
                row -> (Long) row[1]
            ));
        statistics.put("activityCategoryStatistics", categoryStatistics);
        
        // 일별 활동 통계
        List<Object[]> dailyStats = userActivityRepository.getUserDailyActivityStatistics(userId, startDate, endDate);
        statistics.put("dailyActivityStatistics", dailyStats);
        
        // 시간대별 활동 통계
        List<Object[]> hourlyStats = userActivityRepository.getUserHourlyActivityStatistics(userId, startDate, endDate);
        statistics.put("hourlyActivityStatistics", hourlyStats);
        
        // 실패 활동 통계
        List<Object[]> failureStats = userActivityRepository.getUserFailureStatistics(userId);
        statistics.put("failureStatistics", failureStats);
        
        // 최근 로그인 정보
        Optional<UserActivity> lastLogin = userActivityRepository.findLastSuccessfulLogin(userId);
        if (lastLogin.isPresent()) {
            statistics.put("lastLoginTime", lastLogin.get().getTimestamp());
            statistics.put("lastLoginIp", lastLogin.get().getIpAddress());
        }
        
        // 평균 세션 지속 시간
        Double averageSessionDuration = userActivityRepository.getAverageSessionDuration(userId, startDate, endDate);
        statistics.put("averageSessionDurationMinutes", averageSessionDuration != null ? averageSessionDuration / 60000 : 0);
        
        return statistics;
    }
    
    /**
     * 전체 활동 이력 조회 (관리자용)
     */
    @Transactional(readOnly = true) 
    public Page<UserActivity> getAllActivities(int page, int size) {
        // 시스템 관리자만 조회 가능
        if (!securityContextUtil.isSystemAdmin()) {
            throw new SecurityException("전체 활동 이력을 조회할 권한이 없습니다.");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        return userActivityRepository.findAllActivities(pageable);
    }
    
    /**
     * 활동 검색 (관리자용)
     */
    @Transactional(readOnly = true)
    public Page<UserActivity> searchActivities(String keyword, int page, int size) {
        // 시스템 관리자만 검색 가능
        if (!securityContextUtil.isSystemAdmin()) {
            throw new SecurityException("활동 검색 권한이 없습니다.");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        return userActivityRepository.searchActivities(keyword, pageable);
    }
    
    /**
     * 이상 활동 조회
     */
    @Transactional(readOnly = true)
    public List<UserActivity> getAnomalousActivities(String userId) {
        // 권한 확인
        if (!securityContextUtil.isSystemAdmin() && !securityContextUtil.getCurrentUserId().equals(userId)) {
            throw new SecurityException("이상 활동 조회 권한이 없습니다.");
        }
        
        if (userId != null) {
            return userActivityRepository.findByUserIdAndAnomalyDetectedTrue(userId);
        } else {
            // 시스템 관리자는 전체 이상 활동 조회 가능
            if (!securityContextUtil.isSystemAdmin()) {
                throw new SecurityException("전체 이상 활동 조회 권한이 없습니다.");
            }
            return userActivityRepository.findByAnomalyDetectedTrue();
        }
    }
    
    /**
     * 활동 세부 정보 조회
     */
    @Transactional(readOnly = true)
    public UserActivity getActivityDetail(String activityId) {
        UserActivity activity = userActivityRepository.findById(activityId)
            .orElseThrow(() -> new ResourceNotFoundException("활동 이력을 찾을 수 없습니다: " + activityId));
        
        // 권한 확인: 본인 또는 시스템 관리자만 조회 가능
        if (!securityContextUtil.isSystemAdmin() && 
            !securityContextUtil.getCurrentUserId().equals(activity.getUser().getId())) {
            throw new SecurityException("해당 활동 이력을 조회할 권한이 없습니다.");
        }
        
        return activity;
    }
    
    /**
     * 위험도 점수 계산
     */
    private Integer calculateRiskScore(String activityType, String ipAddress, String userAgent) {
        int score = 0;
        
        // 활동 타입별 기본 위험도
        switch (activityType) {
            case ActivityType.LOGIN_FAILED:
                score += 30;
                break;
            case ActivityType.PASSWORD_CHANGE:
                score += 20;
                break;
            case ActivityType.ADMIN_ACCESS:
                score += 40;
                break;
            case ActivityType.SYSTEM_CONFIG:
                score += 50;
                break;
            default:
                score += 5;
        }
        
        // IP 주소 변경 감지 (간단한 구현)
        // 실제로는 더 정교한 로직이 필요
        if (ipAddress != null && !ipAddress.startsWith("192.168.") && !ipAddress.startsWith("10.")) {
            score += 15; // 외부 IP
        }
        
        // User Agent 분석 (기본적인 구현)
        if (userAgent != null && userAgent.toLowerCase().contains("bot")) {
            score += 25; // 봇으로 의심되는 경우
        }
        
        return Math.min(score, 100); // 최대 100점
    }
    
    /**
     * 이상 활동 감지
     */
    private void detectAnomalies(UserActivity activity) {
        // 간단한 이상 감지 로직 구현
        boolean isAnomalous = false;
        
        // 1. 고위험 점수
        if (activity.getRiskScore() != null && activity.getRiskScore() >= 70) {
            isAnomalous = true;
        }
        
        // 2. 짧은 시간 내 많은 실패 로그인
        if (ActivityType.LOGIN_FAILED.equals(activity.getActivityType())) {
            LocalDateTime oneHourAgo = LocalDateTime.now().minus(1, ChronoUnit.HOURS);
            List<UserActivity> recentFailures = userActivityRepository.findByUserIdAndActivityType(
                activity.getUser().getId(), ActivityType.LOGIN_FAILED)
                .stream()
                .filter(a -> a.getTimestamp().isAfter(oneHourAgo))
                .collect(Collectors.toList());
            
            if (recentFailures.size() >= 5) {
                isAnomalous = true;
            }
        }
        
        if (isAnomalous) {
            activity.setAnomalyDetected(true);
            userActivityRepository.save(activity);
            logger.warn("이상 활동 감지: 사용자={}, 활동={}, 위험도={}", 
                       activity.getUser().getUsername(), activity.getActivityType(), activity.getRiskScore());
        }
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // IPv6 loopback을 IPv4로 변환
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        
        return ipAddress;
    }
    
    /**
     * 오래된 활동 이력 정리
     */
    @Transactional
    public int cleanupOldActivities(LocalDateTime cutoffDate) {
        // 시스템 관리자만 실행 가능
        if (!securityContextUtil.isSystemAdmin()) {
            throw new SecurityException("활동 이력 정리 권한이 없습니다.");
        }
        
        List<UserActivity> oldActivities = userActivityRepository.findOldActivities(cutoffDate);
        int count = oldActivities.size();
        
        if (count > 0) {
            userActivityRepository.deleteAll(oldActivities);
            logger.info("오래된 활동 이력 {}건 정리 완료", count);
        }
        
        return count;
    }
    
    /**
     * 사용자 활동 접근 권한 확인
     * Spring Security @PreAuthorize에서 사용
     */
    public boolean canAccessUserActivities(String targetUserId, String currentUsername) {
        try {
            // 시스템 관리자는 모든 사용자의 활동 접근 가능
            if (securityContextUtil.isSystemAdmin()) {
                return true;
            }
            
            // 현재 사용자 ID 조회
            String currentUserId = securityContextUtil.getCurrentUserId();
            
            // 본인의 활동만 접근 가능
            return currentUserId.equals(targetUserId);
            
        } catch (Exception e) {
            logger.error("사용자 활동 접근 권한 확인 실패: targetUserId={}, currentUsername={}", 
                        targetUserId, currentUsername, e);
            return false;
        }
    }
}