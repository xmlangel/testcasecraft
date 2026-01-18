package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.config.JiraSecurityConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * JIRA 연결 관리자
 * ICT-165: 연결 풀링 및 성능 최적화
 */
@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "jira.connection-pool.enabled", havingValue = "true", matchIfMissing = true)
public class JiraConnectionManager {

    private final JiraSecurityConfig jiraSecurityConfig;

    @Value("${jira.connection-pool.max-connections:20}")
    private int maxConnections;

    @Value("${jira.connection-pool.idle-timeout:300000}") // 5분
    private long idleTimeoutMs;

    @Value("${jira.connection-pool.cleanup-interval:60000}") // 1분
    private long cleanupIntervalMs;

    // 연결별 RestTemplate 캐시
    private final ConcurrentHashMap<String, CachedRestTemplate> connectionPool = new ConcurrentHashMap<>();

    // 연결 통계
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicLong totalConnectionsCreated = new AtomicLong(0);
    private final AtomicLong totalConnectionsReused = new AtomicLong(0);

    private ScheduledExecutorService cleanupExecutor;

    @PostConstruct
    public void init() {
        // 연결 정리 스케줄러 시작
        this.cleanupExecutor = Executors.newSingleThreadScheduledExecutor(
                r -> {
                    Thread t = new Thread(r);
                    t.setName("jira-connection-cleanup");
                    t.setDaemon(true);
                    return t;
                });

        cleanupExecutor.scheduleAtFixedRate(
                this::cleanupIdleConnections,
                cleanupIntervalMs,
                cleanupIntervalMs,
                TimeUnit.MILLISECONDS);

        log.info("JIRA 연결 관리자 초기화 완료 - 최대연결: {}, 유휴타임아웃: {}ms",
                maxConnections, idleTimeoutMs);
    }

    @PreDestroy
    public void destroy() {
        if (cleanupExecutor != null && !cleanupExecutor.isShutdown()) {
            cleanupExecutor.shutdown();
            try {
                if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    cleanupExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                cleanupExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }

        // 모든 연결 정리
        connectionPool.clear();
        log.info("JIRA 연결 관리자 정리 완료");
    }

    /**
     * JIRA 서버별 최적화된 RestTemplate 획득
     */
    public RestTemplate getRestTemplate(String serverUrl) {
        String connectionKey = generateConnectionKey(serverUrl);

        CachedRestTemplate cached = connectionPool.get(connectionKey);

        if (cached != null && !cached.isExpired()) {
            // 기존 연결 재사용
            cached.updateLastUsed();
            totalConnectionsReused.incrementAndGet();

            if (log.isDebugEnabled()) {
                log.debug("JIRA 연결 재사용: serverUrl={}, key={}", serverUrl, connectionKey);
            }

            return cached.getRestTemplate();
        }

        // 새 연결 생성
        return createNewRestTemplate(serverUrl, connectionKey);
    }

    /**
     * 연결 상태 정보 조회
     */
    public ConnectionPoolStats getConnectionPoolStats() {
        return ConnectionPoolStats.builder()
                .maxConnections(maxConnections)
                .activeConnections(activeConnections.get())
                .cachedConnections(connectionPool.size())
                .totalConnectionsCreated(totalConnectionsCreated.get())
                .totalConnectionsReused(totalConnectionsReused.get())
                .idleTimeoutMs(idleTimeoutMs)
                .build();
    }

    /**
     * 특정 서버의 연결 강제 제거
     */
    public void evictConnection(String serverUrl) {
        String connectionKey = generateConnectionKey(serverUrl);
        CachedRestTemplate removed = connectionPool.remove(connectionKey);

        if (removed != null) {
            activeConnections.decrementAndGet();
            log.info("JIRA 연결 강제 제거: serverUrl={}", serverUrl);
        }
    }

    /**
     * 모든 연결 강제 제거
     */
    public void evictAllConnections() {
        int removedCount = connectionPool.size();
        connectionPool.clear();
        activeConnections.set(0);
        log.info("모든 JIRA 연결 강제 제거: count={}", removedCount);
    }

    // Private Helper Methods

    private synchronized RestTemplate createNewRestTemplate(String serverUrl, String connectionKey) {
        // 더블 체크 (동시 생성 방지)
        CachedRestTemplate existing = connectionPool.get(connectionKey);
        if (existing != null && !existing.isExpired()) {
            existing.updateLastUsed();
            totalConnectionsReused.incrementAndGet();
            return existing.getRestTemplate();
        }

        // 최대 연결 수 체크
        if (activeConnections.get() >= maxConnections) {
            log.warn("최대 연결 수 초과, 오래된 연결 정리 시도: current={}, max={}",
                    activeConnections.get(), maxConnections);
            cleanupIdleConnections();

            // 정리 후에도 여전히 최대 연결 수를 초과하면 오래된 것 하나 제거
            if (activeConnections.get() >= maxConnections) {
                evictOldestConnection();
            }
        }

        try {
            // 보안 설정이 적용된 RestTemplate 생성
            RestTemplate restTemplate = jiraSecurityConfig.jiraRestTemplate();

            CachedRestTemplate cachedTemplate = new CachedRestTemplate(restTemplate);
            connectionPool.put(connectionKey, cachedTemplate);
            activeConnections.incrementAndGet();
            totalConnectionsCreated.incrementAndGet();

            log.info("새 JIRA 연결 생성: serverUrl={}, activeConnections={}",
                    serverUrl, activeConnections.get());

            return restTemplate;

        } catch (Exception e) {
            log.error("JIRA 연결 생성 실패: serverUrl={}", serverUrl, e);
            throw new RuntimeException("JIRA 연결 생성 실패", e);
        }
    }

    private String generateConnectionKey(String serverUrl) {
        // 서버 URL을 기반으로 고유 키 생성
        return serverUrl.toLowerCase().trim();
    }

    private void cleanupIdleConnections() {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusNanos(idleTimeoutMs * 1_000_000);

            connectionPool.entrySet().removeIf(entry -> {
                CachedRestTemplate cached = entry.getValue();
                if (cached.getLastUsed().isBefore(cutoffTime)) {
                    activeConnections.decrementAndGet();
                    log.debug("유휴 JIRA 연결 정리: key={}, lastUsed={}",
                            entry.getKey(), cached.getLastUsed());
                    return true;
                }
                return false;
            });

        } catch (Exception e) {
            log.warn("JIRA 연결 정리 중 경고", e);
        }
    }

    private void evictOldestConnection() {
        connectionPool.entrySet().stream()
                .min((e1, e2) -> e1.getValue().getLastUsed().compareTo(e2.getValue().getLastUsed()))
                .ifPresent(entry -> {
                    connectionPool.remove(entry.getKey());
                    activeConnections.decrementAndGet();
                    log.info("가장 오래된 JIRA 연결 제거: key={}", entry.getKey());
                });
    }

    // Inner Classes

    private static class CachedRestTemplate {
        private final RestTemplate restTemplate;
        private volatile LocalDateTime lastUsed;

        public CachedRestTemplate(RestTemplate restTemplate) {
            this.restTemplate = restTemplate;
            this.lastUsed = LocalDateTime.now();
        }

        public RestTemplate getRestTemplate() {
            return restTemplate;
        }

        public LocalDateTime getLastUsed() {
            return lastUsed;
        }

        public void updateLastUsed() {
            this.lastUsed = LocalDateTime.now();
        }

        public boolean isExpired() {
            // 만료 여부는 ConnectionManager에서 판단
            return false;
        }
    }

    public static class ConnectionPoolStats {
        private int maxConnections;
        private int activeConnections;
        private int cachedConnections;
        private long totalConnectionsCreated;
        private long totalConnectionsReused;
        private long idleTimeoutMs;

        public static ConnectionPoolStatsBuilder builder() {
            return new ConnectionPoolStatsBuilder();
        }

        // Getters
        public int getMaxConnections() {
            return maxConnections;
        }

        public int getActiveConnections() {
            return activeConnections;
        }

        public int getCachedConnections() {
            return cachedConnections;
        }

        public long getTotalConnectionsCreated() {
            return totalConnectionsCreated;
        }

        public long getTotalConnectionsReused() {
            return totalConnectionsReused;
        }

        public long getIdleTimeoutMs() {
            return idleTimeoutMs;
        }

        public double getReuseRate() {
            long total = totalConnectionsCreated + totalConnectionsReused;
            return total > 0 ? (double) totalConnectionsReused / total * 100 : 0.0;
        }

        public static class ConnectionPoolStatsBuilder {
            private ConnectionPoolStats stats = new ConnectionPoolStats();

            public ConnectionPoolStatsBuilder maxConnections(int maxConnections) {
                stats.maxConnections = maxConnections;
                return this;
            }

            public ConnectionPoolStatsBuilder activeConnections(int activeConnections) {
                stats.activeConnections = activeConnections;
                return this;
            }

            public ConnectionPoolStatsBuilder cachedConnections(int cachedConnections) {
                stats.cachedConnections = cachedConnections;
                return this;
            }

            public ConnectionPoolStatsBuilder totalConnectionsCreated(long totalConnectionsCreated) {
                stats.totalConnectionsCreated = totalConnectionsCreated;
                return this;
            }

            public ConnectionPoolStatsBuilder totalConnectionsReused(long totalConnectionsReused) {
                stats.totalConnectionsReused = totalConnectionsReused;
                return this;
            }

            public ConnectionPoolStatsBuilder idleTimeoutMs(long idleTimeoutMs) {
                stats.idleTimeoutMs = idleTimeoutMs;
                return this;
            }

            public ConnectionPoolStats build() {
                return stats;
            }
        }
    }
}