package com.testcase.testcasemanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * JIRA 통합 감사 로그 서비스
 * ICT-165: JIRA 연동 작업의 상세 감사 로그
 */
@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "jira.audit-log.enabled", havingValue = "true", matchIfMissing = false)
public class JiraAuditLogService {

    @Value("${jira.audit-log.file-path:./logs/jira-audit.log}")
    private String logFilePath;

    @Value("${jira.audit-log.max-queue-size:1000}")
    private int maxQueueSize;

    @Value("${jira.audit-log.flush-interval:10000}")
    private long flushInterval; // 10초

    @Value("${jira.audit-log.include-sensitive:false}")
    private boolean includeSensitiveInfo;

    // 비동기 로그 처리를 위한 큐
    private final BlockingQueue<AuditLogEntry> logQueue = new LinkedBlockingQueue<>();
    private final AtomicBoolean running = new AtomicBoolean(false);
    private Thread logWriterThread;

    @PostConstruct
    public void init() {
        try {
            // 로그 디렉토리 생성
            Path logPath = Paths.get(logFilePath);
            Path logDir = logPath.getParent();
            if (logDir != null && !Files.exists(logDir)) {
                Files.createDirectories(logDir);
            }

            // 로그 작성 스레드 시작
            startLogWriterThread();
            
            log.info("JIRA 감사 로그 서비스 초기화 완료 - 파일: {}, 큐 크기: {}", 
                    logFilePath, maxQueueSize);
            
            // 서비스 시작 로그
            logAuditEvent("SYSTEM", "SERVICE_START", "JIRA 감사 로그 서비스 시작", null, null);

        } catch (Exception e) {
            log.error("JIRA 감사 로그 서비스 초기화 실패", e);
        }
    }

    /**
     * JIRA 연결 시도 로그
     */
    public void logConnectionAttempt(String userId, String serverUrl, boolean success, String message) {
        String sanitizedServerUrl = sanitizeUrl(serverUrl);
        logAuditEvent(userId, success ? "CONNECTION_SUCCESS" : "CONNECTION_FAILED", 
                "JIRA 연결 " + (success ? "성공" : "실패"), 
                sanitizedServerUrl, message);
    }

    /**
     * JIRA API 호출 로그
     */
    public void logApiCall(String userId, String operation, String endpoint, boolean success, 
                          long responseTime, String errorMessage) {
        String message = String.format("API 호출 - 작업: %s, 엔드포인트: %s, 응답시간: %dms", 
                operation, sanitizeUrl(endpoint), responseTime);
        
        if (!success && errorMessage != null) {
            message += ", 오류: " + errorMessage;
        }
        
        logAuditEvent(userId, success ? "API_CALL_SUCCESS" : "API_CALL_FAILED", 
                message, endpoint, errorMessage);
    }

    /**
     * JIRA 이슈 코멘트 추가 로그
     */
    public void logIssueComment(String userId, String issueKey, boolean success, String errorMessage) {
        String message = String.format("이슈 코멘트 %s - %s", 
                success ? "추가 성공" : "추가 실패", issueKey);
        
        logAuditEvent(userId, success ? "COMMENT_SUCCESS" : "COMMENT_FAILED", 
                message, issueKey, errorMessage);
    }

    /**
     * JIRA 프로젝트 조회 로그
     */
    public void logProjectAccess(String userId, String serverUrl, int projectCount, boolean success) {
        String message = String.format("프로젝트 조회 %s - %d개 프로젝트", 
                success ? "성공" : "실패", projectCount);
        
        logAuditEvent(userId, success ? "PROJECT_ACCESS_SUCCESS" : "PROJECT_ACCESS_FAILED", 
                message, sanitizeUrl(serverUrl), null);
    }

    /**
     * JIRA 설정 변경 로그
     */
    public void logConfigurationChange(String userId, String action, String details) {
        logAuditEvent(userId, "CONFIG_CHANGE", 
                String.format("설정 변경 - %s: %s", action, details), 
                null, null);
    }

    /**
     * 배치 작업 로그
     */
    public void logBatchOperation(String userId, String operationType, int itemCount, 
                                boolean success, long executionTime) {
        String message = String.format("배치 작업 %s - 유형: %s, 항목수: %d, 실행시간: %dms", 
                success ? "성공" : "실패", operationType, itemCount, executionTime);
        
        logAuditEvent(userId, success ? "BATCH_SUCCESS" : "BATCH_FAILED", 
                message, operationType, null);
    }

    /**
     * 보안 이벤트 로그
     */
    public void logSecurityEvent(String userId, String eventType, String description, String ipAddress) {
        String message = String.format("보안 이벤트 - %s: %s", eventType, description);
        if (ipAddress != null && includeSensitiveInfo) {
            message += String.format(" (IP: %s)", ipAddress);
        }
        
        logAuditEvent(userId != null ? userId : "ANONYMOUS", "SECURITY_EVENT", 
                message, eventType, description);
    }

    /**
     * 시스템 성능 임계값 초과 로그
     */
    public void logPerformanceAlert(String metricType, double threshold, double actualValue, String description) {
        String message = String.format("성능 경고 - %s: %.2f (임계값: %.2f) - %s", 
                metricType, actualValue, threshold, description);
        
        logAuditEvent("SYSTEM", "PERFORMANCE_ALERT", message, metricType, description);
    }

    /**
     * 일반적인 감사 이벤트 로그
     */
    private void logAuditEvent(String userId, String eventType, String message, 
                              String resourceId, String additionalInfo) {
        try {
            AuditLogEntry entry = AuditLogEntry.builder()
                    .timestamp(LocalDateTime.now())
                    .userId(userId != null ? userId : "SYSTEM")
                    .eventType(eventType)
                    .message(message)
                    .resourceId(resourceId)
                    .additionalInfo(additionalInfo)
                    .build();

            // 큐가 가득 차면 오래된 항목 제거
            if (logQueue.size() >= maxQueueSize) {
                logQueue.poll(); // 가장 오래된 항목 제거
                log.warn("감사 로그 큐가 가득 참 - 오래된 항목 제거");
            }

            if (!logQueue.offer(entry)) {
                log.error("감사 로그 큐에 항목 추가 실패: {}", message);
            }

        } catch (Exception e) {
            log.error("감사 로그 기록 실패: {}", message, e);
        }
    }

    /**
     * 로그 작성 스레드 시작
     */
    private void startLogWriterThread() {
        if (running.get()) {
            return;
        }

        running.set(true);
        logWriterThread = new Thread(this::processLogQueue);
        logWriterThread.setName("jira-audit-log-writer");
        logWriterThread.setDaemon(true);
        logWriterThread.start();
    }

    /**
     * 로그 큐 처리
     */
    private void processLogQueue() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(logFilePath, true))) {
            while (running.get() || !logQueue.isEmpty()) {
                try {
                    AuditLogEntry entry = logQueue.poll();
                    if (entry != null) {
                        writeLogEntry(writer, entry);
                    } else {
                        // 큐가 비어있으면 잠시 대기
                        Thread.sleep(100);
                    }
                    
                    // 주기적으로 플러시
                    if (System.currentTimeMillis() % flushInterval < 100) {
                        writer.flush();
                    }
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("감사 로그 처리 중 오류", e);
                }
            }
        } catch (IOException e) {
            log.error("감사 로그 파일 작성 실패", e);
        }
    }

    /**
     * 로그 항목을 파일에 작성
     */
    private void writeLogEntry(BufferedWriter writer, AuditLogEntry entry) throws IOException {
        String logLine = formatLogEntry(entry);
        writer.write(logLine);
        writer.newLine();
    }

    /**
     * 로그 항목 포맷팅
     */
    private String formatLogEntry(AuditLogEntry entry) {
        StringBuilder sb = new StringBuilder();
        sb.append(entry.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        sb.append(" | ").append(entry.getUserId());
        sb.append(" | ").append(entry.getEventType());
        sb.append(" | ").append(entry.getMessage());
        
        if (entry.getResourceId() != null) {
            sb.append(" | Resource: ").append(entry.getResourceId());
        }
        
        if (entry.getAdditionalInfo() != null) {
            sb.append(" | Info: ").append(entry.getAdditionalInfo());
        }
        
        return sb.toString();
    }

    /**
     * URL 민감 정보 제거
     */
    private String sanitizeUrl(String url) {
        if (url == null) {
            return null;
        }
        
        if (!includeSensitiveInfo) {
            // API 토큰, 비밀번호 등 민감한 정보 제거
            return url.replaceAll("(token|password|key|secret)=[^&]*", "$1=***");
        }
        
        return url;
    }

    /**
     * 서비스 종료
     */
    public void shutdown() {
        running.set(false);
        if (logWriterThread != null && logWriterThread.isAlive()) {
            try {
                logWriterThread.join(5000); // 5초 대기
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        logAuditEvent("SYSTEM", "SERVICE_STOP", "JIRA 감사 로그 서비스 종료", null, null);
        log.info("JIRA 감사 로그 서비스 종료 완료");
    }

    // Inner Class
    private static class AuditLogEntry {
        private LocalDateTime timestamp;
        private String userId;
        private String eventType;
        private String message;
        private String resourceId;
        private String additionalInfo;

        public static AuditLogEntryBuilder builder() {
            return new AuditLogEntryBuilder();
        }

        // Getters
        public LocalDateTime getTimestamp() { return timestamp; }
        public String getUserId() { return userId; }
        public String getEventType() { return eventType; }
        public String getMessage() { return message; }
        public String getResourceId() { return resourceId; }
        public String getAdditionalInfo() { return additionalInfo; }

        public static class AuditLogEntryBuilder {
            private AuditLogEntry entry = new AuditLogEntry();

            public AuditLogEntryBuilder timestamp(LocalDateTime timestamp) {
                entry.timestamp = timestamp;
                return this;
            }

            public AuditLogEntryBuilder userId(String userId) {
                entry.userId = userId;
                return this;
            }

            public AuditLogEntryBuilder eventType(String eventType) {
                entry.eventType = eventType;
                return this;
            }

            public AuditLogEntryBuilder message(String message) {
                entry.message = message;
                return this;
            }

            public AuditLogEntryBuilder resourceId(String resourceId) {
                entry.resourceId = resourceId;
                return this;
            }

            public AuditLogEntryBuilder additionalInfo(String additionalInfo) {
                entry.additionalInfo = additionalInfo;
                return this;
            }

            public AuditLogEntry build() {
                return entry;
            }
        }
    }
}