package com.testcase.testcasemanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * JIRA API 호출 캐싱 서비스
 * ICT-165: 성능 최적화를 위한 캐싱 전략 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JiraCacheService {

    private final CacheManager cacheManager;
    
    @Value("${jira.cache.enabled:true}")
    private boolean cacheEnabled;
    
    @Value("${jira.cache.ttl:300000}")
    private long cacheTtl; // 기본 5분
    
    @Value("${jira.cache.max-entries:1000}")
    private int maxEntries;

    // 캐시 통계를 위한 맵
    private final Map<String, CacheStats> cacheStatsMap = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    // 캐시 이름 상수
    public static final String JIRA_CONNECTION_STATUS_CACHE = "jiraConnectionStatus";
    public static final String JIRA_PROJECTS_CACHE = "jiraProjects";
    public static final String JIRA_ISSUES_CACHE = "jiraIssues";
    public static final String JIRA_ISSUE_DETAILS_CACHE = "jiraIssueDetails";
    public static final String JIRA_USER_INFO_CACHE = "jiraUserInfo";

    @PostConstruct
    public void init() {
        if (cacheEnabled) {
            log.info("JIRA 캐시 서비스 초기화 - TTL: {}ms, 최대 엔트리: {}", cacheTtl, maxEntries);
            
            // 캐시 통계 주기적 출력 (5분마다)
            scheduler.scheduleAtFixedRate(this::logCacheStatistics, 5, 5, TimeUnit.MINUTES);
        } else {
            log.info("JIRA 캐시 서비스 비활성화");
        }
    }

    /**
     * 연결 상태 캐시 (짧은 TTL)
     */
    @Cacheable(value = JIRA_CONNECTION_STATUS_CACHE, key = "#userId + '_' + #serverUrl", condition = "#root.target.isCacheEnabled()")
    public Object cacheConnectionStatus(String userId, String serverUrl, Object status) {
        recordCacheOperation(JIRA_CONNECTION_STATUS_CACHE, "PUT");
        return status;
    }

    /**
     * JIRA 프로젝트 목록 캐시 (중간 TTL)
     */
    @Cacheable(value = JIRA_PROJECTS_CACHE, key = "#userId + '_' + #serverUrl", condition = "#root.target.isCacheEnabled()")
    public List<Object> cacheJiraProjects(String userId, String serverUrl, List<Object> projects) {
        recordCacheOperation(JIRA_PROJECTS_CACHE, "PUT");
        return projects;
    }

    /**
     * JIRA 이슈 검색 결과 캐시 (짧은 TTL)
     */
    @Cacheable(value = JIRA_ISSUES_CACHE, key = "#userId + '_' + #query.hashCode()", condition = "#root.target.isCacheEnabled()")
    public List<Object> cacheJiraIssues(String userId, String query, List<Object> issues) {
        recordCacheOperation(JIRA_ISSUES_CACHE, "PUT");
        return issues;
    }

    /**
     * JIRA 이슈 상세 정보 캐시 (긴 TTL)
     */
    @Cacheable(value = JIRA_ISSUE_DETAILS_CACHE, key = "#userId + '_' + #issueKey", condition = "#root.target.isCacheEnabled()")
    public Object cacheJiraIssueDetails(String userId, String issueKey, Object issueDetails) {
        recordCacheOperation(JIRA_ISSUE_DETAILS_CACHE, "PUT");
        return issueDetails;
    }

    /**
     * JIRA 사용자 정보 캐시 (긴 TTL)
     */
    @Cacheable(value = JIRA_USER_INFO_CACHE, key = "#userId + '_' + #serverUrl", condition = "#root.target.isCacheEnabled()")
    public Object cacheJiraUserInfo(String userId, String serverUrl, Object userInfo) {
        recordCacheOperation(JIRA_USER_INFO_CACHE, "PUT");
        return userInfo;
    }

    /**
     * 특정 사용자의 모든 캐시 무효화
     */
    @CacheEvict(value = {
        JIRA_CONNECTION_STATUS_CACHE, 
        JIRA_PROJECTS_CACHE, 
        JIRA_ISSUES_CACHE, 
        JIRA_ISSUE_DETAILS_CACHE, 
        JIRA_USER_INFO_CACHE
    }, key = "#userId + '*'")
    public void evictUserCaches(String userId) {
        if (cacheEnabled) {
            log.info("사용자 캐시 무효화: userId={}", userId);
            recordCacheOperation("ALL", "EVICT");
        }
    }

    /**
     * 특정 캐시의 특정 키 무효화
     */
    public void evictSpecificCache(String cacheName, String key) {
        if (!cacheEnabled) return;
        
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
            log.debug("캐시 무효화: cache={}, key={}", cacheName, key);
            recordCacheOperation(cacheName, "EVICT");
        }
    }

    /**
     * 모든 JIRA 캐시 클리어
     */
    public void clearAllJiraCaches() {
        if (!cacheEnabled) return;
        
        String[] cacheNames = {
            JIRA_CONNECTION_STATUS_CACHE,
            JIRA_PROJECTS_CACHE,
            JIRA_ISSUES_CACHE,
            JIRA_ISSUE_DETAILS_CACHE,
            JIRA_USER_INFO_CACHE
        };
        
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                log.info("캐시 클리어: {}", cacheName);
            }
        }
        
        recordCacheOperation("ALL", "CLEAR");
    }

    /**
     * 캐시 활성화 여부 확인
     */
    public boolean isCacheEnabled() {
        return cacheEnabled;
    }

    /**
     * 캐시 통계 정보 조회
     */
    public Map<String, CacheStats> getCacheStatistics() {
        Map<String, CacheStats> stats = new ConcurrentHashMap<>(cacheStatsMap);
        
        // 각 캐시의 실시간 정보 추가
        String[] cacheNames = {
            JIRA_CONNECTION_STATUS_CACHE,
            JIRA_PROJECTS_CACHE,
            JIRA_ISSUES_CACHE,
            JIRA_ISSUE_DETAILS_CACHE,
            JIRA_USER_INFO_CACHE
        };
        
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                CacheStats stat = stats.computeIfAbsent(cacheName, k -> new CacheStats());
                stat.setCacheName(cacheName);
                // Redis 캐시의 경우 정확한 크기를 얻기 어려울 수 있음
                // stat.setSize(cache.size()); // Redis 캐시에서는 지원하지 않을 수 있음
            }
        }
        
        return stats;
    }

    /**
     * 캐시 작업 기록
     */
    private void recordCacheOperation(String cacheName, String operation) {
        if (!cacheEnabled) return;
        
        CacheStats stats = cacheStatsMap.computeIfAbsent(cacheName, k -> new CacheStats());
        stats.setCacheName(cacheName);
        stats.incrementOperation(operation);
    }

    /**
     * 캐시 통계 로그 출력
     */
    private void logCacheStatistics() {
        if (!cacheEnabled || cacheStatsMap.isEmpty()) {
            return;
        }

        log.info("===== JIRA 캐시 통계 =====");
        for (Map.Entry<String, CacheStats> entry : cacheStatsMap.entrySet()) {
            CacheStats stats = entry.getValue();
            log.info("캐시: {} | PUT: {} | GET: {} | EVICT: {} | HIT_RATE: {:.2f}%",
                stats.getCacheName(),
                stats.getPutCount(),
                stats.getGetCount(),
                stats.getEvictCount(),
                stats.getHitRate() * 100
            );
        }
        log.info("========================");
    }

    /**
     * ICT-189: JIRA 이슈 정보 캐시 (JsonNode 타입)
     */
    @Cacheable(value = JIRA_ISSUE_DETAILS_CACHE, key = "#issueKey", condition = "#root.target.isCacheEnabled()")
    public com.fasterxml.jackson.databind.JsonNode getCachedJiraIssue(String issueKey) {
        recordCacheOperation(JIRA_ISSUE_DETAILS_CACHE, "GET");
        return null; // 캐시 미스 시 null 반환
    }

    /**
     * ICT-189: JIRA 이슈 정보 캐시에 저장
     */
    public void cacheJiraIssue(String issueKey, com.fasterxml.jackson.databind.JsonNode issueInfo) {
        if (!cacheEnabled) return;
        
        Cache cache = cacheManager.getCache(JIRA_ISSUE_DETAILS_CACHE);
        if (cache != null) {
            cache.put(issueKey, issueInfo);
            recordCacheOperation(JIRA_ISSUE_DETAILS_CACHE, "PUT");
            log.debug("JIRA 이슈 캐시 저장: issueKey={}", issueKey);
        }
    }

    /**
     * ICT-189: 프로젝트 JIRA 상태 캐시 무효화
     */
    public void evictProjectJiraStatus(String projectId) {
        if (!cacheEnabled) return;
        
        // jiraStatusSummary 캐시에서 프로젝트 관련 항목 제거
        Cache cache = cacheManager.getCache("jiraStatusSummary");
        if (cache != null) {
            cache.evict(projectId);
            log.info("프로젝트 JIRA 상태 캐시 무효화: projectId={}", projectId);
            recordCacheOperation("jiraStatusSummary", "EVICT");
        }
    }

    /**
     * 캐시 상태 정보
     */
    public CacheHealthInfo getCacheHealthInfo() {
        return CacheHealthInfo.builder()
                .enabled(cacheEnabled)
                .ttl(cacheTtl)
                .maxEntries(maxEntries)
                .activeCache(cacheStatsMap.size())
                .totalOperations(cacheStatsMap.values().stream()
                    .mapToLong(stats -> stats.getPutCount() + stats.getGetCount() + stats.getEvictCount())
                    .sum())
                .averageHitRate(cacheStatsMap.values().stream()
                    .mapToDouble(CacheStats::getHitRate)
                    .average()
                    .orElse(0.0))
                .build();
    }

    /**
     * 캐시 통계 클래스
     */
    public static class CacheStats {
        private String cacheName;
        private long putCount = 0;
        private long getCount = 0;
        private long hitCount = 0;
        private long evictCount = 0;
        private LocalDateTime lastAccessed = LocalDateTime.now();

        public void incrementOperation(String operation) {
            lastAccessed = LocalDateTime.now();
            switch (operation.toUpperCase()) {
                case "PUT" -> putCount++;
                case "GET" -> getCount++;
                case "HIT" -> hitCount++;
                case "EVICT" -> evictCount++;
            }
        }

        public double getHitRate() {
            return getCount > 0 ? (double) hitCount / getCount : 0.0;
        }

        // Getters and Setters
        public String getCacheName() { return cacheName; }
        public void setCacheName(String cacheName) { this.cacheName = cacheName; }
        public long getPutCount() { return putCount; }
        public long getGetCount() { return getCount; }
        public long getHitCount() { return hitCount; }
        public long getEvictCount() { return evictCount; }
        public LocalDateTime getLastAccessed() { return lastAccessed; }
    }

    /**
     * 캐시 건강 상태 정보
     */
    public static class CacheHealthInfo {
        private boolean enabled;
        private long ttl;
        private int maxEntries;
        private int activeCache;
        private long totalOperations;
        private double averageHitRate;

        public static CacheHealthInfoBuilder builder() {
            return new CacheHealthInfoBuilder();
        }

        // Getters
        public boolean isEnabled() { return enabled; }
        public long getTtl() { return ttl; }
        public int getMaxEntries() { return maxEntries; }
        public int getActiveCache() { return activeCache; }
        public long getTotalOperations() { return totalOperations; }
        public double getAverageHitRate() { return averageHitRate; }

        public static class CacheHealthInfoBuilder {
            private CacheHealthInfo info = new CacheHealthInfo();

            public CacheHealthInfoBuilder enabled(boolean enabled) {
                info.enabled = enabled;
                return this;
            }

            public CacheHealthInfoBuilder ttl(long ttl) {
                info.ttl = ttl;
                return this;
            }

            public CacheHealthInfoBuilder maxEntries(int maxEntries) {
                info.maxEntries = maxEntries;
                return this;
            }

            public CacheHealthInfoBuilder activeCache(int activeCache) {
                info.activeCache = activeCache;
                return this;
            }

            public CacheHealthInfoBuilder totalOperations(long totalOperations) {
                info.totalOperations = totalOperations;
                return this;
            }

            public CacheHealthInfoBuilder averageHitRate(double averageHitRate) {
                info.averageHitRate = averageHitRate;
                return this;
            }

            public CacheHealthInfo build() {
                return info;
            }
        }
    }
}