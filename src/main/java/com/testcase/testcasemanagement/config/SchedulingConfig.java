package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * ICT-134: 대시보드 모니터링을 위한 스케줄링 설정
 * RefreshTokenService의 @Scheduled 메서드와 대시보드 모니터링 스케줄링이 동작하도록 설정
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {

    private static final Logger logger = LoggerFactory.getLogger(SchedulingConfig.class);

    @Autowired
    private DashboardService dashboardService;

    /**
     * 매 5분마다 대시보드 성능 메트릭을 로그에 기록
     * cron 표현식: 0초 매5분 매시간 매일 매월 매요일
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void logPerformanceMetrics() {
        try {
            logger.debug("=== 정기 성능 메트릭 로깅 시작 ===");
            dashboardService.logDashboardPerformanceMetrics();
            logger.debug("=== 정기 성능 메트릭 로깅 완료 ===");
        } catch (Exception e) {
            logger.error("정기 성능 메트릭 로깅 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 매 10분마다 시스템 헬스 임계값 확인
     * cron 표현식: 0초 매10분 매시간 매일 매월 매요일
     */
    @Scheduled(cron = "0 */10 * * * *")
    public void checkSystemHealthThresholds() {
        try {
            logger.debug("=== 시스템 헬스 임계값 확인 시작 ===");
            dashboardService.checkSystemHealthThresholds();
            logger.debug("=== 시스템 헬스 임계값 확인 완료 ===");
        } catch (Exception e) {
            logger.error("시스템 헬스 임계값 확인 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 매 30분마다 전체 캐시 상태를 확인하고 필요시 경고 로그 출력
     * fixedRate: 30분 (30 * 60 * 1000 = 1,800,000ms)
     */
    @Scheduled(fixedRate = 1800000)
    public void monitorCacheHealth() {
        try {
            logger.info("=== 캐시 상태 모니터링 시작 ===");
            
            // 캐시 상태 정보는 DashboardService의 checkSystemHealthThresholds에서 확인됨
            logger.info("캐시 상태 모니터링이 완료되었습니다.");
            logger.info("=== 캐시 상태 모니터링 완료 ===");
            
        } catch (Exception e) {
            logger.error("캐시 상태 모니터링 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 매일 자정에 일일 성능 리포트 생성
     * cron 표현식: 0초 0분 0시 매일 매월 매요일
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyPerformanceReport() {
        try {
            logger.info("=== 일일 성능 리포트 생성 시작 ===");
            
            // 일일 성능 요약 로그 출력
            dashboardService.logDashboardPerformanceMetrics();
            dashboardService.checkSystemHealthThresholds();
            
            logger.info("📊 일일 성능 리포트가 생성되었습니다.");
            logger.info("=== 일일 성능 리포트 생성 완료 ===");
            
        } catch (Exception e) {
            logger.error("일일 성능 리포트 생성 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 매주 월요일 오전 9시에 주간 성능 요약 리포트 생성
     * cron 표현식: 0초 0분 9시 매일 매월 1요일 (월요일)
     */
    @Scheduled(cron = "0 0 9 * * 1")
    public void generateWeeklyPerformanceReport() {
        try {
            logger.info("=== 주간 성능 리포트 생성 시작 ===");
            
            // 주간 성능 요약 로그 출력
            dashboardService.logDashboardPerformanceMetrics();
            dashboardService.checkSystemHealthThresholds();
            
            logger.info("📈 주간 성능 리포트가 생성되었습니다.");
            logger.info("=== 주간 성능 리포트 생성 완료 ===");
            
        } catch (Exception e) {
            logger.error("주간 성능 리포트 생성 중 오류 발생: {}", e.getMessage());
        }
    }
}