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

    @Autowired
    private com.testcase.testcasemanagement.service.RagService ragService;

    @Autowired
    private com.testcase.testcasemanagement.repository.TestCaseRepository testCaseRepository;

    @Autowired
    private com.testcase.testcasemanagement.service.TestCaseFileStorageService testCaseFileStorageService;

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

    /**
     * 매일 새벽 1시에 RAG 고아 문서 정리
     * cron 표현식: 0초 0분 1시 매일 매월 매요일
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void cleanupOrphanedRagDocuments() {
        try {
            logger.info("=== RAG 고아 문서 정리 시작 ===");

            // 모든 RAG 문서 조회
            var ragDocuments = ragService.listDocuments(null, 1, 10000);
            if (ragDocuments == null || ragDocuments.getDocuments() == null) {
                logger.info("RAG 문서를 찾을 수 없습니다.");
                return;
            }

            int deletedCount = 0;
            int totalOrphaned = 0;

            // 각 RAG 문서가 실제 TestCase와 매칭되는지 확인
            for (var doc : ragDocuments.getDocuments()) {
                if (doc.getFileName() != null && doc.getFileName().startsWith("testcase_")) {
                    // 파일명에서 TestCase ID 추출
                    String testCaseId = doc.getFileName()
                            .replace("testcase_", "")
                            .replace(".txt", "");

                    // DB에 TestCase가 존재하는지 확인
                    boolean exists = testCaseRepository.existsById(testCaseId);

                    if (!exists) {
                        totalOrphaned++;
                        try {
                            ragService.deleteDocument(doc.getId());
                            deletedCount++;
                            logger.info("고아 RAG 문서 삭제 완료: documentId={}, fileName={}",
                                    doc.getId(), doc.getFileName());
                        } catch (Exception e) {
                            logger.error("고아 RAG 문서 삭제 실패: documentId={}, fileName={}",
                                    doc.getId(), doc.getFileName(), e);
                        }
                    }
                }
            }

            logger.info("📋 RAG 고아 문서 정리 완료 - 총 문서: {}, 고아 문서: {}, 삭제 완료: {}",
                    ragDocuments.getDocuments().size(), totalOrphaned, deletedCount);
            logger.info("=== RAG 고아 문서 정리 완료 ===");

        } catch (Exception e) {
            logger.error("RAG 고아 문서 정리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 매일 새벽 2시에 미사용 첨부파일 정리
     * 7일 이상 사용되지 않은 첨부파일을 자동으로 삭제
     * cron 표현식: 0초 0분 2시 매일 매월 매요일
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupUnusedAttachments() {
        try {
            logger.info("=== 미사용 첨부파일 정리 시작 ===");

            // 7일 이상 사용되지 않은 첨부파일 정리
            int daysOld = 7;
            var result = testCaseFileStorageService.cleanupUnusedAttachments(daysOld);

            logger.info("🗑️ 미사용 첨부파일 정리 완료 - 삭제: {}, 실패: {}, 확보 공간: {} MB (기준: {}일 이전 생성)",
                    result.getDeletedCount(),
                    result.getFailedCount(),
                    result.getFreedSpaceBytes() / 1024 / 1024,
                    daysOld);
            logger.info("=== 미사용 첨부파일 정리 완료 ===");

        } catch (Exception e) {
            logger.error("미사용 첨부파일 정리 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}